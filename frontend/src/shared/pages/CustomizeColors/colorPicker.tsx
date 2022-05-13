import { Box } from '@mui/material';
import { useState } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';

type IInfoCustomerModal = {
  openModal: boolean;
  closeModal: () => void;
  color: string;
  saveColor: (color: string) => void;
};

export function ColorPickerModal({ closeModal, color, openModal, saveColor }: IInfoCustomerModal) {
  const [selectColor, setSelectColor] = useState(color);

  return (
    <>
      <CustomDialog open={openModal} closeModal={closeModal} title="Selecionar Cor" maxWidth="xs">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <HexColorPicker color={selectColor} onChange={setSelectColor} />

            <HexColorInput color={selectColor} onChange={setSelectColor} />
          </Box>

          <Box sx={{ background: selectColor, width: '8rem', height: '8rem' }} />
        </Box>

        <CustomButton
          onClick={() => {
            saveColor(selectColor);
            closeModal();
          }}
          size="small"
        >
          Salvar
        </CustomButton>
      </CustomDialog>
    </>
  );
}
