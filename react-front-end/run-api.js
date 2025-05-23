const os = require('node:os');
var exec = require('node:child_process').exec;
const isWin = os.platform() == 'win32'

// This is so horrible I hate everything
// FIX: this so its not stupid and does shit properly instead of just this, needs to return Flask's output 

if(isWin) {
  exec('cd ../ && python main.py',
      function (error, stdout, stderr) {
          console.log(stdout);
          console.log(stderr);
          if (error !== null) {
              console.log(error);
          }
      });
} else {
  exec('cd ../ && python3 main.py',
      function (error, stdout, stderr) {
          console.log(stdout);
          console.log(stderr);
          if (error !== null) {
              console.log(error);
          }
      });
}