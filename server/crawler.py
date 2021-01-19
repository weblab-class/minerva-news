import re
import time
import datetime
import requests

from bs4 import BeautifulSoup
from urllib.request import Request, urlopen
from GoogleNews import GoogleNews

from models.article import Article

# Used for development
UPDATE_DB = False


BEGIN = str(datetime.date.today() - datetime.timedelta(days=2))
BEGIN_URL = '/'.join(BEGIN.split('-'))
TODAY = str(datetime.date.today())  # - timedelta(days=1))
TODAY_URL = '/'.join(TODAY.split('-'))


def alt_date_format(url):
    dates = url.split('/')
    return '/'.join(dates[1:] + dates[:1])


newspapers = {
    'cnn': {
        'name': "CNN",
        'url': 'https://www.cnn.com',
        'url_pattern': r'[0-9]+/[0-9]+/[0-9]+/' + '(?!entertainment)',
        'is_article_pattern': 'index.html',
        'title_class': 'pg-headline',
        'body_classes': ['zn-body__paragraph'],
        'headings': ['h3', 'strong'],
        'source_tag': r'.*\(CNN.*?\)'
    }
}

HEADER = {'User-Agent': 'Mozilla/5.0'}  # get around 403 forbidden error
ENDPAGE = 5
googlenews = GoogleNews(start=alt_date_format(BEGIN_URL),
                        end=alt_date_format(TODAY_URL))


def scrape(source):
    ''' Given source (key for newspapers), scrape from urls found by GoogleNews
        Creates article entry in db with id = timestamp scraped
    '''
    paper = newspapers[source]

    def not_heading(x):
        tags = set([tag.name for tag in x.find_all()])
        return not any([h in tags for h in paper['headings']])

    urls = set()
    googlenews.search(paper['url'])
    for i in range(1, ENDPAGE):
        googlenews.getpage(i)
        urls |= set([r['link'] for r in googlenews.result()])

    # scrape individual articles
    for url in urls:
        if not paper['is_article_pattern'] in url:
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
            sections = [re.sub(r'[^\u0000-\u007F]', r'', s.get_text()) for s in sections]
            if len(sections) == 0:
                return None
            sections[0] = re.sub(paper['source_tag'], '', sections[0])
            body_text = ' '.join([s for s in sections if len(s)])
            body_text = re.sub(r'\n', ' ', body_text)

            article = Article(article_id, url, source, title, body_text)
            # add article to db
            if UPDATE_DB:
                article_id = str(time.time())
                article.create_db_article()
        except:
            print('Article not valid: ' + url)
        else:
            print(url)

def crawl():
    scrape('cnn')


crawl()
