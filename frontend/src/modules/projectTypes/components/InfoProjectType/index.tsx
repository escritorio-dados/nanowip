import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IProjectType } from '#shared/types/backend/IProjectType';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldValueContainer } from './styles';

type IInfoProjectTypeModal = { openModal: boolean; closeModal: () => void; projectType_id: string };

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
          <FieldValueContainer>
            <Typography component="strong">Nome: </Typography>

            <Typography>{projectTypeInfo.name}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Criado em: </Typography>

            <Typography>{projectTypeInfo.created_at}</Typography>
          </FieldValueContainer>

          <FieldValueContainer>
            <Typography component="strong">Atualizado em: </Typography>

            <Typography>{projectTypeInfo.updated_at}</Typography>
          </FieldValueContainer>
        </CustomDialog>
      )}
    </>
  );
}
