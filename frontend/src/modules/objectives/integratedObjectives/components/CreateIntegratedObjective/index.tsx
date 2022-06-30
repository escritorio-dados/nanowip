import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { IAddModal } from '#shared/types/IModal';

import {
  IIntegratedObjectiveSchema,
  integratedObjectiveSchema,
} from '../../schema/integratedObjective.schema';
import { IIntegratedObjective, IIntegratedObjectiveInput } from '../../types/IIntegratedObjective';

export function CreateIntegratedObjectiveModal({
  openModal,
  closeModal,
  addList,
}: IAddModal<IIntegratedObjective>) {
  const { toast } = useToast();

  const { send: createIntegratedObjective, loading: createLoading } = usePost<
    IIntegratedObjective,
    IIntegratedObjectiveInput
  >('integrated_objectives');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IIntegratedObjectiveSchema>({
    resolver: yupResolver(integratedObjectiveSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async (input: IIntegratedObjectiveSchema) => {
      const { error: createErrors, data } = await createIntegratedObjective(input);

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data);

      toast({ message: 'objetivo integrado criado', severity: 'success' });

      closeModal();
    },
    [createIntegratedObjective, addList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Objetivo Integrado"
        maxWidth="xs"
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

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
