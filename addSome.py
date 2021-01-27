import os
''' Enviornmental Variables '''
os.environ['DEPLOY'] = 'LOCAL'

if os.environ.get('DEPLOY') != 'HEROKU':
    with open('./env.txt', 'r') as fin:
        env = tuple(fin.read().splitlines())
    os.environ['GOOGLE_CLIENT_ID']     = env[0]
    os.environ['GOOGLE_CLIENT_SECRET'] = env[1]
    os.environ['MONGO_ATLAS_SRV']      = env[2]
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'


from server.db import article_db
import json
from server.db.article import Article
with open("./server/news_data/1-21/cnn_with_tags.txt") as f:
    news = json.load(f)
for k, v in news.items():
    art = Article(v['id'], v['url'], v['source'], v['title'], v['body_text'], v['tags'])
    art.create_db_entry()