import spacy
import json
import en_core_web_sm
import time
from models.article import Article

time1 = time.time()

tag_type = {"PROPN", "NOUN"}
n_tags = {"PROPN": -1, "NOUN": -1} #number of total tags
n_tpn = {"PROPN": 15, "NOUN": 10} #tags per news
noun_threshold = 100
nlp = en_core_web_sm.load()

with open("nlp_data/common_nouns.txt") as f:
    commons = f.read()
    f.close()
common_nouns = commons.split("\n")


def process_news(news):
    #takes in list of news and adds tags to them
    n_news = len(news)
    vocab_freqs = {"PROPN": {},"NOUN": {}}

    #time2 = time.time()
    #print(time2 - time1)

    docs = []

    def process_doc(doc, freqs):
        #freq list of 2 dictionaries for prop/noun freqs
        span_start = 0
        span_end = 0
        while span_start < len(doc):
            span_end += 1
            token = doc[span_start]
            if token.pos_ in ["NOUN", "PROPN"]:
                if token.pos_ == "NOUN":
                    text = token.lemma_
                else:
                    text = token.text
                texts = text.split("-")
                for text_part in texts:
                    freqs[token.pos_][text_part] = freqs[token.pos_].setdefault(text_part, 0) + 1
            span_start = span_end

    for i in range(n_news):
        doc = nlp(news[i].body_text)
        docs.append(doc)
        process_doc(doc, vocab_freqs)

    #time3 = time.time()
    #print(time3 - time2)

    top_tags = {"PROPN": {},"NOUN": {}}
    for i in tag_type:
        top_tags[i] = dict(sorted(vocab_freqs[i].items(), key=lambda pair: pair[1], reverse = True)[:n_tags[i]])
    top_tags["NOUN"] = {k:v for k,v in top_tags["NOUN"].items() if v<noun_threshold or not k in common_nouns}
    #time4 = time.time()
    #print(time4 - time3)

    for i_news in range(n_news):
        doc = docs[i_news]
        freq_in_news = {"PROPN": {},"NOUN": {}}
        process_doc(doc, freq_in_news)
        for i_type in tag_type:
            filtered_freqs = {k:v for k,v in freq_in_news[i_type].items() if k in top_tags[i_type]}
            freq_in_news[i_type] = sorted(filtered_freqs.items(), key=lambda pair: pair[1], reverse = True)[:n_tpn[i_type]]
        news[i_news].tags = [x[0] for type_freq in freq_in_news.values() for x in type_freq]

    #time5 = time.time()
    #print(time5 - time4)

    return news

    #time6 = time.time()
    #print(time6 - time5)



with open("news/2020-08-25.json") as f:
    news = json.load(f)
    f.close()
n_news = len(news)
news = [news[str(i)] for i in range(n_news)]
news = list(map(Article.from_dict, news))
news = process_news(news)
news = list(map(lambda x: x.to_dict(), news))

with open("news/taggedict-2020-08-25.json", "w") as f:
    json.dump(news, f)
    f.close()
    
