import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IServiceProvider } from '#shared/types/backend/costs/IServiceProvider';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoServiceProviderModal = {
  openModal: boolean;
  closeModal: () => void;
  service_provider_id: string;
};

export function InfoServiceProviderModal({
  closeModal,
  service_provider_id,
  openModal,
}: IInfoServiceProviderModal) {
  const { toast } = useToast();

  const {
    loading: serviceProviderLoading,
    data: serviceProviderData,
    error: serviceProviderError,
  } = useGet<IServiceProvider>({ url: `/service_providers/${service_provider_id}` });

  useEffect(() => {
    if (serviceProviderError) {
      toast({ message: serviceProviderError, severity: 'error' });

      closeModal();
    }
  }, [serviceProviderError, toast, closeModal]);

  const serviceProviderInfo = useMemo(() => {
    if (!serviceProviderData) {
      return null;
    }

    return {
      ...serviceProviderData,
      created_at: parseDateApi(serviceProviderData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(serviceProviderData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [serviceProviderData]);

  if (serviceProviderLoading) return <Loading loading={serviceProviderLoading} />;

  return (
    <>
      {serviceProviderInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Prestador de Serviço"
          maxWidth="sm"
        >
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{serviceProviderInfo.name}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{serviceProviderInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{serviceProviderInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
