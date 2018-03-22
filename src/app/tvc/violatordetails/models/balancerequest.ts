import { BalanceType } from "../../../shared/constants";

export interface IBalanceRequest {
   //BalanceType: BalanceType;
   BalanceType: string;
   BalanceAmount: number;
   CustomerId: number;
   UserName: string;
}