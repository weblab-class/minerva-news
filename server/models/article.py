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

    def create_db_article(self):
        ''' json for creating article entry in database '''
        articleinfo = {
            'id': self.id,
            'url': self.url,
            'source': self.source,
            'title': self.title,
            'body_text': self.body_text,
        }
        articleQuery = {"id": self.id}
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
