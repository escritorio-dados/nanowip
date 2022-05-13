const path = require('path');

module.exports = function override(config) {
  config.resolve = {
    ...config.resolve,

    alias: {
      ...config.alias,
      '#config': path.resolve(__dirname, 'src/config'),
      '#shared': path.resolve(__dirname, 'src/shared'),
      '#modules': path.resolve(__dirname, 'src/modules')
    },

    fallback: {
      ...config.fallback,
      'react/jsx-runtime': 'react/jsx-runtime.js',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
    },
  };

  // config.plugins = config.plugins.filter(plugin => {
  //   if (plugin.constructor.name === 'ForkTsCheckerWebpackPlugin') return false;
  //   return true;
  // });

  return config;
};
