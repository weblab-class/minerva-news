import json
import time
import spacy, en_core_web_sm
from collections import Counter

from db import Article
from crawler import load_articles, save_articles

TAG_PARAMS = {
    'PROPN': {
        'tags_per_news': 45,
        'get_text': lambda x: x.lemma_.lower(),
        'vocab_freq': Counter(),
    },
    'NOUN': {
        'tags_per_news': 30,
        'get_text': lambda x: x.lemma_,
        'vocab_freq': Counter(),
    }
    # more to be added
}

NLP = en_core_web_sm.load()

with open('nlp_data/common_nouns.txt', 'r') as fin:
    COMMON_NOUNS = fin.read().split('\n')


def process_doc(doc, freq, tag_type, params, count_once=True):
    ''' Given spacy-parsed string, maintain freq with string's word dist
        Each article gets only one vote per word
    '''
    start, end  = 0, 0
    seen = set()
    while start < len(doc):
        end += 1
        token = doc[start]
        if token.pos_ == tag_type:
            text = params['get_text'](token)
            if text not in seen and text not in set(['-', ',', '%', '.']):
                freq[text] += 1
                if count_once:
                    seen.add(text)
        start = end


def generate_tags(articles, docs):
    for tag_type, params in TAG_PARAMS.items():
        vocab_freq = params['vocab_freq']
        for doc in docs:
            process_doc(doc, vocab_freq, tag_type, params)
        # process common nouns
        params['vocab_freq'] = Counter(dict(filter(lambda x: not x[0] in COMMON_NOUNS, vocab_freq.items())))

    #print(sorted(list(noun_dict.items()), key=lambda x: x[1], reverse=True))

    for i, article in enumerate(articles):
        doc = docs[i]
        for tag_type, params in TAG_PARAMS.items():
            freq = Counter()
            process_doc(doc, freq, tag_type, params)
            freq = dict(filter(lambda x: x[0] in params['vocab_freq'], freq.items()))
            freq = sorted(freq.items(), key=lambda x: x[1], reverse=True)
            freq = freq[:min(params['tags_per_news'], len(freq))]
            article.tags.extend([x for x, _ in freq])

        article.tags = list(set(article.tags))
        #print(article.tags)
    return articles


def build_docs(articles):
    return [NLP(article.body_text) for article in articles]


if __name__ == '__main__':
    for i in range(23, 24):
        day = i
        print(day)
        TAG_PARAMS['NOUN']['vocab_freq'].clear()
        TAG_PARAMS['PROPN']['vocab_freq'].clear()
        articles = load_articles('news_data/1-'+str(day)+'/cnn.txt')
        docs = build_docs(articles)
        generate_tags(articles, docs)
        save_articles(articles, 'news_data/1-'+str(day)+'/cnn_with_tags.txt')
