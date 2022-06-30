import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { ISectionTrail } from '../../types/ISectionTrail';

type IInfoSectionTrailModal = IBaseModal & { sectionTrail_id: string };

export function InfoSectionTrailModal({
  closeModal,
  sectionTrail_id,
  openModal,
}: IInfoSectionTrailModal) {
  const { toast } = useToast();

  const {
    loading: sectionTrailLoading,
    data: sectionTrailData,
    error: sectionTrailError,
  } = useGet<ISectionTrail>({ url: `/section_trails/${sectionTrail_id}` });

  useEffect(() => {
    if (sectionTrailError) {
      toast({ message: sectionTrailError, severity: 'error' });

      closeModal();
    }
  }, [sectionTrailError, toast, closeModal]);

  const sectionTrailInfo = useMemo(() => {
    if (!sectionTrailData) {
      return null;
    }

    return {
      ...sectionTrailData,
      created_at: parseDateApi(sectionTrailData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(sectionTrailData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [sectionTrailData]);

  if (sectionTrailLoading) return <Loading loading={sectionTrailLoading} />;

  return (
    <>
      {sectionTrailInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Trilha"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={sectionTrailInfo.name} />

          <LabelValue label="Criado em:" value={sectionTrailInfo.created_at} />

          <LabelValue label="Atualizado em:" value={sectionTrailInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
