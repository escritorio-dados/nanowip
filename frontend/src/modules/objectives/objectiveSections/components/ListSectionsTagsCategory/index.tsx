import { Edit, Info } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useMemo, useState } from 'react';

import { CustomCollapse } from '#shared/components/CustomCollapse';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { useAuth } from '#shared/hooks/auth';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { IMilestoneModal, ListMilestones } from '#modules/milestones/components/ListMiliestones';
import { CreateDeliverableTagModal } from '#modules/objectives/deliverableTags/components/CreateDeliverableTag';
import { DeleteDeliverableTagModal } from '#modules/objectives/deliverableTags/components/DeleteDeliverableTag';
import { DeliverableTagCard } from '#modules/objectives/deliverableTags/components/DeliverableTagCard';
import { InfoDeliverableTagModal } from '#modules/objectives/deliverableTags/components/InfoDeliverableTag';
import { UpdateDeliverableTagModal } from '#modules/objectives/deliverableTags/components/UpdateDeliverableTag';
import { IObjectiveCategory } from '#modules/objectives/objectiveCategories/types/IObjectiveCategory';

import { IObjectiveSectionTagApi } from '../../types/IObjectiveSection';
import { DeleteObjectiveSectionModal } from '../DeleteObjectiveSection';
import { InfoObjectiveSectionModal } from '../InfoObjectiveSection';
import { SectionTagCard } from '../SectionTagCard';
import { UpdateObjectiveSectionModal } from '../UpdateObjectiveSection';
import { SectionsContainer } from './styles';

type IListSectionsCategory = {
  category: IObjectiveCategory;
  data: IObjectiveSectionTagApi;
  reloadList: () => void;
};

type IIdNameModal = { id: string; name: string } | null;
type IIdModal = { id: string } | null;

export function ListSectionsTagsCategory({ category, data, reloadList }: IListSectionsCategory) {
  const [deleteSection, setDeleteSection] = useState<IIdNameModal>(null);
  const [updateSection, setUpdateSection] = useState<IIdModal>(null);
  const [infoSection, setInfoSection] = useState<IIdModal>(null);

  const [createDeliverable, setCreateDeliverable] = useState(false);
  const [updateDeliverable, setUpdateDeliverable] = useState<IIdModal>(null);
  const [deleteDeliverable, setDeleteDeliverable] = useState<IIdNameModal>(null);
  const [infoDeliverable, setInfoDeliverable] = useState<IIdModal>(null);
  const [milestonesDeliverable, setMilestonesDeliverable] = useState<IMilestoneModal | null>(null);

  const { checkPermissions } = useAuth();

  const permissions = useMemo(() => {
    return {
      updateObjectiveSection: checkPermissions([
        [PermissionsUser.update_objective_category, PermissionsUser.manage_objective_category],
      ]),
      deleteObjectiveSection: checkPermissions([
        [PermissionsUser.delete_objective_category, PermissionsUser.manage_objective_category],
      ]),
      createDeliverable: checkPermissions([
        [PermissionsUser.create_deliverable, PermissionsUser.manage_deliverable],
      ]),
      updateDeliverable: checkPermissions([
        [PermissionsUser.update_deliverable, PermissionsUser.manage_deliverable],
      ]),
    };
  }, [checkPermissions]);

  return (
    <>
      {!!createDeliverable && (
        <CreateDeliverableTagModal
          openModal={!!createDeliverable}
          closeModal={() => setCreateDeliverable(null)}
          objective_category_id={category.id}
          reloadList={reloadList}
        />
      )}

      {!!updateDeliverable && (
        <UpdateDeliverableTagModal
          openModal={!!updateDeliverable}
          closeModal={() => setUpdateDeliverable(null)}
          deliverable_id={updateDeliverable.id}
          reloadList={reloadList}
        />
      )}

      {!!infoDeliverable && (
        <InfoDeliverableTagModal
          openModal={!!infoDeliverable}
          closeModal={() => setInfoDeliverable(null)}
          deliverable_id={infoDeliverable.id}
        />
      )}

      {!!milestonesDeliverable && (
        <ListMilestones
          openModal={!!milestonesDeliverable}
          closeModal={() => setMilestonesDeliverable(null)}
          data={milestonesDeliverable}
        />
      )}

      {!!deleteDeliverable && (
        <DeleteDeliverableTagModal
          openModal={!!deleteDeliverable}
          closeModal={() => setDeleteDeliverable(null)}
          deliverable={deleteDeliverable}
          reloadList={reloadList}
        />
      )}

      {!!updateSection && (
        <UpdateObjectiveSectionModal
          openModal={!!updateSection}
          closeModal={() => setUpdateSection(null)}
          objective_section_id={updateSection.id}
          reloadList={reloadList}
          type={category.type}
        />
      )}

      {!!infoSection && (
        <InfoObjectiveSectionModal
          openModal={!!infoSection}
          closeModal={() => setInfoSection(null)}
          section_id={infoSection.id}
        />
      )}

      {!!deleteSection && (
        <DeleteObjectiveSectionModal
          openModal={!!deleteSection}
          closeModal={() => setDeleteSection(null)}
          objectiveSection={deleteSection}
          reloadList={reloadList}
        />
      )}

      <CustomCollapse
        title="Não Classificado"
        customActions={
          <>
            {permissions.createDeliverable && (
              <CustomIconButton
                action={() => setCreateDeliverable(true)}
                title="Cadastrar Entregavel"
                iconType="add"
                size="small"
              />
            )}
          </>
        }
        sx={{ marginBottom: '1rem' }}
      >
        <Grid container spacing={2}>
          {data.deliverablesStart.map((deliverable) => (
            <Grid key={deliverable.id} item xs={12} sm={6} md={4} lg={3}>
              <DeliverableTagCard
                deliverable={deliverable}
                updateModal={(id) => setUpdateDeliverable({ id })}
                deleteModal={(id, name) => setDeleteDeliverable({ id, name })}
                infoModal={(id) => setInfoDeliverable({ id })}
                milestonesModal={(milestoneData) => setMilestonesDeliverable(milestoneData)}
              />
            </Grid>
          ))}
        </Grid>
      </CustomCollapse>

      <SectionsContainer>
        {data.sections.map((section) => (
          <SectionTagCard
            key={section.id}
            section={section}
            updateModal={(id) => setUpdateDeliverable({ id })}
            deleteModal={(id, name) => setDeleteDeliverable({ id, name })}
            infoModal={(id) => setInfoDeliverable({ id })}
            milestonesModal={(milestoneData) => setMilestonesDeliverable(milestoneData)}
            actions={
              <>
                <CustomIconButton
                  iconType="custom"
                  title="Info"
                  action={() => setInfoSection({ id: section.id })}
                  CustomIcon={<Info fontSize="small" sx={{ color: 'text.primary' }} />}
                  sx={{ padding: '5px' }}
                />

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

      <CustomCollapse title="Finalizados" sx={{ marginTop: '1rem' }}>
        <Grid container spacing={2}>
          {data.deliverablesEnd.map((deliverable) => (
            <Grid key={deliverable.id} item xs={12} sm={6} md={4} lg={3}>
              <DeliverableTagCard
                deliverable={deliverable}
                updateModal={(id) => setUpdateDeliverable({ id })}
                deleteModal={(id, name) => setDeleteDeliverable({ id, name })}
                infoModal={(id) => setInfoDeliverable({ id })}
                milestonesModal={(milestoneData) => setMilestonesDeliverable(milestoneData)}
              />
            </Grid>
          ))}
        </Grid>
      </CustomCollapse>
    </>
  );
}
