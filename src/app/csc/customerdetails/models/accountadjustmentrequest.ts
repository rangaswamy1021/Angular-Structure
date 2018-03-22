import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IAccountAdjustmentRequest {
    AccStatusCode: string;
    CustomerId: number;
    AdjustmentCategory: string;
    DrCr_Flag: string;
    Amount: number;
    IsPostpaidCustomer: boolean;
    Description: string;
    AppTxnTypeCode: string;
    Stmt_Literal: string;
    User: string;
    RewardBalances: number;
    CSVRewardIds: string;
    RewardPoint: number;
    LoginId: number;
    UserId: number;
    ActionCode: string;
    ActivitySource: string;
    SubSystem: string;
    CustTripIdCSV: string;
    IsVehicleTransfered: boolean;
    TransferCustomerId: number;
    ICNId: number;
    SystemActivity: ISystemActivities;
    IsTripTransfer: boolean;
    RedeemRewardPoints:number;
    ReasonCode: string;
    IsDismissed: boolean;
    AmountType: string;
    TxnType: string;
    TxnTypeDesc: string;
    AdjustmentDate: Date;
}
