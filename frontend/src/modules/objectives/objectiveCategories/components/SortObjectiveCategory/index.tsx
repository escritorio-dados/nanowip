import { useCallback, useEffect, useState } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { SortableContainer } from '#shared/components/SortableContainer';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IReloadModal } from '#shared/types/IModal';

import {
  INewPosition,
  IObjectiveCategory,
  ISortObjectiveCategoryInput,
} from '../../types/IObjectiveCategory';
import { SortItem } from './styles';

type ISortObjectiveCategory = IReloadModal & { operational_objective_id: string };

type INewPositionName = INewPosition & { name: string };

export function SortObjectiveCategory({
  operational_objective_id,
  closeModal,
  openModal,
  reloadList,
}: ISortObjectiveCategory) {
  const [newPositions, setNewPositions] = useState<INewPositionName[]>([]);

  const { toast } = useToast();

  const {
    loading: categoriesLoading,
    data: categoriesData,
    error: categoriesError,
  } = useGet<IObjectiveCategory[]>({
    url: `/objective_categories`,
    config: {
      params: { operational_objective_id },
    },
  });

  const { send: sortObjectiveCategory, loading: sortLoading } = usePut<
    void,
    ISortObjectiveCategoryInput
  >(`/objective_categories/sort`);

  useEffect(() => {
    if (categoriesError) {
      toast({ message: categoriesError, severity: 'error' });

      closeModal();
    }
  }, [categoriesError, closeModal, toast]);

  useEffect(() => {
    setNewPositions(categoriesData);
  }, [categoriesData]);

  const onSave = useCallback(async () => {
    const newPositionsApi = newPositions.map((newPosition, index) => ({
      id: newPosition.id,
      position: index + 1,
    }));

    const { error: updateErrors } = await sortObjectiveCategory({
      operational_objective_id,
      newPositions: newPositionsApi,
    });

    if (updateErrors) {
      toast({ message: updateErrors, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'ordem atualizada', severity: 'success' });

    closeModal();
  }, [
    sortObjectiveCategory,
    operational_objective_id,
    newPositions,
    reloadList,
    toast,
    closeModal,
  ]);

  if (categoriesLoading) return <Loading loading={categoriesLoading} />;

  return (
    <>
      <Loading loading={sortLoading} />

      {categoriesData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Mudar ordem das categorias"
          maxWidth="sm"
        >
          <SortableContainer
            itemType="newPositionCategory"
            items={newPositions}
            updateItems={(newItens) => setNewPositions(newItens)}
            renderItem={(item) => (
              <SortItem>
                <TextEllipsis fontWeight="bold" fontSize="1.1rem">
                  {item.name}
                </TextEllipsis>
              </SortItem>
            )}
          />

          <CustomButton onClick={onSave}>Salvar Alterações</CustomButton>
        </CustomDialog>
      )}
    </>
  );
}
