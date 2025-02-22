class Post:
    def __init__(self, link, title):
        self.link = link
        self.title = title

        # Rank has not been set so is initialized to -1, this is updated later based on karma in main.py
        self.rank = -1

    
    def __str__(self):
        return (f"Post title: {self.title}\n"
                f"Link: {self.link}\n"
                f"Rank: {self.rank}\n")


    def set_link(self, new_link):
        self.link = new_link

    
    def get_link(self):
        return self.link

    
    def set_title(self, new_title):
        self.title = new_title


    def get_title(self):
        return self.title
    

    def set_rank(self, new_rank):
        self.link = new_rank

    
    def get_rank(self):
        return self.rank
