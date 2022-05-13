import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IRole } from '#shared/types/backend/IRole';
import { parseDateApi } from '#shared/utils/parseDateApi';
import { translatorPermission } from '#shared/utils/translatePermissions';

import { FieldContainer, FieldValueContainer, TagsContainer } from './styles';

type IInfoRoleModal = { openModal: boolean; closeModal: () => void; role_id: string };

export function InfoRoleModal({ closeModal, role_id, openModal }: IInfoRoleModal) {
  const { toast } = useToast();

  const {
    loading: roleLoading,
    data: roleData,
    error: roleError,
  } = useGet<IRole>({ url: `/roles/${role_id}` });

  useEffect(() => {
    if (roleError) {
      toast({ message: roleError, severity: 'error' });

      closeModal();
    }
  }, [roleError, toast, closeModal]);

  const roleInfo = useMemo(() => {
    if (!roleData) {
      return null;
    }

    const permissionsFormatted = roleData.permissions.map(
      (permission) => translatorPermission[permission],
    );

    return {
      ...roleData,
      permissions: permissionsFormatted,
      created_at: parseDateApi(roleData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(roleData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [roleData]);

  if (roleLoading) return <Loading loading={roleLoading} />;

  return (
    <>
      {roleInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações papel"
          maxWidth="sm"
        >
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{roleInfo.name}</Typography>
          </FieldValueContainer>

          <FieldContainer>
            <Typography component="strong">Permissões: </Typography>

            <TagsContainer>
              {roleInfo.permissions.map((permission) => (
                <Typography component="span" key={permission}>
                  {permission}
                </Typography>
              ))}
            </TagsContainer>
          </FieldContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{roleInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{roleInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
