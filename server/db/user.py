import flask_login

from .db import MongoJSONEncoder, user_db

DEFAULT_COLLECTIONS = {
    'US': {
        'tags': ['trump', 'america', 'covid-19'],
        'img': 'USFlag.png'
    },
    'World': {
        'tags': ['china', 'un'],
        'img': 'USFlag.png'
    }
}


class User(flask_login.UserMixin):
    ''' reference container for user in db '''

    def __init__(self, id, name, email, picture):
        ''' __init__ contains all items needed in backend processing '''
        self.id = id
        self.name = name
        self.email = email
        self.picture = picture

    def create_db_user(self):
        ''' json for creating user entry in database '''
        userinfo = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'picture': self.picture
        }
        userinfo['collections'] = DEFAULT_COLLECTIONS
        user_db.insert_one(userinfo)

    def query_db_user(self):
        ''' return user as json '''
        return MongoJSONEncoder().encode(
            user_db.find_one(
                {'id': self.id}
            )
        )

    def add_collection(self, name, tags):
        user_db.update_one(
            { 'id': self.id },
            {
                '$set': {
                    'collections.' + name : {
                        'tags': tags,
                        'img': 'user_collection.png'
                    }
                }
            }
        )

    def remove_collection(self, name):
        user_db.update_one(
            { 'id': self.id },
            {
                '$unset': {
                    'collections.' + name : 1
                }
            }
        )
