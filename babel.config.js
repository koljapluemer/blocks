// babel-preset-expo auto-adds react-native-worklets/plugin (Reanimated 4) when the
// package is installed, so it is not listed here. nativewind/babel is a preset in v4.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
