import db


class Article:
    ''' reference container for article in db '''

    def __init__(self, id, url, source, title, body_text):
        ''' __init__ contains all items needed in backend processing '''
        self.id = id
        self.url = url
        self.source = source
        self.title = title
        self.body_text = body_text
        self.tags = []

    @classmethod
    def from_dict(cls, news_dict):
        return cls(0, news_dict['url'], news_dict['source'], " ", news_dict['text'])

    def to_dict(self):
        return {"url": self.url, "source": self.source, "text": self.body_text, "tags": self.tags}

    def create_db_article(self):
        ''' json for creating article entry in database '''
        articleinfo = {
            'id': self.id,
            'url': self.url,
            'source': self.source,
            'title': self.title,
            'body_text': self.body_text,
            'tags': self.tags,
        }
        articleQuery = {"url": self.url}
        if db.article_db.find_one(articleQuery) == None:
            db.article_db.insert_one(articleinfo)
        else:
            db.article_db.fine_one_and_replace(articleQuery, articleinfo)

    def query_db_article(self):
        ''' return article as json '''
        return db.MongoJSONEncoder().encode(
            db.article_db.find_one(
                {'id': self.id}
            )
        )
