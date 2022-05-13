import { Grid, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IValueChain } from '#shared/types/backend/IValueChain';
import { getStatusText } from '#shared/utils/getStatusText';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoValueChainModal = { openModal: boolean; closeModal: () => void; value_chain_id: string };

export function InfoValueChainModal({
  closeModal,
  value_chain_id,
  openModal,
}: IInfoValueChainModal) {
  const { toast } = useToast();

  const {
    loading: valueChainLoading,
    data: valueChainData,
    error: valueChainError,
  } = useGet<IValueChain>({ url: `/value_chains/${value_chain_id}` });

  useEffect(() => {
    if (valueChainError) {
      toast({ message: valueChainError, severity: 'error' });

      closeModal();
    }
  }, [valueChainError, toast, closeModal]);

  const valueChainInfo = useMemo(() => {
    if (!valueChainData) {
      return null;
    }

    return {
      ...valueChainData,
      startDate: parseDateApi(valueChainData.startDate, 'dd/MM/yyyy (HH:mm)', '-'),
      availableDate: parseDateApi(valueChainData.availableDate, 'dd/MM/yyyy (HH:mm)', '-'),
      endDate: parseDateApi(valueChainData.endDate, 'dd/MM/yyyy (HH:mm)', '-'),
      created_at: parseDateApi(valueChainData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(valueChainData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
      status: getStatusText(valueChainData.statusDate),
    };
  }, [valueChainData]);

  if (valueChainLoading) return <Loading loading={valueChainLoading} />;

  return (
    <>
      {valueChainInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Cadeia de valor"
          maxWidth="md"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Nome: </Typography>

                <Typography>{valueChainInfo.name}</Typography>
              </FieldValueContainer>
            </Grid>

            {valueChainInfo.path && (
              <>
                {Object.values(valueChainInfo.path)
                  .reverse()
                  .map((path) => (
                    <Grid item xs={12} sm={6} key={path.id}>
                      <FieldValueContainer>
                        <Typography component="strong">{path.entity}: </Typography>

                        <Typography>{path.name}</Typography>
                      </FieldValueContainer>
                    </Grid>
                  ))}
              </>
            )}

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Status: </Typography>

                <Typography>{valueChainInfo.status}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Disponivel em: </Typography>

                <Typography>{valueChainInfo.availableDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Iniciado em </Typography>

                <Typography>{valueChainInfo.startDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Finalizado em: </Typography>

                <Typography>{valueChainInfo.endDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Criado em: </Typography>

                <Typography>{valueChainInfo.created_at}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Atualizado em: </Typography>

                <Typography>{valueChainInfo.updated_at}</Typography>
              </FieldValueContainer>
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
