import sys
import os

from .setup import MongoJSONEncoder, article_db


class Article():
    ''' reference container for article in db '''

    def __init__(self, id, url, source, title, body_text, tags=[]):
        ''' __init__ contains all items needed in backend processing '''
        self.id = id
        self.url = url
        self.source = source
        self.title = title
        self.body_text = body_text
        self.tags = tags

    def format_json(self):
        return {
            'id': self.id,
            'url': self.url,
            'source': self.source,
            'title': self.title,
            'body_text': self.body_text,
            'tags': self.tags,
        }

    def create_db_entry(self):
        ''' json for creating article entry in database '''
        info = self.format_json()
        query = {"url": self.url}
        if article_db.find_one(query) == None:
            article_db.insert_one(info)
        else:
            article_db.fine_one_and_replace(query, info)

    def query_db_entry(self):
        ''' return article as json '''
        return MongoJSONEncoder().encode(
            article_db.find_one({'id': self.id})
        )
