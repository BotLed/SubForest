# ＳｕｂＦｏｒｅｓｔ
A web app that uses Perlin Noise procedural generation to visualize any subreddit by creating a forest representing its top posts, statistics and comments in the form of trees, clouds, etc.

Utilizes React-Three-Fiber (React/Three.js) on the front-end and Flask on the back-end, with the back-end acting as a REST API to communicate with the front-end. 

## Requirements
- **Node v23.5.0** or newer
- **NPM v10.9.2** or newer
- **Python 3.12 or higher**

## How to Build
1. **Clone the repository using Git**
   
   ```bash
   git clone https://github.com/BotLed/SubForest.git
   
   ```
2. **In the root level of the repository install necessary packages for Flask (Do this in an environment preferably)**
   
   ```bash
   pip install -r requirements.txt
   
   ```
3. **Navigate into the 'react-front-end' directory and run**
   
   ```bash
   npm install
   
   ```
   
4. After npm has installed the required dependencies, start up the server

     ```bash
   npm run start-api
   
   ```
5. Finally, start up the front-end
     ```bash
   npm start
   
   ```


![image](app/assets/progress1.png)

![image](app/assets/progress2.png)

*P.S*: This is literally the best guide on the planet to Hexagonal grids (I LOVE YOU RED BLOB GAMES):
- https://www.redblobgames.com/grids/hexagons-v1/#basics
