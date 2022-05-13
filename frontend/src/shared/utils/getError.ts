export const getError = (error: unknown) =>
  typeof error === 'string' ? error : 'Aconteceu algum erro';
