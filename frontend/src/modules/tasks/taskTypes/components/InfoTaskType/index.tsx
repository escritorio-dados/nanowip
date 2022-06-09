import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { ITaskType } from '#modules/tasks/taskTypes/types/ITaskType';

type IInfoTaskTypeModal = IBaseModal & { task_type_id: string };

export function InfoTaskTypeModal({ closeModal, task_type_id, openModal }: IInfoTaskTypeModal) {
  const { toast } = useToast();

  const {
    loading: taskTypeLoading,
    data: taskTypeData,
    error: taskTypeError,
  } = useGet<ITaskType>({ url: `/task_types/${task_type_id}` });

  useEffect(() => {
    if (taskTypeError) {
      toast({ message: taskTypeError, severity: 'error' });

      closeModal();
    }
  }, [taskTypeError, toast, closeModal]);

  const taskTypeInfo = useMemo(() => {
    if (!taskTypeData) {
      return null;
    }

    return {
      ...taskTypeData,
      created_at: parseDateApi(taskTypeData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(taskTypeData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [taskTypeData]);

  if (taskTypeLoading) return <Loading loading={taskTypeLoading} />;

  return (
    <>
      {taskTypeInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Tipo de Tarefa"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={taskTypeInfo.name} />

          <LabelValue label="Criado em:" value={taskTypeInfo.created_at} />

          <LabelValue label="Atualizado em:" value={taskTypeInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
