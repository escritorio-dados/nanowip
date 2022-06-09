import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IOrganization } from '#modules/organizations/types/IOrganization';

type IInfoOrganizationModal = IBaseModal & { organization_id: string };

export function InfoOrganizationModal({
  closeModal,
  organization_id,
  openModal,
}: IInfoOrganizationModal) {
  const { toast } = useToast();

  const {
    loading: organizationLoading,
    data: organizationData,
    error: organizationError,
  } = useGet<IOrganization>({ url: `/organizations/${organization_id}` });

  useEffect(() => {
    if (organizationError) {
      toast({ message: organizationError, severity: 'error' });

      closeModal();
    }
  }, [organizationError, toast, closeModal]);

  const organizationInfo = useMemo(() => {
    if (!organizationData) {
      return null;
    }

    return {
      ...organizationData,
      created_at: parseDateApi(organizationData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(organizationData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [organizationData]);

  if (organizationLoading) return <Loading loading={organizationLoading} />;

  return (
    <>
      {organizationInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Organização"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={organizationInfo.name} />

          <LabelValue label="Criado em:" value={organizationInfo.created_at} />

          <LabelValue label="Atualizado em:" value={organizationInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
