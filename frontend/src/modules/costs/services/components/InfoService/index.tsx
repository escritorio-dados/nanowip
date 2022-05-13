import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IService } from '#shared/types/backend/costs/IService';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoServiceModal = {
  openModal: boolean;
  closeModal: () => void;
  service_id: string;
};

export function InfoServiceModal({ closeModal, service_id, openModal }: IInfoServiceModal) {
  const { toast } = useToast();

  const {
    loading: serviceLoading,
    data: serviceData,
    error: serviceError,
  } = useGet<IService>({ url: `/services/${service_id}` });

  useEffect(() => {
    if (serviceError) {
      toast({ message: serviceError, severity: 'error' });

      closeModal();
    }
  }, [serviceError, toast, closeModal]);

  const serviceInfo = useMemo(() => {
    if (!serviceData) {
      return null;
    }

    return {
      ...serviceData,
      created_at: parseDateApi(serviceData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(serviceData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [serviceData]);

  if (serviceLoading) return <Loading loading={serviceLoading} />;

  return (
    <>
      {serviceInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Serviço"
          maxWidth="sm"
        >
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{serviceInfo.name}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{serviceInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{serviceInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
