import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteLinkModal = {
  openModal: boolean;
  closeModal: () => void;
  link: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteLinkModal({
  closeModal,
  link,
  openModal,
  handleDeleteData,
}: IDeleteLinkModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteLink } = useDelete(`/links/${link.id}`);

  const handleDelete = useCallback(async () => {
    if (!link) {
      return;
    }

    const { error } = await deleteLink();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    handleDeleteData(link.id);

    toast({ message: 'link excluido', severity: 'success' });

    closeModal();
  }, [link, deleteLink, handleDeleteData, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Link" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar o link:</Typography>

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
          {link.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
