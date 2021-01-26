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

import random

from collections import Counter
from collection_builder import NLP, merge, GENERAL_CONTEXT_WORDS
from crawler import load_articles
from db import Common

NUM_CONSIDERED = 15
NUM_POPULAR = 7

with open('nlp_data/stopwords.txt') as fin:
    STOPWORDS = set([x.strip() for x in fin.readlines()])
with open('nlp_data/stopwords.txt') as fin:
    COMMON_NOUNS = set([x.strip() for x in fin.readlines()])
SYMBOLS = {'%', '-', '.', ','}

EXCLUDE = GENERAL_CONTEXT_WORDS | STOPWORDS | COMMON_NOUNS | SYMBOLS


def make_counter(article):
    freq = Counter()
    for token in NLP(article.body_text):
        if not token.pos_ in ['NOUN', 'PROPN']:
            continue
        word = token.lemma_
        if not word.lower() in EXCLUDE:
            freq[word] += 1
    return freq


def get_popular(articles):
    unified = Counter()
    for article in articles:
        freq = make_counter(article)
        merge(unified, freq)

    to_be_removed = []
    for word in unified.keys():
        if word[-1] == 's' and word[:-1] in unified or word.lower() in unified:
            to_be_removed.append(word.lower())
    for word in to_be_removed:
        del unified[word]

    popular = [x[0] for x in sorted(unified.items(), key=lambda x: x[1], reverse=True)]
    return random.sample(popular[:NUM_CONSIDERED], NUM_POPULAR)


if __name__ == '__main__':
    articles = load_articles('news_data/1-13/cnn_with_tags.txt')
    common = Common(get_popular(articles))
    #print(common.format_json())
    common.create_db_entry()
