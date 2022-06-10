import { ListAlt } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IPagingResult } from '#shared/types/IPagingResult';
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
import { getSortOptions, IPaginationConfig } from '#shared/utils/pagination';
import { parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { InfoCostModal } from '#modules/costs/costs/components/InfoCost';
import { ICost, ICostDistributionFilters } from '#modules/costs/costs/types/ICost';

import { InfoCostDistributionsTaskModal } from '../../components/InfoCostDistributionCost';
import { defaultCostDistributionFilter, ListCostDistributionsFilter } from './form';

type IUpdateModal = { id: string } | null;
type IDistributeModal = { id: string; name: string; description } | null;

type ICostFormatted = {
  id: string;
  reason: string;
  value: string;
  paymentDate: string;
  percentDistributed: string;
  description?: string;
};

const defaultPaginationConfig: IPaginationConfig<ICostDistributionFilters> = {
  page: 1,
  sort_by: 'created_at',
  order_by: 'DESC',
  filters: defaultCostDistributionFilter,
};

const sortTranslator: Record<string, string> = {
  reason: 'Motivo',
  value: 'Valor',
  description: 'Descrição',
  product: 'Produto',
  task_type: 'Tipo de Tarefa',
  percent_distributed: 'Distribuição dos Custos',
  document_number: 'Numero do Documento',
  document_type: 'Tipo de Documento',
  service_provider: 'Provedor de Serviço',
  issue_date: 'Data de Lançamento',
  due_date: 'Data de Vencimento',
  payment_date: 'Data de Pagamento',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'cost_distributions';

export function ListCostDistributions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ICostDistributionFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [infoCost, setInfoCost] = useState<IUpdateModal>(null);
  const [infoCostDistribution, setInfoCostDistribution] = useState<IDistributeModal>(null);

  const { getBackUrl } = useGoBackUrl();
  const { toast } = useToast();
  const { updateTitle } = useTitle();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
      document_number: apiConfig.filters.documentNumber || undefined,
      document_type_id: apiConfig.filters.documentType?.id,
      service_provider_id: apiConfig.filters.serviceProvider?.id,
      product_id: apiConfig.filters.product?.id,
      task_type_id: apiConfig.filters.taskType?.id,
      status: apiConfig.filters.status?.value,
    };
  }, [apiConfig]);

  const {
    loading: costsLoading,
    data: costsData,
    error: costsError,
    send: getCosts,
  } = useGet<IPagingResult<ICost>>({
    url: '/costs/distribution',
    lazy: true,
  });

  useEffect(() => {
    getCosts({ params: apiParams });
  }, [apiParams, getCosts]);

  useEffect(() => {
    if (costsError) {
      toast({ message: costsError, severity: 'error' });
    }
  }, [costsError, toast]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    updateTitle('Distribuição dos Custos');
  }, [updateTitle]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const data = useMemo<ICostFormatted[]>(() => {
    if (!costsData) {
      return [];
    }

    return costsData.data.map<ICostFormatted>((cost) => {
      const percent = `${((cost.percentDistributed || 0) * 100).toFixed(2)}%`;

      return {
        ...cost,
        percentDistributed: percent,
        paymentDate: parseDateApi(cost.paymentDate, 'dd/MM/yyyy', '-'),
        issueDate: parseDateApi(cost.issueDate, 'dd/MM/yyyy', '-'),
        value: new Intl.NumberFormat('pt-Br', { currency: 'BRL', style: 'currency' }).format(
          cost.value,
        ),
      };
    });
  }, [costsData]);

  const cols = useMemo<ICol<ICostFormatted>[]>(() => {
    return [
      {
        key: 'reason',
        header: 'Motivo',
        minWidth: '200px',
        maxWidth: '400px',
        customColumn: ({ reason }) => {
          return (
            <>
              <CustomTooltip title={reason}>{reason}</CustomTooltip>
            </>
          );
        },
      },
      { key: 'value', header: 'Valor', minWidth: '120px', maxWidth: '120px' },
      { key: 'issueDate', header: 'Lançamento', minWidth: '120px', maxWidth: '120px' },
      { key: 'paymentDate', header: 'Pagamento', minWidth: '120px', maxWidth: '120px' },
      { key: 'percentDistributed', header: '%', minWidth: '100px', maxWidth: '100px' },
      {
        header: 'Opções',
        minWidth: '80px',
        maxWidth: '80px',
        customColumn: ({ id, reason, description }) => {
          return (
            <Box sx={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
              <CustomIconButton
                iconType="custom"
                iconSize="small"
                title="Distribuir Custo"
                CustomIcon={<ListAlt fontSize="small" color="success" />}
                action={() => {
                  setInfoCostDistribution({ id, name: reason, description });
                }}
              />

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoCost({ id })}
              />
            </Box>
          );
        },
      },
    ];
  }, []);

  if (costsLoading) return <Loading loading={costsLoading} />;

  return (
    <>
      {!!infoCost && (
        <InfoCostModal
          openModal={!!infoCost}
          closeModal={() => setInfoCost(null)}
          cost_id={infoCost.id}
        />
      )}

      {!!infoCostDistribution && (
        <InfoCostDistributionsTaskModal
          openModal={!!infoCostDistribution}
          closeModal={(reload) => {
            setInfoCostDistribution(null);

            if (reload) {
              getCosts({ params: apiParams });
            }
          }}
          cost={infoCostDistribution}
        />
      )}

      {costsData && (
        <CustomTable<ICostFormatted>
          id="costs"
          goBackUrl={getBackUrl('costs')}
          cols={cols}
          data={data}
          activeFilters={activeFiltersNumber}
          tableMinWidth="850px"
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
            <ListCostDistributionsFilter
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
            totalPages: costsData.pagination.total_pages,
            totalResults: costsData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
