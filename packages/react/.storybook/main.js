// eslint-disable-next-line @typescript-eslint/no-var-requires
var path = require('path');

const AppSourceDir = path.join(__dirname, '..', 'src');

module.exports = {
  stories: ['../stories/**/*.stories.@(ts|tsx|js|jsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    'storybook-addon-mock',
  ],
  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    check: true, // type-check stories during Storybook build
  },
  webpackFinal: async (config) => {
    // Remove the existing css rule
    config.module.rules = config.module.rules.filter(
      (f) => f.test.toString() !== '/\\.css$/'
    );

    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    config.resolve.modules = [...(config.resolve.modules || [])];

    config.resolve.alias = {
      ...config.resolve.alias,
      '@theniledev/react/*': path.resolve(__dirname, '../src/*'),
      '@theniledev/react': path.resolve(__dirname, '../src/'),
    };
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true, // Enable modules to help you using className
          },
        },
      ],
      include: path.resolve(__dirname, '../stories'),
    });

    const svgRule = config.module.rules.find((rule) =>
      'test.svg'.match(rule.test)
    );
    svgRule.exclude = [AppSourceDir];

    // Merge our rule with existing assetLoader rules
    config.module.rules.unshift({
      test: /\.svg$/,
      include: [AppSourceDir],
      use: ['@svgr/webpack'],
    });

    return config;
  },
};
