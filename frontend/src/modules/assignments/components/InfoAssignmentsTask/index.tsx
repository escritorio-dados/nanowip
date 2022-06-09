import { ListAlt } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';

import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IAssignment } from '#modules/assignments/types/IAssignment';

import { CreateAssignmentModal } from '../CreateAssignment';
import { DeleteAssignmentModal } from '../DeleteAssignment';
import { InfoAssignmentModal } from '../InfoAssignment';
import { UpdateAssignmentModal } from '../UpdateAssignment';
import { AssignmentCard } from './styles';

type IInfoAssignmentsTaskModal = {
  openModal: boolean;
  closeModal: (reload: boolean) => void;
  task: { id: string; name: string };
};

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

export function InfoAssignmentsTaskModal({
  closeModal,
  task,
  openModal,
}: IInfoAssignmentsTaskModal) {
  const [reloadTasks, setReloadTasks] = useState(false);
  const [createAssignment, setCreateAssignment] = useState(false);
  const [updateAssignment, setUpdateAssignment] = useState<IUpdateModal>(null);
  const [deleteAssignment, setDeleteAssignment] = useState<IDeleteModal>(null);
  const [infoAssignment, setInfoAssignment] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setBackUrl } = useGoBackUrl();
  const { toast } = useToast();
  const { checkPermissions } = useAuth();

  const {
    loading: assignmentsLoading,
    data: assignmentsData,
    error: assignmentsError,
    updateData: updateAssignmentsData,
  } = useGet<IAssignment[]>({
    url: `/assignments/task`,
    config: { params: { task_id: task.id } },
  });

  useEffect(() => {
    if (assignmentsError) {
      toast({ message: assignmentsError, severity: 'error' });

      closeModal(false);
    }
  }, [assignmentsError, toast, closeModal]);

  const permissions = useMemo(() => {
    return {
      createAssignment: checkPermissions([
        [PermissionsUser.create_assignment, PermissionsUser.manage_assignment],
      ]),
      updateAssignment: checkPermissions([
        [PermissionsUser.update_assignment, PermissionsUser.manage_assignment],
      ]),
      deleteAssignment: checkPermissions([
        [PermissionsUser.delete_assignment, PermissionsUser.manage_assignment],
      ]),
    };
  }, [checkPermissions]);

  const assignmentsInfo = useMemo(() => {
    if (!assignmentsData) {
      return [];
    }

    return assignmentsData.map((assignment) => ({
      ...assignment,
      startDate: parseDateApi(assignment.startDate, 'dd/MM/yyyy (HH:mm)', '-'),
      endDate: parseDateApi(assignment.endDate, 'dd/MM/yyyy (HH:mm)', '-'),
    }));
  }, [assignmentsData]);

  const handleAdd = useCallback(
    (newData: IAssignment) => {
      updateAssignmentsData((current) => [...(current || []), newData]);

      setReloadTasks(true);
    },
    [updateAssignmentsData],
  );

  const handleUpdateData = useCallback(
    (id: string, newData: IAssignment) => {
      updateAssignmentsData((current) =>
        (current || []).map((item) => {
          if (item.id === id) {
            return newData;
          }

          return item;
        }),
      );

      setReloadTasks(true);
    },
    [updateAssignmentsData],
  );

  const handleDeleteData = useCallback(
    (id: string) => {
      updateAssignmentsData((current) => {
        return (current || []).filter((item) => item.id !== id);
      });

      setReloadTasks(true);
    },
    [updateAssignmentsData],
  );

  const handleNavigateAssignments = useCallback(
    (collaborator: { id: string; name: string }) => {
      const search = { filters: JSON.stringify({ collaborator, status: 'Aberto' }) };

      setBackUrl('assignments', location);

      navigate({
        pathname: '/assignments',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, navigate, setBackUrl],
  );

  if (assignmentsLoading) return <Loading loading={assignmentsLoading} />;

  return (
    <>
      {!!createAssignment && (
        <CreateAssignmentModal
          openModal={createAssignment}
          closeModal={() => setCreateAssignment(false)}
          addList={handleAdd}
          task_id={task.id}
        />
      )}

      {!!updateAssignment && (
        <UpdateAssignmentModal
          openModal={!!updateAssignment}
          closeModal={() => setUpdateAssignment(null)}
          updateList={handleUpdateData}
          assignment_id={updateAssignment.id}
        />
      )}

      {!!infoAssignment && (
        <InfoAssignmentModal
          openModal={!!infoAssignment}
          closeModal={() => setInfoAssignment(null)}
          assignment_id={infoAssignment.id}
        />
      )}

      {!!deleteAssignment && (
        <DeleteAssignmentModal
          openModal={!!deleteAssignment}
          closeModal={() => setDeleteAssignment(null)}
          updateList={handleDeleteData}
          assignment={deleteAssignment}
        />
      )}

      {assignmentsData && (
        <CustomDialog
          open={openModal}
          closeModal={() => closeModal(reloadTasks)}
          title={`Atribuições - ${task.name}`}
          maxWidth="sm"
          customActions={
            <>
              {permissions.createAssignment && (
                <CustomIconButton
                  action={() => setCreateAssignment(true)}
                  title="Cadastrar Atribuição"
                  iconType="add"
                />
              )}
            </>
          }
        >
          {assignmentsInfo.map((assignment) => (
            <AssignmentCard key={assignment.id} sx={{ display: { xs: 'block', sm: 'flex' } }}>
              <Box className="info">
                <Typography>{assignment.collaborator.name}</Typography>

                <LabelValue fontSize="0.875rem" label="Status:" value={assignment.status} />
              </Box>

              <Box className="actions">
                <CustomIconButton
                  iconType="custom"
                  iconSize="small"
                  title="Visualizar outras atribuições"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => {
                    handleNavigateAssignments(assignment.collaborator);
                  }}
                />

                <CustomIconButton
                  iconType="info"
                  iconSize="small"
                  title="Informações"
                  action={() => setInfoAssignment({ id: assignment.id })}
                />

                {permissions.updateAssignment && (
                  <CustomIconButton
                    iconType="edit"
                    iconSize="small"
                    title="Editar Atribuição"
                    action={() => setUpdateAssignment({ id: assignment.id })}
                  />
                )}

                {permissions.deleteAssignment && (
                  <CustomIconButton
                    iconType="delete"
                    iconSize="small"
                    title="Deletar Atribuição"
                    action={() =>
                      setDeleteAssignment({
                        id: assignment.id,
                        name: `${task.name} - ${assignment.collaborator.name}`,
                      })
                    }
                  />
                )}
              </Box>
            </AssignmentCard>
          ))}
        </CustomDialog>
      )}
    </>
  );
}
