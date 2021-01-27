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


TODAY = str(datetime.date.today() - datetime.timedelta(days=1))
YEAR, MONTH, DAY = (int(x) for x in TODAY.split('-'))

def pad_date(date):
    return str(date).zfill(2)

newspapers = {
    'cnn': {
        'mode': "sitemap",
        'name': "CNN",
        'sitemap': 'https://www.cnn.com/app-news-section/article/sitemap-' + str(YEAR) + '-' + str(MONTH) + '.html',
        'parser': 'html.parser',
        'sitemap_attr': 'a',
        'sitemap_postfunc': lambda x: x['href'],
        'get_date': lambda x: None,
        'url_pattern': 'https://www.cnn.com/' + str(YEAR) + '/' + pad_date(MONTH) + '/' + pad_date(DAY),
        'article_pattern': 'index.html',
        'title_class': 'pg-headline',
        'body_classes': ['zn-body__paragraph'],
        'headings': ['h3', 'strong'],
        'source_tag': r'.*\(CNN.*?\)',
        'check_date': False,
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
        'mode': "crawler",
        'name': "AP News",
        'url_crawl': r"https://apnews.com/.*",
        'url_save': r"https://apnews.com/article/.+",
        'parser': 'html.parser',
        'check_date': True
    }
    # nyt, lat, apnews, dailymail, usatoday
}

HEADER = {'User-Agent': 'Mozilla/5.0'}  # get around 403 forbidden error


def randomize_scrape_pattern():
    time.sleep(5 + random.random() * 8)
    return


def crawl(source):
    ''' Crawls urls off sitemap or using crawler '''
    paper = newspapers[source]
    if paper['mode'] == "sitemap":
        urls = []
        req = Request(paper['sitemap'], headers=HEADER)
        page = urlopen(req)
        soup = BeautifulSoup(page, paper['parser'])

        for link in soup.find_all(paper['sitemap_attr']):
            url = paper['sitemap_postfunc'](link)
            if not paper['url_pattern'] in url:
                continue
            urls.append(url)

        return urls
    
    if paper['mode'] == "crawler":
        return site_crawl(paper['home'], paper['url_crawl'], paper['url_save'], [], paper['parser'])


def site_crawl(src, url_crawl, url_save, visited, parser = "html.parser", selector = 'a', postfunc = lambda x: x['href']):
    """
        recursively crawls websites to get list of news urls
        :param str src: starts crawling from this source
        :param r-str url_crawl: valid urls which will continue crawling
        :param r-str url_save: desired url end results saved in crawling
        :param str selector: selector in bs4 find_all() function
        :param func postfunc: functino applied to bs4 outputs of find_all()
        :return: list of urls of news articles
        :rtype: list[str] 
    """
    print("crawling", src)
    visited.add(src)
    randomize_scrape_pattern()
    all_urls = []

    try:
        req = Request(src, headers=HEADER)
        page = urlopen(req)
        soup = BeautifulSoup(page, parser)
        for link in soup.find_all(selector, href=True):
            url = postfunc(link)
            if not url[:4] == "http": #relative url
                url = urljoin(src, url)
            if url in visited: 
                continue
            if re.fullmatch(url_save, url):
                visited.add(url)
                all_urls.append(url)
                print("saved", url)
            elif re.fullmatch(url_crawl, url):
                visited.add(url)
                all_urls.extend(crawl(url, url_crawl, url_save, visited, parser, selector, postfunc))

        return all_urls
    except Exception: #also catches keyboard interrupt, this removes a layer from crawler
        return []

def read_urls(path):
    pass


def scrape(source, urls):
    ''' Given source (key for newspapers), scrape from urls found by GoogleNews
        Creates article entry in db with id = timestamp scraped
    '''
    paper = newspapers[source]
    articles_list = []

    def not_heading(x):
        tags = set([tag.name for tag in x.find_all()])
        return not any([h in tags for h in paper['headings']])

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


def crawl_scrape_all():
    all_articles = []
    all_articles.extend(crawl_and_scrape('cnn'))
    return all_articles

def crawl_and_scrape(source):
    urls = crawl(source)
    return scrape(source, urls)


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
    articles = crawl_scrape_all()
    save_articles(articles, 'news_data/1-25/cnn.txt')
