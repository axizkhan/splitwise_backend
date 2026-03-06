import { Types } from "mongoose";

export type BalanceResponse = {
  userAmount: number;
  memberAmount: number;

  _id: Types.ObjectId;
  groupId: Types.ObjectId;
  JournelId: Types.ObjectId;

  userId: Types.ObjectId | string;

  memberdetails: {
    _id: Types.ObjectId;
    name: {
      firstName: string;
      lastName: string;
    };
    mobileNumber?: number;
    upiId?: string;
  };
};

export type GroupSummaryResponse = {
  group:
    | {
        _id: string;
        name: string;
        description?: string;
        members: string[];
        createdBy: string;
        createdAt: string;
      }
    | "";
  balances: Array<BalanceResponse>;
  userData:
    | {
        totalSpent: number;
        youOwe: number;
        youWillReceive: number;
      }
    | "";
};
