import { Box, Grid, Typography } from '@mui/material';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { IBaseModal } from '#shared/types/IModal';

import { FieldContainer } from './styles';

type IDescriptionAssignmentModal = IBaseModal & { data: { description?: string; link?: string } };

export function DescriptionAssignmentModal({
  closeModal,
  data,
  openModal,
}: IDescriptionAssignmentModal) {
  return (
    <>
      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Descrição da tarefa"
        maxWidth="sm"
      >
        <Grid container spacing={2}>
          {data.link && (
            <Grid item xs={12}>
              <CustomButton
                size="small"
                color="info"
                margin_type="no-margin"
                sx={{ marginBottom: '0.5rem' }}
                onClick={() => window.open(data.link)}
              >
                Acessar Link
              </CustomButton>
            </Grid>
          )}

          <Grid item xs={12}>
            <FieldContainer>
              <Box className="title">
                <Typography>Descrição</Typography>
              </Box>

              <Box className="desc">
                <Typography whiteSpace="pre-wrap">{data.description || 'Sem Descrição'}</Typography>
              </Box>
            </FieldContainer>
          </Grid>
        </Grid>
      </CustomDialog>
    </>
  );
}
