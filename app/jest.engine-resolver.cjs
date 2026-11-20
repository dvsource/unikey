const path = require("node:path");
const presetResolver = require(require("jest-expo/jest-preset").resolver);

const engine = path.resolve(__dirname, "../engine/src");
module.exports = (name, options) => {
  if (options.basedir === engine || options.basedir.startsWith(engine + path.sep)) {
    if (name.startsWith(".") && name.endsWith(".js")) name = name.slice(0, -3) + ".ts";
    if (name.startsWith("@babel/runtime/")) options = { ...options, basedir: __dirname };
  }
  return presetResolver(name, options);
};
