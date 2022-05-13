import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteCustomerModal = {
  openModal: boolean;
  closeModal: () => void;
  customer: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteCustomerModal({
  closeModal,
  customer,
  openModal,
  handleDeleteData,
}: IDeleteCustomerModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteCustomer } = useDelete(`/customers/${customer.id}`);

  const handleDelete = useCallback(async () => {
    if (!customer) {
      return;
    }

    const { error } = await deleteCustomer();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    handleDeleteData(customer.id);

    toast({ message: 'cliente excluido', severity: 'success' });

    closeModal();
  }, [customer, deleteCustomer, handleDeleteData, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Cliente" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar o cliente:</Typography>

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
          {customer.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
