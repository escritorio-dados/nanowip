import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { TagsInfo } from '#shared/components/info/TagsInfo';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { ICustomer } from '#modules/customers/types/ICustomer';

type IInfoCustomerModal = IBaseModal & { customer_id: string };

export function InfoCustomerModal({ closeModal, customer_id, openModal }: IInfoCustomerModal) {
  const { toast } = useToast();

  const {
    loading: customerLoading,
    data: customerData,
    error: customerError,
  } = useGet<ICustomer>({ url: `/customers/${customer_id}` });

  useEffect(() => {
    if (customerError) {
      toast({ message: customerError, severity: 'error' });

      closeModal();
    }
  }, [customerError, toast, closeModal]);

  const customerInfo = useMemo(() => {
    if (!customerData) {
      return null;
    }

    return {
      ...customerData,
      created_at: parseDateApi(customerData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(customerData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [customerData]);

  if (customerLoading) return <Loading loading={customerLoading} />;

  return (
    <>
      {customerInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Cliente"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={customerInfo.name} />

          <TagsInfo
            label="Projetos:"
            tagsData={customerInfo.projects}
            getId={(data) => data.id}
            getValue={(data) => data.name}
          />

          <LabelValue label="Criado em:" value={customerInfo.created_at} />

          <LabelValue label="Atualizado em:" value={customerInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
