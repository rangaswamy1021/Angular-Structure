import { ICustomerResponse } from './../../../shared/models/customerresponse';
import { IPaging } from './../../../shared/models/paging';
export interface IAgencyResponse {
    AgencyId: number;
    AgencyName: string;
    AgencyCode: string;
    AgencyDescription: string;
    pPgpKeyId: string;
    FTPURL: string;
    FTPLogin: string;
    FTPPwd: string;
    IsActive: boolean;
    PricingMode: string;
    SshHostKey: string;
    PortNumber: number;
    ChartOfAccountID: number;
    IFSCCode: string;
    AccountType: string;
    BankName: string;
    AccountName: string;
    AccountNumber: string;
    StartEffectiveDate: Date;
    EndEffectiveDate: Date;
    CustomerDetails:ICustomerResponse;
    CreatedDate: Date;
    CreatedUser: string;
    UpdatedDate: Date;
    UpdatedUser: string;
    Paging: IPaging;
    PerformedBy: string;
    RecordCount: number;
    viewFlag: string;
    UserId: number;
   LoginId: number;
   
}
