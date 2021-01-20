import os
import json
import requests

import flask
import flask_login
import flask_cors

from flask import jsonify
from flask import request
from auth import auth_api
from db import user_db, article_db
from models.user import User

# app
app = flask.Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)
cors = flask_cors.CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

app.register_blueprint(auth_api, url_prefix='/api')

# authentication
login_manager = flask_login.LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(id):
    userinfo = user_db.find_one({'id': id})
    if not userinfo:
        return None
    return User(
        id=userinfo['id'],
        name=userinfo['name'],
        email=userinfo['email'],
        picture=userinfo['picture']
    )


@app.route("/api/tagsuggest", methods=['GET'])
def tag_suggestions():
    suggestions = ["Covid-19", "Trump", "Washington"]
    return jsonify(suggestions)

@app.route("/api/feed", methods = ['POST'])
def get_newsids():
    tags = request.get_json()['tags']
    if len(tags) == 0:
        all_ids = article_db.distinct("id")
    else:
        all_ids = article_db.distinct("id", {"tags": {"$all": tags}})
    return jsonify(all_ids)


@app.route("/api/news", methods=['POST'])
def get_news():
    newsids = request.get_json()['newsids']
    news = article_db.find({ "id": {"$in": newsids}})
    def id2news(one_news):
        return {
            "title": one_news['title'],
            "source": one_news['source'],
            "id": one_news['id'],
            "content": one_news['body_text'],
            "upvotes": 0,
            "image": None,
            "numComments": 0,
            "numAnnotations": 0,
        }
    return jsonify(list(map(id2news, news)))

@app.route("/api/collections", methods=['GET'])
def collections():
    userid = flask_login.current_user.id
    return jsonify(user_db.find_one({"id": userid})['collections'])


@app.route("/api/summaries", methods=['GET'])
def summaries():
    return jsonify([
        {
            "tags": ["Inauguration", "Biden"],
            "summary": """Army deployed to defend Biden during Inauguration day
            after FBI finds evidence of Washington rioters having intent on assasinations.""",
        },
        {
            "tags": ["Russia", "Alexei Navalny"],
            "summary": """Alexei Navalny has been imprisoned for 30 days. Officials give no
            answers to what crimes he committed.""",
        },
    ])


if __name__ == "__main__":
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # for local testing only
    app.run(host='0.0.0.0', port=os.environ.get('PORT', 3000), debug=True)
