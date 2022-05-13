import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IUser } from '#shared/types/backend/IUser';
import { parseDateApi } from '#shared/utils/parseDateApi';
import { translatorPermission } from '#shared/utils/translatePermissions';

import { FieldContainer, FieldValueContainer, TagsContainer } from './styles';

type IInfoUserModal = { openModal: boolean; closeModal: () => void; user_id: string };

export function InfoUserModal({ closeModal, user_id, openModal }: IInfoUserModal) {
  const { toast } = useToast();

  const {
    loading: userLoading,
    data: userData,
    error: userError,
  } = useGet<IUser>({ url: `/users/${user_id}` });

  useEffect(() => {
    if (userError) {
      toast({ message: userError, severity: 'error' });

      closeModal();
    }
  }, [userError, toast, closeModal]);

  const userInfo = useMemo(() => {
    if (!userData) {
      return null;
    }

    const permissionsFormatted = userData.permissions.map(
      (permission) => translatorPermission[permission],
    );

    return {
      ...userData,
      permissions: permissionsFormatted,
      created_at: parseDateApi(userData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(userData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [userData]);

  if (userLoading) return <Loading loading={userLoading} />;

  return (
    <>
      {userInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações usuario"
          maxWidth="sm"
        >
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{userInfo.name}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">E-mail: </Typography>

            <Typography>{userInfo.email}</Typography>
          </FieldValueContainer>

          <FieldContainer>
            <Typography component="strong">Permissões: </Typography>

            <TagsContainer>
              {userInfo.permissions.map((permission) => (
                <Typography component="span" key={permission}>
                  {permission}
                </Typography>
              ))}
            </TagsContainer>
          </FieldContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{userInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{userInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
