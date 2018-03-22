import { ActivitySource } from "../../../shared/constants";


export interface IContractRequest {
    ContractNumber: string,
    ContractName: string,
    UploadContract: string,
    CreatedUser: string,
    UpdatedUser: string,
    ContractId: number,
    ContractStatus: number,
    UserId: number,
    LoginId: number,
    User: string,
    SearchFlag: string,
    ActivitySource: string,
    VendorId: number,
    PageNumber:number,
    PageSize:number,
    SortDirection:boolean,
    SortColumn:string,
    Vendor:string,
    FeaturesCode:string,
    ActionCode:string,
    KeyValue:string
}