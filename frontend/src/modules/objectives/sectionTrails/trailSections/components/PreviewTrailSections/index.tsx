import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';

import { ITrailSection } from '../../types/ITrailSection';
import { SectionCard } from './styles';

type IListTrailSectionsModal = IBaseModal & { sectionTrail: { id: string; name: string } };

export function PreviewTrailSectionsModal({
  closeModal,
  sectionTrail,
  openModal,
}: IListTrailSectionsModal) {
  const { toast } = useToast();

  const {
    loading: trailSectionsLoading,
    data: trailSectionsData,
    error: trailSectionsError,
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

  if (trailSectionsLoading) return <Loading loading={trailSectionsLoading} />;

  return (
    <>
      {trailSectionsData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Seções - ${sectionTrail.name}`}
          maxWidth="sm"
        >
          {trailSectionsData.map((trailSection) => (
            <SectionCard key={trailSection.id} sx={{ display: { xs: 'block', sm: 'flex' } }}>
              <Box className="info">
                <Typography>{trailSection.name}</Typography>
              </Box>
            </SectionCard>
          ))}
        </CustomDialog>
      )}
    </>
  );
}
