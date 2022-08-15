import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormDatePicker } from '#shared/components/form/FormDatePicker';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePut } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';

import { IMilestoneSchema, milestoneSchema } from '#modules/milestones/schemas/milestoneSchema';
import { IMilestone, IMilestoneInput } from '#modules/milestones/types/IMilestone';

type IUpdateMilestone = IBaseModal & {
  reloadList: () => void;
  milestone: IMilestone;
};

export function UpdateMilestone({
  openModal,
  closeModal,
  reloadList,
  milestone,
}: IUpdateMilestone) {
  const { toast } = useToast();

  const { send: updateMilestone, loading: updateLoading } = usePut<IMilestone, IMilestoneInput>(
    `/milestones/${milestone.id}`,
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
      const { error: updateErrors } = await updateMilestone({
        name,
        description: description || undefined,
        date,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'milestone atualizado', severity: 'success' });

      closeModal();
    },
    [updateMilestone, reloadList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={updateLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Atualizar Milestones"
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            control={control}
            name="name"
            label="Nome"
            defaultValue={milestone.name}
            errors={errors.name}
            margin_type="no-margin"
          />

          <FormDatePicker
            required
            control={control}
            name="date"
            label="Data"
            defaultValue={milestone.date}
            errors={errors.date}
          />

          <FormTextField
            multiline
            control={control}
            name="description"
            label="Descrição"
            defaultValue={milestone.description}
            errors={errors.description}
          />

          <CustomButton type="submit">Salvar Alterar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
