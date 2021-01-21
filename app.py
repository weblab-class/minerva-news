import os
import flask
import json

app = flask.Flask(__name__, static_folder='build/', static_url_path='/')

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/login')
def login():
    print("JAHSGDSDGASDGGSJADGh")
    return json.dumps({'userId': '1232132149999'})

@app.route('/api/logout', methods=['POST'])
def logout():
    return json.dumps({})

app.run(host='0.0.0.0', port=os.environ.get('PORT', 5000), debug=False)
