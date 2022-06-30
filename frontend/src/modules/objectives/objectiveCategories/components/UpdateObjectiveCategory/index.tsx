import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IUpdateModal } from '#shared/types/IModal';

import {
  IOperationalObjective,
  limitedOperationalObjectivesLength,
} from '#modules/objectives/operationalObjectives/types/IOperationalObjective';

import {
  IUpdateObjectiveCategorySchema,
  updateObjectiveCategorySchema,
} from '../../schemas/updateObjectiveCategory.schema';
import { IObjectiveCategory, IObjectiveCategoryInput } from '../../types/IObjectiveCategory';

type IUpdateObjectiveCategoryModal = IUpdateModal<IObjectiveCategory> & {
  objective_category_id: string;
};

export function UpdateObjectiveCategoryModal({
  closeModal,
  objective_category_id,
  openModal,
  updateList,
}: IUpdateObjectiveCategoryModal) {
  const { toast } = useToast();

  const {
    loading: objectiveCategoryLoading,
    data: objectiveCategoryData,
    error: objectiveCategoryError,
  } = useGet<IObjectiveCategory>({ url: `/objective_categories/${objective_category_id}` });

  const { send: updateObjectiveCategory, loading: updateLoading } = usePut<
    IObjectiveCategory,
    IObjectiveCategoryInput
  >(`/objective_categories/${objective_category_id}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IUpdateObjectiveCategorySchema>({
    resolver: yupResolver(updateObjectiveCategorySchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const {
    loading: operationalObjectivesLoading,
    data: operationalObjectivesData,
    error: operationalObjectivesError,
    send: getOperationalObjectives,
  } = useGet<IOperationalObjective[]>({
    url: '/operational_objectives/limited',
    lazy: true,
  });

  useEffect(() => {
    if (objectiveCategoryError) {
      toast({ message: objectiveCategoryError, severity: 'error' });

      closeModal();
    }

    if (operationalObjectivesError) {
      toast({ message: operationalObjectivesError, severity: 'error' });
    }
  }, [closeModal, operationalObjectivesError, objectiveCategoryError, toast]);

  const defaultOperationalObjective = useMemo(() => {
    if (!objectiveCategoryData) {
      return null;
    }

    const pathString = Object.values(objectiveCategoryData.path)
      .map(({ name }) => name)
      .join(' | ');

    return {
      id: objectiveCategoryData.path.operationalObjective.id,
      pathString,
      path: objectiveCategoryData.path,
    };
  }, [objectiveCategoryData]);

  const operationalObjectivesOptions = useMemo(() => {
    const options = !operationalObjectivesData ? [] : operationalObjectivesData;

    if (defaultOperationalObjective) {
      options.push(defaultOperationalObjective as any);
    }

    return options;
  }, [operationalObjectivesData, defaultOperationalObjective]);

  const onSubmit = useCallback(
    async ({ name, operationalObjective }: IUpdateObjectiveCategorySchema) => {
      const { error: updateErrors, data } = await updateObjectiveCategory({
        name,
        operational_objective_id: operationalObjective.id,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(objective_category_id, data as IObjectiveCategory);

      toast({ message: 'categoria atualizada', severity: 'success' });

      closeModal();
    },
    [updateObjectiveCategory, updateList, objective_category_id, toast, closeModal],
  );

  if (objectiveCategoryLoading) return <Loading loading={objectiveCategoryLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {objectiveCategoryData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar categoria"
          maxWidth="sm"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              required
              name="name"
              label="Nome"
              defaultValue={objectiveCategoryData.name}
              control={control}
              errors={errors.name}
              margin_type="no-margin"
            />

            <FormSelectAsync
              required
              control={control}
              name="operationalObjective"
              label="Objetivo Operacional"
              options={operationalObjectivesOptions}
              optionLabel="pathString"
              optionValue="id"
              filterField="name"
              defaultValue={defaultOperationalObjective}
              errors={errors.operationalObjective as any}
              loading={operationalObjectivesLoading}
              handleOpen={() => getOperationalObjectives()}
              handleFilter={(params) => getOperationalObjectives(params)}
              limitFilter={limitedOperationalObjectivesLength}
              renderOption={(props, option: IOperationalObjective) => (
                <CustomTooltip
                  key={option.id}
                  title={
                    <Box>
                      {Object.values(option.path)
                        .reverse()
                        .map(({ id, name, entity }) => (
                          <Box key={id} sx={{ display: 'flex' }}>
                            <Typography sx={(theme) => ({ color: theme.palette.primary.main })}>
                              {entity}:
                            </Typography>

                            <Typography sx={{ marginLeft: '0.5rem' }}>{name}</Typography>
                          </Box>
                        ))}
                    </Box>
                  }
                >
                  <Box {...props} key={option.id} component="li">
                    <Box width="100%">
                      <TextEllipsis
                        sx={(theme) => ({
                          color: theme.palette.primary.main,
                        })}
                      >
                        {option.path.integratedObjective.name}
                      </TextEllipsis>

                      <TextEllipsis>{option.path.operationalObjective.name}</TextEllipsis>
                    </Box>
                  </Box>
                </CustomTooltip>
              )}
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
