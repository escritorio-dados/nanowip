import { yupResolver } from '@hookform/resolvers/yup';
import { AssignmentInd, Cached, Comment } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createSearchParams, useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { FormCheckbox } from '#shared/components/form/FormCheck';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { HeaderList } from '#shared/components/HeaderList';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IProduct, IProductReportFilters } from '#shared/types/backend/IProduct';
import { IProductType, limitedProductTypesLength } from '#shared/types/backend/IProductType';
import { IProject, limitedProjectsLength } from '#shared/types/backend/IProject';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  StatusDateColor,
  statusDateOptions,
  statusDateTranslator,
} from '#shared/types/IStatusDate';
import { getStatusText } from '#shared/utils/getStatusText';
import { IPaginationConfig } from '#shared/utils/pagination';
import { parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { InfoAssignmentsTaskModal } from '#modules/assignments/components/InfoAssignmentsTask';
import {
  filterProductReportSchema,
  IFilterProductReportSchema,
} from '#modules/products/schemas/filterProductReport.schema';
import { ListCommentsTaskReport } from '#modules/tasks/taskReportComments/components/ListCommentsTaskReport';
import { ManageTaskReportCommentsModal } from '#modules/tasks/taskReportComments/components/ManageTaskReportComment';
import { UpdateTaskNoDependenciesModal } from '#modules/tasks/tasks/components/UpdateTaskNoDependencies';

import {
  ListProductContainer,
  ProductCardData,
  ProductList,
  ProductTitle,
  SubproductTitle,
  TaskField,
  ValueChainTitle,
  SubproductDataRow,
  ValueChainRows,
  TaskData,
} from './styles';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IProductReportFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: {
    name: '',
    status_date: null,
    product_type: null,
    project: null,
    includeAvailable: true,
    includeFirst: false,
    includeLast: false,
  },
};

export function ListProductReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [lastUpdate, setLastUpdate] = useState(null);
  const [infoAssignments, setInfoAssignments] = useState<IDeleteModal>(null);
  const [manageComments, setManageComments] = useState<IDeleteModal>(null);
  const [seeComments, setSeeComents] = useState<IDeleteModal>(null);
  const [updateTask, setUpdateTask] = useState<IUpdateModal>(null);
  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IProductReportFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IProductReportFilters>({
      category: 'filters',
      key: 'products_report',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'products_report',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'products_report',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'products_report',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });

  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();
  const { toast } = useToast();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
      project_id: apiConfig.filters.project?.id,
      product_type_id: apiConfig.filters.product_type?.id,
    };
  }, [apiConfig]);

  const {
    loading: productsLoading,
    data: productsData,
    error: productsError,
    send: getProducts,
  } = useGet<IPagingResult<IProduct>>({
    url: '/products/report',
    lazy: true,
  });

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
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterProductReportSchema>({
    resolver: yupResolver(filterProductReportSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getProducts({ params: apiParams });

    setLastUpdate(new Date());
  }, [apiParams, getProducts]);

  useEffect(() => {
    const { page, order_by, sort_by, filters } = apiConfig;

    const filtersString = JSON.stringify(removeEmptyFields(filters, true));

    searchParams.set('page', String(page));
    searchParams.set('order_by', order_by);
    searchParams.set('sort_by', sort_by);

    if (filtersString !== '{}') {
      searchParams.set('filters', filtersString);
    } else {
      searchParams.delete('filters');
    }

    setSearchParams(searchParams);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    if (productsError) {
      toast({ message: productsError, severity: 'error' });

      return;
    }

    if (projectsError) {
      toast({ message: projectsError, severity: 'error' });

      return;
    }

    if (productTypesError) {
      toast({ message: productTypesError, severity: 'error' });
    }
  }, [productsError, projectsError, toast, productTypesError]);

  useEffect(() => {
    updateTitle('Relatório Produtos');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      updateTask: checkPermissions([[PermissionsUser.update_task, PermissionsUser.manage_task]]),
      readAssignment: checkPermissions([
        [PermissionsUser.read_assignment, PermissionsUser.manage_assignment],
      ]),
      manageComments: checkPermissions([
        [
          PermissionsUser.create_task_report_comment,
          PermissionsUser.update_task_report_comment,
          PermissionsUser.delete_task_report_comment,
          PermissionsUser.manage_task_report_comment,
        ],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const projectsOptions = useMemo(() => {
    const options = !projectsData ? [] : projectsData;

    if (apiConfig.filters.project) {
      const filter = options.find((project) => project.id === apiConfig.filters.project!.id);

      if (!filter) {
        options.push(apiConfig.filters.project as any);
      }
    }

    return options;
  }, [apiConfig.filters.project, projectsData]);

  const productTypesOptions = useMemo(() => {
    const options = !productTypesData ? [] : productTypesData;

    if (apiConfig.filters.product_type) {
      const filter = options.find(
        (product_type) => product_type.id === apiConfig.filters.product_type!.id,
      );

      if (!filter) {
        options.push(apiConfig.filters.product_type as any);
      }
    }

    return options;
  }, [apiConfig.filters.product_type, productTypesData]);

  const lastUpdateFormatted = useMemo(() => {
    return parseDateApi(lastUpdate, 'HH:mm:ss', '-');
  }, [lastUpdate]);

  const handleApplyFilters = useCallback(
    (formData: IFilterProductReportSchema) => {
      const filtersValue = { ...formData, status_date: formData.status_date?.value || '' };

      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: filtersValue,
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'products_report',
        value: filtersValue,
        localStorage: true,
      });
    },
    [updateState],
  );

  const handleClearFilters = useCallback(() => {
    setApiConfig((oldConfig) => ({
      ...oldConfig,
      filters: defaultPaginationConfig.filters,
      page: 1,
    }));

    resetForm({
      ...defaultPaginationConfig.filters,
      status_date: defaultPaginationConfig.filters.status_date
        ? {
            label: statusDateTranslator[defaultPaginationConfig.filters.status_date] || '',
            value: defaultPaginationConfig.filters.status_date,
          }
        : null,
    });

    updateState({
      category: 'filters',
      key: 'products_report',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const handleNavigateValueChains = useCallback((subproduct: IProduct, product: IProduct) => {
    const stringPath = Object.values(product.path)
      .map(({ name }) => name)
      .join(' | ');

    const pathString =
      subproduct.id === product.id ? stringPath : `${subproduct.name} | ${stringPath}`;

    const search = { filters: JSON.stringify({ product: { id: subproduct.id, pathString } }) };

    window.open(`${window.location.origin}/value_chains?${createSearchParams(search)}`);
  }, []);

  const productsFormatted = useMemo(() => {
    if (!productsData) {
      return [];
    }

    return productsData.data.map((product) => {
      const subproductsFormatted = product.subproducts.map((subproduct) => ({
        ...subproduct,
        valueChains: subproduct.valueChains.map((valueChain) => ({
          ...valueChain,
          tasks: valueChain.tasks.map((task) => ({
            ...task,
            deadline: parseDateApi(task.deadline, 'dd/MM/yyyy (HH:mm)', '-'),
            status: getStatusText(task.statusDate),
            statusColor: StatusDateColor[task.statusDate.status],
            lateColor: task.statusDate.late ? StatusDateColor.late : undefined,
            collaborators:
              task.assignments.length === 0
                ? '-'
                : task.assignments.map(({ collaborator }) => collaborator.name).join(', '),
          })),
        })),
      }));

      return {
        ...product,
        subproducts: subproductsFormatted,
      };
    });
  }, [productsData]);

  return (
    <>
      <Loading loading={productsLoading} />

      {!!infoAssignments && (
        <InfoAssignmentsTaskModal
          openModal={!!infoAssignments}
          closeModal={() => {
            setInfoAssignments(null);
          }}
          task={infoAssignments}
        />
      )}

      {!!manageComments && (
        <ManageTaskReportCommentsModal
          openModal={!!manageComments}
          closeModal={() => {
            setManageComments(null);
          }}
          task={manageComments}
          reportName="tabela_fluxos"
        />
      )}

      {!!seeComments && (
        <ListCommentsTaskReport
          openModal={!!seeComments}
          closeModal={() => {
            setSeeComents(null);
          }}
          task={seeComments}
          reportName="tabela_fluxos"
        />
      )}

      {!!updateTask && (
        <UpdateTaskNoDependenciesModal
          openModal={!!updateTask}
          closeModal={() => {
            setUpdateTask(null);
          }}
          task_id={updateTask.id}
        />
      )}

      <ListProductContainer>
        <HeaderList
          id="products_report"
          activeFilters={activeFiltersNumber}
          filterContainer={
            <>
              <form onSubmit={handleSubmit(handleApplyFilters)} noValidate>
                <Grid container spacing={2}>
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="name"
                      label="Nome"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.name}
                      errors={errors.name}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelect
                      control={control}
                      name="status_date"
                      label="Status"
                      margin_type="no-margin"
                      defaultValue={
                        apiConfig.filters.status_date
                          ? {
                              value: apiConfig.filters.status_date,
                              label: statusDateTranslator[apiConfig.filters.status_date],
                            }
                          : null
                      }
                      options={statusDateOptions}
                      optionLabel="label"
                      errors={errors.status_date as any}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      name="project"
                      label="Projeto"
                      options={projectsOptions}
                      optionLabel="pathString"
                      optionValue="id"
                      defaultValue={apiConfig.filters.project}
                      margin_type="no-margin"
                      errors={errors.project as any}
                      loading={projectsLoading}
                      handleOpen={() => getProjects()}
                      handleFilter={(params) => getProjects(params)}
                      limitFilter={limitedProjectsLength}
                      filterField="name"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      name="product_type"
                      label="Tipo de Produto"
                      options={productTypesOptions}
                      optionLabel="name"
                      optionValue="id"
                      defaultValue={apiConfig.filters.product_type}
                      margin_type="no-margin"
                      errors={errors.product_type as any}
                      loading={productTypesLoading}
                      handleOpen={() => getProductTypes()}
                      handleFilter={(params) => getProductTypes(params)}
                      limitFilter={limitedProductTypesLength}
                      filterField="name"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormCheckbox
                      control={control}
                      name="includeAvailable"
                      label="Incluir Tarefas Disponiveis"
                      defaultValue={apiConfig.filters.includeAvailable}
                      margin_type="no-margin"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormCheckbox
                      control={control}
                      name="includeFirst"
                      label="Incluir Primeira Tarefa"
                      defaultValue={apiConfig.filters.includeFirst}
                      margin_type="no-margin"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormCheckbox
                      control={control}
                      name="includeLast"
                      label="Incluir Ultima Tarefa"
                      defaultValue={apiConfig.filters.includeLast}
                      margin_type="no-margin"
                    />
                  </Grid>
                </Grid>

                <Grid container columnSpacing={2}>
                  <Grid item md={6} xs={12}>
                    <CustomButton type="submit" size="medium">
                      Aplicar Filtros
                    </CustomButton>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <CustomButton color="info" size="medium" onClick={handleClearFilters}>
                      Limpar Filtros
                    </CustomButton>
                  </Grid>
                </Grid>
              </form>
            </>
          }
          custom_actions={
            <Box display="flex" alignItems="center">
              <Typography>Ultima Atualização: {lastUpdateFormatted}</Typography>

              <CustomIconButton
                type="custom"
                sx={{ marginLeft: '0.5rem' }}
                title="Atualizar Dados"
                action={() => {
                  getProducts({ params: apiParams });

                  setLastUpdate(new Date());
                }}
                CustomIcon={<Cached color="primary" />}
              />
            </Box>
          }
          pagination={{
            currentPage: apiConfig.page,
            totalPages: productsData?.pagination.total_pages || 1,
            totalResults: productsData?.pagination.total_results || 0,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        >
          <ProductList minWidth="1150px">
            {productsFormatted.map((product) => (
              <ProductCardData key={product.id}>
                <ProductTitle>
                  <CustomTooltip
                    title={
                      <Box>
                        {Object.values(product.path)
                          .reverse()
                          .map(({ id, name, entity }) => (
                            <Box key={id} sx={{ display: 'flex' }}>
                              <Typography sx={(theme) => ({ color: theme.palette.primary.main })}>
                                {entity}:
                              </Typography>

                              <Typography sx={{ marginLeft: '0.5rem' }}>{name}</Typography>
                            </Box>
                          ))}
                      </Box>
                    }
                  >
                    <TextEllipsis>{product.name}</TextEllipsis>
                  </CustomTooltip>
                </ProductTitle>

                <Box>
                  {product.subproducts.map((subproduct) => (
                    <SubproductDataRow key={subproduct.id} container>
                      <Grid item xs={2}>
                        <SubproductTitle
                          onClick={() => {
                            handleNavigateValueChains(subproduct as any, product as any);
                          }}
                        >
                          <Typography fontSize="0.875rem">{subproduct.name}</Typography>
                        </SubproductTitle>
                      </Grid>

                      <Grid item xs>
                        <ValueChainRows>
                          {subproduct.valueChains.map((valueChain) => (
                            <Grid key={valueChain.id} container flex={1}>
                              <Grid item xs={2}>
                                <ValueChainTitle
                                  onClick={() =>
                                    window.open(
                                      `${window.location.origin}/tasks/graph/${valueChain.id}`,
                                    )
                                  }
                                >
                                  <Typography fontSize="0.875rem">{valueChain.name}</Typography>
                                </ValueChainTitle>
                              </Grid>

                              <Grid item xs>
                                <Box display="flex" flexDirection="column" height="100%">
                                  {valueChain.tasks.length === 0 ? (
                                    <Grid container flex={1}>
                                      <Grid item xs={12}>
                                        <TaskField>
                                          <Typography textAlign="center">-</Typography>
                                        </TaskField>
                                      </Grid>
                                    </Grid>
                                  ) : (
                                    valueChain.tasks.map((task) => (
                                      <TaskData key={task.id} container>
                                        <Grid item xs="auto" minWidth="50px" maxWidth="50px">
                                          <CustomTooltip title={task.status}>
                                            <Box
                                              sx={(theme) => ({
                                                backgroundColor: task.statusColor,
                                                height: '100%',
                                                borderLeft: `1px solid ${theme.palette.divider}`,
                                              })}
                                            >
                                              <Box
                                                sx={{
                                                  width: '30%',
                                                  height: '100%',
                                                  backgroundColor: task.lateColor,
                                                }}
                                              >
                                                {' '}
                                              </Box>
                                            </Box>
                                          </CustomTooltip>
                                        </Grid>

                                        <Grid item xs={4}>
                                          <TaskField>
                                            <CustomTooltip title={task.name}>
                                              <TextEllipsis fontSize="0.875rem">
                                                {task.name}
                                              </TextEllipsis>
                                            </CustomTooltip>
                                          </TaskField>
                                        </Grid>

                                        <Grid item xs="auto" minWidth="150px" maxWidth="150px">
                                          <TaskField justifyContent="center">
                                            <TextEllipsis fontSize="0.875rem">
                                              {task.deadline}
                                            </TextEllipsis>
                                          </TaskField>
                                        </Grid>

                                        <Grid item xs={2.5}>
                                          <TaskField>
                                            <CustomTooltip title={task.collaborators}>
                                              <TextEllipsis fontSize="0.875rem">
                                                {task.collaborators}
                                              </TextEllipsis>
                                            </CustomTooltip>
                                          </TaskField>
                                        </Grid>

                                        <Grid item xs minWidth="150px">
                                          <TaskField justifyContent="center">
                                            {task.hasComments && (
                                              <CustomIconButton
                                                type="info"
                                                title="Comentarios"
                                                size="small"
                                                action={() => {
                                                  setSeeComents({
                                                    id: task.id,
                                                    name: task.name,
                                                  });
                                                }}
                                                sx={{ padding: '5px' }}
                                              />
                                            )}

                                            {permissions.updateTask && (
                                              <CustomIconButton
                                                type="edit"
                                                title="Editar Tarefa"
                                                size="small"
                                                action={() => setUpdateTask({ id: task.id })}
                                                sx={{ padding: '5px' }}
                                              />
                                            )}

                                            {permissions.readAssignment && (
                                              <CustomIconButton
                                                type="custom"
                                                size="small"
                                                title="Atribuições"
                                                sx={{ padding: '5px', marginLeft: '0.2rem' }}
                                                CustomIcon={
                                                  <AssignmentInd
                                                    fontSize="small"
                                                    sx={{ color: 'success.main' }}
                                                  />
                                                }
                                                action={() => {
                                                  setInfoAssignments({
                                                    id: task.id,
                                                    name: task.name,
                                                  });
                                                }}
                                              />
                                            )}

                                            {permissions.manageComments && (
                                              <CustomIconButton
                                                type="custom"
                                                size="small"
                                                title="Gerenciar Comentarios"
                                                sx={{ padding: '5px', marginLeft: '0.2rem' }}
                                                CustomIcon={<Comment fontSize="small" />}
                                                action={() => {
                                                  setManageComments({
                                                    id: task.id,
                                                    name: task.name,
                                                  });
                                                }}
                                              />
                                            )}
                                          </TaskField>
                                        </Grid>
                                      </TaskData>
                                    ))
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                          ))}
                        </ValueChainRows>
                      </Grid>
                    </SubproductDataRow>
                  ))}
                </Box>
              </ProductCardData>
            ))}
          </ProductList>
        </HeaderList>
      </ListProductContainer>
    </>
  );
}
