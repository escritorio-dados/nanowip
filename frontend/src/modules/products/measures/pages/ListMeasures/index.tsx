import { ListAlt } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
import {
  getSortOptions,
  handleAddItem,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateMeasureModal } from '#modules/products/measures/components/CreateMeasure';
import { DeleteMeasureModal } from '#modules/products/measures/components/DeleteMeasure';
import { InfoMeasureModal } from '#modules/products/measures/components/InfoMeasure';
import { UpdateMeasureModal } from '#modules/products/measures/components/UpdateMeasure';
import { IMeasure, IMeasureFilters } from '#modules/products/measures/types/IMeasure';

import { defaultMeasureFilter, ListMeasuresFilter } from './form';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IMeasureFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultMeasureFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'measures';

export function ListMeasure() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IMeasureFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [deleteMeasure, setDeleteMeasure] = useState<IDeleteModal>(null);
  const [updateMeasure, setUpdateMeasure] = useState<IUpdateModal>(null);
  const [createMeasure, setCreateMeasure] = useState(false);
  const [infoMeasure, setInfoMeasure] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setBackUrl } = useGoBackUrl();
  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();
  const { toast } = useToast();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
    };
  }, [apiConfig]);

  const {
    loading: measuresLoading,
    data: measuresData,
    error: measuresError,
    send: getMeasures,
    updateData: updateMeasuresData,
  } = useGet<IPagingResult<IMeasure>>({
    url: '/measures',
    lazy: true,
  });

  useEffect(() => {
    getMeasures({ params: apiParams });
  }, [apiParams, getMeasures]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    if (measuresError) {
      toast({ message: measuresError, severity: 'error' });
    }
  }, [measuresError, toast]);

  useEffect(() => {
    updateTitle('Unidades de medida');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createMeasure: checkPermissions([
        [PermissionsUser.create_measure, PermissionsUser.manage_measure],
      ]),
      updateMeasure: checkPermissions([
        [PermissionsUser.update_measure, PermissionsUser.manage_measure],
      ]),
      deleteMeasure: checkPermissions([
        [PermissionsUser.delete_measure, PermissionsUser.manage_measure],
      ]),
      readProject: checkPermissions([
        [PermissionsUser.read_product, PermissionsUser.manage_product],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleNavigateProducts = useCallback(
    (id: string, name: string) => {
      const search = { filters: JSON.stringify({ measure: { id, name } }) };

      setBackUrl('products', location);

      navigate({
        pathname: '/products',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, setBackUrl, navigate],
  );

  const cols = useMemo<ICol<IMeasure>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '175px',
        minWidth: '175px',
        customColumn: ({ id, name }) => {
          return (
            <Box sx={{ display: 'flex' }}>
              {permissions.readProject && (
                <CustomIconButton
                  iconType="custom"
                  iconSize="small"
                  title="Ir para produtos"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateProducts(id, name)}
                />
              )}

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoMeasure({ id })}
              />

              {permissions.updateMeasure && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar unidade de medida"
                  action={() => setUpdateMeasure({ id })}
                />
              )}

              {permissions.deleteMeasure && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar unidade de medida"
                  action={() => setDeleteMeasure({ id, name })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [
    handleNavigateProducts,
    permissions.deleteMeasure,
    permissions.readProject,
    permissions.updateMeasure,
  ]);

  if (measuresLoading) return <Loading loading={measuresLoading} />;

  return (
    <>
      {createMeasure && (
        <CreateMeasureModal
          openModal={createMeasure}
          closeModal={() => setCreateMeasure(false)}
          addList={(newData) =>
            updateMeasuresData((current) => handleAddItem({ data: newData, current }))
          }
        />
      )}

      {!!deleteMeasure && (
        <DeleteMeasureModal
          openModal={!!deleteMeasure}
          measure={deleteMeasure}
          closeModal={() => setDeleteMeasure(null)}
          updateList={(id) => updateMeasuresData((current) => handleDeleteItem({ id, current }))}
        />
      )}

      {!!updateMeasure && (
        <UpdateMeasureModal
          openModal={!!updateMeasure}
          closeModal={() => setUpdateMeasure(null)}
          measure_id={updateMeasure.id}
          updateList={(id, newData) =>
            updateMeasuresData((current) => handleUpdateItem({ id, data: newData, current }))
          }
        />
      )}

      {!!infoMeasure && (
        <InfoMeasureModal
          openModal={!!infoMeasure}
          closeModal={() => setInfoMeasure(null)}
          measure_id={infoMeasure.id}
        />
      )}

      {measuresData && (
        <CustomTable<IMeasure>
          id="measures"
          cols={cols}
          data={measuresData.data}
          tableMinWidth="375px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createMeasure && (
                <CustomIconButton
                  action={() => setCreateMeasure(true)}
                  title="Cadastrar unidade de medida"
                  iconType="add"
                />
              )}
            </>
          }
          sortContainer={
            <SortForm
              sortOptions={sortOptions}
              sortTranslator={sortTranslator}
              defaultOrder={apiConfig.order_by}
              defaultSort={apiConfig.sort_by}
              updateSort={(sortBy, orderBy) => {
                setApiConfig((oldConfig) => ({ ...oldConfig, sort_by: sortBy, order_by: orderBy }));

                keepState.updateManyStates([
                  {
                    category: 'sort_by',
                    key: stateKey,
                    value: sortBy,
                    localStorage: true,
                  },
                  {
                    category: 'order_by',
                    key: stateKey,
                    value: orderBy,
                    localStorage: true,
                  },
                ]);
              }}
            />
          }
          filterContainer={
            <ListMeasuresFilter
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
          pagination={{
            currentPage: apiConfig.page,
            totalPages: measuresData.pagination.total_pages,
            totalResults: measuresData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
