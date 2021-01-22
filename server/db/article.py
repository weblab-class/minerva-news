from server.minerva.document import Document

from .db import MongoJSONEncoder, article_db

class Article(Document):
    ''' reference container for article in db '''

    def __init__(self, id, url, source, title, body_text):
        ''' __init__ contains all items needed in backend processing '''
        self.id = id
        self.url = url
        self.source = source
        self.title = title
        super().__init__(body_text, [])

    def create_db_article(self):
        ''' json for creating article entry in database '''
        articleinfo = {
            'id': self.id,
            'url': self.url,
            'source': self.source,
            'title': self.title,
            'body_text': self.text,
            'tags': self.categories,
        }
        articleQuery = {"url": self.url}
        if article_db.find_one(articleQuery) == None:
            article_db.insert_one(articleinfo)
        else:
            article_db.fine_one_and_replace(articleQuery, articleinfo)

    def query_db_article(self):
        ''' return article as json '''
        return MongoJSONEncoder().encode(
            article_db.find_one(
                {'id': self.id}
            )
        )
