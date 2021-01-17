class Article:
    def __init__(self, source, url, text):
        self.source = source
        self.url = url
        self.text = text

    def format_json(self):
        return {
            'source': self.source,
            'url': self.url,
            'text': self.text
        }


def read_articles(path):
    ''' Read articles from directory specified by path '''
    with open(path) as fin:
        input = json.load(fin)
    articles = [Article(a['source'], a['url'], a['text']) for n, a in input.items()]
    return articles


def save_articles(articles, path):
    ''' Save articles to directory specified by path '''
    print(articles)
    corpus = {k: a.format_json() for k, a in enumerate(articles)}
    with open(path, 'w') as fout:
        json.dump(corpus, fout, indent=4)
