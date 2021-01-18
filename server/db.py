import bson, json
import pymongo


class MongoJSONEncoder(json.JSONEncoder):
    ''' Flask.jsonify does not natively work with MongoDB

        command: JSONEncoder().encode(JsonToConvert)
    '''
    def default(self, o):
        if isinstance(o, bson.ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)


# connect with mongodb atlas
with open('secret/mongodb_atlas_srv.txt', 'r') as fin:
    MONGO_ATLAS_SRV = fin.read().strip()

client = pymongo.MongoClient(MONGO_ATLAS_SRV)
db = client.minerva

# database.collections
user_db = db.users
article_db = db.articles
