const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-addon-mock',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    if (config.module?.rules) {
      // This modifies the existing image rule to exclude .svg files
      // since you want to handle those files with @svgr/webpack
      const imageRule = config.module.rules.find((rule) =>
        rule.test.test('.svg')
      );
      imageRule.exclude = /\.svg$/;

      // Configure .svg files to be loaded with @svgr/webpack
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });
    }

    return config;
  },
};
export default config;
