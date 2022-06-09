import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteServiceProviderModal = IDeleteModal & { serviceProvider: { id: string; name: string } };

export function DeleteServiceProviderModal({
  closeModal,
  serviceProvider,
  openModal,
  updateList,
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

    updateList(serviceProvider.id);

    toast({ message: 'prestador de serviço excluido', severity: 'success' });

    closeModal();
  }, [serviceProvider, deleteServiceProvider, updateList, toast, closeModal]);

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

        <TextConfirm>{serviceProvider.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
