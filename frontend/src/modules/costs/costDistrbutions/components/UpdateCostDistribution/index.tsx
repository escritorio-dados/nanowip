import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IReloadModal } from '#shared/types/IModal';

import {
  ICostDistribution,
  IUpdateCostDistribution,
} from '#modules/costs/costDistrbutions/types/ICostDistribution';
import { IProduct, limitedProductLength } from '#modules/products/products/types/IProduct';
import { ITaskType, limitedTaskTypesLength } from '#modules/tasks/taskTypes/types/ITaskType';

import {
  costDistributionSchema,
  ICostDistributionSchema,
} from '../../schema/costDistribution.schema';

type IUpdateCostDistributionModal = IReloadModal & { cost_distribution_id: string };

export function UpdateCostDistributionModal({
  closeModal,
  cost_distribution_id,
  openModal,
  reloadList,
}: IUpdateCostDistributionModal) {
  const { toast } = useToast();

  const { send: updateCostDistribution, loading: updateLoading } = usePut<
    ICostDistribution,
    IUpdateCostDistribution
  >(`/cost_distributions/${cost_distribution_id}`);

  const {
    loading: costDistributionLoading,
    data: costDistributionData,
    error: costDistributionError,
  } = useGet<ICostDistribution>({ url: `/cost_distributions/${cost_distribution_id}` });

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

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ICostDistributionSchema>({
    resolver: yupResolver(costDistributionSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (costDistributionError) {
      toast({ message: costDistributionError, severity: 'error' });

      closeModal();
    }

    if (taskTypesError) {
      toast({ message: taskTypesError, severity: 'error' });

      return;
    }

    if (productsError) {
      toast({ message: productsError, severity: 'error' });
    }
  }, [closeModal, costDistributionError, productsError, taskTypesError, toast]);

  const defaultPercent = useMemo(() => {
    if (!costDistributionData?.percent) {
      return '';
    }

    return String(costDistributionData.percent * 100);
  }, [costDistributionData]);

  const defaultProduct = useMemo(() => {
    if (!costDistributionData) {
      return null;
    }

    const pathString = Object.values(costDistributionData.path)
      .map(({ name }) => name)
      .join(' | ');

    return {
      id: costDistributionData.path.product.id,
      pathString,
    };
  }, [costDistributionData]);

  const taskTypesOptions = useMemo(() => {
    const options = !taskTypesData ? [] : taskTypesData;

    if (costDistributionData?.taskType) {
      const filter = options.find((option) => option.id === costDistributionData.taskType!.id);

      if (!filter) {
        options.push(costDistributionData.taskType as any);
      }
    }

    return options;
  }, [costDistributionData, taskTypesData]);

  const productsOptions = useMemo(() => {
    const options = !productsData ? [] : productsData;

    if (defaultProduct) {
      const filter = options.find((option) => option.id === defaultProduct!.id);

      if (!filter) {
        options.push(defaultProduct as any);
      }
    }

    return options;
  }, [defaultProduct, productsData]);

  const onSubmit = useCallback(
    async ({ percent, product, taskType }: ICostDistributionSchema) => {
      const { error: updateErrors } = await updateCostDistribution({
        task_type_id: taskType?.id,
        product_id: product.id,
        percent: Number(percent),
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'distribuição do custo atualizada', severity: 'success' });

      closeModal();
    },
    [updateCostDistribution, reloadList, toast, closeModal],
  );

  if (costDistributionLoading) return <Loading loading={costDistributionLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {costDistributionData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar Distribuição do Custo"
          maxWidth="sm"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormSelectAsync
              control={control}
              name="taskType"
              label="Tipo de Tarefa"
              options={taskTypesOptions}
              optionLabel="name"
              optionValue="id"
              defaultValue={costDistributionData.taskType || null}
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
              options={productsOptions}
              filterField="name"
              optionLabel="pathString"
              optionValue="id"
              defaultValue={defaultProduct}
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
              defaultValue={defaultPercent}
              errors={errors.percent}
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
