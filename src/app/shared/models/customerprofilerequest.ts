import { ISystemActivities } from "./systemactivitiesrequest";
import { NameType } from "../../csc/customeraccounts/constants";
import { ActivitySource, SubSystem } from "../constants";

export interface ICustomerProfileRequest {
    AccountId: number,
    FirstName: string,
    MiddleName: string,
    LastName: string,
    Gender: string,
    Title: string,
    Suffix: string,
    DOB: string,
    FullName: string,
    NameType: NameType,
    ContactId: number,
    PerformBy: string,
    SubSystem: SubSystem,
    ActivitySource: ActivitySource,
    OrganisationName: string,
    IsActivityRequired: boolean,
    CheckBlockList: boolean,
    SortColumn: string,
    SortDirection: boolean,
    PageNumber: number,
    PageSize: number,
    SystemActivities: ISystemActivities
}