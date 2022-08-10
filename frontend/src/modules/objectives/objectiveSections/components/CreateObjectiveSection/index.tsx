import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePost } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';

import {
  IObjectiveCategoryType,
  ObjectiveCategoryTypes,
} from '#modules/objectives/objectiveCategories/types/IObjectiveCategory';

import {
  objectiveSectionSchema,
  IObjectiveSectionSchema,
} from '../../schemas/objectiveSection.schema';
import { IObjectiveSection, ICreateObjectiveSectionInput } from '../../types/IObjectiveSection';

type ICreateObjectiveSectionModal = IBaseModal & {
  objective_category_id: string;
  type: IObjectiveCategoryType;
  addList?: (data: IObjectiveSection) => void;
  reloadList?: () => void;
};

export function CreateObjectiveSectionModal({
  openModal,
  closeModal,
  addList,
  reloadList,
  objective_category_id,
  type,
}: ICreateObjectiveSectionModal) {
  const { toast } = useToast();

  const { send: createObjectiveSection, loading: createLoading } = usePost<
    IObjectiveSection,
    ICreateObjectiveSectionInput
  >('/objective_sections');

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
    formState: { errors },
    control,
  } = useForm<IObjectiveSectionSchema>({
    resolver: yupResolver(objectiveSectionSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (tagsError) {
      toast({ message: tagsError, severity: 'error' });
    }
  }, [toast, closeModal, tagsError]);

  const onSubmit = useCallback(
    async ({ name, tags }: IObjectiveSectionSchema) => {
      const { error: createErrors, data } = await createObjectiveSection({
        name,
        objective_category_id,
        tags,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      if (type === ObjectiveCategoryTypes.tags) {
        reloadList();
      } else {
        addList({ ...data, deliverables: [] });
      }

      toast({ message: 'seção criada', severity: 'success' });

      closeModal();
    },
    [createObjectiveSection, objective_category_id, type, toast, closeModal, reloadList, addList],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Cadastrar Seção" maxWidth="sm">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            name="name"
            label="Nome"
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
              defaultValue={[]}
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

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
