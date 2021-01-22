import os
import json
import requests
import flask, flask_login
import oauthlib.oauth2

from .db import user_db, User


GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GOOGLE_DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration'
GOOGLE_PROVIDER_CFG = requests.get(GOOGLE_DISCOVERY_URL).json()


''' API Defintion '''
auth_api = flask.Blueprint('auth_api', __name__)


''' Login Manager'''
login_manager = flask_login.LoginManager()

@login_manager.user_loader
def load_user(id):
    userinfo = user_db.find_one({'id': id})
    if not userinfo:
        return None
    return User (
        id=userinfo['id'],
        name=userinfo['name'],
        email=userinfo['email'],
        picture=userinfo['picture']
    )


''' Client Authentication Routes '''
client = oauthlib.oauth2.WebApplicationClient(GOOGLE_CLIENT_ID)

import pymongo

MONGO_ATLAS_SRV = os.environ.get('MONGO_ATLAS_SRV')
client_db = pymongo.MongoClient(MONGO_ATLAS_SRV)
db = client_db.minerva
user_db = db.users


@auth_api.route('/whoami')
def loggedin():
    user = {}
    if flask_login.current_user.is_authenticated:
        user = json.loads(flask_login.current_user.query_db_user())
    return flask.jsonify(user)


@auth_api.route('/login')
def login():
    # Find out what URL to hit for Google login
    authorization_endpoint = GOOGLE_PROVIDER_CFG['authorization_endpoint']

    # Construct the request for Google login
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=flask.request.base_url + '/callback',
        scope=['openid', 'email', 'profile'],
    ),
    return flask.jsonify({'request_uri': request_uri})
    #return flask.redirect(request_uri[0])


@auth_api.route('/login/callback')
def callback():
    # Get authorization code Google sent back to you and request user info
    code = flask.request.args.get('code')
    token_endpoint = GOOGLE_PROVIDER_CFG['token_endpoint']
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=flask.request.url,
        redirect_url=flask.request.base_url,
        code=code
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )
    client.parse_request_body_response(json.dumps(token_response.json()))

    # Get user information once authorized
    userinfo_endpoint = GOOGLE_PROVIDER_CFG['userinfo_endpoint']
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body).json()

    if userinfo_response.get('email_verified'):
        id = userinfo_response['sub']
        name = userinfo_response['given_name']
        email = userinfo_response['email']
        picture = userinfo_response['picture']
    else:
        return 'User email not available or not verified by Google.', 400

    # Create user, maintain user db, and begin session
    user = User(id=id, name=name, email=email, picture=picture)

    if not user_db.find_one({'id': id}):
        user.create_db_user()
    flask_login.login_user(user)

    if os.environ.get('DEPLOY') != 'HEROKU':
        return flask.redirect('http://localhost:5000/')
    return flask.redirect('https://minerva-news.herokuapp.com/')


@auth_api.route('/logout', methods=['POST'])
@flask_login.login_required
def logout():
    flask_login.logout_user()
    return 'Success'
