const path = require("node:path");

const engine = path.resolve(__dirname, "../engine/src");
module.exports = base => ({
  watchFolders: [...base.watchFolders, engine],
  resolver: {
    ...base.resolver,
    nodeModulesPaths: [...base.resolver.nodeModulesPaths, path.join(__dirname, "node_modules")],
    resolveRequest(context, name, platform) {
      const resolve = base.resolver.resolveRequest ?? context.resolveRequest;
      if (context.originModulePath.startsWith(engine + path.sep) && name.startsWith(".") && name.endsWith(".js")) {
        return resolve(context, name.slice(0, -3) + ".ts", platform);
      }
      return resolve(context, name, platform);
    },
  },
});
