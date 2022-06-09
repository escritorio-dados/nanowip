import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { ICollaboratorStatus } from '#modules/collaborators/collaboratorsStatus/types/ICollaboratorStatus';

type IInfoCollaboratorStatusModal = IBaseModal & { collaboratorStatus_id: string };

export function InfoCollaboratorStatusModal({
  closeModal,
  collaboratorStatus_id,
  openModal,
}: IInfoCollaboratorStatusModal) {
  const { toast } = useToast();

  const {
    loading: collaboratorStatusLoading,
    data: collaboratorStatusData,
    error: collaboratorStatusError,
  } = useGet<ICollaboratorStatus>({ url: `/collaborators_status/${collaboratorStatus_id}` });

  useEffect(() => {
    if (collaboratorStatusError) {
      toast({ message: collaboratorStatusError, severity: 'error' });

      closeModal();
    }
  }, [collaboratorStatusError, toast, closeModal]);

  const collaboratorStatusInfo = useMemo(() => {
    if (!collaboratorStatusData) {
      return null;
    }

    return {
      ...collaboratorStatusData,
      date: parseDateApi(collaboratorStatusData.date, "LLLL 'de' yyyy", '-'),
      salary: new Intl.NumberFormat('pt-Br', { currency: 'BRL', style: 'currency' }).format(
        collaboratorStatusData.salary,
      ),
      created_at: parseDateApi(collaboratorStatusData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(collaboratorStatusData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [collaboratorStatusData]);

  if (collaboratorStatusLoading) return <Loading loading={collaboratorStatusLoading} />;

  return (
    <>
      {collaboratorStatusInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Status do Colaborador"
          maxWidth="sm"
        >
          <LabelValue label="Data:" value={collaboratorStatusInfo.date} />

          <LabelValue label="Salario:" value={collaboratorStatusInfo.salary} />

          <LabelValue
            label="Horas Trabalhadas:"
            value={String(collaboratorStatusInfo.monthHours)}
          />

          <LabelValue label="Colaborador:" value={collaboratorStatusInfo.collaborator.name} />

          <LabelValue label="Criado em:" value={collaboratorStatusInfo.created_at} />

          <LabelValue label="Atualizado em:" value={collaboratorStatusInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
