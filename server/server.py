import os
import json
import requests

import flask
import flask_login

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


@app.route("/api/collections", methods=['POST'])
def collections():
    collectionObjs = [
        {
            "name": "US",
            "tags": [
                "US",
                "Donald Trump",
            ],
            "imageName": "USFlag.png",
        },
        {
            "name": "World",
            "tags": [
                "World",
                "War",
            ],
            "imageName": "USFlag.png",
        },
    ]
    return flask.jsonify(collectionObjs)


if __name__ == "__main__":
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # for local testing only
    app.run(host='0.0.0.0', port=os.environ.get('PORT', 3000), debug=True)
