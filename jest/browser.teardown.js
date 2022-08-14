const child_process = require("child_process");

const commonTeardown = require("./common.teardown");

module.exports = async function globalTeardown() {
  // Your global teardown

  global.moduleServer.stdio.forEach((s) => s.pause());

  // Windows doesn't respect a *nix kill signal
  if (process.platform === "win32") {
    child_process.exec("taskkill /pid " + global.moduleServer.pid + " /T /F");
  } else {
    global.moduleServer.kill();
  }
  console.log("stopped express");

  await commonTeardown();
};
