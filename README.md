# minerva
Using AI to revolutionize how we browse and comprehend news. It is hosted on https://minerva-news.herokuapp.com.

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
First set env variables in env.txt, specifically
```
{YOUR_GOOGLE_CLIENT_ID}
{YOUR_GOOGLE_CLIENT_SECRET}
{YOUR_MONGO_ATLAS_SRV}
```
To test frontend + backend, we first need a production build for frontend (only build if frontend changes)
```
npm run build
```
Then to launch the app run
```
python3 app.py
```
The app will be hosted on http://localhost:5000. To run both at once do (recommended since one often forgets to build)
```
sh run.txt
```
If some components exhibit weird behavior after correct bugs, try clearing browser cache etc...

## Heroku Deployment
Make sure you have Heroku CLI installed. We will be using gunicorn, python WSGI HTTP server,
to serve the Flask application (specified in Procfile).

First change os.environ['GUNICORN'] in app.py to HEROKU as opposed to LOCAL.

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
heroku config:set MONGO_ATLAS_SRV={YOUR_MONGO_ATLAS_SRV}
```
Finally commit to Heroku (repeat for subsequent deploys)
```
git add .
git commit -m {COMMIT_MESSAGE}
git push heroku master
```
Make sure to wait a little bit before accessing the website. Otherwise 1) it might not update or 2) freeze.

## Minerva Frontend Interface

### Landing Page
The landing page is only displayed for users who are not currently log in. To use the site, click “Start Reading” or “Login with Google”, then authenticate with your google account in the pop-up, and you’ll be automatically redirected to the home page.

### Navigation Bar
Use this bar to navigate around our site. Clicking on “Home” takes you to the home page. Clicking on the profile button will show a small modal of your profile picture and name. Finally, click the logout button to logout or switch users.

### Information Modals
Most of our components will have a small ? icon to the right of their titles. Clicking on it will open a modal describing in detail how to use the component.

### Home Page
The home page is where you can explore news. To see all news, just scroll down on the page to read the feed. Minerva provides 3 other components for exploring news. 
On the left side is the collections sidebar, which offers a selection of 7 collections. Clicking on a collection will reload the feed with only the news categorized in the selected collection.
On top of feed is the tag selection search box. Input tags by typing the word you’re interested in, adding the prefix #. You may also select tags by clicking on one of the selected tags. You may select more than one tag to search for a broader range of topics. Press Enter on the tag box to search. This will reload the feed with only the news relevant to at least 1 selected tag. Pressing Enter again on the same tags will randomly reshuffle the feed.
On the right side is the summaries sidebar, where you can see the brief descriptions and tags of today’s main events. Our NLP pipeline automatically clusters the articles into small groups of around 12 news articles, then use them to generate a summary and the related tags.

### Reading Page
Our reading page allows you to read a single news article in detail and to interact with other users on Minerva through annotations. The main panel displays the news source, title and content. 
On the top-right is the annotation toolbox, used for creating annotations. To create an annotation, select a color in the annotation toolbox by clicking on the colored circles, then select some text in the news content using your mouse. The text will then be highlighted with the chosen color for preview, and a modal will pop up to write a text comment associated with your highlight, and to submit or cancel the annotation. After you submitted, the annotation will show up on the comments section.
On the right is the comment section, where you can view comments which other people have posted. Click on a comment to show its corresponding highlight.

## Minerva Backend Pipeline
The backend is where all the heavy lifting occurs-- where nlp, machine learning, inference, and algorithms
come together to make the information the user obtains in the frontend possible. Specifically, hundreds of recent news
articles are scraped from many sources and relevant features are extracted/computed to yeild our tagging system,
summarization system, and article grouping system.

First, Minerva is built upon tags-- keywords from a piece of text. Although one tag usually isn't sufficient
to do much, frequency distributions have many nice properties which we exploit to yield maximum performance.

### Tag Extraction
We now discuss how to extract tags from text. We utilize an industrial-grade nlp library, [spacy](https://spacy.io/),
to preprocess the text; from which we obtain word tokenization, parts-of-speech, and word lemmatization. We
consider proper and improper nouns only, since verbs, adverbs, and adjectives are often used subjectively
and generally can apply to anything,


### Article Category Classification

### Information Clustering and Main Idea Extraction

### Summary Generation
