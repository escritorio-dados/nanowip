import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IObjectiveCategory } from '#modules/objectives/objectiveCategories/types/IObjectiveCategory';

type IInfoObjectiveCategoryModal = IBaseModal & {
  objective_category_id: string;
};

export function InfoObjectiveCategoryModal({
  closeModal,
  objective_category_id,
  openModal,
}: IInfoObjectiveCategoryModal) {
  const { toast } = useToast();

  const {
    loading: objectiveCategoryLoading,
    data: objectiveCategoryData,
    error: objectiveCategoryError,
  } = useGet<IObjectiveCategory>({ url: `/objective_categories/${objective_category_id}` });

  useEffect(() => {
    if (objectiveCategoryError) {
      toast({ message: objectiveCategoryError, severity: 'error' });

      closeModal();
    }
  }, [objectiveCategoryError, toast, closeModal]);

  const objectiveCategoryInfo = useMemo(() => {
    if (!objectiveCategoryData) {
      return null;
    }

    return {
      ...objectiveCategoryData,
      created_at: parseDateApi(objectiveCategoryData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(objectiveCategoryData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [objectiveCategoryData]);

  if (objectiveCategoryLoading) return <Loading loading={objectiveCategoryLoading} />;

  return (
    <>
      {objectiveCategoryInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Categoria"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={objectiveCategoryInfo.name} />

          <LabelValue label="Tipo:" value={objectiveCategoryInfo.type} />

          {Object.values(objectiveCategoryInfo.path).map((path) => (
            <LabelValue key={path.id} label={`${path.entity}:`} value={path.name} />
          ))}

          <LabelValue label="Criado em:" value={objectiveCategoryInfo.created_at} />

          <LabelValue label="Atualizado em:" value={objectiveCategoryInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}
