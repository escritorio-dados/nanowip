import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteLinkModal = IDeleteModal & { link: { id: string; name: string } };

export function DeleteLinkModal({ closeModal, link, openModal, updateList }: IDeleteLinkModal) {
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

    updateList(link.id);

    toast({ message: 'link excluido', severity: 'success' });

    closeModal();
  }, [link, deleteLink, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Link" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar o link:</Typography>

        <TextConfirm>{link.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
