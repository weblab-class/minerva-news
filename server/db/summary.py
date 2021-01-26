from .setup import MongoJSONEncoder, summary_db

class Summary():
    def __init__(self, content, newsIds, category, tags = []):
        self.content = content
        self.newsIds = newsIds
        self.category = category
        self.tags = tags
        summary_db.insert_one({"one": "one"})
        #print(type(self.newsIds[0]))
        #print(type(self.tags[0]))

    def format_json(self):
        ''' json for creating summary entry in database '''
        return {
            'content' : self.content,
            'newsIds' : self.newsIds,
            'category' : self.category,
            'tags' : self.tags,
        }

    def create_db_entry(self):
        info = self.format_json()
        #print("insert", info)
        summary_db.insert_one(info)

"""
    @classmethod
    def nuke_summary_db(cls):
        summary_db.delete_many({})
        """