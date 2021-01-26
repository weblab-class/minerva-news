import datetime
from .setup import MongoJSONEncoder, common_db


TODAY = str(datetime.date.today())


class Common:
    def __init__(self, popular):
        self.date = TODAY
        self.popular = popular

    def format_json(self):
        return {
            'date': self.date,
            'popular': self.popular,
        }

    def create_db_entry(self):
        ''' json for creating article entry in database '''
        info = self.format_json()
        common_db.insert_one(info)

    def query_db_entry(self):
        ''' return article as json '''
        return MongoJSONEncoder().encode(
            common_db.find_one({'date': self.date})
        )
