import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteServiceModal = {
  openModal: boolean;
  closeModal: () => void;
  service: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteServiceModal({
  closeModal,
  service,
  openModal,
  handleDeleteData,
}: IDeleteServiceModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteService } = useDelete(`/services/${service.id}`);

  const handleDelete = useCallback(async () => {
    if (!service) {
      return;
    }

    const { error } = await deleteService();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    handleDeleteData(service.id);

    toast({ message: 'serviço excluido', severity: 'success' });

    closeModal();
  }, [service, deleteService, handleDeleteData, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Serviço" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar o serviço:</Typography>

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
          {service.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
