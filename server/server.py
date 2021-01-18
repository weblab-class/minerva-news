import os
import json
import requests

import flask
import flask_login

from flask import jsonify
from flask import request
from auth import auth_api
from db import user_db
from models.user import User

# app
app = flask.Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)

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


@app.route("/")
def index():
    if flask_login.current_user.is_authenticated:
        return (
            "<p>Hello, {}! You're logged in! Email: {}</p>"
            "<div><p>Google Profile Picture:</p>"
            '<img src="{}" alt="Google profile pic"></img></div>'
            '<a class="button" href="/api/logout">Logout</a>'.format(
                flask_login.current_user.name, flask_login.current_user.email, flask_login.current_user.picture
            )
        )
    else:
        return '<a class="button" href="/api/login">Google Login</a>'


@app.route("/api/tagsuggest", methods = ['GET'])
def tag_suggestions():
    suggestions = ["COVID", "Trump", "Washington"]
    return jsonify(suggestions)

@app.route("/api/feed", methods = ['GET'])
def feedids():
    return jsonify(list(range(50)))

@app.route("/api/news", methods = ['POST'])
def get_news():
    def id2news(newsid):
        return {
            "title": newsid * 200,
            "source": "Fox News",
            "id": newsid,
            "content": str(newsid) * 200,
            "upvotes": newsid + 5,
            "image": None,
            "numComments": newsid + 10,
            "numAnnotations": newsid + 15,    
        }  
    content = request.get_json()
    return jsonify(list(map(id2news, content['newsids'])))

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
