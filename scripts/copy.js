/* eslint-disable no-console */
var copyfiles = require('copyfiles');

copyfiles(
  ["./index.js", "./history.js", "./matcher.js", "./extra/**", "./preact"],
  {
    verbose: true,
    error: true
  },
  function(error) {
    if (error) {
      console.log("\x1b[41m%s\x1b[0m", "ERROR!", error.message);
    } else {
      console.log("\x1b[32m%s\x1b[0m", "Copied successfully!");
    }
  }
);
