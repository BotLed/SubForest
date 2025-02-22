import praw

class Emoo:
    def __init__(self, sub_name="all"):
        self.sub_name = sub_name
        self.reddit = reddit = praw.Reddit("bot")
        self.subreddit = self.reddit.subreddit(self.sub_name)


    def top_posts(self):
        posts = []

        for submission in self.subreddit.top(limit=10, time_filter="day"):
            posts.append(submission.title)

        return posts



