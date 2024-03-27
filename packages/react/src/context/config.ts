/* eslint-disable @typescript-eslint/ban-ts-comment */
import deepmerge from '@mui/utils/deepmerge';
import { extendTheme as extendJoyTheme } from '@mui/joy/styles';
import { experimental_extendTheme as extendMuiTheme } from '@mui/material/styles';

const palette = {
  primary: {
    '50': '#fff7ed',
    '100': '#FFEAD2',
    '200': '#FFDCB5',
    '300': '#FFCE97', //primary
    '400': '#FFC480',
    '500': '#FDC067',
    '600': '#FFB262',
    '700': '#FFAA57',
    '800': '#FFA24D',
    '900': '#FF933C',
    solidColor: 'rgba(var(--nile-palette-primary-contrastTextChannel) / 1)',
    softColor: 'rgba(var(--nile-palette-primary-contrastTextChannel) / .5)',
    solidDisabledBg: 'var(--nile-palette-grey-600)',
    solidDisabledColor: 'var(--nile-palette-grey-700)',
    plainHoverBg:
      'rgba(var(--nile-palette-primary-mainChannel) / var(--nile-palette-action-hoverOpacity))',
    outlinedHoverBg:
      'rgba(var(--nile-palette-primary-mainChannel) / var(--nile-palette-action-selectedOpacity))',
  },
  neutral: {
    outlinedHoverBg:
      'rgba(var(--nile-palette-neutral-mainChannel) / var(--nile-palette-action-selectedOpacity))',
    softBg: 'rgba(45, 45, 51)',
  },
  // @ts-ignore
  purple: {
    '50': '#f0edff',
    '100': '#d8d3ff', // primary
    '200': '#beb6fe',
    '300': '#a298fb',
    '400': '#8a7ff7',
    '500': '#7269f3',
    '600': '#6663eb',
    '700': '#565ae1',
    '800': '#4754d8',
    '900': '#2d47c9',
  },
  blue: {
    '50': '#dff8ff',
    '100': '#adedff',
    '200': '#6fe2ff', // primary
    '300': '#12d6fb',
    '400': '#00ccf6',
    '500': '#00c2f0',
    '600': '#00b2dc',
    '700': '#009dc0',
    '800': '#008aa6',
    '900': '#006778',
  },
  divider: '#181818',
  text: {
    primary: '#fff7ed',
    tertiary: 'rgba(255 255 255 / 0.5)',
  },
  background: {
    surface: '#000',
    body: '#000',
    default: '#000',
  },
  tableCell: {
    border: 'none',
  },
};

const { unstable_sxConfig: muiSxConfig, ...muiTheme } = extendMuiTheme({
  cssVarPrefix: 'nile',
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: '#FFCE97',
        },
      },
    },
  },
});

const { unstable_sxConfig: joySxConfig, ...joyTheme } = extendJoyTheme({
  cssVarPrefix: 'nile',
  components: {
    JoyInput: {
      styleOverrides: {
        input: {
          ':disabled': { color: 'var(--nile-palette-neutral-500)' },
          '::placeholder': {
            opacity: 0.6,
          },
          color: 'white',
        },
      },
    },
  },
  colorSchemes: {
    dark: { palette },
    light: { palette },
  },
});
const mergedTheme = {
  ...muiTheme,
  ...joyTheme,
  colorSchemes: deepmerge(muiTheme.colorSchemes, joyTheme.colorSchemes),
  typography: {
    ...muiTheme.typography,
    ...joyTheme.typography,
  },
} as unknown as ReturnType<typeof extendJoyTheme>;

mergedTheme.generateCssVars = (colorScheme) => ({
  css: {
    ...muiTheme.generateCssVars(colorScheme).css,
    ...joyTheme.generateCssVars(colorScheme).css,
  },
  //@ts-expect-error - new dev
  vars: deepmerge(
    muiTheme.generateCssVars(colorScheme).vars,
    joyTheme.generateCssVars(colorScheme).vars
  ),
});

mergedTheme.unstable_sxConfig = {
  ...muiSxConfig,
  ...joySxConfig,
};
export default mergedTheme;
