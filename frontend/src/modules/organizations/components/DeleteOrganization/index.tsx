import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteOrganizationModal = {
  openModal: boolean;
  closeModal: () => void;
  organization: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteOrganizationModal({
  closeModal,
  organization,
  openModal,
  handleDeleteData,
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

    handleDeleteData(organization.id);

    toast({ message: 'organização excluido', severity: 'success' });

    closeModal();
  }, [organization, deleteOrganization, handleDeleteData, toast, closeModal]);

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
          {organization.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
