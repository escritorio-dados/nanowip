import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteOrganizationModal = IDeleteModal & { organization: { id: string; name: string } };

export function DeleteOrganizationModal({
  closeModal,
  organization,
  openModal,
  updateList,
}: IDeleteOrganizationModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteOrganization } = useDelete(
    `/organizations/${organization.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!organization) {
      return;
    }

    const { error } = await deleteOrganization();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(organization.id);

    toast({ message: 'organização excluido', severity: 'success' });

    closeModal();
  }, [organization, deleteOrganization, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Organização"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar a organização:</Typography>

        <TextConfirm>{organization.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
