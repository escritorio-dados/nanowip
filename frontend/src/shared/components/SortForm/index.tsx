import { yupResolver } from '@hookform/resolvers/yup';
import { Box, BoxProps } from '@mui/material';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { ISortOption, orderOptions, orderTranslator } from '#shared/utils/pagination';

import { CustomButton } from '../CustomButton';
import { FormSelect } from '../form/FormSelect';
import { ISortSchema, sortSchema } from './sort.schema';

type ISortForm = BoxProps & {
  defaultSort: string;
  defaultOrder: string;
  updateSort: (sortBy: string, orderBy: string) => void;
  sortTranslator: Record<string, string>;
  sortOptions: ISortOption[];
};

export function SortForm({
  defaultOrder,
  defaultSort,
  sortTranslator,
  sortOptions,
  updateSort,
  ...props
}: ISortForm) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ISortSchema>({
    resolver: yupResolver(sortSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    (input: ISortSchema) => {
      updateSort(input.sortBy.value, input.orderBy.value);
    },
    [updateSort],
  );

  return (
    <Box
      sx={{
        width: '350px',
        padding: '1rem',
      }}
      {...props}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormSelect
          required
          control={control}
          name="sortBy"
          label="Classificar Por"
          optionLabel="label"
          optionValue="value"
          options={sortOptions}
          defaultValue={{ value: defaultSort, label: sortTranslator[defaultSort] }}
          errors={errors.sortBy as any}
          margin_type="no-margin"
        />

        <FormSelect
          required
          control={control}
          name="orderBy"
          label="Ordem"
          optionLabel="label"
          optionValue="value"
          options={orderOptions}
          defaultValue={{ value: defaultOrder, label: orderTranslator[defaultOrder] }}
          errors={errors.orderBy as any}
        />

        <CustomButton size="small" type="submit">
          Aplicar
        </CustomButton>
      </form>
    </Box>
  );
}
