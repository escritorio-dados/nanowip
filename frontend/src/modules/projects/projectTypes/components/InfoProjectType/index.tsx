import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IProjectType } from '../../types/IProjectType';

type IInfoProjectTypeModal = IBaseModal & { projectType_id: string };

export function InfoProjectTypeModal({
  closeModal,
  projectType_id,
  openModal,
}: IInfoProjectTypeModal) {
  const { toast } = useToast();

  const {
    loading: projectTypeLoading,
    data: projectTypeData,
    error: projectTypeError,
  } = useGet<IProjectType>({ url: `/project_types/${projectType_id}` });

  useEffect(() => {
    if (projectTypeError) {
      toast({ message: projectTypeError, severity: 'error' });

      closeModal();
    }
  }, [projectTypeError, toast, closeModal]);

  const projectTypeInfo = useMemo(() => {
    if (!projectTypeData) {
      return null;
    }

    return {
      ...projectTypeData,
      created_at: parseDateApi(projectTypeData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(projectTypeData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [projectTypeData]);

  if (projectTypeLoading) return <Loading loading={projectTypeLoading} />;

  return (
    <>
      {projectTypeInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Tipo de Projeto"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={projectTypeInfo.name} />

          <LabelValue label="Criado em:" value={projectTypeInfo.created_at} />

          <LabelValue label="Atualizado em:" value={projectTypeInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
