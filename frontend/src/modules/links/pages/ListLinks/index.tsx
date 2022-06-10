import { RemoveCircle, Web } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IPagingResult } from '#shared/types/IPagingResult';
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
import {
  getSortOptions,
  handleAddItem,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { ChangeStateLinkModal } from '#modules/links/components/ChangeStateLink';
import { CreateLinkModal } from '#modules/links/components/CreateLink';
import { DeleteLinkModal } from '#modules/links/components/DeleteLink';
import { InfoLinkModal } from '#modules/links/components/InfoLink';
import { UpdateLinkModal } from '#modules/links/components/UpdateLink';
import { ILink, ILinkFilters } from '#modules/links/types/ILink';

import { defaultLinkFilter, ListLinksFilter } from './form';

type IDeleteModal = { id: string; name: string } | null;
type IChangeStateModal = { id: string; name: string; active: boolean } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<ILinkFilters> = {
  page: 1,
  sort_by: 'title',
  order_by: 'ASC',
  filters: defaultLinkFilter,
};

const sortTranslator: Record<string, string> = {
  title: 'Titulo',
  category: 'Categoria',
  owner: 'Responsavel',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'links';

export function ListLink() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ILinkFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [changeStateLink, setChangeStateLink] = useState<IChangeStateModal>(null);
  const [deleteLink, setDeleteLink] = useState<IDeleteModal>(null);
  const [updateLink, setUpdateLink] = useState<IUpdateModal>(null);
  const [createLink, setCreateLink] = useState(false);
  const [infoLink, setInfoLink] = useState<IUpdateModal>(null);

  const { toast } = useToast();
  const { updateTitle } = useTitle();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
      state: apiConfig.filters.state?.value,
    };
  }, [apiConfig]);

  const {
    loading: linksLoading,
    data: linksData,
    error: linksError,
    send: getLinks,
    updateData: updateLinksData,
  } = useGet<IPagingResult<ILink>>({
    url: '/links',
    lazy: true,
  });

  useEffect(() => {
    getLinks({ params: apiParams });
  }, [apiParams, getLinks]);

  useEffect(() => {
    if (linksError) {
      toast({ message: linksError, severity: 'error' });
    }
  }, [linksError, toast]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    updateTitle('Links Úteis');
  }, [updateTitle]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const cols = useMemo<ICol<ILink>[]>(() => {
    return [
      { key: 'title', header: 'Titulo', minWidth: '200px' },
      { key: 'category', header: 'Categoria', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '210px',
        minWidth: '210px',
        customColumn: ({ id, title, active, url }) => {
          return (
            <Box display="flex" alignItems="center">
              <CustomIconButton
                iconType="custom"
                title="Acessar Link"
                action={() => window.open(url)}
                CustomIcon={<Web fontSize="small" color="info" />}
              />

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoLink({ id })}
              />

              <CustomIconButton
                iconType="edit"
                iconSize="small"
                title="Editar Link"
                action={() => setUpdateLink({ id })}
              />

              <CustomIconButton
                iconType="delete"
                iconSize="small"
                title="Deletar Link"
                action={() => setDeleteLink({ id, name: title })}
              />

              <CustomIconButton
                iconType="custom"
                title={active ? 'Desativar Link' : 'Ativar Link'}
                action={() => setChangeStateLink({ id, name: title, active })}
                CustomIcon={
                  <RemoveCircle fontSize="small" color={active ? 'warning' : 'success'} />
                }
              />
            </Box>
          );
        },
      },
    ];
  }, []);

  if (linksLoading) return <Loading loading={linksLoading} />;

  return (
    <>
      {createLink && (
        <CreateLinkModal
          openModal={createLink}
          closeModal={() => setCreateLink(false)}
          addList={(newData) =>
            updateLinksData((current) => handleAddItem({ data: newData, current }))
          }
        />
      )}

      {!!deleteLink && (
        <DeleteLinkModal
          openModal={!!deleteLink}
          closeModal={() => setDeleteLink(null)}
          link={deleteLink}
          updateList={(id) => updateLinksData((current) => handleDeleteItem({ id, current }))}
        />
      )}

      {!!changeStateLink && (
        <ChangeStateLinkModal
          openModal={!!changeStateLink}
          closeModal={() => setChangeStateLink(null)}
          link={changeStateLink}
          reloadList={() => getLinks({ params: apiParams })}
        />
      )}

      {!!updateLink && (
        <UpdateLinkModal
          openModal={!!updateLink}
          closeModal={() => setUpdateLink(null)}
          link_id={updateLink.id}
          updateList={(id, newData) =>
            updateLinksData((current) => handleUpdateItem({ id, data: newData, current }))
          }
        />
      )}

      {!!infoLink && (
        <InfoLinkModal
          openModal={!!infoLink}
          closeModal={() => setInfoLink(null)}
          link_id={infoLink.id}
        />
      )}

      {linksData && (
        <CustomTable<ILink>
          id="links"
          cols={cols}
          data={linksData.data}
          tableMinWidth="610px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              <CustomIconButton
                action={() => setCreateLink(true)}
                title="Cadastrar Link"
                iconType="add"
              />
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
            <ListLinksFilter
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
            totalPages: linksData.pagination.total_pages,
            totalResults: linksData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
