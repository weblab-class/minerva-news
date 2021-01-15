# minerva
Using AI to revolutionize how we browse and comprehend news

## Development Notes
React frontend, Python/Flask backend, and MongoDB

Node/npm is used in the development process for frontend.

When first cloning repo, make sure to run in ./client 
```
npm install
```
which will create a node_modules folder with the dependencies specified in package.json. Also run in ./server
```
pip3 install requirements.txt
```
for the neccessary Python libs

To start development server (http://localhost:5000/). Make sure you are in ./client
```
npm start
```

which will live update as the frontend code is updated

To run backend (http://localhost:3000/). Make sure you are in ./server
```
python3 server.py
```
