import spacy
import json
import en_core_web_sm
import time
import matplotlib.pyplot as plt
import math
from db import Article
from scipy.sparse import csr_matrix
from sklearn.cluster import KMeans

nlp = en_core_web_sm.load()

with open("./news_data/1-13/cnn_with_tags.txt") as f:
    news = json.load(f)
    id2news = {v['id']:Article.from_dict(v) for k,v in news.items()}
#print(len(id2news.items()))
with open("./news_data/1-13/cnn_cat.txt") as f:
    cnn_cat = json.load(f)
    categories = {}
    for k,v in cnn_cat.items():
        categories.setdefault(v['cat'], set()).add(v['id'])

with open("nlp_data/stopwords.txt", encoding='utf-8') as f:
    commons = f.read()
    f.close()
stopwords = commons.split("\n")

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

usefulPositions = ['PROPN', "NOUN", "VERB", 'ADJ', 'ADV']

all_lemmas = set()
curTime = time.time()
for cat, ids in categories.items():
    for artId in ids:
        art = id2news[artId]
        doc = nlp(art.body_text)
        for token in doc:
            if ((not token.text in stopwords) 
            and (not token.lemma_ in stopwords) 
            and (token.pos_ in usefulPositions) 
            and (len(token.text) > 2)):
                art.lemmas[token.lemma_] = art.lemmas.get(token.lemma_, 0) + 1
                all_lemmas.add(token.lemma_)
        normalize(art.lemmas)

print(time.time() - curTime)
curTime = time.time()

print(len(list(id2news.items())[0][1].lemmas))
print(len(all_lemmas))

def lemma_similarity(lemmas_sm, lemmas_lg):
    """
    computes cosine similarity between 2 normalized dictionaries
    time complexity is O(lemmas_sm)
    """
    total = 0
    for k, v in lemmas_sm:
        if k in lemmas_lg:
            total += v*lemmas_lg[k]
    return total

lem2ind = {lemma: i for i, lemma in enumerate(list(all_lemmas))}
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
    labels = KMeans(n_clusters = (len(ids)-1)//5 + 1, copy_x = False).fit_predict(csr)
    curTime = time.time()
    subclusters = [set() for i in range((len(ids)-1)//5 + 1)]
    for newsId in ids:
        subclusters[labels[ids2ind[newsId]]].add(newsId)
    for sc in subclusters:
        print([id2news[newsId].title for newsId in sc])
