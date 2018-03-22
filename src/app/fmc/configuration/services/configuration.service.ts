import { Injectable } from "@angular/core";
import { HttpService } from "../../../shared/services/http.service";
import { Observable } from "rxjs/Observable";
import { IAccountGroupsresponse } from "../models/accountgroupsresponse";
import { IAccountGroupsRequest } from "../models/accountgroupsresquest";
import { IAccountsubgroupsrequest } from "../models/accountsubgrouprequest";
import { IAccountsubgroupsresponse } from "../models/accountsubgroupresponse";
import { ICategoryTypesResponse } from "../models/categoryresponse";
import { ICategoryTypesRequest } from "../models/categoryrequest";
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { IFicalyearResponse } from "../models/fiscalyearresponse";
import { IFiscalyearRequest } from "../models/fiscalyearrequest";
import { ICostCenterCodeRequest } from "../models/costcentercodesrequest";
import { ICostCenterCodeResponse } from "../models/costcentercodesresponse";
import { IPeriodsRequest } from "../models/periodsrequest";
import { IPeriodsresponse } from "../models/periodsresponse";
import { IFiscalyearRequestStatus } from "../models/fiscalyearrequeststatus";
import { IManageSpecialJournalRequest } from "../models/managespecialjouralsrequest";
import { IManageSpecialJournalResponse } from "../models/managespecialjouralsresponse";
import { IBusinessesProcessesRequest } from "../models/managebusinessprocessesrequest";
import { IBusinessProcessesresponse } from "../models/managebusinessprocessresponse";
import { IManageTransactionTypeResponse } from "../models/managetransactiontypesresponse";
import { IManageTransactionTypeRequest } from "../models/managetransactiontypesrequest";
import { IUserEvents } from "../../../shared/models/userevents";


@Injectable()
export class ConfigurationService {
    constructor(private http: HttpService) { }
    private url = 'Configurations/';
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });
    getAccountGroups(objsystemActivitysreq: ISystemActivities, userEvents?: IUserEvents): Observable<IAccountGroupsresponse[]> {
        return this.http.postHttpMethod(this.url + 'GetAccountGroups', objsystemActivitysreq, userEvents);
    }
    addAccountGroupDetails(objAccountGroups: IAccountGroupsRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'CreateAccountGroup', JSON.stringify(objAccountGroups), userEvents);
    }
    updateAccountGroupDetails(objAccountGroups: IAccountGroupsRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'UpdateAccountGroup', objAccountGroups, userEvents);
    }
    getSubGroups(objAccountSubGroups: IAccountsubgroupsrequest): Observable<IAccountsubgroupsresponse[]> {
        return this.http.postHttpMethod(this.url + 'GetAccountSubGroups', JSON.stringify(objAccountSubGroups));
    }
    addAccountSubGroupDetails(objAccountSubGroups: IAccountsubgroupsrequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'CreateAccountSubGroup', JSON.stringify(objAccountSubGroups), userEvents);
    }
    updateAccountSubGroupDetails(objAccountSubGroups: IAccountsubgroupsrequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'UpdateAccountSubGroup', JSON.stringify(objAccountSubGroups), userEvents);
    }
    getCategoryTypes(objCategorytypesrequest: ICategoryTypesRequest, userEvents?: IUserEvents): Observable<ICategoryTypesResponse[]> {
        let obj = JSON.stringify(objCategorytypesrequest);
        return this.http.postHttpMethod(this.url + 'GetFinanceCategoryTypes', objCategorytypesrequest, userEvents);
    }
    createCategoryTypes(objCategorytypesrequest: ICategoryTypesRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'CreateFinanceCategoryTypes', objCategorytypesrequest,userEvents);
    }
    updateCategoryTypes(objCategoryTypes: ICategoryTypesRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'UpdateFinanceCategoryTypes', JSON.stringify(objCategoryTypes),userEvents);
    }
    getFiscalyearDetails(objSystemActivities: ISystemActivities, userEvents?: IUserEvents): Observable<IFicalyearResponse[]> {
        return this.http.postHttpMethod(this.url + 'GetFiscalYears', JSON.stringify(objSystemActivities), userEvents);
    }
    createFiscalyearDetails(objFiscalYear: IFiscalyearRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'CreateFiscalYear', objFiscalYear,userEvents);
    }
    editFiscalYearDetails(objFiscalYear: IFiscalyearRequest,userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'UpdateFiscalYear', JSON.stringify(objFiscalYear),userEvents);
    }

    getCostcentercodes(objCostCenterCodeRequest: ICostCenterCodeRequest, userEvents?: IUserEvents): Observable<ICostCenterCodeResponse[]> {
        return this.http.postHttpMethod(this.url + 'GetCostCenterCode', JSON.stringify(objCostCenterCodeRequest), userEvents);
    }
    createCostCenterCodes(objCostCenterCodeRequest: ICostCenterCodeRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'CreateCostCenterCode', objCostCenterCodeRequest, userEvents);
    }
    updateCostCenterCode(objCostCenterCodeRequest: ICostCenterCodeRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'UpdateCostCenterCode', JSON.stringify(objCostCenterCodeRequest), userEvents);
    }

    getFiscalYearPeriods(objFiscalPeriods: IPeriodsRequest): Observable<IPeriodsresponse[]> {
        return this.http.postHttpMethod(this.url + 'GetFiscalYearPeriods', JSON.stringify(objFiscalPeriods));
    }
    getAdjustmentTypeDetails(): Observable<IManageTransactionTypeResponse> {
        return this.http.getHttpWithoutParams(this.url + 'GetAdjustmentTypeDetails');
    }
    getTransactionTypesDetails(objTransactionTypes: IManageTransactionTypeRequest): Observable<IManageTransactionTypeResponse[]> {
        return this.http.postHttpMethod(this.url + 'GetTransactionTypes', JSON.stringify(objTransactionTypes));
    }

    searchTransactionTypeDetails(objTransactionTypes: IManageTransactionTypeRequest, userEvents: IUserEvents): Observable<IManageTransactionTypeResponse[]> {
        return this.http.postHttpMethod(this.url + 'SearchTransactionType', objTransactionTypes, userEvents);
    }

    createTransactionTypesDetails(objTransactionTypes: IManageTransactionTypeRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'CreateTransactionTypes', JSON.stringify(objTransactionTypes), userEvents);
    }

    upadateTransactionTypesDetails(objTransactionTypes: IManageTransactionTypeRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'UpdateTransactionTypes', JSON.stringify(objTransactionTypes), userEvents);
    }

    getLineItemsByTxnTypeIdDetails(objTransactionTypes: IManageTransactionTypeRequest, userEvents: IUserEvents): Observable<IManageTransactionTypeResponse[]> {
        return this.http.postHttpMethod(this.url + 'GetLineItemsByTxnTypeId', JSON.stringify(objTransactionTypes), userEvents);
    }

    getTransactionTypeHistory(objTransactionTypes: IManageTransactionTypeRequest, userEvents: IUserEvents): Observable<IManageTransactionTypeResponse[]> {
        return this.http.postHttpMethod(this.url + 'GetTransactionTypeHistory', JSON.stringify(objTransactionTypes), userEvents);
    }

    getFiscalYearPeriodsClosing(objFiscalYearPeriodsReq: IPeriodsRequest, userEvents: IUserEvents): Observable<IPeriodsresponse[]> {
        return this.http.postHttpMethod(this.url + "GetFiscalYearPeriodsClosing", JSON.stringify(objFiscalYearPeriodsReq), userEvents);
    }

    updateFiscalYearPeriods(objFiscalYearPeriodsReq: IFiscalyearRequestStatus, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'UpdateFiscalPeriodsStatus', JSON.stringify(objFiscalYearPeriodsReq), userEvents);
    }

    createFiscalYearPeriods(objCreateFiscalYearPeriods: IPeriodsRequest[], userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'CreateFiscalYearPeriods', JSON.stringify(objCreateFiscalYearPeriods), userEvents);
    }

    getSpecialJournals(objspecialjournalRequest: ISystemActivities, userEvents?: IUserEvents): Observable<IManageSpecialJournalResponse[]> {
        return this.http.postHttpMethod(this.url + 'GetSpecialJournals', JSON.stringify(objspecialjournalRequest), userEvents);
    }
    createSpecialJournals(objspecialjournalRequest: IManageSpecialJournalRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'CreateSpecialJournals', objspecialjournalRequest,userEvents);
    }
    updateSpecialJournals(objspecialjournalRequest: IManageSpecialJournalRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'UpdateSpecialJournals', JSON.stringify(objspecialjournalRequest),userEvents);
    }

    getSpecialJournalAssociations(objspecialjournalRequest: ISystemActivities, userEvents?: IUserEvents): Observable<IManageSpecialJournalResponse[]> {
        return this.http.postHttpMethod(this.url + 'GetSpecialJournalAssociations', JSON.stringify(objspecialjournalRequest), userEvents);
    }

    createSpecialJournalAssociation(objReqSpecialJournalSetup: IManageSpecialJournalRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'CreateSpecialJournalAssociation', JSON.stringify(objReqSpecialJournalSetup),userEvents);
    }

    updateSpecialJournalAssociaton(objspecialjournalRequest: IManageSpecialJournalRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'UpdateSpecialJournalAssociaton', JSON.stringify(objspecialjournalRequest),userEvents);
    }
    getBusinessProcessesCode(objReqBusinessProcess: IBusinessesProcessesRequest): Observable<IBusinessProcessesresponse[]> {
        return this.http.postHttpMethod(this.url + 'GetBusinessProcessCodes', JSON.stringify(objReqBusinessProcess));
    }
    searchBusinessProcessesCode(objBusinessProcess: IBusinessesProcessesRequest, userEvents: IUserEvents): Observable<IBusinessProcessesresponse[]> {
        return this.http.postHttpMethod(this.url + 'GetBusinessProcessByPK', JSON.stringify(objBusinessProcess), userEvents);
    }
    createBusinessProcessesCode(objBusinessProcess: IBusinessesProcessesRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + 'CreateBusinessProcess', JSON.stringify(objBusinessProcess), userEvents);
    }
    getTxnTypeChartDeatails(service: IBusinessesProcessesRequest): Observable<IBusinessProcessesresponse[]> {
        return this.http.postHttpMethod(this.url + 'GetTxnTypeDetails', JSON.stringify(service));
    }
    getBusinessProcessByBusinessProcessId(objBusinessProcess: IBusinessesProcessesRequest): Observable<IBusinessProcessesresponse[]> {
        return this.http.postHttpMethod(this.url + 'GetBusinessProcessByBusinessProcessId', JSON.stringify(objBusinessProcess));
    }
    updateBusinessProcess(objBusinessProcess: IBusinessesProcessesRequest, userEvents: IUserEvents): Observable<IBusinessProcessesresponse[]> {
        return this.http.postHttpMethod(this.url + 'UpdateBusinessProcess', JSON.stringify(objBusinessProcess), userEvents);
    }


}