import re
import json
import random
import time
import datetime
import requests
import sys

from collections import deque
from bs4 import BeautifulSoup
from urllib.request import Request, urlopen
from urllib.parse import urljoin
from urllib.error import HTTPError

"""
A class dedicated to crawling and finding the news urls, another class will handle scraping
"""

HEADER = {'User-Agent': 'Mozilla/5.0'}  # get around 403 forbidden error

def randomize_scrape_pattern():
    time.sleep(5 + random.random() * 10)
    return

def crawl(src, url_crawl, url_save, visited, parser = "html.parser",selector = 'a', postfunc = lambda x: x['href']):
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
                all_urls.extend(crawl(url, url_crawl, url_save, visited, parser, selector, postfunc))

        return all_urls
    except Exception:
        return []

if __name__ == "__main__":
    """
    params = {
        "name": "New York Times",
        "src": "https://www.nytimes.com/",
        "crawl": r"https://www.nytimes.com/(?!video)[^#]*",
        "article": r"https://www.nytimes.com/(article/|(live/)?2021/01/2[0-9]/)[^#]+",
    }
    
    params = {
        "name": "AP News",
        "src": "https://apnews.com/",
        "crawl": r"https://apnews.com/.*",
        "article": r"https://apnews.com/article/.+" 
    }
    
    params = {
        "name": "BBC News",
        "src": "https://www.bbc.co.uk/news/10628494#userss",
        "crawl": r"https://(feeds.bbci.co.uk|www.bbc.co.uk|www.bbc.com)/",
        "article": r"https://www.bbc.(co.uk|.com)/news/[a-z]+[^/]+"
    }
    """
    params = {
        "name": "Fox News",
        "src": "https://www.foxnews.com/",
        "crawl": r"https://www.foxnews.com/((?!shows)[^/]*|category/.*)",
        "article": r"https://www.foxnews.com/(us|politics|media|opinion|sports|world|science|health|tech)/.+"
    }
    
    
    with open(f'./news_data/{params["name"]}', 'w+') as f:
        json.dump(crawl(params['src'], params['crawl'], params['article'], set()), f)