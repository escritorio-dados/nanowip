import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePost } from '#shared/services/useAxios';
import { IAssignment, ICreateAssignmentInput } from '#shared/types/backend/IAssignment';
import { ICollaborator, limitedCollaboratorsLength } from '#shared/types/backend/ICollaborator';
import { convertDurationToSeconds } from '#shared/utils/validateDuration';

import {
  ICreateAssignmentSchema,
  createAssignmentSchema,
} from '#modules/assignments/schemas/createAssignment.schema';

type ICreateAssignmentModal = {
  openModal: boolean;
  closeModal(): void;
  handleAdd(data: IAssignment): void;
  task_id: string;
};

export function CreateAssignmentModal({
  openModal,
  closeModal,
  handleAdd,
  task_id,
}: ICreateAssignmentModal) {
  const { toast } = useToast();

  const { send: createAssignment, loading: createLoading } = usePost<
    IAssignment,
    ICreateAssignmentInput
  >('assignments');

  const {
    loading: collaboratorsLoading,
    data: collaboratorsData,
    error: collaboratorsError,
    send: getCollaborators,
  } = useGet<ICollaborator[]>({
    url: '/collaborators/limited',
    lazy: true,
  });

  useEffect(() => {
    if (collaboratorsError) {
      toast({ message: collaboratorsError, severity: 'error' });
    }
  }, [toast, closeModal, collaboratorsError]);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ICreateAssignmentSchema>({
    resolver: yupResolver(createAssignmentSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ status, collaborator, timeLimit }: ICreateAssignmentSchema) => {
      const { error: createErrors, data } = await createAssignment({
        status,
        collaborator_id: collaborator.id,
        task_id,
        timeLimit: timeLimit ? convertDurationToSeconds(timeLimit) : undefined,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      handleAdd(data as any);

      toast({ message: 'atribuição criada', severity: 'success' });

      closeModal();
    },
    [createAssignment, task_id, handleAdd, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Atribuição"
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormSelectAsync
            required
            control={control}
            name="collaborator"
            label="Colaborador"
            options={collaboratorsData || []}
            optionLabel="name"
            optionValue="id"
            defaultValue={null}
            margin_type="no-margin"
            errors={errors.collaborator as any}
            loading={collaboratorsLoading}
            handleOpen={() => getCollaborators()}
            handleFilter={(params) => getCollaborators(params)}
            limitFilter={limitedCollaboratorsLength}
            filterField="name"
          />

          <FormSelect
            required
            control={control}
            name="status"
            label="Status"
            options={['Aberto', 'Fechado']}
            defaultValue="Aberto"
            errors={errors.status}
          />

          <FormTextField
            control={control}
            name="timeLimit"
            label="Tempo Limite"
            helperText="Formato: hh:mm:ss"
            errors={errors.timeLimit}
          />

          <CustomButton type="submit">Cadastrar Atribuição</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
