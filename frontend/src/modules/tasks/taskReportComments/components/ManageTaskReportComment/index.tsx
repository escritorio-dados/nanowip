import { Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ITaskReportComment } from '#shared/types/backend/ITaskReportComment';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { CreateTaskReportCommentModal } from '../CreateTaskReportComment';
import { DeleteTaskReportCommentModal } from '../DeleteTaskReportComment';
import { UpdateTaskReportCommentModal } from '../UpdateTaskReportComment';
import { TaskReportCommentCard } from './styles';

type IManageTaskReportCommentsTaskModal = {
  openModal: boolean;
  closeModal: () => void;
  task: { id: string; name: string };
  reportName: string;
};

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; comment: string } | null;

export function ManageTaskReportCommentsModal({
  closeModal,
  task,
  openModal,
  reportName,
}: IManageTaskReportCommentsTaskModal) {
  const [createTaskReportComment, setCreateTaskReportComment] = useState(false);
  const [updateTaskReportComment, setUpdateTaskReportComment] = useState<IUpdateModal>(null);
  const [deleteTaskReportComment, setDeleteTaskReportComment] = useState<IDeleteModal>(null);

  const { toast } = useToast();
  const { checkPermissions } = useAuth();

  const {
    loading: taskReportCommentsLoading,
    data: taskReportCommentsData,
    error: taskReportCommentsError,
    updateData: updateTaskReportCommentsData,
  } = useGet<ITaskReportComment[]>({
    url: `/task_report_comments`,
    config: { params: { task_id: task.id, report_name: reportName } },
  });

  useEffect(() => {
    if (taskReportCommentsError) {
      toast({ message: taskReportCommentsError, severity: 'error' });

      closeModal();
    }
  }, [taskReportCommentsError, toast, closeModal]);

  const permissions = useMemo(() => {
    return {
      createTaskReportComment: checkPermissions([
        [PermissionsUser.create_task_report_comment, PermissionsUser.manage_task_report_comment],
      ]),
      updateTaskReportComment: checkPermissions([
        [PermissionsUser.update_task_report_comment, PermissionsUser.manage_task_report_comment],
      ]),
      deleteTaskReportComment: checkPermissions([
        [PermissionsUser.delete_task_report_comment, PermissionsUser.manage_task_report_comment],
      ]),
    };
  }, [checkPermissions]);

  const handleAdd = useCallback(
    (newData: ITaskReportComment) => {
      updateTaskReportCommentsData((current) => [...(current || []), newData]);
    },
    [updateTaskReportCommentsData],
  );

  const handleUpdateData = useCallback(
    (id: string, newData: ITaskReportComment) => {
      updateTaskReportCommentsData((current) =>
        (current || []).map((item) => {
          if (item.id === id) {
            return newData;
          }

          return item;
        }),
      );
    },
    [updateTaskReportCommentsData],
  );

  const handleDeleteData = useCallback(
    (id: string) => {
      updateTaskReportCommentsData((current) => {
        return (current || []).filter((item) => item.id !== id);
      });
    },
    [updateTaskReportCommentsData],
  );

  if (taskReportCommentsLoading) return <Loading loading={taskReportCommentsLoading} />;

  return (
    <>
      {!!createTaskReportComment && (
        <CreateTaskReportCommentModal
          openModal={createTaskReportComment}
          closeModal={() => setCreateTaskReportComment(false)}
          handleAdd={handleAdd}
          task_id={task.id}
          reportName={reportName}
        />
      )}

      {!!updateTaskReportComment && (
        <UpdateTaskReportCommentModal
          openModal={!!updateTaskReportComment}
          closeModal={() => setUpdateTaskReportComment(null)}
          handleUpdateData={handleUpdateData}
          comment_id={updateTaskReportComment.id}
        />
      )}

      {!!deleteTaskReportComment && (
        <DeleteTaskReportCommentModal
          openModal={!!deleteTaskReportComment}
          closeModal={() => setDeleteTaskReportComment(null)}
          handleDeleteData={handleDeleteData}
          taskReportComment={deleteTaskReportComment}
        />
      )}

      {taskReportCommentsData && (
        <CustomDialog
          open={openModal}
          closeModal={() => closeModal()}
          title={`Comentarios - ${task.name}`}
          maxWidth="md"
          customActions={
            <>
              {permissions.createTaskReportComment && (
                <CustomIconButton
                  action={() => setCreateTaskReportComment(true)}
                  title="Cadastrar Comentario"
                  type="add"
                />
              )}
            </>
          }
        >
          {taskReportCommentsData.map((taskReportComment) => (
            <TaskReportCommentCard
              key={taskReportComment.id}
              sx={{ display: { xs: 'block', sm: 'flex' } }}
            >
              <div className="info">
                <Typography whiteSpace="pre-wrap">{taskReportComment.comment}</Typography>
              </div>

              <div className="actions">
                {permissions.updateTaskReportComment && (
                  <CustomIconButton
                    type="edit"
                    size="small"
                    title="Editar Comentario"
                    action={() => setUpdateTaskReportComment({ id: taskReportComment.id })}
                  />
                )}

                {permissions.deleteTaskReportComment && (
                  <CustomIconButton
                    type="delete"
                    size="small"
                    title="Deletar Comentario"
                    action={() =>
                      setDeleteTaskReportComment({
                        id: taskReportComment.id,
                        comment: taskReportComment.comment,
                      })
                    }
                  />
                )}
              </div>
            </TaskReportCommentCard>
          ))}
        </CustomDialog>
      )}
    </>
  );
}
