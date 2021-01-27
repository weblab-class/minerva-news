import json
import re
import time
from bs4 import BeautifulSoup
import traceback
from urllib.request import Request, urlopen
from db import Article

newspapers = {
    "apnews":{ 
        "name": "AP News",
        "article_pattern": "",
        "title_selector": ".Component-h1-0-2-42",
        "date_selector": ".Timestamp.Component-root-0-2-46.Component-timestamp-0-2-45",
        "acceptable_date": lambda x: ("hour" in x or "yesterday" in x or "minute" in x or "second" in x or "2 days" in x),
        "body_selector": "p.Component-root-0-2-179.Component-p-0-2-170"
    }
}

HEADER = {'User-Agent': 'Mozilla/5.0'}  # get around 403 forbidden error

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
        soup = BeautifulSoup(page, 'html5lib')
        print(soup.text)
        try:
            # generate article params
            print(soup.select_one(paper['title_selector']))
            title = soup.select(paper['title_selector'])[0].get_text()
            if paper['check_date']:
                date = soup.select(paper['date_selector'])[0].get_text()
                if not paper['acceptable_date'](date):
                    continue

            sections = soup.select(paper['body_selector'])
            sections = list(filter(not_heading, sections))
            sections = [s.get_text().strip() for s in sections]
            if len(sections) == 0:
                return None
            body_text = '\n '.join([s for s in sections if len(s)])
            #body_text = re.sub(paper['source_tag'], '', body_text)

            article_id = str(time.time())
            article = Article(article_id, url, source, title, body_text)
            articles_list.append(article)
        except Exception as e:
            print('Article not valid: ' + url)
            traceback.print_exc()
        else:
            print(url)
            #print(body_text)

        #randomize_scrape_pattern()

    return articles_list

if __name__ == "__main__":

    with open(f"./news_data/{newspapers['apnews']['name']}") as f:
        urls = json.load(f)
    print(scrape('apnews', urls))
    