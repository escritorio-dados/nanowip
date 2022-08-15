import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormDatePicker } from '#shared/components/form/FormDatePicker';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';

import { IMilestoneSchema, milestoneSchema } from '#modules/milestones/schemas/milestoneSchema';
import { IMilestone, IMilestoneInput } from '#modules/milestones/types/IMilestone';

type ICreateMilestone = IBaseModal & {
  apiRoute: string;
  reloadList: () => void;
};

export function CreateMilestone({ openModal, closeModal, apiRoute, reloadList }: ICreateMilestone) {
  const { toast } = useToast();

  const { send: createMilestone, loading: createLoading } = usePost<IMilestone, IMilestoneInput>(
    apiRoute,
  );

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IMilestoneSchema>({
    resolver: yupResolver(milestoneSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ date, name, description }: IMilestoneInput) => {
      const { error: createErrors } = await createMilestone({
        name,
        description: description || undefined,
        date,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'milestone criado', severity: 'success' });

      closeModal();
    },
    [createMilestone, reloadList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Milestones"
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            name="name"
            label="Nome"
            control={control}
            errors={errors.name}
            margin_type="no-margin"
          />

          <FormDatePicker
            required
            control={control}
            name="date"
            label="Data"
            errors={errors.date}
          />

          <FormTextField
            multiline
            name="description"
            label="Descrição"
            control={control}
            errors={errors.description}
          />

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
