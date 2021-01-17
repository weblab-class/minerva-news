import spacy
import json
import en_core_web_sm
import time

time1 = time.time()

#type of words: 0 proper noun, 1 noun

n_news = 786
n_tags = [-1, -1] #number of total tags
n_tpn = [15, 10] #tags per news
noun_threshold = 100
nlp = en_core_web_sm.load()

with open("commonnouns") as f:
    commons = f.read()
    f.close()
common_nouns = commons.split("\n")

with open("news/2020-09-19.json") as f:
    news = json.load(f)
    f.close()
news = [news[str(i)] for i in range(n_news)]
vocab_freqs = [{},{}]

time2 = time.time()
print(time2 - time1)

docs = []

def process_doc(doc, freqs):
    #freq list of 2 dictionaries for prop/noun freqs
    span_start = 0
    span_end = 0
    while span_start < len(doc):
        while doc[span_end].pos_ == "PROPN" and doc[span_end].dep_ == "compound":
            span_end += 1
        if doc[span_end].pos_ == "PROPN":
            span_end += 1        
        if span_end > span_start:
            text = " ".join([doc[j].text for j in range(span_start, span_end)])  
            freqs[0][text] = freqs[0].setdefault(text, 0) + 1
        else:
            span_end += 1
            token = doc[span_start]
            if token.pos_ == "NOUN":
                text = token.lemma_
                freqs[1][text] = freqs[1].setdefault(text, 0) + 1
        span_start = span_end

for i in range(n_news):
    doc = nlp(news[i]['text'])
    docs.append(doc)
    process_doc(doc, vocab_freqs)

time3 = time.time()
print(time3 - time2)

top_tags = [{},{}]
for i in range(2):
    top_tags[i] = dict(sorted(vocab_freqs[i].items(), key=lambda pair: pair[1], reverse = True)[:n_tags[i]])
top_tags[1] = {k:v for k,v in top_tags[1].items() if v<noun_threshold or not k in common_nouns}
time4 = time.time()
print(time4 - time3)

for i_news in range(n_news):
    doc = docs[i_news]
    freq_in_news = [{},{}]
    process_doc(doc, freq_in_news)
    for i_type in range(2):
        filtered_freqs = {k:v for k,v in freq_in_news[i_type].items() if k in top_tags[i_type]}
        freq_in_news[i_type] = dict(sorted(filtered_freqs.items(), key=lambda pair: pair[1], reverse = True)[:n_tpn[i_type]])
    news[i_news]["tags"] = freq_in_news

news = {str(i): news[i] for i in range(n_news)}

time5 = time.time()
print(time5 - time4)

with open("news/taggedict-2020-09-19.json", "w") as f:
    json.dump(news, f)
    f.close()

time6 = time.time()
print(time6 - time5)
