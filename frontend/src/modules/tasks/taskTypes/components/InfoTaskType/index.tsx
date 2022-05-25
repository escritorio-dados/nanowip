import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ITaskType } from '#shared/types/backend/ITaskType';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoTaskTypeModal = { openModal: boolean; closeModal: () => void; task_type_id: string };

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
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{taskTypeInfo.name}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{taskTypeInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{taskTypeInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
