const { exec } = require("child_process");
const path = require("path")

 const runPrediction = (teamA, teamB) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, "../../algorithm/predict.py");

    exec(
      `python "${scriptPath}" "${teamA}" "${teamB}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(stderr);
          return reject("Python execution failed");
        }

        try {
          const data = JSON.parse(stdout);
          resolve(data);
        } catch (err) {
          console.error(stdout);
          reject("Invalid JSON from ML");
        }
      }
    );
  });
};
module.exports = { runPrediction };