import { ListAlt } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useAuth } from '#shared/hooks/auth';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IPagingResult } from '#shared/types/IPagingResult';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { getApiConfig, updateApiConfig } from '#shared/utils/apiConfig';
import {
  getSortOptions,
  handleAddItem,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { ListTrailSectionsModal } from '#modules/objectives/sectionTrails/trailSections/components/ListTrailSections';

import { CreateSectionTrailModal } from '../../components/CreateSectionTrail';
import { DeleteSectionTrailModal } from '../../components/DeleteSectionTrail';
import { InfoSectionTrailModal } from '../../components/InfoSectionTrail';
import { UpdateSectionTrailModal } from '../../components/UpdateSectionTrail';
import { ISectionTrailFilters, ISectionTrail } from '../../types/ISectionTrail';
import { defaultSectionTrailFilter, ListSectionTrailsFilter } from './form';

type IIdNameModal = { id: string; name: string } | null;
type IIdModal = { id: string } | null;

export const defaultApiConfigSectionTrails: IPaginationConfig<ISectionTrailFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultSectionTrailFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export const stateKeySectionTrails = 'sectionTrails';

export function ListSectionTrail() {
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ISectionTrailFilters>>(() =>
    getApiConfig({
      defaultApiConfig: defaultApiConfigSectionTrails,
      keepState,
      stateKey: stateKeySectionTrails,
    }),
  );
  const [deleteSectionTrail, setDeleteSectionTrail] = useState<IIdNameModal>(null);
  const [updateSectionTrail, setUpdateSectionTrail] = useState<IIdModal>(null);
  const [createSectionTrail, setCreateSectionTrail] = useState(false);
  const [infoSectionTrail, setInfoSectionTrail] = useState<IIdModal>(null);
  const [listSections, setListSections] = useState<IIdNameModal>(null);

  const { toast } = useToast();
  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
    };
  }, [apiConfig]);

  const {
    loading: sectionTrailsLoading,
    data: sectionTrailsData,
    error: sectionTrailsError,
    send: getSectionTrails,
    updateData: updateSectionTrailsData,
  } = useGet<IPagingResult<ISectionTrail>>({
    url: '/section_trails',
    lazy: true,
  });

  useEffect(() => {
    getSectionTrails({ params: apiParams });
  }, [apiParams, getSectionTrails]);

  useEffect(() => {
    if (sectionTrailsError) {
      toast({ message: sectionTrailsError, severity: 'error' });
    }
  }, [sectionTrailsError, toast]);

  useEffect(() => {
    updateTitle('Trilhas de Seções');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createSectionTrail: checkPermissions([
        [PermissionsUser.create_section_trail, PermissionsUser.manage_section_trail],
      ]),
      updateSectionTrail: checkPermissions([
        [PermissionsUser.update_section_trail, PermissionsUser.manage_section_trail],
      ]),
      deleteSectionTrail: checkPermissions([
        [PermissionsUser.delete_section_trail, PermissionsUser.manage_section_trail],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const cols = useMemo<ICol<ISectionTrail>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '175px',
        minWidth: '175px',
        customColumn: ({ id, name }) => {
          return (
            <Box sx={{ display: 'flex' }}>
              <CustomIconButton
                iconType="custom"
                iconSize="small"
                title="Visualizar Seções"
                CustomIcon={<ListAlt fontSize="small" />}
                action={() => setListSections({ id, name })}
              />

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoSectionTrail({ id })}
              />

              {permissions.updateSectionTrail && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Trilha"
                  action={() => setUpdateSectionTrail({ id })}
                />
              )}

              {permissions.deleteSectionTrail && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Trilha"
                  action={() => setDeleteSectionTrail({ id, name })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [permissions.deleteSectionTrail, permissions.updateSectionTrail]);

  return (
    <>
      <Loading loading={sectionTrailsLoading} />

      {createSectionTrail && (
        <CreateSectionTrailModal
          openModal={createSectionTrail}
          closeModal={() => setCreateSectionTrail(false)}
          addList={(newData) =>
            updateSectionTrailsData((current) => handleAddItem({ data: newData, current }))
          }
        />
      )}

      {!!deleteSectionTrail && (
        <DeleteSectionTrailModal
          openModal={!!deleteSectionTrail}
          closeModal={() => setDeleteSectionTrail(null)}
          sectionTrail={deleteSectionTrail}
          updateList={(id) =>
            updateSectionTrailsData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateSectionTrail && (
        <UpdateSectionTrailModal
          openModal={!!updateSectionTrail}
          closeModal={() => setUpdateSectionTrail(null)}
          sectionTrail_id={updateSectionTrail.id}
          updateList={(id, newData) =>
            updateSectionTrailsData((current) => handleUpdateItem({ id, data: newData, current }))
          }
        />
      )}

      {!!listSections && (
        <ListTrailSectionsModal
          openModal={!!listSections}
          closeModal={() => setListSections(null)}
          sectionTrail={listSections}
        />
      )}

      {!!infoSectionTrail && (
        <InfoSectionTrailModal
          openModal={!!infoSectionTrail}
          closeModal={() => setInfoSectionTrail(null)}
          sectionTrail_id={infoSectionTrail.id}
        />
      )}

      <CustomTable<ISectionTrail>
        id="sectionTrails"
        cols={cols}
        data={sectionTrailsData?.data || []}
        tableMinWidth="375px"
        tableMaxWidth="900px"
        activeFilters={activeFiltersNumber}
        custom_actions={
          <>
            {permissions.createSectionTrail && (
              <CustomIconButton
                action={() => setCreateSectionTrail(true)}
                title="Cadastrar Trilha"
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
            updateSort={(sort_by, order_by) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { sort_by, order_by },
                  stateKey: stateKeySectionTrails,
                }),
              );
            }}
          />
        }
        filterContainer={
          <ListSectionTrailsFilter
            apiConfig={apiConfig}
            updateApiConfig={(filters) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { filters, page: 1 },
                  stateKey: stateKeySectionTrails,
                }),
              );
            }}
          />
        }
        pagination={{
          currentPage: apiConfig.page,
          totalPages: sectionTrailsData?.pagination.total_pages || 1,
          totalResults: sectionTrailsData?.pagination.total_results || 0,
          changePage: (page) =>
            setApiConfig(
              updateApiConfig({
                apiConfig,
                keepState,
                newConfig: { page },
                stateKey: stateKeySectionTrails,
              }),
            ),
        }}
      />
    </>
  );
}
