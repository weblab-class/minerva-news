import os
import flask
import json

app = flask.Flask(__name__, static_folder='build/', static_url_path='/')

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/test')
def query():
    return json.dumps({"message": "Success"})
