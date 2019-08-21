module.exports = function(api) {
  api.cache(true);

  return {
    plugins: [
      "@babel/plugin-transform-react-jsx",
      "@babel/plugin-transform-modules-commonjs"
    ]
  };
};
