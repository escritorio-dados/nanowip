import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IOrganization } from '#shared/types/backend/IOrganization';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoOrganizationModal = {
  openModal: boolean;
  closeModal: () => void;
  organization_id: string;
};

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
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{organizationInfo.name}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{organizationInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{organizationInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
