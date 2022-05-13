import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ICustomer } from '#shared/types/backend/ICustomer';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldContainer, FieldValueContainer, TagsContainer } from './styles';

type IInfoCustomerModal = { openModal: boolean; closeModal: () => void; customer_id: string };

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
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{customerInfo.name}</Typography>
          </FieldValueContainer>

          <FieldContainer>
            <Typography component="strong">Projetos: </Typography>

            <TagsContainer>
              {customerInfo.projects.map((project) => (
                <Typography component="span" key={project.id}>
                  {project.name}
                </Typography>
              ))}
            </TagsContainer>
          </FieldContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{customerInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{customerInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
