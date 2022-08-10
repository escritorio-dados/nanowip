import { Edit, SwapVert } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePatch } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { IMap, mapFromArray } from '#shared/utils/mapFromArray';

import { CreateDeliverableModal } from '#modules/objectives/deliverables/components/CreateDeliverable';
import { DeleteDeliverableModal } from '#modules/objectives/deliverables/components/DeleteDeliverable';
import { InfoDeliverableModal } from '#modules/objectives/deliverables/components/InfoDeliverable';
import { SortDeliverableModal } from '#modules/objectives/deliverables/components/SortDeliverable';
import { UpdateDeliverableModal } from '#modules/objectives/deliverables/components/UpdateDeliverable';
import {
  IChangeSectionDeliverableInput,
  IDeliverable,
} from '#modules/objectives/deliverables/types/IDeliverable';
import {
  IObjectiveCategory,
  ObjectiveCategoryTypes,
} from '#modules/objectives/objectiveCategories/types/IObjectiveCategory';

import { IObjectiveSection } from '../../types/IObjectiveSection';
import { DeleteObjectiveSectionModal } from '../DeleteObjectiveSection';
import { SectionCard } from '../SectionCard';
import { UpdateObjectiveSectionModal } from '../UpdateObjectiveSection';
import { SectionsContainer } from './styles';

type IListSectionsCategory = {
  category: IObjectiveCategory;
  sections: IObjectiveSection[];
  updateList: (id: string, data: IObjectiveSection) => void;
  deleteList: (id: string) => void;
};

type IIdNameModal = { id: string; name: string } | null;
type IIdModal = { id: string } | null;

type ISectionModal = { section_id: string } | null;
type IIdNameSectionModal = { id: string; name: string; section_id: string } | null;
type IIdSectionModal = { id: string; section_id: string } | null;

export function ListSectionsCategory({
  category,
  sections,
  updateList,
  deleteList,
}: IListSectionsCategory) {
  const [sectionsInfo, setSectionsInfo] = useState<IMap<IObjectiveSection>>(() => ({}));
  const [sortDeliverables, setSortDeliverables] = useState<IIdModal>(null);
  const [deleteSection, setDeleteSection] = useState<IIdNameModal>(null);
  const [updateSection, setUpdateSection] = useState<IIdModal>(null);
  const [createDeliverable, setCreateDeliverable] = useState<ISectionModal>(null);
  const [updateDeliverable, setUpdateDeliverable] = useState<IIdSectionModal>(null);
  const [infoDeliverable, setInfoDeliverable] = useState<IIdModal>(null);
  const [deleteDeliverable, setDeleteDeliverable] = useState<IIdNameSectionModal>(null);

  const { toast } = useToast();
  const { checkPermissions } = useAuth();

  const { send: changeSectionDeliverable, loading: changeSectionDeliverableLoading } = usePatch<
    IDeliverable,
    IChangeSectionDeliverableInput
  >('');

  const { loading: deliverablesLoading, sendGet: getDeliverables } = useGet<IDeliverable[]>({
    url: `/deliverables`,
    lazy: true,
  });

  useEffect(() => {
    setSectionsInfo(mapFromArray(sections, (section) => section.id));
  }, [sections]);

  const permissions = useMemo(() => {
    return {
      updateObjectiveSection: checkPermissions([
        [PermissionsUser.update_objective_category, PermissionsUser.manage_objective_category],
      ]),
      deleteObjectiveSection: checkPermissions([
        [PermissionsUser.delete_objective_category, PermissionsUser.manage_objective_category],
      ]),
      updateDeliverable: checkPermissions([
        [PermissionsUser.update_deliverable, PermissionsUser.manage_deliverable],
      ]),
    };
  }, [checkPermissions]);

  const handleDrop = useCallback(
    async (deliverable: IDeliverable, section: IObjectiveSection) => {
      if (section.id === deliverable.objective_section_id) {
        return;
      }

      const { error, data: deliverableUpdated } = await changeSectionDeliverable(
        { new_section_id: section.id },
        { url: `/deliverables/${deliverable.id}/change_section` },
      );

      if (error) {
        toast({ message: error, severity: 'error' });

        return;
      }

      setSectionsInfo((old) => {
        const newSection = old[section.id];

        newSection.deliverables = [
          ...newSection.deliverables,
          { ...deliverable, ...deliverableUpdated },
        ];

        const oldSection = old[deliverable.objective_section_id];

        oldSection.deliverables = oldSection.deliverables.filter(
          (deli) => deli.id !== deliverableUpdated.id,
        );

        return {
          ...old,
          [section.id]: { ...newSection },
          [deliverable.objective_section_id]: { ...oldSection },
        };
      });
    },
    [changeSectionDeliverable, toast],
  );

  const addDeliverable = useCallback((deliverable: IDeliverable, section_id: string) => {
    setSectionsInfo((old) => {
      const section = old[section_id];

      const deliverables = [...section.deliverables, deliverable];

      return {
        ...old,
        [section_id]: {
          ...section,
          deliverables,
        },
      };
    });
  }, []);

  const updateListDeliverable = useCallback(
    (id: string, deliverable: IDeliverable, section_id: string) => {
      setSectionsInfo((old) => {
        const section = old[section_id];

        const deliverables = section.deliverables.map((deli) => {
          if (deli.id === id) {
            return {
              ...deli,
              ...deliverable,
            };
          }

          return deli;
        });

        return {
          ...old,
          [section_id]: {
            ...section,
            deliverables,
          },
        };
      });
    },
    [],
  );

  const deleteListDeliverable = useCallback((id: string, section_id: string) => {
    setSectionsInfo((old) => {
      const section = old[section_id];

      const deliverables = section.deliverables.filter((deli) => deli.id !== id);

      return {
        ...old,
        [section_id]: {
          ...section,
          deliverables,
        },
      };
    });
  }, []);

  const reloadDeliverables = useCallback(
    async (section_id: string) => {
      const { data, error } = await getDeliverables({
        params: { objective_section_id: section_id },
      });

      if (error) {
        toast({ message: error, severity: 'error' });

        return;
      }

      setSectionsInfo((old) => {
        const section = old[section_id];

        return {
          ...old,
          [section_id]: {
            ...section,
            deliverables: [...data],
          },
        };
      });
    },
    [getDeliverables, toast],
  );

  return (
    <>
      <Loading loading={changeSectionDeliverableLoading} />

      <Loading loading={deliverablesLoading} />

      {!!sortDeliverables && (
        <SortDeliverableModal
          openModal={!!sortDeliverables}
          closeModal={() => setSortDeliverables(null)}
          objective_section_id={sortDeliverables.id}
          reloadList={(section_id) => reloadDeliverables(section_id)}
        />
      )}

      {!!createDeliverable && (
        <CreateDeliverableModal
          openModal={!!createDeliverable}
          closeModal={() => setCreateDeliverable(null)}
          objective_section_id={createDeliverable.section_id}
          addList={addDeliverable}
        />
      )}

      {!!updateDeliverable && (
        <UpdateDeliverableModal
          openModal={!!updateDeliverable}
          closeModal={() => setUpdateDeliverable(null)}
          deliverable_id={updateDeliverable.id}
          section_id={updateDeliverable.section_id}
          updateList={(id, data, section_id) => updateListDeliverable(id, data, section_id)}
        />
      )}

      {!!deleteDeliverable && (
        <DeleteDeliverableModal
          openModal={!!deleteDeliverable}
          closeModal={() => setDeleteDeliverable(null)}
          deliverable={deleteDeliverable}
          updateList={(id, section_id) => deleteListDeliverable(id, section_id)}
        />
      )}

      {!!updateSection && (
        <UpdateObjectiveSectionModal
          openModal={!!updateSection}
          closeModal={() => setUpdateSection(null)}
          objective_section_id={updateSection.id}
          updateList={updateList}
          type={category.type}
        />
      )}

      {!!deleteSection && (
        <DeleteObjectiveSectionModal
          openModal={!!deleteSection}
          closeModal={() => setDeleteSection(null)}
          objectiveSection={deleteSection}
          updateList={deleteList}
        />
      )}

      {!!infoDeliverable && (
        <InfoDeliverableModal
          openModal={!!infoDeliverable}
          closeModal={() => setInfoDeliverable(null)}
          deliverable_id={infoDeliverable.id}
        />
      )}

      <SectionsContainer>
        {sectionsInfo &&
          Object.values(sectionsInfo).map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              category_id={category.id}
              onDrop={(item) => handleDrop(item, section)}
              createModal={(section_id) => setCreateDeliverable({ section_id })}
              updateModal={(id, section_id) => setUpdateDeliverable({ id, section_id })}
              deleteModal={(id, name, section_id) => setDeleteDeliverable({ id, name, section_id })}
              infoModal={(id) => setInfoDeliverable({ id })}
              actions={
                <>
                  {permissions.updateDeliverable &&
                    category.type !== ObjectiveCategoryTypes.tags && (
                      <CustomIconButton
                        iconType="custom"
                        title="Mudar Ordem dos entregáveis"
                        action={() => setSortDeliverables({ id: section.id })}
                        CustomIcon={<SwapVert fontSize="small" sx={{ color: 'text.primary' }} />}
                      />
                    )}

                  {permissions.updateObjectiveSection && (
                    <CustomIconButton
                      iconType="custom"
                      title="Editar Seção"
                      action={() => setUpdateSection({ id: section.id })}
                      CustomIcon={<Edit fontSize="small" sx={{ color: 'text.primary' }} />}
                    />
                  )}

                  {permissions.deleteObjectiveSection && (
                    <CustomIconButton
                      iconType="delete"
                      iconSize="small"
                      title="Deletar Seção"
                      action={() => setDeleteSection({ id: section.id, name: section.name })}
                    />
                  )}
                </>
              }
            />
          ))}
      </SectionsContainer>
    </>
  );
}
