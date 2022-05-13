import { useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useEffect, useMemo } from 'react';
import ReactFlow, { Controls, Edge, MarkerType, MiniMap, Node } from 'react-flow-renderer';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IGraphTaskTrails } from '#shared/types/backend/ITaskTrail';

import { TaskTrailPreviewCard, ITaskTrailCardPreviewInfo } from '../TaskTrailCardPreview';
import { GraphContainer } from './styles';

const nodeTypes = { task: TaskTrailPreviewCard };

type IPreviewTrail = {
  openModal: boolean;
  closeModal(): void;
  trail: { id: string; name: string };
};

export function PreviewTrail({ trail, openModal, closeModal }: IPreviewTrail) {
  const { toast } = useToast();
  const { palette } = useTheme();

  const {
    loading: tasksLoading,
    data: tasksData,
    error: tasksError,
    send: getTasks,
  } = useGet<IGraphTaskTrails>({ url: `/task_trails`, lazy: true });

  useEffect(() => {
    getTasks({
      params: { trail_id: trail.id, node_width: 330, node_height: 130 },
    });
  }, [getTasks, trail.id]);

  useEffect(() => {
    if (tasksError) {
      toast({ message: tasksError, severity: 'error' });
    }
  }, [tasksError, toast]);

  const nodes = useMemo(() => {
    if (!tasksData) {
      return [];
    }

    return tasksData.nodes.map<Node<ITaskTrailCardPreviewInfo>>((node) => ({
      ...node,
      type: 'task',
      dragHandle: '.custom-drag-handle',
      data: {
        ...node.data,
        width: node.width,
        height: node.height,
      },
      position: { x: node.x, y: node.y },
    }));
  }, [tasksData]);

  const edges = useMemo(() => {
    if (!tasksData) {
      return [];
    }

    return tasksData.edges.map<Edge>((edge) => ({
      ...edge,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }));
  }, [tasksData]);

  return (
    <>
      <Loading loading={tasksLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title={`Pré-visualização da trilha - ${trail.name}`}
        maxWidth="lg"
      >
        {tasksData && (
          <GraphContainer>
            <ReactFlow
              defaultNodes={nodes}
              defaultEdges={edges}
              nodeTypes={nodeTypes}
              nodesDraggable
              nodesConnectable={false}
              defaultZoom={0.8}
            >
              <MiniMap
                nodeColor={() => palette.backgoundAlt}
                maskColor="#ffffff50"
                style={{
                  background: grey[700],
                  height: 200,
                  top: 20,
                  width: 300,
                }}
              />

              <Controls showInteractive={false} />
            </ReactFlow>
          </GraphContainer>
        )}
      </CustomDialog>
    </>
  );
}
