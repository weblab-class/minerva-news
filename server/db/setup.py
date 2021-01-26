import os
import bson, json
import pymongo

class MongoJSONEncoder(json.JSONEncoder):
    ''' Flask.jsonify does not natively work with MongoDB

        usage: JSONEncoder().encode(JsonToConvert)
    '''
    def default(self, o):
        if isinstance(o, bson.ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)


''' MongoDB Init '''
MONGO_ATLAS_SRV = os.environ.get('MONGO_ATLAS_SRV')
client = pymongo.MongoClient(MONGO_ATLAS_SRV)
db = client.minerva

''' Collections '''
user_db = db.users
article_db = db.articles
summary_db = db.summaries
common_db = db.common
