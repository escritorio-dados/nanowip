import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IReloadModal } from '#shared/types/IModal';

import { IMeasure, limitedMeasuresLength } from '#modules/products/measures/types/IMeasure';
import {
  IUpdateProductSchema,
  updateProductSchema,
} from '#modules/products/products/schemas/updateProduct.schema';
import {
  IProduct,
  IProductInput,
  limitedProductLength,
} from '#modules/products/products/types/IProduct';
import {
  IProductType,
  limitedProductTypesLength,
} from '#modules/products/productTypes/types/IProductType';
import { IProject, limitedProjectsLength } from '#modules/projects/projects/types/IProject';

type IUpdateProductModal = IReloadModal & { product_id: string };

export function UpdateProductModal({
  closeModal,
  product_id,
  openModal,
  reloadList,
}: IUpdateProductModal) {
  const { toast } = useToast();

  const {
    loading: productLoading,
    data: productData,
    error: productError,
  } = useGet<IProduct>({ url: `/products/${product_id}` });

  const {
    loading: projectsLoading,
    data: projectsData,
    error: projectsError,
    send: getCustomers,
  } = useGet<IProject[]>({
    url: '/projects/limited/all',
    lazy: true,
  });

  const {
    loading: productTypesLoading,
    data: productTypesData,
    error: productTypesError,
    send: getProductTypes,
  } = useGet<IProductType[]>({
    url: '/product_types/limited',
    lazy: true,
  });

  const {
    loading: measuresLoading,
    data: measuresData,
    error: measuresError,
    send: getMeasures,
  } = useGet<IMeasure[]>({
    url: '/measures/limited',
    lazy: true,
  });

  const {
    loading: productParentsLoading,
    data: productParentsData,
    error: productParentsError,
    send: getProductParents,
  } = useGet<IProduct[]>({
    url: '/products/limited/root',
    lazy: true,
  });

  const { send: updateProduct, loading: updateLoading } = usePut<IProduct, IProductInput>(
    `/products/${product_id}`,
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IUpdateProductSchema>({
    resolver: yupResolver(updateProductSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (productError) {
      toast({ message: productError, severity: 'error' });

      return;
    }

    if (projectsError) {
      toast({ message: projectsError, severity: 'error' });

      return;
    }

    if (productTypesError) {
      toast({ message: productTypesError, severity: 'error' });

      return;
    }

    if (measuresError) {
      toast({ message: measuresError, severity: 'error' });

      return;
    }

    if (productParentsError) {
      toast({ message: productParentsError, severity: 'error' });
    }
  }, [
    closeModal,
    projectsError,
    measuresError,
    productError,
    productTypesError,
    toast,
    productParentsError,
  ]);

  const projectsOptions = useMemo(() => {
    const options = !projectsData ? [] : projectsData;

    if (productData?.project) {
      const filter = options.find((project) => project.id === productData.project!.id);

      if (!filter) {
        options.push({
          id: productData.project.id,
          pathString: productData.pathString,
        } as any);
      }
    }

    return options;
  }, [projectsData, productData]);

  const productParentsOptions = useMemo(() => {
    const options = !productParentsData ? [] : productParentsData;

    if (productData?.productParent) {
      const filter = options.find(
        (productParent) => productParent.id === productData.productParent!.id,
      );

      if (!filter) {
        options.push({
          id: productData.productParent.id,
          pathString: productData.pathString,
        } as any);
      }
    }

    return options;
  }, [productData, productParentsData]);

  const productTypesOptions = useMemo(() => {
    const options = !productTypesData ? [] : productTypesData;

    if (productData?.productType) {
      const filter = options.find(
        (product_type) => product_type.id === productData.productType!.id,
      );

      if (!filter) {
        options.push(productData.productType as any);
      }
    }

    return options;
  }, [productData, productTypesData]);

  const measuresOptions = useMemo(() => {
    const options = !measuresData ? [] : measuresData;

    if (productData?.measure) {
      const filter = options.find((measure) => measure.id === productData.measure!.id);

      if (!filter) {
        options.push(productData.measure as any);
      }
    }

    return options;
  }, [productData, measuresData]);

  const productParentDefault = useMemo(() => {
    if (productData?.productParent) {
      return {
        id: productData.productParent.id,
        pathString: productData.pathString,
      };
    }

    return null;
  }, [productData]);

  const projectDefault = useMemo(() => {
    if (productData?.project) {
      return {
        id: productData.project.id,
        pathString: productData.pathString,
      };
    }

    return null;
  }, [productData]);

  const quantityDefault = useMemo(() => {
    if (!productData) {
      return '';
    }

    return productData.quantity.toLocaleString('pt-BR');
  }, [productData]);

  const onSubmit = useCallback(
    async ({
      project,
      productType,
      measure,
      quantity,
      productParent,
      ...rest
    }: IUpdateProductSchema) => {
      const { error: updateErrors } = await updateProduct({
        project_id: project?.id,
        product_type_id: productType.id,
        measure_id: measure.id,
        product_parent_id: productParent?.id,
        quantity: Number(quantity),
        ...rest,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'produto atualizado', severity: 'success' });

      closeModal();
    },
    [updateProduct, reloadList, toast, closeModal],
  );

  if (productLoading) return <Loading loading={productLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {productData && (
        <CustomDialog open={openModal} closeModal={closeModal} title="Editar produto" maxWidth="md">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormTextField
                  required
                  name="name"
                  label="Nome"
                  control={control}
                  errors={errors.name}
                  margin_type="no-margin"
                  defaultValue={productData.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormSelectAsync
                  control={control}
                  name="project"
                  label="Projeto"
                  options={projectsOptions}
                  optionLabel="pathString"
                  optionValue="id"
                  defaultValue={projectDefault}
                  margin_type="no-margin"
                  errors={errors.project as any}
                  loading={projectsLoading}
                  handleOpen={() => getCustomers()}
                  handleFilter={(params) => getCustomers(params)}
                  limitFilter={limitedProjectsLength}
                  filterField="name"
                  helperText="Preencher o projeto ou o produto pai"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormSelectAsync
                  control={control}
                  name="productParent"
                  label="Produto Pai"
                  options={productParentsOptions}
                  optionLabel="pathString"
                  optionValue="id"
                  defaultValue={productParentDefault}
                  margin_type="no-margin"
                  errors={errors.productParent as any}
                  loading={productParentsLoading}
                  handleOpen={() => getProductParents()}
                  handleFilter={(params) => getProductParents(params)}
                  limitFilter={limitedProductLength}
                  filterField="name"
                  helperText="Preencher o projeto ou o produto pai"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormSelectAsync
                  required
                  control={control}
                  name="productType"
                  label="Tipo de Produto"
                  options={productTypesOptions}
                  optionLabel="name"
                  optionValue="id"
                  defaultValue={productData.productType || null}
                  margin_type="no-margin"
                  errors={errors.productType as any}
                  loading={productTypesLoading}
                  handleOpen={() => getProductTypes()}
                  handleFilter={(params) => getProductTypes(params)}
                  limitFilter={limitedProductTypesLength}
                  filterField="name"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormSelectAsync
                  required
                  control={control}
                  name="measure"
                  label="Unidade de Medida"
                  options={measuresOptions}
                  optionLabel="name"
                  optionValue="id"
                  defaultValue={productData.measure || null}
                  margin_type="no-margin"
                  errors={errors.measure as any}
                  loading={measuresLoading}
                  handleOpen={() => getMeasures()}
                  handleFilter={(params) => getMeasures(params)}
                  limitFilter={limitedMeasuresLength}
                  filterField="name"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormTextField
                  required
                  name="quantity"
                  label="Quantidade"
                  control={control}
                  defaultValue={quantityDefault}
                  errors={errors.quantity}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormDateTimePicker
                  control={control}
                  name="deadline"
                  label="Prazo"
                  errors={errors.deadline}
                  defaultValue={productData.deadline}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormDateTimePicker
                  control={control}
                  name="availableDate"
                  label="Data de Disponibilidade"
                  errors={errors.availableDate}
                  defaultValue={productData.availableDate}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormDateTimePicker
                  control={control}
                  name="startDate"
                  label="Data de Inicio"
                  errors={errors.startDate}
                  defaultValue={productData.startDate}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormDateTimePicker
                  control={control}
                  name="endDate"
                  label="Data de Término"
                  errors={errors.endDate}
                  defaultValue={productData.endDate}
                  margin_type="no-margin"
                />
              </Grid>
            </Grid>

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
