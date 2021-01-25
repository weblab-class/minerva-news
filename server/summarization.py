import spacy
import json
import en_core_web_sm
import time
import matplotlib.pyplot as plt
import math
from db import Article

nlp = en_core_web_sm.load()

with open("news/01-13/cnn_with_tags.txt") as f:
    news = json.load(f)
    id2news = {v['id']:Article.from_dict(v) for k,v in news.items()}
#print(len(id2news.items()))
with open("news/01-13/cnn_cat.txt") as f:
    cnn_cat = json.load(f)
    categories = {}
    for k,v in cnn_cat.items():
        categories.setdefault(v['cat'], set()).add(v['id'])

with open("nlp_data/stopwords.txt", encoding='utf-8') as f:
    commons = f.read()
    f.close()
stopwords = commons.split("\n")

usefulPositions = ['PROPN', "NOUN", "VERB", 'ADJ', 'ADV']

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

print(time.time() - curTime)
curTime = time.time()