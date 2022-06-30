import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IUpdateModal } from '#shared/types/IModal';

import {
  IIntegratedObjective,
  limitedIntegratedObjectivesLength,
} from '#modules/objectives/integratedObjectives/types/IIntegratedObjective';
import {
  IOperationalObjective,
  IOperationalObjectiveInput,
} from '#modules/objectives/operationalObjectives/types/IOperationalObjective';

import {
  IOperationalObjectiveSchema,
  operationalObjectiveSchema,
} from '../../schema/operationalObjective.schema';

type IUpdateOperationalObjectiveModal = IUpdateModal<IOperationalObjective> & {
  operational_objective_id: string;
};

export function UpdateOperationalObjectiveModal({
  closeModal,
  operational_objective_id,
  openModal,
  updateList,
}: IUpdateOperationalObjectiveModal) {
  const { toast } = useToast();

  const {
    loading: operationalObjectiveLoading,
    data: operationalObjectiveData,
    error: operationalObjectiveError,
  } = useGet<IOperationalObjective>({ url: `/operational_objectives/${operational_objective_id}` });

  const { send: updateOperationalObjective, loading: updateLoading } = usePut<
    IOperationalObjective,
    IOperationalObjectiveInput
  >(`/operational_objectives/${operational_objective_id}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IOperationalObjectiveSchema>({
    resolver: yupResolver(operationalObjectiveSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const {
    loading: integratedObjectivesLoading,
    data: integratedObjectivesData,
    error: integratedObjectivesError,
    send: getIntegratedObjectives,
  } = useGet<IIntegratedObjective[]>({
    url: '/integrated_objectives/limited',
    lazy: true,
  });

  useEffect(() => {
    if (operationalObjectiveError) {
      toast({ message: operationalObjectiveError, severity: 'error' });

      closeModal();
    }

    if (integratedObjectivesError) {
      toast({ message: integratedObjectivesError, severity: 'error' });
    }
  }, [closeModal, integratedObjectivesError, operationalObjectiveError, toast]);

  const integratedObjectivesOptions = useMemo(() => {
    const options = !integratedObjectivesData ? [] : integratedObjectivesData;

    if (operationalObjectiveData) {
      const filter = options.find(
        (integratedObjective) =>
          integratedObjective.id === operationalObjectiveData.integratedObjective.id,
      );

      if (!filter) {
        options.push(operationalObjectiveData.integratedObjective as any);
      }
    }

    return options;
  }, [integratedObjectivesData, operationalObjectiveData]);

  const onSubmit = useCallback(
    async ({ name, deadline, integratedObjective }: IOperationalObjectiveSchema) => {
      const { error: updateErrors, data } = await updateOperationalObjective({
        name,
        deadline,
        integrated_objective_id: integratedObjective.id,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(operational_objective_id, data as IOperationalObjective);

      toast({ message: 'objetivo operacional atualizado', severity: 'success' });

      closeModal();
    },
    [updateOperationalObjective, updateList, operational_objective_id, toast, closeModal],
  );

  if (operationalObjectiveLoading) return <Loading loading={operationalObjectiveLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {operationalObjectiveData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar objetivo operacional"
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              required
              name="name"
              label="Nome"
              defaultValue={operationalObjectiveData.name}
              control={control}
              errors={errors.name}
              margin_type="no-margin"
            />

            <FormSelectAsync
              required
              control={control}
              name="integratedObjective"
              label="Objetivo Integrado"
              options={integratedObjectivesOptions}
              optionLabel="name"
              optionValue="id"
              filterField="name"
              defaultValue={operationalObjectiveData.integratedObjective}
              errors={errors.integratedObjective as any}
              loading={integratedObjectivesLoading}
              handleOpen={() => getIntegratedObjectives()}
              handleFilter={(params) => getIntegratedObjectives(params)}
              limitFilter={limitedIntegratedObjectivesLength}
            />

            <FormDateTimePicker
              control={control}
              name="deadline"
              label="Prazo"
              errors={errors.deadline}
              defaultValue={operationalObjectiveData.deadline}
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
