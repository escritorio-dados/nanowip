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
  IObjectiveSection,
  ISortObjectiveSectionInput,
} from '../../types/IObjectiveSection';
import { SortItem } from './styles';

type ISortObjectiveSection = IReloadModal & { objective_category_id: string };

type INewPositionName = INewPosition & { name: string };

export function SortObjectiveSectionModal({
  objective_category_id,
  closeModal,
  openModal,
  reloadList,
}: ISortObjectiveSection) {
  const [newPositions, setNewPositions] = useState<INewPositionName[]>([]);

  const { toast } = useToast();

  const {
    loading: categoriesLoading,
    data: categoriesData,
    error: categoriesError,
  } = useGet<IObjectiveSection[]>({
    url: `/objective_sections`,
    config: {
      params: { objective_category_id },
    },
  });

  const { send: sortObjectiveSection, loading: sortLoading } = usePut<
    void,
    ISortObjectiveSectionInput
  >(`/objective_sections/sort`);

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

    const { error: updateErrors } = await sortObjectiveSection({
      objective_category_id,
      newPositions: newPositionsApi,
    });

    if (updateErrors) {
      toast({ message: updateErrors, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'ordem atualizada', severity: 'success' });

    closeModal();
  }, [sortObjectiveSection, objective_category_id, newPositions, reloadList, toast, closeModal]);

  if (categoriesLoading) return <Loading loading={categoriesLoading} />;

  return (
    <>
      <Loading loading={sortLoading} />

      {categoriesData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Mudar ordem das seções"
          maxWidth="sm"
        >
          <SortableContainer
            itemType="newPositionSection"
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
