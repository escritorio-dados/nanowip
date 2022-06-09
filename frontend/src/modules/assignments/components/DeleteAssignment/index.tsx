import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteAssignmentModal = IDeleteModal & { assignment: { id: string; name: string } };

export function DeleteAssignmentModal({
  closeModal,
  assignment,
  openModal,
  updateList,
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

    updateList(assignment.id);

    toast({ message: 'atribuição deletada', severity: 'success' });

    closeModal();
  }, [assignment, deleteAssignment, updateList, toast, closeModal]);

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

        <TextConfirm>{assignment.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
