import spacy
import json
import en_core_web_sm
import time
from db import Article
from collections import Counter

NLP = en_core_web_sm.load()
with open('nlp_data/common_nouns.txt', 'r') as fin:
    COMMON_NOUNS = fin.read().split('\n')

with open("./news_data/1-13/cnn_with_tags.txt") as f:
    news = json.load(f)
    id2news = {v['id']:Article.from_dict(v) for k,v in news.items()}
with open("./news_data/1-13/cnn_cat.txt") as f:
    cnn_cat = json.load(f)
    categories = {}
    for k,v in cnn_cat.items():
        categories.setdefault(v['cat'], set()).add(v['id'])
    list_cat = list(categories)
with open("./news_data/1-13/summaries") as f:
    summaries = json.load(f)
summaries = [item for item in summaries if isinstance(item, dict)]
for item in summaries:
    summary = item['summary']
    start, end = 0, 0
    doc = NLP(summary)
    word_counts = Counter()
    while start < len(doc):
        while doc[end].pos_ == "PROPN" and doc[end].dep_ == "compound":
            end += 1
        if doc[end].pos_ == "PROPN":
            end += 1
        if end > start:
            text = " ".join([doc[j].text for j in range(start, end)])
            word_counts[text] += 1
        else:
            token = doc[start]
            if token.pos_ == "NOUN" and token.text not in COMMON_NOUNS:
                word_counts[token.lemma_] += 1
            end += 1
        start = end
    print([x[0] for x in word_counts.most_common(3)])
    print(summary)
