export type User = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber?: number;
  upiId?: string;
};

export type UserLocalLogin = {
  email: string;
  password: string;
};
