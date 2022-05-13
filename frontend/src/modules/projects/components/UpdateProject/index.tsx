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
import { ICustomer, limitedCustomersLength } from '#shared/types/backend/ICustomer';
import { IPortfolio, limitedPortfoliosLength } from '#shared/types/backend/IPortfolio';
import { IProject, IProjectInput, limitedProjectsLength } from '#shared/types/backend/IProject';
import { IProjectType, limitedProjectTypesLength } from '#shared/types/backend/IProjectType';

import {
  IUpdateProjectSchema,
  updateProjectSchema,
} from '#modules/projects/schemas/updateProject.schema';

type IUpdateProjectModal = {
  openModal: boolean;
  closeModal(): void;
  project_id: string;
  reloadList: () => void;
};

export function UpdateProjectModal({
  closeModal,
  project_id,
  openModal,
  reloadList,
}: IUpdateProjectModal) {
  const { toast } = useToast();

  const {
    loading: projectLoading,
    data: projectData,
    error: projectError,
  } = useGet<IProject>({ url: `/projects/${project_id}` });

  const {
    loading: customersLoading,
    data: customersData,
    error: customersError,
    send: getCustomers,
  } = useGet<ICustomer[]>({
    url: '/customers/limited',
    lazy: true,
  });

  const {
    loading: portfoliosLoading,
    data: portfoliosData,
    error: portfoliosError,
    send: getPortfolios,
  } = useGet<IPortfolio[]>({
    url: '/portfolios/limited',
    lazy: true,
  });

  const {
    loading: projectTypesLoading,
    data: projectTypesData,
    error: projectTypesError,
    send: getProjectTypes,
  } = useGet<IProjectType[]>({
    url: '/project_types/limited',
    lazy: true,
  });

  const {
    loading: projectParentsLoading,
    data: projectParentsData,
    error: projectParentsError,
    send: getProjectParents,
  } = useGet<IProject[]>({
    url: '/projects/limited/root',
    lazy: true,
  });

  const { send: updateProject, loading: updateLoading } = usePut<IProject, IProjectInput>(
    `/projects/${project_id}`,
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IUpdateProjectSchema>({
    resolver: yupResolver(updateProjectSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (projectError) {
      toast({ message: projectError, severity: 'error' });

      return;
    }

    if (customersError) {
      toast({ message: customersError, severity: 'error' });

      return;
    }

    if (projectTypesError) {
      toast({ message: projectTypesError, severity: 'error' });

      return;
    }

    if (portfoliosError) {
      toast({ message: portfoliosError, severity: 'error' });

      return;
    }

    if (projectParentsError) {
      toast({ message: projectParentsError, severity: 'error' });
    }
  }, [
    closeModal,
    customersError,
    portfoliosError,
    projectError,
    projectTypesError,
    toast,
    projectParentsError,
  ]);

  const customersOptions = useMemo(() => {
    const options = !customersData ? [] : customersData;

    if (projectData?.customer) {
      const filter = options.find((customer) => customer.id === projectData.customer!.id);

      if (!filter) {
        options.push(projectData.customer as any);
      }
    }

    return options;
  }, [customersData, projectData]);

  const projectParentsOptions = useMemo(() => {
    const options = !projectParentsData ? [] : projectParentsData;

    if (projectData?.projectParent) {
      const filter = options.find(
        (projectParent) => projectParent.id === projectData.projectParent!.id,
      );

      if (!filter) {
        options.push({
          ...projectData.projectParent,
          pathString: `${projectData.projectParent.name} | ${projectData.projectParent.customer.name}`,
        } as any);
      }
    }

    return options;
  }, [projectData, projectParentsData]);

  const portfoliosOptions = useMemo(() => {
    const options = !portfoliosData ? [] : portfoliosData;

    if (projectData?.portfolios) {
      const filter = options.find((portfolio) =>
        projectData.portfolios.map(({ id }) => id).includes(portfolio.id),
      );

      if (!filter) {
        options.push(...projectData.portfolios);
      }
    }

    return options;
  }, [portfoliosData, projectData]);

  const projectTypesOptions = useMemo(() => {
    const options = !projectTypesData ? [] : projectTypesData;

    if (projectData?.projectType) {
      const filter = options.find(
        (project_type) => project_type.id === projectData.projectType!.id,
      );

      if (!filter) {
        options.push(projectData.projectType as any);
      }
    }

    return options;
  }, [projectData, projectTypesData]);

  const projectParentDefault = useMemo(() => {
    if (projectData?.projectParent) {
      return {
        ...projectData.projectParent,
        pathString: `${projectData.projectParent.name} | ${projectData.projectParent.customer.name}`,
      };
    }

    return null;
  }, [projectData]);

  const onSubmit = useCallback(
    async ({ customer, projectType, portfolios, projectParent, ...rest }: IUpdateProjectSchema) => {
      const portfolios_id = portfolios.map(({ id }) => id);

      const { error: updateErrors } = await updateProject({
        customer_id: customer?.id,
        portfolios_id,
        project_type_id: projectType.id,
        project_parent_id: projectParent?.id,
        ...rest,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'projeto atualizado', severity: 'success' });

      closeModal();
    },
    [updateProject, reloadList, toast, closeModal],
  );

  if (projectLoading) return <Loading loading={projectLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {projectData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Editar projeto - ${projectData.name}`}
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
                  defaultValue={projectData.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormSelectAsync
                  control={control}
                  name="customer"
                  label="Cliente"
                  options={customersOptions}
                  optionLabel="name"
                  optionValue="id"
                  defaultValue={projectData.customer || null}
                  margin_type="no-margin"
                  errors={errors.customer as any}
                  loading={customersLoading}
                  handleOpen={() => getCustomers()}
                  handleFilter={(params) => getCustomers(params)}
                  limitFilter={limitedCustomersLength}
                  filterField="name"
                  helperText="Preencher o cliente ou o projeto Pai"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormSelectAsync
                  control={control}
                  name="projectParent"
                  label="Projeto Pai"
                  optionValue="id"
                  options={projectParentsOptions}
                  optionLabel="pathString"
                  defaultValue={projectParentDefault}
                  margin_type="no-margin"
                  errors={errors.projectParent as any}
                  loading={projectParentsLoading}
                  handleOpen={() => getProjectParents()}
                  handleFilter={(params) => getProjectParents(params)}
                  limitFilter={limitedProjectsLength}
                  filterField="name"
                  helperText="Preencher o projeto Pai ou o cliente"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormSelectAsync
                  required
                  control={control}
                  name="projectType"
                  label="Tipo de Projeto"
                  options={projectTypesOptions}
                  optionLabel="name"
                  optionValue="id"
                  defaultValue={projectData.projectType || null}
                  margin_type="no-margin"
                  errors={errors.projectType as any}
                  loading={projectTypesLoading}
                  handleOpen={() => getProjectTypes()}
                  handleFilter={(params) => getProjectTypes(params)}
                  limitFilter={limitedProjectTypesLength}
                  filterField="name"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormSelectAsync
                  multiple
                  control={control}
                  name="portfolios"
                  label="Portfolios"
                  options={portfoliosOptions}
                  optionLabel="name"
                  optionValue="id"
                  defaultValue={projectData.portfolios || []}
                  margin_type="no-margin"
                  errors={errors.portfolios as any}
                  loading={portfoliosLoading}
                  handleOpen={() => getPortfolios()}
                  handleFilter={(params) => getPortfolios(params)}
                  limitFilter={limitedPortfoliosLength}
                  filterField="name"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormDateTimePicker
                  control={control}
                  name="deadline"
                  label="Prazo"
                  errors={errors.deadline}
                  defaultValue={projectData.deadline}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormDateTimePicker
                  control={control}
                  name="availableDate"
                  label="Data de Disponibilidade"
                  errors={errors.availableDate}
                  defaultValue={projectData.availableDate}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormDateTimePicker
                  control={control}
                  name="startDate"
                  label="Data de Inicio"
                  errors={errors.startDate}
                  defaultValue={projectData.startDate}
                  margin_type="no-margin"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormDateTimePicker
                  control={control}
                  name="endDate"
                  label="Data de Término"
                  errors={errors.endDate}
                  defaultValue={projectData.endDate}
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
