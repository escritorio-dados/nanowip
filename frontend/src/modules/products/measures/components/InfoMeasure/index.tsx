import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IMeasure } from '#modules/products/measures/types/IMeasure';

type IInfoMeasureModal = IBaseModal & { measure_id: string };

export function InfoMeasureModal({ closeModal, measure_id, openModal }: IInfoMeasureModal) {
  const { toast } = useToast();

  const {
    loading: measureLoading,
    data: measureData,
    error: measureError,
  } = useGet<IMeasure>({ url: `/measures/${measure_id}` });

  useEffect(() => {
    if (measureError) {
      toast({ message: measureError, severity: 'error' });

      closeModal();
    }
  }, [measureError, toast, closeModal]);

  const measureInfo = useMemo(() => {
    if (!measureData) {
      return null;
    }

    return {
      ...measureData,
      created_at: parseDateApi(measureData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(measureData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [measureData]);

  if (measureLoading) return <Loading loading={measureLoading} />;

  return (
    <>
      {measureInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Unidade de Medida"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={measureInfo.name} />

          <LabelValue label="Criado em:" value={measureInfo.created_at} />

          <LabelValue label="Atualizado em:" value={measureInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
