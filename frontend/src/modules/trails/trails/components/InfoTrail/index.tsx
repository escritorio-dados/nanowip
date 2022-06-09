import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { ITrail } from '#modules/trails/trails/types/ITrail';

type IInfoTrailModal = IBaseModal & { trail_id: string };

export function InfoTrailModal({ closeModal, trail_id, openModal }: IInfoTrailModal) {
  const { toast } = useToast();

  const {
    loading: trailLoading,
    data: trailData,
    error: trailError,
  } = useGet<ITrail>({ url: `/trails/${trail_id}` });

  useEffect(() => {
    if (trailError) {
      toast({ message: trailError, severity: 'error' });

      closeModal();
    }
  }, [trailError, toast, closeModal]);

  const trailInfo = useMemo(() => {
    if (!trailData) {
      return null;
    }

    return {
      ...trailData,
      created_at: parseDateApi(trailData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(trailData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [trailData]);

  if (trailLoading) return <Loading loading={trailLoading} />;

  return (
    <>
      {trailInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Trilha"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={trailInfo.name} />

          <LabelValue label="Criado em:" value={trailInfo.created_at} />

          <LabelValue label="Atualizado em:" value={trailInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
