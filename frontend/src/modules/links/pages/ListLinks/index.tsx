import { yupResolver } from '@hookform/resolvers/yup';
import { RemoveCircle, Web } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ILink, ILinkFilters, linkStatesOptions } from '#shared/types/backend/ILink';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  getSortOptions,
  handleAddItem,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { ChangeStateLinkModal } from '#modules/links/components/ChangeStateLink';
import { CreateLinkModal } from '#modules/links/components/CreateLink';
import { DeleteLinkModal } from '#modules/links/components/DeleteLink';
import { InfoLinkModal } from '#modules/links/components/InfoLink';
import { UpdateLinkModal } from '#modules/links/components/UpdateLink';
import { filterLinkSchema, IFilterLinkSchema } from '#modules/links/schema/filterLink.schema';

type IDeleteModal = { id: string; name: string } | null;
type IChangeStateModal = { id: string; name: string; active: boolean } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<ILinkFilters> = {
  page: 1,
  sort_by: 'title',
  order_by: 'ASC',
  filters: {
    title: '',
    category: '',
    description: '',
    owner: '',
    state: { label: 'Ativos', value: 'active' },
    min_updated: null,
    max_updated: null,
  },
};

const sortTranslator: Record<string, string> = {
  title: 'Titulo',
  category: 'Categoria',
  owner: 'Responsavel',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListLink() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ILinkFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<ILinkFilters>({
      category: 'filters',
      key: 'links',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'links',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'links',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'links',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
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

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterLinkSchema>({
    resolver: yupResolver(filterLinkSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
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
    updateTitle('Links Úteis');
  }, [updateTitle]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleApplyFilters = useCallback(
    (formData: IFilterLinkSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'links',
        value: formData,
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

    resetForm(defaultPaginationConfig.filters);

    updateState({
      category: 'filters',
      key: 'links',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const cols = useMemo<ICol<ILink>[]>(() => {
    return [
      { key: 'title', header: 'Titulo', minWidth: '200px' },
      { key: 'category', header: 'Categoria', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '250px',
        customColumn: ({ id, title, active, url }) => {
          return (
            <div style={{ display: 'flex' }}>
              <CustomIconButton
                type="custom"
                title="Acessar Link"
                action={() => window.open(url)}
                CustomIcon={<Web fontSize="small" color="info" />}
              />

              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoLink({ id })}
              />

              <CustomIconButton
                type="edit"
                size="small"
                title="Editar Link"
                action={() => setUpdateLink({ id })}
              />

              <CustomIconButton
                type="delete"
                size="small"
                title="Deletar Link"
                action={() => setDeleteLink({ id, name: title })}
              />

              <CustomIconButton
                type="custom"
                title={active ? 'Desativar Link' : 'Ativar Link'}
                action={() => setChangeStateLink({ id, name: title, active })}
                CustomIcon={
                  <RemoveCircle fontSize="small" color={active ? 'warning' : 'success'} />
                }
              />
            </div>
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
          handleAdd={(newData) => updateLinksData((current) => handleAddItem({ newData, current }))}
        />
      )}

      {!!deleteLink && (
        <DeleteLinkModal
          openModal={!!deleteLink}
          closeModal={() => setDeleteLink(null)}
          link={deleteLink}
          handleDeleteData={(id) => updateLinksData((current) => handleDeleteItem({ id, current }))}
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
          handleUpdateData={(id, newData) =>
            updateLinksData((current) => handleUpdateItem({ id, newData, current }))
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
          tableMinWidth="500px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              <CustomIconButton
                action={() => setCreateLink(true)}
                title="Cadastrar Link"
                type="add"
              />
            </>
          }
          sortContainer={
            <Box
              sx={{
                width: '300px',
                padding: '0.6rem',
                border: `2px solid`,
                borderColor: 'divider',
              }}
            >
              <CustomSelect
                label="Classificar por"
                onChange={(newValue) => {
                  setApiConfig((oldConfig) => ({ ...oldConfig, sort_by: newValue.value }));

                  updateState({
                    category: 'sort_by',
                    key: 'links',
                    value: newValue.value,
                    localStorage: true,
                  });
                }}
                options={sortOptions}
                optionLabel="label"
                value={{ value: apiConfig.sort_by, label: sortTranslator[apiConfig.sort_by] }}
              />

              <CustomSelect
                label="Ordem"
                onChange={(newValue) => {
                  setApiConfig((oldConfig) => ({ ...oldConfig, order_by: newValue.value }));

                  updateState({
                    category: 'order_by',
                    key: 'links',
                    value: newValue.value,
                    localStorage: true,
                  });
                }}
                options={orderOptions}
                optionLabel="label"
                value={{ value: apiConfig.order_by, label: orderTranslator[apiConfig.order_by] }}
              />
            </Box>
          }
          filterContainer={
            <>
              <form onSubmit={handleSubmit(handleApplyFilters)} noValidate>
                <Grid container spacing={2}>
                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="title"
                      label="Titulo"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.title}
                      errors={errors.title}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="category"
                      label="Categoria"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.category}
                      errors={errors.category}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="owner"
                      label="Responsavel"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.owner}
                      errors={errors.owner}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="description"
                      label="Descrição"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.description}
                      errors={errors.description}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormSelect
                      control={control}
                      name="state"
                      label="Status"
                      margin_type="no-margin"
                      options={linkStatesOptions}
                      optionLabel="label"
                      optionValue="value"
                      defaultValue={apiConfig.filters.state}
                      errors={errors.state as any}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_updated"
                      label="Data de Atualização (Minima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_updated}
                      errors={errors.min_updated}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_updated"
                      label="Data de Atualização (Maxima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_updated}
                      errors={errors.max_updated}
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
