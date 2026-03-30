const { getDefaultConfig } = require("expo/metro-config");

// Fix Metro resolving tslib via package "exports" (tslib/modules/index.js),
// which can crash with: "Cannot destructure property '__extends' of 'tslib.default'".
// Force tslib to the ES module-friendly build that Metro can load reliably.
const TSLIB_ALIAS = require.resolve("tslib/tslib.es6.js");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
	...transformer,
	babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

config.resolver = {
	...resolver,
	assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
	sourceExts: [...resolver.sourceExts, "svg"],
};

const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "tslib") {
    return context.resolveRequest(context, TSLIB_ALIAS, platform);
  }
  return upstreamResolveRequest
    ? upstreamResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

