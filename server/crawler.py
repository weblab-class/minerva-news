import re
import json
import random
import time
import datetime
import requests

from bs4 import BeautifulSoup
from urllib.request import Request, urlopen
from GoogleNews import GoogleNews

from db import Article


TODAY = str(datetime.date.today() - datetime.timedelta(days=3))
YEAR, MONTH, DAY = (int(x) for x in TODAY.split('-'))

def pad_date(date):
    return str(date).zfill(2)

newspapers = {
    'cnn': {
        'name': "CNN",
        'sitemap': 'https://www.cnn.com/app-news-section/article/sitemap-' + str(YEAR) + '-' + str(MONTH) + '.html',
        'sitemap_type': 'html.parser',
        'sitemap_attr': 'a',
        'sitemap_postfunc': lambda x: x['href'],
        'url_pattern': 'https://www.cnn.com/' + str(YEAR) + '/' + pad_date(MONTH) + '/' + pad_date(DAY),
        'article_pattern': 'index.html',
        'title_class': 'pg-headline',
        'body_classes': ['zn-body__paragraph'],
        'headings': ['h3', 'strong'],
        'source_tag': r'.*\(CNN.*?\)'
    },
    'huffpost': {
        'name': 'Huffington Post',
        'url': 'https://www.huffpost.com',
        'url_pattern': '',
        'is_article_pattern': 'entry',
        'title_class': 'headline__title',
        'body_classes': ['content-list-component yr-content-list-text text'],
        'headings': [],
        'source_tag': r'.* [—-] (?=[A-Z])'
    },
    'apnews': {
        'name': "AP News",
        'sitemap': [f"https://apnews.com/sitemap/sitemap_{YEAR}-{pad_date(MONTH)}-{pad_date(DAY)}T05:00:0{i}+00:00.xml" for i in range(10)],
        'sitemap_type': "xml",
        'sitemap_attr': "loc",
        'sitemap_postfunc': lambda x: x,
    }
    # nyt, lat, apnews, dailymail, usatoday
}

HEADER = {'User-Agent': 'Mozilla/5.0'}  # get around 403 forbidden error


def randomize_scrape_pattern():
    time.sleep(3 + random.random() * 3.88)
    return


def get_urls(source):
    ''' Scrapes urls off sitemap '''
    paper = newspapers[source]
    urls = []
    req = Request(paper['sitemap'], headers=HEADER)
    page = urlopen(req)
    soup = BeautifulSoup(page, paper['sitemap_type'])

    for link in soup.find_all(paper['sitemap_attr']):
        url = paper['sitemap_postfunc'](link)
        if not paper['url_pattern'] in url:
            continue
        urls.append(url)

    return urls


def scrape(source):
    ''' Given source (key for newspapers), scrape from urls found by GoogleNews
        Creates article entry in db with id = timestamp scraped
    '''
    paper = newspapers[source]
    articles_list = []

    def not_heading(x):
        tags = set([tag.name for tag in x.find_all()])
        return not any([h in tags for h in paper['headings']])

    # scrape individual articles
    urls = get_urls(source)

    for url in urls:
        if not paper['article_pattern'] in url:
            continue
        req = Request(url, headers=HEADER)
        page = urlopen(req)
        soup = BeautifulSoup(page, 'html.parser')
        try:
            # generate article params
            title = soup.find(class_=paper['title_class']).get_text()
            sections = []
            for body_class in paper['body_classes']:
                sections.extend(soup.find_all(class_=body_class))
            sections = list(filter(not_heading, sections))
            sections = [s.get_text().strip() for s in sections]
            if len(sections) == 0:
                return None
            body_text = '\n '.join([s for s in sections if len(s)])
            body_text = re.sub(paper['source_tag'], '', body_text)

            article_id = str(time.time())
            article = Article(article_id, url, source, title, body_text)
            articles_list.append(article)
        except Exception as e:
            print('Article not valid: ' + url)
            # print(e)
        else:
            print(url)
            #print(body_text)

        #randomize_scrape_pattern()

    return articles_list


def crawl():
    all_articles = []
    all_articles.extend(scrape('cnn'))
    return all_articles


def add_articles_to_db(articles):
    for article in articles:
        article.create_db_entry()


def load_articles(path):
    with open(path, 'r') as fin:
        input = json.load(fin)
    articles = [Article(id=a['id'],
                        url=a['url'],
                        source=a['source'],
                        title=a['title'],
                        body_text=a['body_text'],
                        tags=a['tags']) for n, a in input.items()]
    return articles


def save_articles(articles, path):
    corpus = {k: a.format_json() for k, a in enumerate(articles)}
    with open(path, 'w') as fout:
        json.dump(corpus, fout, indent=4)


if __name__ == '__main__':
    articles = crawl()
    save_articles(articles, 'news_data/1-23/cnn.txt')
