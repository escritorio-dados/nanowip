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

import { IRole } from '#modules/users/roles/types/IRole';

type IInfoRoleModal = IBaseModal & { role_id: string };

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
          <LabelValue label="Nome:" value={roleInfo.name} />

          <TagsInfo
            label="Permissões:"
            tagsData={roleInfo.permissions}
            getId={(data) => data}
            getValue={(data) => data}
          />

          <LabelValue label="Criado em:" value={roleInfo.created_at} />

          <LabelValue label="Atualizado em:" value={roleInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
