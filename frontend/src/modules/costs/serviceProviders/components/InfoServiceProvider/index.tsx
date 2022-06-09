import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IServiceProvider } from '#modules/costs/serviceProviders/types/IServiceProvider';

type IInfoServiceProviderModal = IBaseModal & {
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
          <LabelValue label="Nome:" value={serviceProviderInfo.name} />

          <LabelValue label="Criado em:" value={serviceProviderInfo.created_at} />

          <LabelValue label="Atualizado em:" value={serviceProviderInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
