import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';

import { ITaskReportComment } from '#modules/tasks/taskReportComments/types/ITaskReportComment';

type IListCommentsTaskReport = IBaseModal & {
  task: { id: string; name: string };
  reportName: string;
};

export function ListCommentsTaskReport({
  closeModal,
  task,
  openModal,
  reportName,
}: IListCommentsTaskReport) {
  const { toast } = useToast();

  const {
    loading: taskReportCommentsLoading,
    data: taskReportCommentsData,
    error: taskReportCommentsError,
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

  if (taskReportCommentsLoading) return <Loading loading={taskReportCommentsLoading} />;

  return (
    <>
      {taskReportCommentsData && (
        <CustomDialog
          open={openModal}
          closeModal={() => closeModal()}
          title={`Comentarios - ${task.name}`}
          maxWidth="md"
        >
          {taskReportCommentsData.map((taskReportComment) => (
            <Box key={taskReportComment.id} sx={{ padding: '1rem', border: '1px solid #eee' }}>
              <Typography whiteSpace="pre-wrap">{taskReportComment.comment}</Typography>
            </Box>
          ))}
        </CustomDialog>
      )}
    </>
  );
}
