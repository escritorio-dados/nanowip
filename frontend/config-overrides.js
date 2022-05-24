const { useBabelRc, override } = require('customize-cra');
const path = require('path');

const resolvePathCofig = config => {
  config.resolve = {
    ...config.resolve,

    alias: {
      ...config.alias,
      '#config': path.resolve(__dirname, 'src/config'),
      '#shared': path.resolve(__dirname, 'src/shared'),
      '#modules': path.resolve(__dirname, 'src/modules')
    },
  };

  return config;
}

const configPlugins = config => {
  config.plugins = config.plugins.filter(plugin => {
    if (plugin.constructor.name === 'ForkTsCheckerWebpackPlugin') return false;
    return true;
  });

  return config;
}

module.exports = override(useBabelRc(), resolvePathCofig, configPlugins);
