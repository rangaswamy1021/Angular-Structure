import { BalanceTypes } from '../../../shared/constants';


export interface IBalanceRequest {
    BalanceType: string,
    BalanceAmount: number,
    CustomerId: number,
    UserName: string,

}