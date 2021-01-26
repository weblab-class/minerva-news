import spacy
import json
import en_core_web_sm
import time
import matplotlib.pyplot as plt
import math
import numpy as np
import networkx as nx
from db import Article
from scipy.sparse import csr_matrix
from sklearn.cluster import KMeans

nlp = en_core_web_sm.load()


"""
load news data and stopwords
id2news: a dictionary mapping id to article objects
categories: a dictionary mapping category names to a set of ids of the news articles in that category
stopwords: a list of common stop words
"""
with open("./news_data/1-13/cnn_with_tags.txt") as f:
    news = json.load(f)
    id2news = {v['id']:Article.from_dict(v) for k,v in news.items()}
    f.close()
#print(len(id2news.items()))
with open("./news_data/1-13/cnn_cat.txt") as f:
    cnn_cat = json.load(f)
    categories = {}
    for k,v in cnn_cat.items():
        categories.setdefault(v['cat'], set()).add(v['id'])
    f.close()
with open("nlp_data/stopwords.txt", encoding='utf-8') as f:
    commons = f.read()
    f.close()
stopwords = set(commons.split("\n"))
list_cat = list(categories)

def normalize(freqs):
    """
    normalize freqs to have sum of squares 1
    modifies in place
    """
    square_sum = 0
    for _,v in freqs.items():
        square_sum += v**2
    rss = math.sqrt(square_sum)
    for k in freqs:
        freqs[k] /= rss
    return freqs


"""
uses spacy to lemmatize and senticize articles
filter words to only include those in usefulpositions, and it and its lemma is not a stopword
sentences are stored in art.sentences, which is a list of sentences, each of which
is represented as bag of words in a frequency dict
total bag of words of article, also a frequency dict, is stored in art.lemmas
set of all lemmas occuring in any article is stored in all_lemmas
lem2ind bijectively maps all lemmas to an index in the range 0-len(all_lemmas)
"""
usefulPositions = ['PROPN', "NOUN", "VERB", 'ADJ', 'ADV']
all_lemmas = set()
curTime = time.time()
for cat, ids in categories.items():
    for artId in ids:
        art = id2news[artId]
        doc = nlp(art.body_text)
        for sent in doc.sents:
            sent_bag = {}
            for token in sent:
                if ((not token.text in stopwords) 
                and (not token.lemma_ in stopwords) 
                and (token.pos_ in usefulPositions) 
                and (len(token.text) > 2)):
                    art.lemmas[token.lemma_] = art.lemmas.get(token.lemma_, 0) + 1
                    all_lemmas.add(token.lemma_)
                    sent_bag[token.lemma_] = sent_bag.get(token.lemma_, 0) + 1
            normalize(sent_bag)
            art.sentences.append(sent_bag)
            art.true_sentences.append(sent.text)
        normalize(art.lemmas)    
lem2ind = {lemma: i for i, lemma in enumerate(list(all_lemmas))}   


print(time.time() - curTime)
curTime = time.time()


def lemma_similarity(lemmas_sm, lemmas_lg):
    """
    computes cosine similarity between 2 normalized dictionaries
    time complexity is O(lemmas_sm)
    """
    total = 0
    for k, v in lemmas_sm.items():
        if k in lemmas_lg:
            total += v*lemmas_lg[k]
    return total

def textrank(artId):
    """
    uses article Id, returns a list of ids (descending order of relevance) 
    of indices of top sentence in the article, using pagerank algorithm
    """
    divisor = 4
    min_num, max_num = 3, 10

    art = id2news[artId]

    if len(art.sentences) <= 3:
        return art.body_text #no textrank if no text to rank...

    cosine_matrix = np.asarray([[lemma_similarity(sent_1, sent_2) for sent_1 in art.sentences] for sent_2 in art.sentences])
    graph = nx.from_numpy_array(cosine_matrix)
    scores = nx.pagerank(graph)

    n_sents = len(art.sentences)
    num_top = min(max(round(n_sents/divisor), min_num), max_num)
    ranked_sentences = sorted(((scores[i], i) for i in range(n_sents)), reverse=True)[:num_top]
    ranked_sentences.sort(key=lambda x: x[1]) #preserving order will help give more context
    return ' '.join([art.true_sentences[x[1]] for x in ranked_sentences])


"""
kmeans:
for each category, uses k-means on the bag of words of each article to cluster the categories into subclusters
subclusters is represented as a list of sets for each category, (a dictionary all_subclusters categories: list of sets)
containing newsids in each set, which corresponds to a subcluster.
"""
all_subclusters = {}
for cat, ids in categories.items():
    ids2ind = {newsId: i for i, newsId in enumerate(list(ids))}
    rows = []
    cols = []
    data = []
    for newsId in ids:
        for lem, freq in id2news[newsId].lemmas.items():
            rows.append(ids2ind[newsId])
            cols.append(lem2ind[lem])
            data.append(freq)
    csr = csr_matrix((data, (rows, cols)))
    labels = KMeans(n_clusters = (len(ids)-1)//7 + 1, copy_x = False).fit_predict(csr)
    curTime = time.time()
    subclusters = [set() for i in range((len(ids)-1)//7 + 1)]
    for newsId in ids:
        subclusters[labels[ids2ind[newsId]]].add(newsId)
    all_subclusters[cat] = subclusters
    #for sc in subclusters:
        #print([id2news[newsId].title for newsId in sc])
print("num subclusters", sum([len(v) for k,v in all_subclusters.items()]))


import torch
from transformers import PegasusForConditionalGeneration, PegasusTokenizer

def pegasus_load():
    model_name = 'google/pegasus-cnn_dailymail'
    torch_device = 'cuda' if torch.cuda.is_available() else 'cpu'
    tokenizer = PegasusTokenizer.from_pretrained(model_name)
    model = PegasusForConditionalGeneration.from_pretrained(model_name).to(torch_device)

    return model, tokenizer, torch_device

def pegasus_eval(text, params):
    """
    Abstractive summary of input via Google PEAGASuS
    """
    model, tokenizer, torch_device = params
    batch = tokenizer.prepare_seq2seq_batch([text], truncation=True, padding='longest', return_tensors="pt").to(torch_device)
    translated = model.generate(**batch)
    output = tokenizer.batch_decode(translated, skip_special_tokens=True)[0]
    output = output.replace('<n>', ' ')
    return output

params = pegasus_load()
print(time.time() - curTime)
curTime = time.time()

summaries = []
for cat in list_cat:
    subclusters = all_subclusters[cat]
    for i, sc in enumerate(subclusters):
        joined = ' '.join([textrank(newsId) for newsId in sc])
        output = pegasus_eval(joined, params)   
        print(time.time() - curTime)
        curTime = time.time()
        summaries.append(output)
print(len(summaries))

for cat in list_cat:
    subclusters = all_subclusters[cat]
    for sc in subclusters:
        if i < len(summaries):
            summaries[i] = {
                "summary": summaries[i], 
                "category": cat,
                "newsids": list(sc)
            }
            i += 1

with open("./news_data/1-13/textrank-summaries.txt") as f:
    json.dump(summaries, f)
    f.close()