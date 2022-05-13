import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePatch } from '#shared/services/useAxios';

type IChangeStateLinkModal = {
  openModal: boolean;
  closeModal: () => void;
  link: { id: string; name: string; active: boolean };
  reloadList: () => void;
};

export function ChangeStateLinkModal({
  closeModal,
  link,
  openModal,
  reloadList,
}: IChangeStateLinkModal) {
  const { toast } = useToast();

  const { loading: changeStateLoading, send: changeStateLink } = usePatch(
    `/links/${link.id}/state`,
  );

  const handleChangeState = useCallback(async () => {
    if (!link) {
      return;
    }

    const { error } = await changeStateLink(undefined);

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    reloadList();

    const message = link.active ? 'link desativado' : 'link ativado';

    toast({ message, severity: 'success' });

    closeModal();
  }, [link, changeStateLink, reloadList, toast, closeModal]);

  return (
    <>
      <Loading loading={changeStateLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title={link.active ? 'Desativar Link' : 'Ativar Link'}
        maxWidth="xs"
      >
        <Typography>
          Tem Certeza que deseja {link.active ? 'desativar' : 'ativar'} o link:
        </Typography>

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

        <CustomButton color="info" onClick={handleChangeState}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
