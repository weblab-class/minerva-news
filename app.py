import os

''' Enviornmental Variables '''
os.environ['DEPLOY'] = 'LOCAL'

if os.environ.get('DEPLOY') != 'HEROKU':
    with open('env.txt', 'r') as fin:
        env = tuple(fin.read().splitlines())
    os.environ['GOOGLE_CLIENT_ID']     = env[0]
    os.environ['GOOGLE_CLIENT_SECRET'] = env[1]
    os.environ['MONGO_ATLAS_SRV']      = env[2]
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'


''' Server entry point '''
import time
import json
import flask
import time

from server import auth
from server import db

app = flask.Flask(__name__, static_folder='build/', static_url_path='/')
app.secret_key = os.urandom(24)
app.register_blueprint(auth.auth_api, url_prefix='/api')
auth.login_manager.init_app(app)


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/tagsuggest', methods=['GET'])
def tag_suggestions():
    suggestions = ['Covid-19', 'Trump', 'Washington']
    return flask.jsonify(suggestions)


@app.route('/api/feed', methods = ['POST'])
def get_newsids():
    tags = flask.request.get_json()['tags']
    if len(tags) == 0:
        all_ids = db.article_db.distinct('id')
    else:
        all_ids = db.article_db.distinct('id', {'tags': {'$all': tags}})
    return flask.jsonify(all_ids)


@app.route('/api/news', methods=['POST'])
def get_news():
    newsids = flask.request.get_json()['newsIds']
    news = db.article_db.find({'id': {'$in': newsids}})

    def id2news(one_news):
        return {
            'title': one_news['title'],
            'source': one_news['source'],
            'id': one_news['id'],
            'body_text': one_news['body_text'],
            'upvotes': 0,
            'image': None,
            'numComments': 0,
            'numAnnotations': 0,
        }

    return flask.jsonify(list(map(id2news, news)))


@app.route('/api/summaries', methods=['GET'])
def summaries():
    return flask.jsonify([
        {
            'tags': ['Inauguration', 'Biden'],
            'summary': '''Army deployed to defend Biden during Inauguration day
            after FBI finds evidence of Washington rioters having intent on assasinations.''',
        },
        {
            'tags': ['Russia', 'Alexei Navalny'],
            'summary': '''Alexei Navalny has been imprisoned for 30 days. Officials give no
            answers to what crimes he committed.''',
        },
    ])


@app.route('/api/addcomment', methods=['POST'])
def addcomments():
    form = flask.request.get_json()
    commentId = form['newsId'] + 'b' + str(time.time()).replace('.', '-')
    db.article_db.find_one_and_update({'id': form['newsId']}, {'$set': {'comments.' + commentId: form}})
    return {}


@app.route('/api/comments', methods=['POST'])
def comments():
    ret = db.article_db.find_one({'id': flask.request.get_json()['newsId']})
    if not ret:
        return {}
    commentsList = [{**v, 'id': k} for k, v in ret['comments'].items()]
    return flask.jsonify(commentsList)


@app.route('/api/user', methods=['POST'])
def user():
    ids = flask.request.get_json()['ids']
    users = db.user_db.find({'id': {'$in': ids}}, {'name': 1, 'id': 1, '_id': 0})
    id2name = {user['id']: user['name'] for user in users}
    def formatUser(userId):
        return {'userName' : id2name[userId]}
    return flask.jsonify(list(map(formatUser, ids)))


@app.errorhandler(404)
def handle_404(e):
    return app.send_static_file('index.html')


if os.environ.get('DEPLOY') != 'HEROKU':
    app.run(host='0.0.0.0', port=5000, debug=False)
