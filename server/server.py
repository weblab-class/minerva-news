from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello World!'

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=os.environ.get('PORT', 3000), debug=True)
