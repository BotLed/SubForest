from flask import Flask
from flask_cors import CORS
from api.RedditAPI import Emoo

class App:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        self.setup_routes()
        
    def setup_routes(self):
        @self.app.route("/")
        def home():
            return {"message": "Welcome to the #1 API"}

        @self.app.route("/message")
        def message():
            return {"message": "You have entered.... the API ZONE"}

    def run(self):
        self.app.run(debug=False, host="0.0.0.0", port="7630") # since its just an API
