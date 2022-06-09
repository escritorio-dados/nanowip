import { Map } from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useEffect, useMemo } from 'react';
import ReactFlow, {
  ControlButton,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
} from 'react-flow-renderer';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';

import { IGraphTaskTrails } from '#modules/trails/taskTrails/types/ITaskTrail';

import { TaskTrailPreviewCard, ITaskTrailCardPreviewInfo } from '../TaskTrailCardPreview';
import { GraphContainer } from './styles';

const nodeTypes = { task: TaskTrailPreviewCard };

type IPreviewTrail = IBaseModal & { trail: { id: string; name: string } };

export function PreviewTrail({ trail, openModal, closeModal }: IPreviewTrail) {
  const { toast } = useToast();
  const { palette } = useTheme();
  const { updateState, getState } = useKeepStates();

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
              defaultPosition={[50, 20]}
            >
              {!!getState({ category: 'map', key: 'map', defaultValue: true }) && (
                <MiniMap
                  nodeColor={() => palette.backgoundAlt}
                  maskColor="#ffffff50"
                  nodeStrokeColor={(node) => node.data.lateColor}
                  nodeStrokeWidth={10}
                  style={{
                    background: grey[900],
                    height: 150,
                    width: 250,
                  }}
                />
              )}

              <Controls showInteractive={false}>
                <ControlButton
                  onClick={() =>
                    updateState({
                      category: 'map',
                      key: 'map',
                      value: !getState({ category: 'map', key: 'map', defaultValue: false }),
                      localStorage: true,
                    })
                  }
                >
                  <Map />
                </ControlButton>
              </Controls>
            </ReactFlow>
          </GraphContainer>
        )}
      </CustomDialog>
    </>
  );
}
