import { AssignmentInd, Cached, Comment } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { HeaderList } from '#shared/components/HeaderList';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IPagingResult } from '#shared/types/IPagingResult';
import { StatusDateColor } from '#shared/types/IStatusDate';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
import { getStatusText } from '#shared/utils/getStatusText';
import { IPaginationConfig } from '#shared/utils/pagination';
import { parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { InfoAssignmentsTaskModal } from '#modules/assignments/components/InfoAssignmentsTask';
import { IProduct, IProductReportFilters } from '#modules/products/products/types/IProduct';
import { ListCommentsTaskReport } from '#modules/tasks/taskReportComments/components/ListCommentsTaskReport';
import { ManageTaskReportCommentsModal } from '#modules/tasks/taskReportComments/components/ManageTaskReportComment';
import { UpdateTaskNoDependenciesModal } from '#modules/tasks/tasks/components/UpdateTaskNoDependencies';

import { defaultProductReportFilter, ListProductsReportFilter } from './form';
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
  TableTitle,
} from './styles';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IProductReportFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultProductReportFilter,
};

const stateKey = 'products_report';

export function ListProductReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [lastUpdate, setLastUpdate] = useState(null);
  const [infoAssignments, setInfoAssignments] = useState<IDeleteModal>(null);
  const [manageComments, setManageComments] = useState<IDeleteModal>(null);
  const [seeComments, setSeeComents] = useState<IDeleteModal>(null);
  const [updateTask, setUpdateTask] = useState<IUpdateModal>(null);
  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IProductReportFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );

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
      status_date: apiConfig.filters.status_date?.value,
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

  useEffect(() => {
    getProducts({ params: apiParams });

    setLastUpdate(new Date());
  }, [apiParams, getProducts]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    if (productsError) {
      toast({ message: productsError, severity: 'error' });
    }
  }, [productsError, toast]);

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

  const lastUpdateFormatted = useMemo(() => {
    return parseDateApi(lastUpdate, 'HH:mm:ss', '-');
  }, [lastUpdate]);

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
            <ListProductsReportFilter
              apiConfig={apiConfig}
              keepState={keepState}
              stateKey={stateKey}
              updateApiConfig={(filters) => {
                setApiConfig((oldConfig) => ({
                  ...oldConfig,
                  filters,
                  page: 1,
                }));
              }}
            />
          }
          custom_actions={
            <Box display="flex" alignItems="center">
              <Typography>Ultima Atualização: {lastUpdateFormatted}</Typography>

              <CustomIconButton
                iconType="custom"
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
                  <Grid container spacing={0}>
                    <Grid item xs={2}>
                      <TableTitle fontSize="0.875rem">Subproduto</TableTitle>
                    </Grid>

                    <Grid item xs>
                      <Grid container spacing={0}>
                        <Grid item xs={2}>
                          <TableTitle fontSize="0.875rem">Cadeia de valor</TableTitle>
                        </Grid>

                        <Grid item xs>
                          <Grid container spacing={0}>
                            <Grid item xs="auto" minWidth="50px" maxWidth="50px">
                              <TableTitle fontSize="0.875rem">S</TableTitle>
                            </Grid>

                            <Grid item xs={4}>
                              <TableTitle fontSize="0.875rem">Tarefa</TableTitle>
                            </Grid>

                            <Grid item xs="auto" minWidth="150px" maxWidth="150px">
                              <TableTitle fontSize="0.875rem">Prazo</TableTitle>
                            </Grid>

                            <Grid item xs={2.5}>
                              <TableTitle fontSize="0.875rem">Atribuições</TableTitle>
                            </Grid>

                            <Grid item xs minWidth="150px">
                              <TableTitle
                                fontSize="0.875rem"
                                sx={(theme) => ({
                                  borderRight: `1px solid ${theme.palette.divider}`,
                                })}
                              >
                                Ações
                              </TableTitle>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>

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
                                                iconType="info"
                                                title="Comentarios"
                                                iconSize="small"
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
                                                iconType="edit"
                                                title="Editar Tarefa"
                                                iconSize="small"
                                                action={() => setUpdateTask({ id: task.id })}
                                                sx={{ padding: '5px' }}
                                              />
                                            )}

                                            {permissions.readAssignment && (
                                              <CustomIconButton
                                                iconType="custom"
                                                iconSize="small"
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
                                                iconType="custom"
                                                iconSize="small"
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
