import { Close } from '@mui/icons-material';
import { Box, Dialog, Paper, PaperProps, Typography } from '@mui/material';
import { ReactNode, useRef } from 'react';
import Draggable from 'react-draggable';

import { CustomIconButton } from '../CustomIconButton';
import { Content, Title } from './styles';

type ICDialogProps = {
  open: boolean;
  title: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  closeModal?: () => void;
  children: ReactNode;
  customActions?: ReactNode;
};

const Draggable1: any = Draggable;

function CustomPaper(props: PaperProps) {
  const nodeRef = useRef(null);

  return (
    <Draggable1
      nodeRef={nodeRef}
      handle="#modal-draggable"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper ref={nodeRef} {...props} />
    </Draggable1>
  );
}

export function CustomDialog({
  open,
  title,
  children,
  maxWidth,
  closeModal,
  customActions,
}: ICDialogProps) {
  return (
    <Dialog
      open={open}
      fullScreen={!maxWidth}
      maxWidth={maxWidth}
      fullWidth
      onClose={closeModal}
      PaperComponent={CustomPaper}
      aria-labelledby="modal-draggable"
      sx={{ maxHeight: '100vh' }}
    >
      <Title id="modal-draggable">
        <CustomIconButton
          title="Fechar"
          action={closeModal}
          iconType="custom"
          CustomIcon={<Close />}
        />

        <Typography component="h3">{title}</Typography>

        <Box>{customActions}</Box>
      </Title>

      <Content>{children}</Content>
    </Dialog>
  );
}
