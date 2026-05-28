export type ActionError = {
  success: false;
  error: string;
};

export type CreateClientSuccess = {
  success: true;
  clientId: string;
};

export type ActionSuccess = {
  success: true;
};
