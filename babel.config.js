module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      'react-native-reanimated/plugin',
      'optional-require',
      'react-native-paper/babel',
      ['@babel/plugin-proposal-decorators', { 'legacy': true }]
    ]
  }
};
