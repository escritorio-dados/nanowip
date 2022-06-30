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
import { useGet, usePost } from '#shared/services/useAxios';
import { IAddModal } from '#shared/types/IModal';

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

type ICreateOperationalObjectiveModal = IAddModal<IOperationalObjective> & {
  defaultIntegratedObjective?: { id: string; name: string };
};

export function CreateOperationalObjectiveModal({
  openModal,
  closeModal,
  addList,
  defaultIntegratedObjective,
}: ICreateOperationalObjectiveModal) {
  const { toast } = useToast();

  const { send: createOperationalObjective, loading: createLoading } = usePost<
    IOperationalObjective,
    IOperationalObjectiveInput
  >('operational_objectives');

  const {
    loading: integratedObjectivesLoading,
    data: integratedObjectivesData,
    error: integratedObjectivesError,
    send: getIntegratedObjectives,
  } = useGet<IIntegratedObjective[]>({
    url: '/integrated_objectives/limited',
    lazy: true,
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IOperationalObjectiveSchema>({
    resolver: yupResolver(operationalObjectiveSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (integratedObjectivesError) {
      toast({ message: integratedObjectivesError, severity: 'error' });
    }
  }, [integratedObjectivesError, toast]);

  const integratedObjectivesOptions = useMemo(() => {
    const options = !integratedObjectivesData ? [] : integratedObjectivesData;

    if (defaultIntegratedObjective) {
      const filter = options.find(
        (integratedObjective) => integratedObjective.id === defaultIntegratedObjective!.id,
      );

      if (!filter) {
        options.push(defaultIntegratedObjective as any);
      }
    }

    return options;
  }, [defaultIntegratedObjective, integratedObjectivesData]);

  const onSubmit = useCallback(
    async ({ name, deadline, integratedObjective }: IOperationalObjectiveSchema) => {
      const { error: createErrors, data } = await createOperationalObjective({
        name,
        deadline,
        integrated_objective_id: integratedObjective.id,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data);

      toast({ message: 'objetivo operacional criado', severity: 'success' });

      closeModal();
    },
    [createOperationalObjective, addList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Objetivo Operacional"
        maxWidth="xs"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            name="name"
            label="Nome"
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
            defaultValue={defaultIntegratedObjective || null}
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
          />

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
