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
import { useGet, usePost } from '#shared/services/useAxios';
import { IAddModal } from '#shared/types/IModal';

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

type ICreateCollaboratorStatusModal = IAddModal<ICollaboratorStatus> & {
  defaultCollaborator?: { id: string; name: string } | null;
};

export function CreateCollaboratorStatusModal({
  openModal,
  closeModal,
  addList,
  defaultCollaborator,
}: ICreateCollaboratorStatusModal) {
  const { toast } = useToast();

  const { send: createCollaboratorStatus, loading: createLoading } = usePost<
    ICollaboratorStatus,
    ICollaboratorStatusInput
  >('collaborators_status');

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
    formState: { errors },
    control,
  } = useForm<ICollaboratorStatusSchema>({
    resolver: yupResolver(collaboratorStatusSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (collaboratorsError) {
      toast({ message: collaboratorsError, severity: 'error' });
    }
  }, [collaboratorsError, toast]);

  const collaboratorsOptions = useMemo(() => {
    const options = !collaboratorsData ? [] : collaboratorsData;

    if (defaultCollaborator) {
      const filter = options.find((project) => project.id === defaultCollaborator.id);

      if (!filter) {
        options.push(defaultCollaborator as any);
      }
    }

    return options;
  }, [collaboratorsData, defaultCollaborator]);

  const onSubmit = useCallback(
    async ({ date, monthHours, salary, collaborator }: ICollaboratorStatusSchema) => {
      const { error: createErrors, data } = await createCollaboratorStatus({
        date,
        monthHours: Number(monthHours),
        salary: Number(salary),
        collaborator_id: collaborator!.id,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data as ICollaboratorStatus);

      toast({ message: 'status do colaborador criado', severity: 'success' });

      closeModal();
    },
    [createCollaboratorStatus, addList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Status do Colaborador"
        maxWidth="xs"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            name="salary"
            label="Salario"
            control={control}
            errors={errors.salary}
            margin_type="no-margin"
          />

          <FormTextField
            required
            name="monthHours"
            label="Horas Trabalhadas no Mês"
            control={control}
            errors={errors.monthHours}
          />

          <FormDatePicker
            required
            control={control}
            label="Data"
            name="date"
            defaultValue={null}
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
            defaultValue={defaultCollaborator}
            errors={errors.collaborator as any}
            loading={collaboratorsLoading}
            handleOpen={() => getCollaborators()}
            handleFilter={(params) => getCollaborators(params)}
            limitFilter={limitedCollaboratorsLength}
            filterField="name"
          />

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
