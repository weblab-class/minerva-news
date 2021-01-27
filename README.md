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
We now discuss how to extract tags from text. We utilize an industrial-grade nlp library, [spacy](https://spacy.io/), to preprocess the text; from which we obtain word tokenization, parts-of-speech, and word lemmatization. We consider proper and improper nouns only, since verbs, adverbs, and adjectives are often used subjectively and generally can apply to anything. We then filter out a list of noun stopwords which we gratefully obtained from https://github.com/isaacg1/words. From this, we choose the most frequently occurring proper nouns and nouns as tags for the article. Lastly, we split the compound words and convert everything to lower case so that our tag search is case-insensitive.

### Article Category Classification
We categorize articles and update the categories on a daily basis via an algorithm inspired by K-means, in order to keep our categories up to date with the changing events. We have 7 clusters with fixed labels, and have manually tagged some 100 articles into these clusters as a starting point. The news articles are represented as frequency dictionaries of the lemmas of nouns and pronouns (as in the tagging algorithm).  We thus have an embedding of all news articles into a Euclidean space. The categories are represented by the “centroid” of its news articles, i.e., a dictionary which, for each lemma, saves the average frequency which it occurs in its news. 
Each day, using newly scraped news on the day of, we complete 1 iteration of our categorizing algorithm, which has 2 steps.
Step 1: Classification. 
For every new article, we classify it based on which category has a closer cosine distance to it. Specifically, if the news article is represented as a dictionary {k: n_k}, where k ranges through all lemmas in the news article, and a category is represented as {k: c_k}, then the distance is set as sum(n_kc_k)/sqrt(sum(n_k^2)sum(c_k^2)).
Step 2: Re-assignment:
For each cluster, we delete the old news in it, then reassign its value to the average of the frequency dicts of all the news it now contains. This will keep the categories gradually updated from day to day and keep up with the changing events.

### Information Clustering and Main Idea Extraction
For generating the summaries, we have a second layer of clustering to make more specific clusters by main ideas and generate more comprehensive summaries overall. For this we apply K-means on each category obtained above. The news are again represented as frequency dictionaries of word lemma. However, in order to fully utilize our data, we have included verbs, adverbs and adjectives, in addition to nouns and pronouns. We filter these words against a list of stopwords, gratefully obtained from... to obtain the freq dict for each news. We have chosen to set the clusters to have an average size of 12 articles each.

### Summary Generation
To generate the summary from each subcluster, we join them together as a string, and put it as an input to Google’s Pegasus-CNN_Dailymail model. We then make some minor changes to the output to remove excessive punctuations to obtain the summaries we display. Lastly, we run the tagging algorithm again on the obtained summaries, except without splitting compound proper nouns, to obtain the tags for each summary.
