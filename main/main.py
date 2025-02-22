from bs4 import BeautifulSoup
import requests

class Scraper:
    def __init__(self, url, headers):
        self.url = url
        self.headers = headers

        # Idk what to do with the data yet, so change this to dict later maybe
        self.top_posts = []

        self.response = requests.get(url, headers=headers, timeout=5)

        # Using lxml instead of default python parser because of speed
        self.soup = BeautifulSoup(self.response.text, "lxml")


    def set_top_posts(self):
        for link in self.soup.find_all('a', 'title may-blank outbound'):
            self.top_posts.append(link.text)


    def get_top_posts(self):
        for rank, post in enumerate(self.top_posts):
            print(rank, post, "\n")


if __name__ == "__main__":
    URL = "https://old.reddit.com/r/projectzomboid/top/?sort=top&t=day"

    HEADERS = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' 
           ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
            }

    reddit = Scraper(URL, HEADERS)
    reddit.set_top_posts()
    reddit.get_top_posts()
