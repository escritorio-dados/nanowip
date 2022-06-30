import { yupResolver } from '@hookform/resolvers/yup';
import { Preview } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePost } from '#shared/services/useAxios';
import { IReloadModal } from '#shared/types/IModal';

import { PreviewTrailSectionsModal } from '#modules/objectives/sectionTrails/trailSections/components/PreviewTrailSections';

import {
  IInstantiateSectionTrailSchema,
  instantiateSectionTrailSchema,
} from '../../schema/instantiateSectionTrail.schema';
import {
  ISectionTrail,
  IInstantiateSectionTrailInput,
  limitedSectionTrailsLength,
} from '../../types/ISectionTrail';

type IInstantiateSectionTrailModal = IReloadModal & {
  objective_category_id: string;
};

export function InstantiateSectionTrailModal({
  openModal,
  closeModal,
  reloadList,
  objective_category_id,
}: IInstantiateSectionTrailModal) {
  const [viewPreview, setViewPreview] = useState(false);

  const { toast } = useToast();

  const { send: createSectionTrail, loading: createLoading } = usePost<
    ISectionTrail,
    IInstantiateSectionTrailInput
  >('section_trails/instantiate');

  const {
    loading: sectionTrailsLoading,
    data: sectionTrailsData,
    error: sectionTrailsError,
    send: getSectionTrails,
  } = useGet<ISectionTrail[]>({
    url: '/section_trails/limited',
    lazy: true,
  });

  useEffect(() => {
    if (sectionTrailsError) {
      toast({ message: sectionTrailsError, severity: 'error' });
    }
  }, [closeModal, sectionTrailsError, toast]);

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<IInstantiateSectionTrailSchema>({
    resolver: yupResolver(instantiateSectionTrailSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const trailSelected = watch('sectionTrail', undefined);

  const onSubmit = useCallback(
    async ({ sectionTrail }: IInstantiateSectionTrailSchema) => {
      const { error: createErrors } = await createSectionTrail({
        objective_category_id,
        section_trail_id: sectionTrail.id,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'trilha instanciada', severity: 'success' });

      closeModal();
    },
    [createSectionTrail, objective_category_id, reloadList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      {viewPreview && (
        <PreviewTrailSectionsModal
          openModal={viewPreview}
          closeModal={() => setViewPreview(false)}
          sectionTrail={trailSelected}
        />
      )}

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Instanciar Trilha"
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box display="flex" alignItems="center">
            <FormSelectAsync
              required
              margin_type="no-margin"
              control={control}
              name="sectionTrail"
              label="Trilha"
              options={sectionTrailsData || []}
              optionLabel="name"
              optionValue="id"
              filterField="name"
              defaultValue={null}
              errors={errors.sectionTrail as any}
              loading={sectionTrailsLoading}
              handleOpen={() => getSectionTrails()}
              handleFilter={(params) => getSectionTrails(params)}
              limitFilter={limitedSectionTrailsLength}
            />

            {trailSelected && (
              <CustomIconButton
                action={() => setViewPreview(true)}
                title="Pré-visualizar Trilha"
                iconType="custom"
                CustomIcon={<Preview color="info" />}
                sx={{ marginLeft: '1rem' }}
              />
            )}
          </Box>

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
