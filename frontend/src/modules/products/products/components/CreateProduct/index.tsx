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
import { useGet, usePost } from '#shared/services/useAxios';
import { IReloadModal } from '#shared/types/IModal';

import { IMeasure, limitedMeasuresLength } from '#modules/products/measures/types/IMeasure';
import {
  ICreateProductSchema,
  createProductSchema,
  createSubProductSchema,
} from '#modules/products/products/schemas/createProduct.schema';
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

type ICreateProductModal = IReloadModal & {
  product_id?: string;
  defaultProject?: { id: string; pathString: string } | null;
};

export function CreateProductModal({
  openModal,
  closeModal,
  reloadList,
  product_id,
  defaultProject,
}: ICreateProductModal) {
  const { toast } = useToast();

  const { send: createProduct, loading: createLoading } = usePost<IProduct, IProductInput>(
    'products',
  );

  const {
    loading: projectsLoading,
    data: projectsData,
    error: projectsError,
    send: getProjects,
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

  useEffect(() => {
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

      return;
    }

    if (projectsError) {
      toast({ message: projectsError, severity: 'error' });
    }
  }, [productTypesError, measuresError, toast, closeModal, projectsError, productParentsError]);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ICreateProductSchema>({
    resolver: yupResolver(product_id ? createSubProductSchema : createProductSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const projectsOptions = useMemo(() => {
    const options = !projectsData ? [] : projectsData;

    if (defaultProject) {
      const filter = options.find((project) => project.id === defaultProject.id);

      if (!filter) {
        options.push(defaultProject as any);
      }
    }

    return options;
  }, [defaultProject, projectsData]);

  const onSubmit = useCallback(
    async ({
      project,
      measure,
      productType,
      productParent,
      quantity,
      ...rest
    }: ICreateProductSchema) => {
      const newProduct = {
        ...rest,
        project_id: project?.id,
        product_parent_id: product_id || productParent?.id,
        product_type_id: productType.id,
        measure_id: measure.id,
        quantity: Number(quantity),
      };

      const { error: createErrors } = await createProduct(newProduct);

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'produto criado', severity: 'success' });

      closeModal();
    },
    [closeModal, createProduct, product_id, reloadList, toast],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Produto"
        maxWidth="md"
      >
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
              />
            </Grid>

            {!product_id && (
              <>
                <Grid item xs={12} md={6}>
                  <FormSelectAsync
                    required
                    control={control}
                    name="project"
                    label="Projeto"
                    options={projectsOptions}
                    optionLabel="pathString"
                    optionValue="id"
                    defaultValue={defaultProject || null}
                    margin_type="no-margin"
                    errors={errors.project as any}
                    loading={projectsLoading}
                    handleOpen={() => getProjects()}
                    handleFilter={(params) => getProjects(params)}
                    limitFilter={limitedProjectsLength}
                    filterField="name"
                    helperText="Preencher o produto Pai ou o projeto"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormSelectAsync
                    control={control}
                    name="productParent"
                    label="Produto Pai"
                    options={productParentsData || []}
                    optionLabel="pathString"
                    optionValue="id"
                    defaultValue={null}
                    margin_type="no-margin"
                    errors={errors.productParent as any}
                    loading={productParentsLoading}
                    handleOpen={() => getProductParents()}
                    handleFilter={(params) => getProductParents(params)}
                    limitFilter={limitedProductLength}
                    filterField="name"
                    helperText="Preencher o produto Pai ou o projeto"
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <FormSelectAsync
                required
                control={control}
                name="productType"
                label="Tipo de Produto"
                options={productTypesData || []}
                optionLabel="name"
                optionValue="id"
                defaultValue={null}
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
                options={measuresData || []}
                optionLabel="name"
                optionValue="id"
                defaultValue={null}
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
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDateTimePicker
                control={control}
                name="availableDate"
                label="Data de Disponibilidade"
                errors={errors.availableDate}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDateTimePicker
                control={control}
                name="startDate"
                label="Data de Inicio"
                errors={errors.startDate}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDateTimePicker
                control={control}
                name="endDate"
                label="Data de Término"
                errors={errors.endDate}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>
          </Grid>

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
