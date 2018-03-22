import { IUserEvents } from './../../../shared/models/userevents';
import { IExceptionListResponse } from './../models/exceptionlistresponse';
import { IExceptionListRequest } from './../models/exceptionlistrequest';
import { Observable } from 'rxjs/Observable';
import { HttpService } from './../../../shared/services/http.service';
import { Injectable } from '@angular/core';
import { ITransactionProcessorErrorsRequest } from "../models/transactionprocessorerrorsrequest";
import { ITransactionProcessorErrorsResponse } from "../models/transactionprocessorerrorsresponse";

@Injectable()
export class ExceptionListService {
    constructor(private baseService: HttpService) { }
    private exceptionListUrl = '/ExceptionLists/';

    getWatchList(exceptionListReq: IExceptionListRequest, userEvents?: IUserEvents): Observable<IExceptionListResponse[]> {
        return this.baseService.postHttpMethod(this.exceptionListUrl + 'GetWatchList', exceptionListReq, userEvents);
    }

    createWatchList(exceptionListReq: IExceptionListRequest, userEvents?: IUserEvents): Observable<number> {
        return this.baseService.postHttpMethod(this.exceptionListUrl + 'CreateWatchList', JSON.stringify(exceptionListReq),userEvents);
    }

    updateWatchList(exceptionListReq: IExceptionListRequest, userEvents?: IUserEvents): Observable<number> {
        return this.baseService.putHttpMethod(this.exceptionListUrl + 'UpdateWatchList', JSON.stringify(exceptionListReq),userEvents);
    }

    getErrorTransactionReport(exceptionListReq: ITransactionProcessorErrorsRequest, userEvents: IUserEvents): Observable<ITransactionProcessorErrorsResponse[]> {
        return this.baseService.postHttpMethod(this.exceptionListUrl + 'GetErrorTransactionReport', exceptionListReq, userEvents);
    }

    updateErrorQueueRelease(arrProcessId: String[], arrVioProcessId: String[], arrIPCProcessId: String[], createdUser: string, userEvents: IUserEvents): Observable<string> {
        var data = { 'arrProcessId': arrProcessId, 'arrVioProcessId': arrVioProcessId, 'arrIPCProcessId': arrIPCProcessId, 'createdUser': createdUser }
        return this.baseService.postHttpMethod(this.exceptionListUrl + 'UpdateErrorQueueRelease', JSON.stringify(data), userEvents);
    }

    getMasterData(userEvents:IUserEvents): Observable<string> {
        return this.baseService.getHttpWithoutParams(this.exceptionListUrl + 'GetMasterData', userEvents) ;
    }

    getTransactions(txnCount: string): Observable<any> {
        return this.baseService.getHttpWithParams(this.exceptionListUrl + 'GetTransactions', "txnCount", txnCount);
    }

    commitTransactions(txnCountTransCommit:String[], userEvents: IUserEvents): Observable<any> {
        return this.baseService.postHttpMethod(this.exceptionListUrl + 'CommitTransactions',txnCountTransCommit, userEvents ) ;
    }

}


