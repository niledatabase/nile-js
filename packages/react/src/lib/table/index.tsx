import { styled } from '@mui/joy';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TableWrapper: any = styled('div', {
  shouldForwardProp: (prop) => prop !== 'itemCount',
})<{
  itemCount: number;
}>`
  ${(props) => ({
    marginTop: props.theme.spacing(2),
    height: Math.min(props.itemCount * 52 + 24, 600),
    width: '100%',
  })}
`;
