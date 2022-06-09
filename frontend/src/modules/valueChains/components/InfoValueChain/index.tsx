import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { getStatusText } from '#shared/utils/getStatusText';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IValueChain } from '#modules/valueChains/types/IValueChain';

type IInfoValueChainModal = IBaseModal & { value_chain_id: string };

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
              <LabelValue label="Nome:" value={valueChainInfo.name} />
            </Grid>

            {valueChainInfo.path && (
              <>
                {Object.values(valueChainInfo.path)
                  .reverse()
                  .map((path) => (
                    <Grid item xs={12} sm={6} key={path.id}>
                      <LabelValue label={`${path.entity}:`} value={path.name} />
                    </Grid>
                  ))}
              </>
            )}

            <Grid item xs={12} sm={6}>
              <LabelValue label="Status:" value={valueChainInfo.status} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Disponivel em:" value={valueChainInfo.availableDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Iniciado em:" value={valueChainInfo.startDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Finalizado em:" value={valueChainInfo.endDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Criado em:" value={valueChainInfo.created_at} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Atualizado em:" value={valueChainInfo.updated_at} />
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}
