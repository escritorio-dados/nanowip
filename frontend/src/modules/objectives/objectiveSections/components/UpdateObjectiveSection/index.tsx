import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';

import {
  IObjectiveCategoryType,
  ObjectiveCategoryTypes,
} from '#modules/objectives/objectiveCategories/types/IObjectiveCategory';

import {
  IObjectiveSectionSchema,
  objectiveSectionSchema,
} from '../../schemas/objectiveSection.schema';
import { IObjectiveSection, IUpdateObjectiveSectionInput } from '../../types/IObjectiveSection';

type IUpdateObjectiveSectionModal = IBaseModal & {
  objective_section_id: string;
  type: IObjectiveCategoryType;
  updateList?: (id: string, data: IObjectiveSection) => void;
  reloadList?: () => void;
};

export function UpdateObjectiveSectionModal({
  closeModal,
  objective_section_id,
  openModal,
  updateList,
  type,
  reloadList,
}: IUpdateObjectiveSectionModal) {
  const { toast } = useToast();

  const {
    loading: objectiveSectionLoading,
    data: objectiveSectionData,
    error: objectiveSectionError,
  } = useGet<IObjectiveSection>({ url: `/objective_sections/${objective_section_id}` });

  const { send: objectiveSection, loading: updateLoading } = usePut<
    IObjectiveSection,
    IUpdateObjectiveSectionInput
  >(`/objective_sections/${objective_section_id}`);

  const {
    loading: tagsLoading,
    data: tagsData,
    error: tagsError,
    send: getTags,
  } = useGet<string[]>({
    url: '/tags',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IObjectiveSectionSchema>({
    resolver: yupResolver(objectiveSectionSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (objectiveSectionError) {
      toast({ message: objectiveSectionError, severity: 'error' });

      closeModal();

      return;
    }

    if (tagsError) {
      toast({ message: tagsError, severity: 'error' });
    }
  }, [closeModal, objectiveSectionError, toast, tagsError]);

  const onSubmit = useCallback(
    async ({ name, tags }: IObjectiveSectionSchema) => {
      const { error: updateErrors, data } = await objectiveSection({
        name,
        tags,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      if (type === ObjectiveCategoryTypes.tags) {
        reloadList();
      } else {
        updateList(objective_section_id, data);
      }

      toast({ message: 'seção atualizada', severity: 'success' });

      closeModal();
    },
    [objectiveSection, type, toast, closeModal, reloadList, updateList, objective_section_id],
  );

  const defaultTags = useMemo(() => {
    if (!objectiveSectionData || !objectiveSectionData.tagsGroup) {
      return [];
    }

    return objectiveSectionData.tagsGroup.tags.map((tag) => tag.name);
  }, [objectiveSectionData]);

  if (objectiveSectionLoading) return <Loading loading={objectiveSectionLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {objectiveSectionData && (
        <CustomDialog open={openModal} closeModal={closeModal} title="Editar seção" maxWidth="sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              required
              name="name"
              label="Nome"
              defaultValue={objectiveSectionData.name}
              control={control}
              errors={errors.name}
              margin_type="no-margin"
            />

            {type === ObjectiveCategoryTypes.tags && (
              <FormSelectAsync
                multiple
                freeSolo
                control={control}
                name="tags"
                label="Tags"
                options={tagsData || []}
                defaultValue={defaultTags}
                errors={errors.tags}
                loading={tagsLoading}
                handleOpen={() => getTags()}
                handleFilter={(params) =>
                  getTags({
                    params: { ...params?.params },
                  })
                }
                limitFilter={100}
                filterField="name"
              />
            )}

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
