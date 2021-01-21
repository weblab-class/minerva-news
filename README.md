# minerva
Using AI to revolutionize how we browse and comprehend news

## Development Notes
React frontend, Python/Flask backend, and MongoDB

npm & create-react-app is used in the development process for frontend.

When first cloning repo, make sure to run
```
npm install
```
which will create a node_modules folder with the dependencies specified in package.json. Also run
```
pip3 install -r requirements.txt
```
for the necessary Python libs

### Frontend
To start the development server, which enables hotloading on http://localhost:3000
```
npm start
```

### App
To test frontend + backend, we first need a production build
```
npm run build
```
Then run
```
python3 app.py
```
The app will be hosted on http://localhost:5000

Important: Please do not attempt to set up a proxy. Authentication won't work unless frontend/backend are on same port.

## Heroku Deployment
Make sure you have Heroku CLI installed. We will be using gunicorn, python WSGI HTTP server,
to serve the Flask application (specified in Procfile).

First comment out in app.py
```
app.run( ... )
```
Next create the app on Heroku. Then run
```
heroku git:remote -a {YOUR_APP_NAME}
heroku buildpacks:set heroku/python
heroku buildpacks:add --index 1 heroku/nodejs
```
to set up the Heroku build environment. Next, set the environmental variables on Heroku.
```
heroku config:set GOOGLE_CLIENT_ID={YOUR_GOOGLE_CLIENT_ID}
heroku config:set GOOGLE_CLIENT_SECRET={YOUR_GOOGLE_CLIENT_SECRET}
heroku config:set MONGODB_SRV={YOUR_MONGODB_SRV}
```
Finally commit to Heroku (repeat for subsequent deploys)
```
git add .
git commit -m {COMMIT_MESSAGE}
git push heroku master
```
