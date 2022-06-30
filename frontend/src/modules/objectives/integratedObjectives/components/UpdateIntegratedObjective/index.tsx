import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IUpdateModal } from '#shared/types/IModal';

import {
  IIntegratedObjectiveSchema,
  integratedObjectiveSchema,
} from '../../schema/integratedObjective.schema';
import { IIntegratedObjective, IIntegratedObjectiveInput } from '../../types/IIntegratedObjective';

type IUpdateIntegratedObjectiveModal = IUpdateModal<IIntegratedObjective> & {
  integratedObjective_id: string;
};

export function UpdateIntegratedObjectiveModal({
  closeModal,
  integratedObjective_id,
  openModal,
  updateList,
}: IUpdateIntegratedObjectiveModal) {
  const { toast } = useToast();

  const {
    loading: integratedObjectiveLoading,
    data: integratedObjectiveData,
    error: integratedObjectiveError,
  } = useGet<IIntegratedObjective>({ url: `/integrated_objectives/${integratedObjective_id}` });

  const { send: updateIntegratedObjective, loading: updateLoading } = usePut<
    IIntegratedObjective,
    IIntegratedObjectiveInput
  >(`/integrated_objectives/${integratedObjective_id}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IIntegratedObjectiveSchema>({
    resolver: yupResolver(integratedObjectiveSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (integratedObjectiveError) {
      toast({ message: integratedObjectiveError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, integratedObjectiveError, toast]);

  const onSubmit = useCallback(
    async (input: IIntegratedObjectiveSchema) => {
      const { error: updateErrors, data } = await updateIntegratedObjective(input);

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(integratedObjective_id, data);

      toast({ message: 'objetivo integrado atualizado', severity: 'success' });

      closeModal();
    },
    [updateIntegratedObjective, updateList, integratedObjective_id, toast, closeModal],
  );

  if (integratedObjectiveLoading) return <Loading loading={integratedObjectiveLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {integratedObjectiveData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar objetivo integrado"
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={integratedObjectiveData.name}
              control={control}
              errors={errors.name}
              margin_type="no-margin"
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
