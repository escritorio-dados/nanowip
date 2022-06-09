import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteCustomerModal = IDeleteModal & { customer: { id: string; name: string } };

export function DeleteCustomerModal({
  closeModal,
  customer,
  openModal,
  updateList,
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

    updateList(customer.id);

    toast({ message: 'cliente excluido', severity: 'success' });

    closeModal();
  }, [customer, deleteCustomer, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Cliente" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar o cliente:</Typography>

        <TextConfirm>{customer.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
