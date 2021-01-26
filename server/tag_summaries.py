import os
''' Enviornmental Variables '''
os.environ['DEPLOY'] = 'LOCAL'

if os.environ.get('DEPLOY') != 'HEROKU':
    with open('../env.txt', 'r') as fin:
        env = tuple(fin.read().splitlines())
    os.environ['GOOGLE_CLIENT_ID']     = env[0]
    os.environ['GOOGLE_CLIENT_SECRET'] = env[1]
    os.environ['MONGO_ATLAS_SRV']      = env[2]
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'



import spacy
import json
import en_core_web_sm
import time
import db
from db import Article, Summary, summary_db
from collections import Counter

'''
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
    colons = []
    while start < len(doc):
        while doc[end].pos_ == "PROPN" and doc[end].dep_ == "compound" and len(doc[end].text) > 2:
            end += 1
        if doc[end].pos_ == "PROPN" and len(doc[end].text) > 2:
            end += 1
        if end > start:
            if doc[end].text == ":":
                colons.append(end)
            text = " ".join([doc[j].text for j in range(start, end)])
            word_counts[text] += 1
        else:
            token = doc[start]
            if token.pos_ == "NOUN" and token.text not in COMMON_NOUNS and len(token.text) > 2:
                word_counts[token.lemma_] += 1
            end += 1
        start = end
    item["tags"] = [x[0] for x in word_counts.most_common(3)]
    summaryObj = Summary(item['summary'], item['newsids'], item['category'], item['tags'])
    summaryObj.create_db_entry()
'''

if __name__ == "__main__":
    insert_result = db.summary_db.insert_one({"one": "one"})
    '''
    print(dir(insert_result))
    print(insert_result.inserted_id)
    '''
