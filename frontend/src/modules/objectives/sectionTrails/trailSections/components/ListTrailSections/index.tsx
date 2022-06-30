import { SwapVert } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ITrailSection } from '../../types/ITrailSection';
import { CreateTrailSectionModal } from '../CreateTrailSection';
import { DeleteTrailSectionModal } from '../DeleteTrailSection';
import { InfoTrailSectionModal } from '../InfoTrailSection';
import { SortTrailSection } from '../SortTrailSection';
import { UpdateTrailSectionModal } from '../UpdateTrailSection';
import { SectionCard } from './styles';

type IListTrailSectionsModal = IBaseModal & { sectionTrail: { id: string; name: string } };

type IIdModal = { id: string } | null;
type IIdNameModal = { id: string; name: string } | null;

export function ListTrailSectionsModal({
  closeModal,
  sectionTrail,
  openModal,
}: IListTrailSectionsModal) {
  const [createTrailSection, setCreateTrailSection] = useState(false);
  const [updateTrailSection, setUpdateTrailSection] = useState<IIdModal>(null);
  const [deleteTrailSection, setDeleteTrailSection] = useState<IIdNameModal>(null);
  const [infoTrailSection, setInfoTrailSection] = useState<IIdModal>(null);
  const [sortSections, setSortSections] = useState(false);

  const { toast } = useToast();
  const { checkPermissions } = useAuth();

  const {
    loading: trailSectionsLoading,
    data: trailSectionsData,
    error: trailSectionsError,
    updateData: updateTrailSectionsData,
    send: getTrailSections,
  } = useGet<ITrailSection[]>({
    url: `/trail_sections`,
    config: { params: { section_trail_id: sectionTrail.id } },
  });

  useEffect(() => {
    if (trailSectionsError) {
      toast({ message: trailSectionsError, severity: 'error' });

      closeModal();
    }
  }, [trailSectionsError, toast, closeModal]);

  const permissions = useMemo(() => {
    return {
      createTrailSection: checkPermissions([
        [PermissionsUser.create_section_trail, PermissionsUser.manage_section_trail],
      ]),
      updateTrailSection: checkPermissions([
        [PermissionsUser.update_section_trail, PermissionsUser.manage_section_trail],
      ]),
      deleteTrailSection: checkPermissions([
        [PermissionsUser.delete_section_trail, PermissionsUser.manage_section_trail],
      ]),
    };
  }, [checkPermissions]);

  const addList = useCallback(
    (data: ITrailSection) => {
      updateTrailSectionsData((oldData) => [...oldData, data]);
    },
    [updateTrailSectionsData],
  );

  const deleteList = useCallback(
    (id: string) => {
      updateTrailSectionsData((oldData) => oldData.filter((old) => old.id !== id));
    },
    [updateTrailSectionsData],
  );

  const updateList = useCallback(
    (id: string, data: ITrailSection) => {
      updateTrailSectionsData((oldData) => oldData.map((old) => (id === old.id ? data : old)));
    },
    [updateTrailSectionsData],
  );

  if (trailSectionsLoading) return <Loading loading={trailSectionsLoading} />;

  return (
    <>
      {!!createTrailSection && (
        <CreateTrailSectionModal
          openModal={createTrailSection}
          closeModal={() => setCreateTrailSection(false)}
          addList={addList}
          section_trail_id={sectionTrail.id}
        />
      )}

      {!!updateTrailSection && (
        <UpdateTrailSectionModal
          openModal={!!updateTrailSection}
          closeModal={() => setUpdateTrailSection(null)}
          updateList={updateList}
          trail_section_id={updateTrailSection.id}
        />
      )}

      {!!infoTrailSection && (
        <InfoTrailSectionModal
          openModal={!!infoTrailSection}
          closeModal={() => setInfoTrailSection(null)}
          trail_section_id={infoTrailSection.id}
        />
      )}

      {!!deleteTrailSection && (
        <DeleteTrailSectionModal
          openModal={!!deleteTrailSection}
          closeModal={() => setDeleteTrailSection(null)}
          updateList={deleteList}
          trailSection={deleteTrailSection}
        />
      )}

      {sortSections && (
        <SortTrailSection
          openModal={sortSections}
          closeModal={() => setSortSections(false)}
          section_trail_id={sectionTrail.id}
          reloadList={() =>
            getTrailSections({
              params: { section_trail_id: sectionTrail.id },
            })
          }
        />
      )}

      {trailSectionsData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Seções - ${sectionTrail.name}`}
          maxWidth="sm"
          customActions={
            <>
              {permissions.updateTrailSection && (
                <CustomIconButton
                  iconType="custom"
                  title="Mudar Ordem das seções"
                  action={() => setSortSections(true)}
                  CustomIcon={<SwapVert fontSize="medium" sx={{ color: 'text.primary' }} />}
                />
              )}

              {permissions.createTrailSection && (
                <CustomIconButton
                  action={() => setCreateTrailSection(true)}
                  title="Cadastrar Seção"
                  iconType="add"
                />
              )}
            </>
          }
        >
          {trailSectionsData.map((trailSection) => (
            <SectionCard key={trailSection.id} sx={{ display: { xs: 'block', sm: 'flex' } }}>
              <Box className="info">
                <Typography>{trailSection.name}</Typography>
              </Box>

              <Box className="actions">
                <CustomIconButton
                  iconType="info"
                  iconSize="small"
                  title="Informações"
                  action={() => setInfoTrailSection({ id: trailSection.id })}
                />

                {permissions.updateTrailSection && (
                  <CustomIconButton
                    iconType="edit"
                    iconSize="small"
                    title="Editar Seção"
                    action={() => setUpdateTrailSection({ id: trailSection.id })}
                  />
                )}

                {permissions.deleteTrailSection && (
                  <CustomIconButton
                    iconType="delete"
                    iconSize="small"
                    title="Deletar Seção"
                    action={() =>
                      setDeleteTrailSection({
                        id: trailSection.id,
                        name: `${sectionTrail.name}`,
                      })
                    }
                  />
                )}
              </Box>
            </SectionCard>
          ))}
        </CustomDialog>
      )}
    </>
  );
}
