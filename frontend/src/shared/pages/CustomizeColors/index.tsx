import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { darkTheme } from '#shared/themes/main.dark.theme';

import { ColorPickerModal } from './colorPicker';
import { ColorPreview, CustomizeContainer } from './styles';

export type IColors = {
  [key: string]: [string, string];
  primary: [string, string];
  secondary: [string, string];
  success: [string, string];
  error: [string, string];
  info: [string, string];
  textPrimary: [string, string];
  textSecondary: [string, string];
  divider: [string, string];
  backgroundDefault: [string, string];
  backgroundPaper: [string, string];
  backgroundAlt: [string, string];
};

type IChangeColor = { color: string; value: string } | null;

const defaultTheme: IColors = {
  primary: ['Primaria', darkTheme.palette.primary.main],
  secondary: ['Secundaria', darkTheme.palette.secondary.main],
  success: ['Sucesso', darkTheme.palette.success.main],
  error: ['Erro', darkTheme.palette.error.main],
  info: ['Info', darkTheme.palette.info.main],
  textPrimary: ['Texto Primario', darkTheme.palette.text.primary],
  textSecondary: ['Texto Secundario', darkTheme.palette.text.secondary],
  backgroundDefault: ['Background', darkTheme.palette.background.default],
  backgroundPaper: ['Background 2', darkTheme.palette.background.paper],
  backgroundAlt: ['Background 3', darkTheme.palette.backgoundAlt],
  divider: ['Divisor', darkTheme.palette.divider],
};

export function CustomizeColors() {
  const { getState, updateState } = useKeepStates();

  const [colors, setColors] = useState<IColors>(
    getState({
      category: 'tema',
      key: 'tema',
      defaultValue: defaultTheme,
    }),
  );
  const [changeColor, setChangeColor] = useState<IChangeColor>(null);

  const { updateTitle } = useTitle();

  useEffect(() => {
    updateTitle('Customizaçao (Beta)');
  }, [updateTitle]);

  return (
    <>
      {changeColor && (
        <ColorPickerModal
          openModal={!!changeColor}
          closeModal={() => setChangeColor(null)}
          color={changeColor!.value}
          saveColor={(newColor) =>
            setColors({
              ...colors,
              [changeColor!.color]: [colors[changeColor!.color][0], newColor],
            })
          }
        />
      )}

      <CustomizeContainer maxWidth="sm">
        {Object.entries(colors).map(([key, [name, color]]) => (
          <ColorPreview
            key={key}
            bcolor={color}
            onClick={() => setChangeColor({ color: key, value: color })}
          >
            {name}
          </ColorPreview>
        ))}

        <CustomButton
          onClick={() => {
            updateState({ category: 'tema', key: 'tema', value: colors, localStorage: true });
          }}
          size="small"
        >
          Salvar Tema
        </CustomButton>

        <CustomButton
          onClick={() => {
            updateState({ category: 'tema', key: 'tema', value: undefined, localStorage: true });

            setColors(defaultTheme);
          }}
          color="info"
          size="small"
        >
          Resetar Tema
        </CustomButton>

        <Typography sx={(theme) => ({ color: theme.palette.primary.main, marginTop: '2rem' })}>
          Esta customização ainda não está finalizada por completo.
        </Typography>

        <Typography sx={(theme) => ({ color: theme.palette.primary.main, marginTop: '1rem' })}>
          Ela possui diversas limitações e em futuras atualizações voce pode perder as cores salvas
        </Typography>
      </CustomizeContainer>
    </>
  );
}
