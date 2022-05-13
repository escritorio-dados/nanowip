import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteAssignmentModal = {
  openModal: boolean;
  closeModal: () => void;
  assignment: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteAssignmentModal({
  closeModal,
  assignment,
  openModal,
  handleDeleteData,
}: IDeleteAssignmentModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteAssignment } = useDelete(
    `/assignments/${assignment.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!assignment) {
      return;
    }

    const { error } = await deleteAssignment();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    handleDeleteData(assignment.id);

    toast({ message: 'atribuição deletada', severity: 'success' });

    closeModal();
  }, [assignment, deleteAssignment, handleDeleteData, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Atribuição"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar a atribuição:</Typography>

        <Typography
          component="strong"
          sx={{
            color: 'primary.main',
            marginTop: '1rem',
            display: 'block',
            width: '100%',
            textAlign: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}
        >
          {assignment.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
