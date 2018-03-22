import { IPaging } from "../../../shared/models/paging";
import { ActivitySource } from "../../../shared/constants";

export interface IPlazaRequest {
    LocationCode: string,
    LocationName: string,
    PlazaId: number,
    PlazaCode: string,
    PlazaName: string,
    Description: string,
    IPAddress: string,
    Paging: IPaging;
    PerformedBy: string,
    RecordCount: number,
    ActivitySource: ActivitySource,
    UserId: number,
    LoginId: number,
    viewFlag: string,
    AgencyCode: string,
    TransactionFeeMode: string,
    PriceMode: string,
    ChartOfAccountID: number,
    PGPKeyId: string,
    FTPURL: string,
    FTPLogin: string,
    FTPPwd: string,
    EncryptFlag: string,
    PortNumber: string,
    IFSCCode: string,
    AccountType: string,
    BankName: string,
    AccountName: string,
    AccountNumber: string,
    TransactionTypeInPlazas: string,
    TransctionTypeInPlaza: string,
    isOwned: boolean,
    isNonRevenue: boolean
}