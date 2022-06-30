import { useCallback, useEffect, useState } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { SortableContainer } from '#shared/components/SortableContainer';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IReloadModal } from '#shared/types/IModal';

import { INewPosition, ITrailSection, ISortTrailSectionInput } from '../../types/ITrailSection';
import { SortItem } from './styles';

type ISortTrailSection = IReloadModal & { section_trail_id: string };

type INewPositionName = INewPosition & { name: string };

export function SortTrailSection({
  section_trail_id,
  closeModal,
  openModal,
  reloadList,
}: ISortTrailSection) {
  const [newPositions, setNewPositions] = useState<INewPositionName[]>([]);

  const { toast } = useToast();

  const {
    loading: trailSectionsLoading,
    data: trailSectionsData,
    error: trailSectionsError,
  } = useGet<ITrailSection[]>({
    url: `/trail_sections`,
    config: {
      params: { section_trail_id },
    },
  });

  const { send: sortTrailSection, loading: sortLoading } = usePut<void, ISortTrailSectionInput>(
    `/trail_sections/sort`,
  );

  useEffect(() => {
    if (trailSectionsError) {
      toast({ message: trailSectionsError, severity: 'error' });

      closeModal();
    }
  }, [trailSectionsError, closeModal, toast]);

  useEffect(() => {
    setNewPositions(trailSectionsData);
  }, [trailSectionsData]);

  const onSave = useCallback(async () => {
    const newPositionsApi = newPositions.map((newPosition, index) => ({
      id: newPosition.id,
      position: index + 1,
    }));

    const { error: updateErrors } = await sortTrailSection({
      section_trail_id,
      newPositions: newPositionsApi,
    });

    if (updateErrors) {
      toast({ message: updateErrors, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'ordem atualizada', severity: 'success' });

    closeModal();
  }, [sortTrailSection, section_trail_id, newPositions, reloadList, toast, closeModal]);

  if (trailSectionsLoading) return <Loading loading={trailSectionsLoading} />;

  return (
    <>
      <Loading loading={sortLoading} />

      {trailSectionsData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Mudar ordem das seções"
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
