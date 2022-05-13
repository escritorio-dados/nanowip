export const dateErrors = {
  startWithoutAvailable: {
    message: 'the available date is required if there is an start date',
    userMessage: 'a data de disponiblidade é necessária se houver uma data de inicio ',
  },
  endWithoutStart: {
    message: 'the start date is required if there is an end date',
    userMessage: 'a data de inicio é necessária se houver uma data de término ',
  },
  futureStart: {
    message: 'the start date cannot be in the future',
    userMessage: 'a data de inicio não pode estar no futuro',
  },
  futureEnd: {
    message: 'the end date cannot be in the future',
    userMessage: 'a data de término não pode estar no futuro',
  },
  futureAvailable: {
    message: 'the available date cannot be in the future',
    userMessage: 'a data de disponibilidade não pode estar no futuro',
  },
  availableAfterStart: {
    message: 'the available date cannot be after the start date',
    userMessage: 'a data de disponibilidade não pode ser posterior a data de inicio',
  },
  startAfterEnd: {
    message: 'the start date cannot be after the end date',
    userMessage: 'a data de inicio não pode ser posterior a data de término',
  },
};

export const commonErrors = {
  invalidOrganization: {
    message: "the user don't have authorization to access data from this organization",
    userMessage: 'o usuário não tem autorização para acessar os dados desta organização',
    statusCode: 401,
  },
};
