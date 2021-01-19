import db


class Article:
    ''' reference container for article in db '''

    def __init__(self, id):
        self.id = id

    def create_db_article(self, url, source, text, title):
        ''' json for creating article entry in database '''
        articleinfo = {
            'id': self.id,
            'url': url,
            'source': source,
            'text': text,
            'title': title,
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

