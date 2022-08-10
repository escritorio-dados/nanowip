import { Cached, LibraryAdd, SwapVert } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { CreateObjectiveSectionModal } from '#modules/objectives/objectiveSections/components/CreateObjectiveSection';
import { ListSectionsCategory } from '#modules/objectives/objectiveSections/components/ListSectionsCategory';
import { ListSectionsTagsCategory } from '#modules/objectives/objectiveSections/components/ListSectionsTagsCategory';
import { SortObjectiveSectionModal } from '#modules/objectives/objectiveSections/components/SortObjectiveSection';
import {
  IObjectiveSection,
  IObjectiveSectionTagApi,
} from '#modules/objectives/objectiveSections/types/IObjectiveSection';
import { InstantiateSectionTrailModal } from '#modules/objectives/sectionTrails/sectionTrails/components/InstantiateSectionTrail';

import { IObjectiveCategory, ObjectiveCategoryTypes } from '../../types/IObjectiveCategory';
import { ActionsSection, CategoryContainer, CollapseBody, CollapseHeader } from './styles';

type IObjectiveCategoryCard = {
  customActions?: JSX.Element;
  category: IObjectiveCategory;
};

export function ObjectiveCategoryCard({ customActions, category }: IObjectiveCategoryCard) {
  const [show, setShow] = useState(false);
  const [createSection, setCreateSection] = useState(false);
  const [sortSections, setSortSections] = useState(false);
  const [instantiateTrailSection, setInstantiateTrailSection] = useState(false);

  const { toast } = useToast();
  const { checkPermissions } = useAuth();

  const {
    loading: sectionsLoading,
    data: sectionsData,
    error: sectionsError,
    send: getSections,
    updateData: updateSections,
  } = useGet<IObjectiveSection[]>({ url: `/objective_sections`, lazy: true });

  const {
    loading: sectionTagsLoading,
    data: sectionTagsData,
    error: sectionTagsError,
    send: getSectionTags,
  } = useGet<IObjectiveSectionTagApi>({ url: `/objective_sections/tags`, lazy: true });

  useEffect(() => {
    if (show) {
      if (category.type === ObjectiveCategoryTypes.tags) {
        getSectionTags({ params: { objective_category_id: category.id } });
      } else {
        getSections({ params: { objective_category_id: category.id } });
      }
    }
  }, [category.id, category.type, getSectionTags, getSections, show]);

  useEffect(() => {
    if (sectionsError) {
      toast({ message: sectionsError, severity: 'error' });

      return;
    }

    if (sectionTagsError) {
      toast({ message: sectionTagsError, severity: 'error' });
    }
  }, [sectionsError, toast, sectionTagsError]);

  const permissions = useMemo(() => {
    return {
      createObjectiveSection: checkPermissions([
        [PermissionsUser.create_objective_category, PermissionsUser.manage_objective_category],
      ]),
      updateObjectiveSection: checkPermissions([
        [PermissionsUser.update_objective_category, PermissionsUser.manage_objective_category],
      ]),
    };
  }, [checkPermissions]);

  const addList = useCallback(
    (data: IObjectiveSection) => {
      updateSections((oldData) => [...oldData, data]);
    },
    [updateSections],
  );

  const deleteList = useCallback(
    (id: string) => {
      updateSections((oldData) => oldData.filter((old) => old.id !== id));
    },
    [updateSections],
  );

  const updateList = useCallback(
    (id: string, data: IObjectiveSection) => {
      updateSections((oldData) =>
        oldData.map((old) => (id === old.id ? { ...old, ...data } : old)),
      );
    },
    [updateSections],
  );

  const reloadList = useCallback(() => {
    if (category.type === ObjectiveCategoryTypes.tags) {
      getSectionTags({ params: { objective_category_id: category.id } });
    } else {
      getSections({ params: { objective_category_id: category.id } });
    }
  }, [category.id, category.type, getSectionTags, getSections]);

  return (
    <>
      <Loading loading={sectionsLoading} />

      <Loading loading={sectionTagsLoading} />

      {createSection && (
        <CreateObjectiveSectionModal
          openModal={createSection}
          closeModal={() => setCreateSection(false)}
          objective_category_id={category.id}
          reloadList={reloadList}
          addList={addList}
          type={category.type}
        />
      )}

      {instantiateTrailSection && (
        <InstantiateSectionTrailModal
          openModal={instantiateTrailSection}
          closeModal={() => setInstantiateTrailSection(false)}
          objective_category_id={category.id}
          reloadList={reloadList}
        />
      )}

      {sortSections && (
        <SortObjectiveSectionModal
          openModal={sortSections}
          closeModal={() => setSortSections(false)}
          objective_category_id={category.id}
          reloadList={reloadList}
        />
      )}

      <CategoryContainer>
        <CollapseHeader>
          <Box className="title" onClick={() => setShow(!show)}>
            <Typography component="h2">{category.name}</Typography>
          </Box>

          <Box display="flex" alignItems="center">
            {show && (
              <ActionsSection>
                {permissions.updateObjectiveSection && (
                  <CustomIconButton
                    iconType="custom"
                    title="Atualizar Dados"
                    action={reloadList}
                    CustomIcon={<Cached fontSize="small" color="primary" />}
                  />
                )}

                {permissions.updateObjectiveSection && (
                  <CustomIconButton
                    iconType="custom"
                    title="Mudar Ordem das Seções"
                    action={() => setSortSections(true)}
                    CustomIcon={<SwapVert fontSize="small" sx={{ color: 'text.primary' }} />}
                  />
                )}

                {permissions.createObjectiveSection && (
                  <CustomIconButton
                    action={() => setCreateSection(true)}
                    title="Cadastrar Seção"
                    iconType="add"
                    size="small"
                  />
                )}

                {permissions.createObjectiveSection && (
                  <CustomIconButton
                    action={() => setInstantiateTrailSection(true)}
                    title="Instanciar Trilha"
                    iconType="custom"
                    CustomIcon={
                      <LibraryAdd
                        sx={(theme) => ({
                          color: theme.palette.success.light,
                        })}
                      />
                    }
                  />
                )}
              </ActionsSection>
            )}

            {customActions}
          </Box>
        </CollapseHeader>

        <CollapseBody in={show} timeout="auto">
          <Box>
            {show && category.type === ObjectiveCategoryTypes.manual && sectionsData && (
              <ListSectionsCategory
                category={category}
                sections={sectionsData || []}
                updateList={updateList}
                deleteList={deleteList}
              />
            )}

            {show && category.type === ObjectiveCategoryTypes.tags && sectionTagsData && (
              <ListSectionsTagsCategory
                category={category}
                data={sectionTagsData}
                reloadList={reloadList}
              />
            )}
          </Box>
        </CollapseBody>
      </CategoryContainer>
    </>
  );
}
