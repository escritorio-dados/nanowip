// import { styled } from '@mui/material';
import { Box, BoxProps, Container, styled } from '@mui/material';

type IColorPreview = BoxProps & { bcolor: string };

export const ColorPreview = styled(Box)<IColorPreview>`
  cursor: pointer;

  border-left: 1.5rem solid ${(props) => props.bcolor};
  padding-left: 0.5rem;
  transition: filter 0.2s;

  & + div {
    margin-top: 0.5rem;
  }

  &:hover {
    filter: brightness(0.8);
  }
`;

export const CustomizeContainer = styled(Container)`
  border: 1px solid ${(props) => props.theme.palette.divider};
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 5px;
  padding: 1rem;
`;
