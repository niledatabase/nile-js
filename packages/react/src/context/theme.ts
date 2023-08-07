// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { extendTheme as extendJoyTheme } from '@mui/joy/styles';

export default extendJoyTheme({
  cssVarPrefix: 'joy',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          '50': '#fff3e4',
          '100': '#ffe1bc',
          '200': '#ffcd92',
          '300': '#ffb96a',
          '400': '#feaa51',
          '500': '#ff9c3f',
          '600': '#f9913d',
          '700': '#f28239',
          '800': '#eb7435',
          '900': '#e05c2e',
        },
        text: {
          tertiary: 'rgba(0 0 0 / 0.56)',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          '50': '#fff3e4',
          '100': '#ffe1bc',
          '200': '#ffcd92',
          '300': '#ffb96a',
          '400': '#feaa51',
          '500': '#ff9c3f',
          '600': '#f9913d',
          '700': '#f28239',
          '800': '#eb7435',
          '900': '#e05c2e',
        },
        text: {
          tertiary: 'rgba(255 255 255 / 0.5)',
        },
      },
    },
  },
});
