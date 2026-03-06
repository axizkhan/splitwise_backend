export type IAccountType = "google" | "local";

export interface IAccount {
  type: IAccountType;
  passwordHash?: string; // optional
  providerId?: string; // optional
}

export interface IUser {
  emailId: string;

  name: {
    firstName: string;
    lastName: string;
  };

  mobileNumber?: number; // optional
  upiId?: string; // optional

  account: IAccount; // required (because schema defines it directly)

  updatedAt?: Date; // auto generated
  deletedAt?: Date | null; // can be null
}
