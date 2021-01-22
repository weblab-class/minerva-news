import os

''' Enviornmental Variables '''
os.environ['DEPLOY'] = 'a'#'HEROKU'

if os.environ.get('DEPLOY') != 'HEROKU':
    with open('env.txt', 'r') as fin:
        env = tuple(fin.read().splitlines())
    os.environ['GOOGLE_CLIENT_ID']     = env[0]
    os.environ['GOOGLE_CLIENT_SECRET'] = env[1]
    os.environ['MONGO_ATLAS_SRV']      = env[2]
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'


''' Server entry point '''
import json
import flask

from server import auth_api, login_manager
from server.db import user_db, article_db

app = flask.Flask(__name__, static_folder='build/', static_url_path='/')
app.secret_key = os.urandom(24)
app.register_blueprint(auth_api, url_prefix='/api')
login_manager.init_app(app)

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
        all_ids = article_db.distinct('id')
    else:
        all_ids = article_db.distinct('id', {'tags': {'$all': tags}})
    return flask.jsonify(all_ids)


@app.route('/api/news', methods=['POST'])
def get_news():
    newsids = flask.request.get_json()['newsids']
    news = article_db.find({ 'id': {'$in': newsids}})
    def id2news(one_news):
        return {
            'title': one_news['title'],
            'source': one_news['source'],
            'id': one_news['id'],
            'content': one_news['body_text'],
            'upvotes': 0,
            'image': None,
            'numComments': 0,
            'numAnnotations': 0,
        }
    return flask.jsonify(list(map(id2news, news)))

@app.route('/api/collections', methods=['GET'])
def collections():
    userid = flask_login.current_user.id
    return flask.jsonify(user_db.find_one({'id': userid})['collections'])


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

@app.errorhandler(404)
def handle_404(e):
    return app.send_static_file('index.html')


if os.environ.get('DEPLOY') != 'HEROKU':
    app.run(host='0.0.0.0', port=5000, debug=False)
