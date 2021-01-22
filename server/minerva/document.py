class Document:
    ''' Document layout minerva adheres to

        User should define the contents and integrate with the respective libraries minerva provides
    '''
    def __init__(self, text, categories):
        self.text = text
        self.categories = categories

    ''' other methods to be defined'''
