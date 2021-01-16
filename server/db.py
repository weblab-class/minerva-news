import pymongo

from models.user import User

with open('secret/mongodb_atlas_srv.txt', 'r') as fin:
    MONGO_ATLAS_SRV = fin.read().strip()

client = pymongo.MongoClient(MONGO_ATLAS_SRV)
db = client.minerva

# database.collections
user_db = db.users
