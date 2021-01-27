import flask_login

from .setup import MongoJSONEncoder, user_db


class User(flask_login.UserMixin):
    ''' reference container for user in db '''

    def __init__(self, id, name, email, picture):
        ''' __init__ contains all items needed in backend processing '''
        self.id = id
        self.name = name
        self.email = email
        self.picture = picture

    def format_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'picture': self.picture
        }

    def create_db_entry(self):
        ''' json for creating user entry in database '''
        info = self.format_json()
        info['collections'] = {}
        user_db.insert_one(info)

    def query_db_entry(self):
        ''' return user as json '''
        return MongoJSONEncoder().encode(
            user_db.find_one({'id': self.id})
        )

    def add_db_collection(self, name, tags):
        user_db.update_one(
            {'id': self.id},
            {'$set': {'collections.' + name: {
                'tags': tags,
                'img': 'user_collection.png'
            }}}
        )

    def remove_db_collection(self, name):
        user_db.update_one(
            {'id': self.id},
            {'$unset': {'collections.' + name: 1}}
        )
