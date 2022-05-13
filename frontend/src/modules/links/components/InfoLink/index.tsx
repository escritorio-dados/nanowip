import { Box, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ILink } from '#shared/types/backend/ILink';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoLinkModal = { openModal: boolean; closeModal: () => void; link_id: string };

export function InfoLinkModal({ closeModal, link_id, openModal }: IInfoLinkModal) {
  const { toast } = useToast();

  const {
    loading: linkLoading,
    data: linkData,
    error: linkError,
  } = useGet<ILink>({ url: `/links/${link_id}` });

  useEffect(() => {
    if (linkError) {
      toast({ message: linkError, severity: 'error' });

      closeModal();
    }
  }, [linkError, toast, closeModal]);

  const linkInfo = useMemo(() => {
    if (!linkData) {
      return null;
    }

    return {
      ...linkData,
      state: linkData.active ? 'Ativo' : 'Desativado',
      created_at: parseDateApi(linkData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(linkData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [linkData]);

  if (linkLoading) return <Loading loading={linkLoading} />;

  return (
    <>
      {linkInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Link"
          maxWidth="sm"
        >
          <FieldValueContainer>
            <Typography component="strong">Titulo: </Typography>

            <Typography>{linkInfo.title}</Typography>
          </FieldValueContainer>

          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <Typography sx={(theme) => ({ color: theme.palette.primary.main, fontWeight: 'bold' })}>
              Link:
            </Typography>

            <CustomButton
              size="small"
              color="info"
              margin_type="left-margin"
              onClick={() => window.open(linkInfo.url)}
            >
              Acessar
            </CustomButton>
          </Box>

          <FieldValueContainer>
            <Typography component="strong">Categoria: </Typography>

            <Typography>{linkInfo.category}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Responsavel: </Typography>

            <Typography>{linkInfo.owner}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Descrição: </Typography>

            <Typography whiteSpace="pre-wrap">{linkInfo.description}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{linkInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{linkInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
