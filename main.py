from flask import Flask
from app.app import App

if __name__ == "__main__":
    app_instance = App()
    app_instance.run()
