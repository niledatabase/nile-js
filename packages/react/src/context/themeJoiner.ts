/**
 * this should go away in the future when joy reaches parity with material
 */
import { deepmerge } from '@mui/utils';
import type {} from '@mui/material/themeCssVarsAugmentation';
import {
  experimental_extendTheme as extendMuiTheme,
  TypeAction,
  Overlays,
  PaletteColorChannel,
  PaletteAlert,
  PaletteAppBar,
  PaletteAvatar,
  PaletteChip,
  PaletteFilledInput,
  PaletteLinearProgress,
  PaletteSlider,
  PaletteSkeleton,
  PaletteSnackbarContent,
  PaletteSpeedDialAction,
  PaletteStepConnector,
  PaletteStepContent,
  PaletteSwitch,
  PaletteTableCell,
  PaletteTooltip,
  Shadows,
  ZIndex,
} from '@mui/material/styles';
import {
  extendTheme as extendJoyTheme,
  Theme as JoyTheme,
} from '@mui/joy/styles';

// extends Joy theme to include tokens from Material UI
declare module '@mui/joy/styles' {
  interface Palette {
    secondary: PaletteColorChannel;
    error: PaletteColorChannel;
    dividerChannel: string;
    action: TypeAction;
    Alert: PaletteAlert;
    AppBar: PaletteAppBar;
    Avatar: PaletteAvatar;
    Chip: PaletteChip;
    FilledInput: PaletteFilledInput;
    LinearProgress: PaletteLinearProgress;
    Skeleton: PaletteSkeleton;
    Slider: PaletteSlider;
    SnackbarContent: PaletteSnackbarContent;
    SpeedDialAction: PaletteSpeedDialAction;
    StepConnector: PaletteStepConnector;
    StepContent: PaletteStepContent;
    Switch: PaletteSwitch;
    TableCell: PaletteTableCell;
    Tooltip: PaletteTooltip;
  }

  interface ThemeVars {
    // attach to Joy UI `theme.vars`
    shadows: Shadows;
    overlays: Overlays;
    zIndex: ZIndex;
  }
}

declare module '@mui/material/styles' {
  interface Theme {
    // put everything back to Material UI `theme.vars`
    vars: JoyTheme['vars'];
  }
}

const palette = {
  primary: { main: '#6fe2ff' },
  secondary: {
    main: '#ffb96a',
  },
  neutral: {
    main: '#d8d3ff',
    dark: '#aea4fe',
    contrastText: '#fff',
  },
  background: {
    paper: '#383742',
    default: '#0f0f0e',
  },
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
export const muiTheme = extendMuiTheme({
  cssVarPrefix: 'joy',
  colorSchemes: {
    light: {
      palette,
    },
    dark: {
      palette,
    },
  },
});

// remove things that break
// if the theme is being overridden, these need added to the custom theme
const joyTheme = extendJoyTheme({
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

const theme = deepmerge(joyTheme, muiTheme);

export default theme;
