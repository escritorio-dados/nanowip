import { BoxProps, Typography } from '@mui/material';

import { FieldContainer, TagsContainer } from './styles';

type ITagsInfo<T> = BoxProps & {
  label?: string;
  tagsData: T[];
  getId: (data: T) => string;
  getValue: (data: T) => string;
};

export function TagsInfo<T>({ getId, getValue, tagsData, label, ...props }: ITagsInfo<T>) {
  return (
    <FieldContainer {...props}>
      {label && <Typography component="strong">{label}</Typography>}

      <TagsContainer>
        {tagsData.map((tag) => (
          <Typography component="span" key={getId(tag)}>
            {getValue(tag)}
          </Typography>
        ))}
      </TagsContainer>
    </FieldContainer>
  );
}
