import { Close } from '@mui/icons-material';
import { Dialog, IconButton, Paper, PaperProps, Tooltip } from '@mui/material';
import { ReactNode, useRef } from 'react';
import Draggable from 'react-draggable';

import { Content, Title } from './styles';

type ICDialogProps = {
  open: boolean;
  title: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  closeModal?: () => void;
  children: ReactNode;
  customActions?: ReactNode;
};

function CustomPaper(props: PaperProps) {
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle="#modal-draggable"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper ref={nodeRef} {...props} />
    </Draggable>
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
        <Tooltip title="Fechar">
          <IconButton onClick={closeModal} size="large">
            <Close />
          </IconButton>
        </Tooltip>

        <h3>{title}</h3>

        <div>{customActions}</div>
      </Title>

      <Content>{children}</Content>
    </Dialog>
  );
}
