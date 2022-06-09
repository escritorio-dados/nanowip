import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { ICollaborator } from '#modules/collaborators/collaborators/types/ICollaborator';

type IInfoCollaboratorModal = IBaseModal & { collaborator_id: string };

export function InfoCollaboratorModal({
  closeModal,
  collaborator_id,
  openModal,
}: IInfoCollaboratorModal) {
  const { toast } = useToast();

  const {
    loading: collaboratorLoading,
    data: collaboratorData,
    error: collaboratorError,
  } = useGet<ICollaborator>({ url: `/collaborators/${collaborator_id}` });

  useEffect(() => {
    if (collaboratorError) {
      toast({ message: collaboratorError, severity: 'error' });

      closeModal();
    }
  }, [collaboratorError, toast, closeModal]);

  const collaboratorInfo = useMemo(() => {
    if (!collaboratorData) {
      return null;
    }

    return {
      ...collaboratorData,
      created_at: parseDateApi(collaboratorData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(collaboratorData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [collaboratorData]);

  if (collaboratorLoading) return <Loading loading={collaboratorLoading} />;

  return (
    <>
      {collaboratorInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Colaborador"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={collaboratorInfo.name} />

          <LabelValue label="Tipo:" value={collaboratorInfo.type} />

          <LabelValue label="Cargo:" value={collaboratorInfo.jobTitle} />

          {collaboratorInfo.user && (
            <LabelValue label="Usuario:" value={collaboratorInfo.user.email} />
          )}

          <LabelValue label="Criado em:" value={collaboratorInfo.created_at} />

          <LabelValue label="Atualizado em:" value={collaboratorInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
