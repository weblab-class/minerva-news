import json
import requests
import os

import flask
import flask_login
import oauthlib.oauth2


class User(flask_login.UserMixin):
    def __init__(self, id_, name, email, profile_pic):
        self.id = id_
        self.name = name
        self.email = email
        self.profile_pic = profile_pic


app = flask.Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)

login_manager = flask_login.LoginManager()
login_manager.init_app(app)
GOOGLE_CLIENT_ID = '99803564144-egqkbueq8b14its0tneh2h1u6fadp37v.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET = '5YuYfWrT9EkWjV_qW0b8vcS7'
GOOGLE_DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration'

client = oauthlib.oauth2.WebApplicationClient(GOOGLE_CLIENT_ID)


user = None


@login_manager.user_loader
def load_user(user_id):
    global user
    return user


@app.route("/")
def index():
    if flask_login.current_user.is_authenticated:
        return (
            "<p>Hello, {}! You're logged in! Email: {}</p>"
            "<div><p>Google Profile Picture:</p>"
            '<img src="{}" alt="Google profile pic"></img></div>'
            '<a class="button" href="/logout">Logout</a>'.format(
                flask_login.current_user.name, flask_login.current_user.email, flask_login.current_user.profile_pic
            )
        )
    else:
        return '<a class="button" href="/login">Google Login</a>'


def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()


@app.route("/login")
def login():
    # Find out what URL to hit for Google login
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    # Use library to construct the request for Google login and provide
    # scopes that let you retrieve user's profile from Google
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=flask.request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )
    return flask.redirect(request_uri)


@app.route("/login/callback")
def callback():
    # Get authorization code Google sent back to you
    code = flask.request.args.get("code")
    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]
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
    # Parse the tokens!
    client.parse_request_body_response(json.dumps(token_response.json()))

    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)

    if userinfo_response.json().get("email_verified"):
        unique_id = userinfo_response.json()["sub"]
        users_email = userinfo_response.json()["email"]
        picture = userinfo_response.json()["picture"]
        users_name = userinfo_response.json()["given_name"]
    else:
        return "User email not available or not verified by Google.", 400

    # Create User
    global user
    user = User(id_=unique_id, name=users_name, email=users_email, profile_pic=picture)

    # Begin user session by logging the user in
    flask_login.login_user(user)
    print(user.name, user.is_authenticated)
    # Send user back to homepage
    return flask.redirect(flask.url_for("index"))


@app.route("/logout")
@flask_login.login_required
def logout():
    flask_login.logout_user()
    global user
    user = None
    return flask.redirect(flask.url_for("index"))


if __name__ == "__main__":
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
    app.run(host='0.0.0.0', port=os.environ.get('PORT', 3000), debug=True)
