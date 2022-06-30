import { useCallback, useEffect, useState } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { SortableContainer } from '#shared/components/SortableContainer';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IBaseModal } from '#shared/types/IModal';

import { INewPosition, IDeliverable, ISortDeliverableInput } from '../../types/IDeliverable';
import { SortItem } from './styles';

type ISortDeliverable = IBaseModal & {
  objective_section_id: string;
  reloadList: (section_id: string) => Promise<void>;
};

type INewPositionName = INewPosition & { name: string };

export function SortDeliverableModal({
  objective_section_id,
  closeModal,
  openModal,
  reloadList,
}: ISortDeliverable) {
  const [newPositions, setNewPositions] = useState<INewPositionName[]>([]);

  const { toast } = useToast();

  const {
    loading: deliverablesLoading,
    data: deliverablesData,
    error: deliverablesError,
  } = useGet<IDeliverable[]>({
    url: `/deliverables`,
    config: {
      params: { objective_section_id },
    },
  });

  const { send: sortDeliverable, loading: sortLoading } = usePut<void, ISortDeliverableInput>(
    `/deliverables/sort`,
  );

  useEffect(() => {
    if (deliverablesError) {
      toast({ message: deliverablesError, severity: 'error' });

      closeModal();
    }
  }, [deliverablesError, closeModal, toast]);

  useEffect(() => {
    setNewPositions(deliverablesData);
  }, [deliverablesData]);

  const onSave = useCallback(async () => {
    const newPositionsApi = newPositions.map((newPosition, index) => ({
      id: newPosition.id,
      position: index + 1,
    }));

    const { error: updateErrors } = await sortDeliverable({
      objective_section_id,
      newPositions: newPositionsApi,
    });

    if (updateErrors) {
      toast({ message: updateErrors, severity: 'error' });

      return;
    }

    reloadList(objective_section_id);

    toast({ message: 'ordem atualizada', severity: 'success' });

    closeModal();
  }, [sortDeliverable, objective_section_id, newPositions, reloadList, toast, closeModal]);

  if (deliverablesLoading) return <Loading loading={deliverablesLoading} />;

  return (
    <>
      <Loading loading={sortLoading} />

      {deliverablesData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Mudar ordem dos entregáveis"
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
