import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { TagsInfo } from '#shared/components/info/TagsInfo';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';
import { translatorPermission } from '#shared/utils/translatePermissions';

import { IUser } from '#modules/users/users/types/IUser';

type IInfoUserModal = IBaseModal & { user_id: string };

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
          <LabelValue label="Nome:" value={userInfo.name} />

          <LabelValue label="E-mail:" value={userInfo.email} />

          <TagsInfo
            label="Permissões:"
            tagsData={userInfo.permissions}
            getId={(data) => data}
            getValue={(data) => data}
          />

          <LabelValue label="Criado em:" value={userInfo.created_at} />

          <LabelValue label="Atualizado em:" value={userInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
