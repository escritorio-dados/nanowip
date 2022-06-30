import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IIntegratedObjective } from '../../types/IIntegratedObjective';

type IInfoIntegratedObjectiveModal = IBaseModal & { integratedObjective_id: string };

export function InfoIntegratedObjectiveModal({
  closeModal,
  integratedObjective_id,
  openModal,
}: IInfoIntegratedObjectiveModal) {
  const { toast } = useToast();

  const {
    loading: integratedObjectiveLoading,
    data: integratedObjectiveData,
    error: integratedObjectiveError,
  } = useGet<IIntegratedObjective>({ url: `/integrated_objectives/${integratedObjective_id}` });

  useEffect(() => {
    if (integratedObjectiveError) {
      toast({ message: integratedObjectiveError, severity: 'error' });

      closeModal();
    }
  }, [integratedObjectiveError, toast, closeModal]);

  const integratedObjectiveInfo = useMemo(() => {
    if (!integratedObjectiveData) {
      return null;
    }

    return {
      ...integratedObjectiveData,
      created_at: parseDateApi(integratedObjectiveData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(integratedObjectiveData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [integratedObjectiveData]);

  if (integratedObjectiveLoading) return <Loading loading={integratedObjectiveLoading} />;

  return (
    <>
      {integratedObjectiveInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Objetivo Integrado"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={integratedObjectiveInfo.name} />

          <LabelValue label="Criado em:" value={integratedObjectiveInfo.created_at} />

          <LabelValue label="Atualizado em:" value={integratedObjectiveInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
