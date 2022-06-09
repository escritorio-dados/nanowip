import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormDatePicker } from '#shared/components/form/FormDatePicker';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IUpdateModal } from '#shared/types/IModal';

import {
  ICollaborator,
  limitedCollaboratorsLength,
} from '#modules/collaborators/collaborators/types/ICollaborator';
import {
  collaboratorStatusSchema,
  ICollaboratorStatusSchema,
} from '#modules/collaborators/collaboratorsStatus/schema/collaboratorStatus.schema';
import {
  ICollaboratorStatus,
  ICollaboratorStatusInput,
} from '#modules/collaborators/collaboratorsStatus/types/ICollaboratorStatus';

type IUpdateCollaboratorStatusModal = IUpdateModal<ICollaboratorStatus> & {
  collaboratorStatus_id: string;
};

export function UpdateCollaboratorStatusModal({
  closeModal,
  collaboratorStatus_id,
  openModal,
  updateList,
}: IUpdateCollaboratorStatusModal) {
  const { toast } = useToast();

  const { send: updateCollaboratorStatus, loading: updateLoading } = usePut<
    ICollaboratorStatus,
    ICollaboratorStatusInput
  >(`/collaborators_status/${collaboratorStatus_id}`);

  const {
    loading: collaboratorStatusLoading,
    data: collaboratorStatusData,
    error: collaboratorStatusError,
  } = useGet<ICollaboratorStatus>({ url: `/collaborators_status/${collaboratorStatus_id}` });

  const {
    loading: collaboratorsLoading,
    data: collaboratorsData,
    error: collaboratorsError,
    send: getCollaborators,
  } = useGet<ICollaborator[]>({
    url: '/collaborators/limited',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ICollaboratorStatusSchema>({
    resolver: yupResolver(collaboratorStatusSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (collaboratorStatusError) {
      toast({ message: collaboratorStatusError, severity: 'error' });

      closeModal();
    }

    if (collaboratorsError) {
      toast({ message: collaboratorsError, severity: 'error' });
    }
  }, [closeModal, collaboratorStatusError, toast, collaboratorsError]);

  const collaboratorsOptions = useMemo(() => {
    const options = !collaboratorsData ? [] : collaboratorsData;

    if (collaboratorStatusData && !!collaboratorStatusData.collaborator) {
      const filter = options.find(
        (option) => option.id === collaboratorStatusData.collaborator!.id,
      );

      if (!filter) {
        options.push(collaboratorStatusData.collaborator);
      }
    }

    return options;
  }, [collaboratorStatusData, collaboratorsData]);

  const onSubmit = useCallback(
    async ({ date, monthHours, salary, collaborator }: ICollaboratorStatusSchema) => {
      const { error: updateErrors, data } = await updateCollaboratorStatus({
        date,
        monthHours: Number(monthHours),
        salary: Number(salary),
        collaborator_id: collaborator!.id,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(collaboratorStatus_id, data as ICollaboratorStatus);

      toast({ message: 'status do colaborador atualizado', severity: 'success' });

      closeModal();
    },
    [updateCollaboratorStatus, updateList, collaboratorStatus_id, toast, closeModal],
  );

  if (collaboratorStatusLoading) return <Loading loading={collaboratorStatusLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {collaboratorStatusData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar status do colaborador"
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              required
              name="salary"
              label="Salario"
              control={control}
              errors={errors.salary}
              defaultValue={collaboratorStatusData.salary}
              margin_type="no-margin"
            />

            <FormTextField
              required
              name="monthHours"
              label="Horas Trabalhadas no Mês"
              control={control}
              errors={errors.monthHours}
              defaultValue={collaboratorStatusData.monthHours}
            />

            <FormDatePicker
              required
              control={control}
              label="Data"
              name="date"
              defaultValue={collaboratorStatusData.date}
              errors={errors.date}
              customView={['year', 'month']}
            />

            <FormSelectAsync
              required
              control={control}
              name="collaborator"
              label="Colaborador"
              options={collaboratorsOptions}
              optionLabel="name"
              optionValue="id"
              defaultValue={collaboratorStatusData.collaborator}
              errors={errors.collaborator as any}
              loading={collaboratorsLoading}
              handleOpen={() => getCollaborators()}
              handleFilter={(params) => getCollaborators(params)}
              limitFilter={limitedCollaboratorsLength}
              filterField="name"
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
