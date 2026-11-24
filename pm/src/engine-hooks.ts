// The engine (engine/src) imports its own TypeScript files as `./x.js` (the bundler convention). Plain Node strips the
// types but resolves `.js` literally, so this resolve hook retries a missing `.js` import as `.ts`. Only for files
// inside the repo's engine/ folder.
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (e) {
      const parent = context.parentURL ?? "";
      if ((e as { code?: string }).code === "ERR_MODULE_NOT_FOUND" && specifier.endsWith(".js") && parent.includes("/engine/")) {
        return next(specifier.slice(0, -3) + ".ts", context);
      }
      throw e;
    }
  },
});
