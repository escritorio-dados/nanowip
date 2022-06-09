import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePost } from '#shared/services/useAxios';
import { IReloadModal } from '#shared/types/IModal';

import {
  ICostDistribution,
  ICreateCostDistribution,
} from '#modules/costs/costDistrbutions/types/ICostDistribution';
import { IProduct, limitedProductLength } from '#modules/products/products/types/IProduct';
import { ITaskType, limitedTaskTypesLength } from '#modules/tasks/taskTypes/types/ITaskType';

import {
  costDistributionSchema,
  ICostDistributionSchema,
} from '../../schema/costDistribution.schema';

type ICreateCostDistributionModal = IReloadModal & { cost_id: string };

export function CreateCostDistributionModal({
  openModal,
  closeModal,
  reloadList,
  cost_id,
}: ICreateCostDistributionModal) {
  const { toast } = useToast();

  const { send: createCostDistribution, loading: createLoading } = usePost<
    ICostDistribution,
    ICreateCostDistribution
  >('cost_distributions');

  const {
    loading: taskTypesLoading,
    data: taskTypesData,
    error: taskTypesError,
    send: getServices,
  } = useGet<ITaskType[]>({
    url: '/task_types/limited',
    lazy: true,
  });

  const {
    loading: productsLoading,
    data: productsData,
    error: productsError,
    send: getProducts,
  } = useGet<IProduct[]>({
    url: '/products/limited/all',
    lazy: true,
  });

  useEffect(() => {
    if (taskTypesError) {
      toast({ message: taskTypesError, severity: 'error' });

      return;
    }

    if (productsError) {
      toast({ message: productsError, severity: 'error' });
    }
  }, [toast, closeModal, taskTypesError, productsError]);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ICostDistributionSchema>({
    resolver: yupResolver(costDistributionSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ percent, product, taskType }: ICostDistributionSchema) => {
      const { error: createErrors } = await createCostDistribution({
        task_type_id: taskType?.id,
        cost_id,
        product_id: product.id,
        percent: Number(percent),
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'distribuição do custo criada', severity: 'success' });

      closeModal();
    },
    [createCostDistribution, cost_id, reloadList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Distribuição do Custo"
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormSelectAsync
            control={control}
            name="taskType"
            label="Tipo de Tarefa"
            options={taskTypesData || []}
            optionLabel="name"
            optionValue="id"
            defaultValue={null}
            margin_type="no-margin"
            errors={errors.taskType as any}
            loading={taskTypesLoading}
            handleOpen={() => getServices()}
            handleFilter={(params) => getServices(params)}
            limitFilter={limitedTaskTypesLength}
            filterField="name"
          />

          <FormSelectAsync
            required
            control={control}
            name="product"
            label="Produto"
            options={productsData || []}
            filterField="name"
            optionLabel="pathString"
            optionValue="id"
            defaultValue={null}
            errors={errors.product as any}
            loading={productsLoading}
            handleOpen={() => getProducts()}
            handleFilter={(params) => getProducts(params)}
            limitFilter={limitedProductLength}
          />

          <FormTextField
            required
            control={control}
            name="percent"
            label="Porcentagem"
            helperText="Numero entre 0 e 100"
            errors={errors.percent}
          />

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
