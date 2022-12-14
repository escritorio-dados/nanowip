import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { IAddModal } from '#shared/types/IModal';

import {
  createObjectiveCategorySchema,
  ICreateObjectiveCategorySchema,
} from '../../schemas/createObjectiveCategory.schema';
import {
  IObjectiveCategory,
  ICreateObjectiveCategoryInput,
  ObjectiveCategoryTypes,
} from '../../types/IObjectiveCategory';

type ICreateObjectiveCategoryModal = IAddModal<IObjectiveCategory> & {
  operational_objective_id: string;
};

export function CreateObjectiveCategoryModal({
  openModal,
  closeModal,
  addList,
  operational_objective_id,
}: ICreateObjectiveCategoryModal) {
  const { toast } = useToast();

  const { send: createObjectiveCategory, loading: createLoading } = usePost<
    IObjectiveCategory,
    ICreateObjectiveCategoryInput
  >('/objective_categories');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ICreateObjectiveCategorySchema>({
    resolver: yupResolver(createObjectiveCategorySchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name, type }: ICreateObjectiveCategorySchema) => {
      const { error: createErrors, data } = await createObjectiveCategory({
        name,
        type,
        operational_objective_id,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data);

      toast({ message: 'categoria criada', severity: 'success' });

      closeModal();
    },
    [createObjectiveCategory, operational_objective_id, addList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Categoria"
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

          <FormSelect
            control={control}
            label="Tipo"
            name="type"
            options={Object.values(ObjectiveCategoryTypes)}
            defaultValue="manual"
            errors={errors.type}
            required
          />

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
