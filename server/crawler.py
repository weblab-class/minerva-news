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
MONTH_ABBREV = {1:'Jan', 2:'Feb', 3:'Mar', 4:'Apr', 5:'May', 6:'Jun', 7:'Jul', 8:'Aug', 9:'Sep', 10:'Oct', 11:'Nov', 12:'Dec'}

def pad_date(date):
    return str(date).zfill(2)

newspapers = {
    'cnn': {
        'mode': 'sitemap',
        'name': 'CNN',
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
    },
    'washpost': {
        'url_pattern': 'https://www.washingtonpost.com/',
        'article_pattern': '',
        'title_class': 'font--headline gray-darkest pb-sm null',
        'body_classes': ['font--body font-copy gray-darkest ma-0 pb-md'],
        'headings': ['font--subhead gray-darkest ma-0 pb-sm pt-lgmod', ],
    },
    'nyt': {
        'url_pattern': 'https://www.nytimes.com/',
        'article_pattern': '',
        'title_class': 'css-1vkm6nb ehdk2mb0',
        'body_classes': ['css-axufdj evys1bk0'],
        'headings': ['h3'],
    },
    'huffpost': {
        'url_pattern': 'https://www.huffpost.com/entry',
        'article_pattern': '',
        'title_class': 'headline__title',
        'body_classes': ['content-list-component yr-content-list-text text'],
        'headings': ['h3'],
    },
    'latimes': {
        'url_pattern': 'https://www.latimes.com/',
        'article_pattern': '',
        'title_class': 'headline',
        'body_classes': ['rich-text-article-body-content rich-text-body'],
        'headings': [],
    }

}

HEADER = {'User-Agent': 'Mozilla/5.0'}  # get around 403 forbidden error


def randomize_scrape_pattern():
    time.sleep(8 + random.random() * 10.265)
    return


def site_crawl(src, url_crawl, url_save, visited, parser = 'html.parser', selector = 'a', postfunc = lambda x: x['href']):
    '''
        recursively crawls websites to get list of news urls
        :param str src: starts crawling from this source
        :param r-str url_crawl: valid urls which will continue crawling
        :param r-str url_save: desired url end results saved in crawling
        :param str selector: selector in bs4 find_all() function
        :param func postfunc: functino applied to bs4 outputs of find_all()
        :return: list of urls of news articles
        :rtype: list[str]
    '''
    visited.add(src)
    all_urls = []
    #randomize_scrape_pattern()

    try:
        req = Request(src, headers=HEADER)
        page = urlopen(req)
        soup = BeautifulSoup(page, parser)
        for link in soup.find_all(selector, href=True):
            url = postfunc(link)
            if not url[:4] == 'http': #relative url
                url = urljoin(src, url)
            if url in visited:
                continue
            if re.fullmatch(url_save, url):
                visited.add(url)
                all_urls.append(url)
                print('saved', url)
            elif re.fullmatch(url_crawl, url):
                visited.add(url)
                all_urls.extend(crawl(url, url_crawl, url_save, visited, parser, selector, postfunc))
        return all_urls

    except Exception: #also catches keyboard interrupt, this removes a layer from crawler
        return []


def crawl(source):
    ''' Crawls urls off sitemap or using crawler '''
    paper = newspapers[source]

    if paper['mode'] == 'sitemap':
        urls = []
        req = Request(paper['sitemap'], headers=HEADER)
        page = urlopen(req)
        soup = BeautifulSoup(page, paper['parser'])
        for link in soup.find_all(paper['sitemap_attr']):
            url = paper['sitemap_postfunc'](link)
            if not paper['url_pattern'] in url or not paper['article_pattern'] in url:
                continue
            urls.append(url)
        return urls

    if paper['mode'] == 'crawler':
        return site_crawl(paper['home_url'], paper['url_crawl'], paper['url_save'], set(), paper['parser'])


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
        req = Request(url, headers=HEADER)
        page = urlopen(req)
        soup = BeautifulSoup(page, 'html.parser')
        try:
            # generate article params
            title = soup.find(class_=paper['title_class']).get_text().strip()
            print(title)
            sections = []
            for body_class in paper['body_classes']:
                sections.extend(soup.find_all(class_=body_class))

            sections = list(filter(not_heading, sections))
            sections = [s.get_text().strip() for s in sections]
            if len(sections) == 0:
                return None
            body_text = '\n '.join([re.sub(r'\n+', r'\n', s) for s in sections if len(s)])
            if source == 'latimes':
                body_text = re.sub('Column:.*\n|Advertisement|Business|California|Climate & Environment|Entertainment & Arts|En Español|Food|Hot Property|Housing & Homelessness|Lifestyle|Obituaries|Opinion|Politics|Science|Sports|Travel|World & Nation|Music', '', body_text)

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


def crawl_and_scrape(source):
    urls = crawl(source)
    return scrape(source, urls)


def crawl_scrape_all():
    all_articles = []
    all_articles.extend(crawl_and_scrape('cnn'))
    #all_articles.extend(crawl_and_scrape('apnews'))
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


import random

if __name__ == '__main__':
    #articles = crawl_scrape_all()
    #save_articles(articles, 'news_data/1-26/cnn.txt')
    '''
    BEGIN = str(datetime.date.today() - datetime.timedelta(days=2))
    BEGIN_URL = '/'.join(BEGIN.split('-'))
    TODAY = str(datetime.date.today())  # - timedelta(days=1))
    TODAY_URL = '/'.join(TODAY.split('-'))

    def alt_date_format(url):
        dates = url.split('/')
        return '/'.join(dates[1:] + dates[:1])


    HEADER = {'User-Agent': 'Mozilla/5.0'}  # get around 403 forbidden error
    ENDPAGE = 10
    googlenews = GoogleNews(start=alt_date_format(BEGIN_URL),
                            end=alt_date_format(TODAY_URL))
    urls = set()
    googlenews.search('latimes')
    for i in range(1, ENDPAGE):
        print(i)
        googlenews.getpage(i)
        urls |= set([r['link'] for r in googlenews.result()])
        randomize_scrape_pattern()
        print(list(urls))
        print()
        print()
    '''
    '''
    with open('news_data/1-26/all_urls.txt') as fin:
        input = fin.readlines()
    sources = ['apnews', 'bloomberg','washpost', 'npr', 'nyt', 'huffpost', 'latimes']
    all_urls = []
    for i, x in enumerate(input):
        if sources[i] in set(['apnews', 'bloomberg', 'npr']):
            continue
        x = x[2:-3]
        x = x.split('\', \'')
        all_urls.extend([(sources[i], [url]) for url in x if url.startswith(newspapers[sources[i]]['url_pattern'])])

    random.shuffle(all_urls)
    random.shuffle(all_urls)
    all_urls = all_urls[:]

    #print(all_urls)

    for source, urls in all_urls:
        try:
            articles.extend(scrape(source, urls))
        except:
            continue
    random.shuffle(articles)
    random.shuffle(articles)
    save_articles(articles, 'news_data/1-26/all_articles.txt')
    '''
    articles = [a for a in load_articles('news_data/1-26/all_articles_with_tags.txt') if a.source != 'latimes']
    random.shuffle(articles)
    random.shuffle(articles)
    for article in articles:
        article.id = str(time.time()).replace('.', '')
    add_articles_to_db(articles)
    save_articles(articles, 'news_data/1-26/all_articles_with_tags.txt')









'''
params = {
    'name': 'New York Times',
    'src': 'https://www.nytimes.com/',
    'crawl': r'https://www.nytimes.com/(?!video)[^0-9#]*',
    'article': r'https://www.nytimes.com/(article/|(live/)?2021/01/2[2-9]/)[^#]+',
}
params = {
    'name': 'AP News',
    'src': 'https://apnews.com/',
    'crawl': r'https://apnews.com/.*',
    'article': r'https://apnews.com/article/.+'
}

params = {
    'name': 'BBC News',
    'src': 'https://www.bbc.co.uk/news/10628494#userss',
    'crawl': r'https://(feeds.bbci.co.uk|www.bbc.co.uk|www.bbc.com)/',
    'article': r'https://www.bbc.(co.uk|.com)/news/[a-z]+[^/]+'
}

params = {
    'name': 'Fox News',
    'src': 'https://www.foxnews.com/',
    'crawl': r'https://www.foxnews.com/((?!shows)[^/]*|category/.*)',
    'article': r'https://www.foxnews.com/(us|politics|media|opinion|sports|world|science|health|tech)/.+'
}
'''
