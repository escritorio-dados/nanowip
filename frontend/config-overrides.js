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

    // Necessario para o DND
    fallback: {
      ...config.fallback,
      'react/jsx-runtime': 'react/jsx-runtime.js',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
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

// module.exports = function override(config, env) {
//   config = resolvePathCofig(config)

//   config = configPlugins(config)

//   return config;
// }

module.exports = override(useBabelRc(), resolvePathCofig, configPlugins);
