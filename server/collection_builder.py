import math
import json
from collections import Counter
import spacy, en_core_web_sm


from db import Article
from crawler import load_articles


DICT_MAX_SIZE = 750
DEFAULT_COLLECTION_LABELS = ['us', 'world', 'politics', 'health', 'business', 'science & tech', 'sports & entertainment']
GENERAL_CONTEXT_WORDS = {'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                         'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
                         'september', 'october', 'november', 'december', 'cnn', 'state', 'month', 'day',
                         'year', 'week', 'people', 'person', 'group', 'state', 'statement', 'country', 'nation',
                         'time', 'company', 'office', 'official'}

TRAINING_PHASE = True
TRAINING_MAPPING = {(i + 1): w for i, w in enumerate(DEFAULT_COLLECTION_LABELS)}
TRAINING_LABELS = []


NLP = en_core_web_sm.load()


def make_counter(article):
    freq = Counter()
    tags = set(article.tags)
    for token in NLP(article.body_text):
        word = token.lemma_.lower()
        if word in tags:
            freq[word] += 1
    return freq


def classify(article, cat_freq):
    accum = Counter()
    '''
    # new method avoids common words skewing results
    for tag in article.tags:
        max_ratio = 0
        winner = None
        for cat in cat_freq.keys():
            ratio = cat_freq[cat]['dist'][tag] / cat_freq[cat]['total']
            if ratio > max_ratio:
                max_ratio = ratio
                winner = cat
        if winner:
            print(tag, winner, max_ratio)
            accum[winner] += 1
    print(accum)
    return max(accum, key=accum.get)
    '''
    freq = make_counter(article)
    print(freq)
    max_score, best_cat = 0, None
    for cat in cat_freq.keys():
        dist = cat_freq[cat]['dist']
        total = cat_freq[cat]['total']
        score = sum([(dist[tag] * freq[tag])**0.5 for tag in freq.keys() if tag in dist]) / (total)**0.5
        accum[cat] = score
        if score > max_score:
            best_cat = cat
            max_score = score
    print(accum)
    return best_cat


def category_freq(articles, prev_cat_freq):
    ''' get respective freq dist for default collections based on analysis from prev cat freq'''
    cat_freq = dict()
    for cat in prev_cat_freq.keys():
        cat_freq[cat] = {
            'total': 0,
            'dist': Counter()
        }
    for article in articles:
        cat = classify(article, prev_cat_freq)
        print(cat, ': ', article.title)
        if not cat:
            continue

        if TRAINING_PHASE:
            try:
                idx = int(input('1) us   2) world   3) politics   4) health   5) business   6) science & tech   7) sports & entertainment: '))
                cat = TRAINING_MAPPING[idx]
            except Exception as e:
                if e == KeyboardInterrupt:
                    exit(0)
            TRAINING_LABELS.append({'id': article.id, 'cat': cat})
            print()

        for tag in article.tags:
            if tag not in GENERAL_CONTEXT_WORDS:
                cat_freq[cat]['dist'][tag] += 1

    return cat_freq


def merge(dist1, dist2):
    ''' Helper for maintainence process that merges two Counters
        Keeps top DICT_MAX_SIZE words after merging
        Returns inc to total words
    '''
    inc = 0
    for word, count in dist2.items():
        dist1[word] += count
        inc += count
    arr = sorted([(count, word) for word, count in dist1.items()], reverse=True)
    for _, word in arr[min(len(arr), DICT_MAX_SIZE):]:
        dist1.pop(word)
    return inc


def maintain_dist(articles, prev_cat_freq):
    ''' Given today's news, update word frequencies/generate default collection tags '''
    cat_freq = category_freq(articles, prev_cat_freq)
    merged_cat_freq = dict()
    for cat in prev_cat_freq.keys():
        inc = merge(prev_cat_freq[cat]['dist'], cat_freq[cat]['dist'])
        prev_cat_freq[cat]['total'] += inc
    return prev_cat_freq


def load_freq_dists(path):
    with open(path, 'r') as fin:
        input = json.load(fin)
    for cat in input.keys():
        input[cat]['dist'] = Counter(input[cat]['dist'])
    return input


def save_freq_dists(cat_freq, path):
    with open(path, 'w') as fout:
        json.dump(cat_freq, fout, indent=4)


def build_dist(articles_path, labels_path, cat_freq_path):
    ''' Given seed assignments to categories, build init dist
        Make sure articles_path is {source}_with_tags.txt
    '''
    articles = load_articles(articles_path)
    with open(labels_path, 'r') as fin:
        input = json.load(fin)
    labels = {a['id']: a['cat'] for a in input.values()}

    cat_freq = {label: Counter() for label in DEFAULT_COLLECTION_LABELS}
    for article in articles:
        freq = cat_freq[labels[article.id]]
        for tag in article.tags:
            if tag not in GENERAL_CONTEXT_WORDS:
                freq[tag] += 1

    for cat, dist in cat_freq.items():
        dist = sorted(dist.items(), key=lambda x: x[1], reverse=True)
        dist = dict(dist[:min(len(dist), DICT_MAX_SIZE)])
        cat_freq[cat] = {
            'total': sum(dist.values()),
            'dist': dist
        }

    save_freq_dists(cat_freq, cat_freq_path)


if __name__ == '__main__':
    day = 22
    '''
    build_dist('news_data/1-'+str(day)+'/cnn_with_tags.txt',
               'news_data/1-'+str(day)+'/cnn_cat.txt',
               'news_data/1-'+str(day)+'/cat_freq.txt')
    '''
    articles = load_articles('news_data/1-'+str(day+1)+'/cnn_with_tags.txt')
    prev_cat_freq = load_freq_dists('news_data/1-'+str(day)+'/cat_freq.txt')
    cat_freq = maintain_dist(articles, prev_cat_freq)
    save_freq_dists(cat_freq, 'news_data/1-'+str(day+1)+'/cat_freq.txt')
    if TRAINING_PHASE:
        corpus = {k: a for k, a in enumerate(TRAINING_LABELS)}
        with open('news_data/1-'+str(day+1)+'/cnn_cat.txt', 'w') as fout:
            json.dump(corpus, fout, indent=4)
