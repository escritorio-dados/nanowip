import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteServiceProviderModal = {
  openModal: boolean;
  closeModal: () => void;
  serviceProvider: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteServiceProviderModal({
  closeModal,
  serviceProvider,
  openModal,
  handleDeleteData,
}: IDeleteServiceProviderModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteServiceProvider } = useDelete(
    `/service_providers/${serviceProvider.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!serviceProvider) {
      return;
    }

    const { error } = await deleteServiceProvider();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    handleDeleteData(serviceProvider.id);

    toast({ message: 'prestador de serviço excluido', severity: 'success' });

    closeModal();
  }, [serviceProvider, deleteServiceProvider, handleDeleteData, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Prestador de serviço"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar o prestador de serviço:</Typography>

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
          {serviceProvider.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
