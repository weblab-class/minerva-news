# minerva
Using AI to revolutionize how we browse and comprehend news

## Development Notes
React frontend, Python/Flask backend, and MongoDB

npm/create-react-app is used in the development process for frontend.

When first cloning repo, make sure to run
```
npm install
```
which will create a node_modules folder with the dependencies specified in package.json. Also run
```
pip3 install -r requirements.txt
```
for the necessary Python libs

To start development server.
```
npm start
```

which will live update as the frontend code is updated

To run backend. Make sure you are in ./server
```
python3 app.py
```

## Heroku Deployment
First make sure you have Heroku CLI installed. We will be using gunicorn, python WSGI HTTP server,
to serve the Flask application (specified in Procfile).

To get a production ready build, run
```
npm run build
```
which will create the build folder. Next create the app on Heroku. Then run
```
heroku git:remote -a {YOUR_APP_NAME}
heroku buildpacks:set heroku/python
heroku buildpacks:add --index 1 heroku/nodejs
```
to set up the Heroku build environment. Finally commit to Heroku
```
git add .
git commit -m {COMMIT_MESSAGE}
git push heroku master
```

You are now ready to view the product.
