import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IOperationalObjective } from '#modules/objectives/operationalObjectives/types/IOperationalObjective';

type IInfoOperationalObjectiveModal = IBaseModal & {
  operational_objective_id: string;
};

export function InfoOperationalObjectiveModal({
  closeModal,
  operational_objective_id,
  openModal,
}: IInfoOperationalObjectiveModal) {
  const { toast } = useToast();

  const {
    loading: operationalObjectiveLoading,
    data: operationalObjectiveData,
    error: operationalObjectiveError,
  } = useGet<IOperationalObjective>({ url: `/operational_objectives/${operational_objective_id}` });

  useEffect(() => {
    if (operationalObjectiveError) {
      toast({ message: operationalObjectiveError, severity: 'error' });

      closeModal();
    }
  }, [operationalObjectiveError, toast, closeModal]);

  const operationalObjectiveInfo = useMemo(() => {
    if (!operationalObjectiveData) {
      return null;
    }

    return {
      ...operationalObjectiveData,
      deadline: parseDateApi(operationalObjectiveData.deadline, 'dd/MM/yyyy (HH:mm)', '-'),
      created_at: parseDateApi(operationalObjectiveData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(operationalObjectiveData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [operationalObjectiveData]);

  if (operationalObjectiveLoading) return <Loading loading={operationalObjectiveLoading} />;

  return (
    <>
      {operationalObjectiveInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Objetivo Operacional"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={operationalObjectiveInfo.name} />

          <LabelValue
            label="Objetivo Integrado:"
            value={operationalObjectiveInfo.integratedObjective.name}
          />

          <LabelValue label="Prazo:" value={operationalObjectiveInfo.deadline} />

          <LabelValue label="Criado em:" value={operationalObjectiveInfo.created_at} />

          <LabelValue label="Atualizado em:" value={operationalObjectiveInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
