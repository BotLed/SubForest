# ＳｕｂＦｏｒｅｓｔ
A web app that uses Perlin Noise procedural generation to visualize any subreddit by creating a forest representing its top posts, statistics and comments in the form of trees, clouds, etc.

Utilizes React-Three-Fiber (React/Three.js) on the front-end and Flask on the back-end, with the back-end acting as a REST API to communicate with the front-end. 

## Required Libraries and Third-Party Tools
- **Node v23.5.0** or newer
- **NPM v10.9.2** or newer

## How to Build
1. **Clone the repository using Git**
   
   ```bash
   git clone https://github.com/BotLed/SubForest.git
   
   ```
2. **In the top level of the repository install necessary packages for Flask**
   
   ```bash
   pip install requirements.txt
   
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
   

**Current Progress screenshots as of Feb 28, 2025**
![image](app/assets/progress1.png)

![image](app/assets/progress2.png)

*P.S*: This is literally the best guide on the planet to Hexagonal grids (I LOVE YOU RED BLOB GAMES):
- https://www.redblobgames.com/grids/hexagons-v1/#basics
