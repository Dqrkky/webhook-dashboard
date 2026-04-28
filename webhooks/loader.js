const fs=require("fs");
const path=require("path");

module.exports = function loadProviders() {
  const providers = {};
  const dir = path.join(__dirname, "providers");
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith(".js")) {
      const name = file.replace(".js","");
      console.log(`[Provider Loaded]: ${name}`);
      providers[name] = require(path.join(dir,file));
    }
  });
  return providers;
};
