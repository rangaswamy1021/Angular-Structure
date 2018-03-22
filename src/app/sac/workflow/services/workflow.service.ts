import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpService } from "../../../shared/services/http.service";
import { IWorkFlowStages } from "../models/WorkFlowStages";
import { IUserEvents } from "../../../shared/models/userevents";


@Injectable()
export class WorkFlowService {

    constructor(private http: HttpService) { }
    private workFlowUrl = 'WorkFlow/';
    arrayAggingData = [];
    GetPlaza(objWorkFlow: IWorkFlowStages, userEvents?: IUserEvents): Observable<IWorkFlowStages[]> {
        return this.http.postHttpMethod(this.workFlowUrl + 'GetWorkFlowStages', objWorkFlow, userEvents);
    }

    UpdateWorkFlowStages(objWorkFlow: IWorkFlowStages, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.workFlowUrl + 'UpdateWorkFlowStages', objWorkFlow);
    }

    GetWorkFlowFeeTypes(userEvents?: IUserEvents) {
        return this.http.getHttpWithoutParams(this.workFlowUrl + 'GetWorkFlowFeeTypes', userEvents);
    }

    GetWorkFlowStagesStepsFeesByStageId(objWorkFlow: IWorkFlowStages): Observable<IWorkFlowStages[]> {
        return this.http.postHttpMethod(this.workFlowUrl + 'GetWorkFlowStagesStepsFeesByStageId', objWorkFlow);
    }

    CreateWorkFlowStageStepsAndFeesByStageID(objWorkFlow: IWorkFlowStages, userEvents?: IUserEvents): Observable<IWorkFlowStages[]> {
        return this.http.postHttpMethod(this.workFlowUrl + 'CreateWorkFlowStageStepsAndFeesByStageID', objWorkFlow, userEvents);
    }

    UpdateWorkFlowStageStepsAndFeesByStageID(objWorkFlow: IWorkFlowStages, userEvents?: IUserEvents): Observable<IWorkFlowStages[]> {
        return this.http.postHttpMethod(this.workFlowUrl + 'UpdateWorkFlowStageStepsAndFeesByStageID', objWorkFlow, userEvents);
    }

    DeleteWorkFlowStageStepsAndFeesByStageID(objWorkFlow: IWorkFlowStages, userEvents?: IUserEvents): Observable<IWorkFlowStages[]> {
        return this.http.postHttpMethod(this.workFlowUrl + 'DeleteWorkFlowStageStepsAndFeesByStageID', objWorkFlow, userEvents);
    }

    IsExistStageStepCode(strStageStepCode: string): Observable<boolean> {
        var obj = JSON.stringify(strStageStepCode);
        return this.http.postHttpMethod(this.workFlowUrl + 'IsExistStageStepCode', obj);
    }

    setAgingWorkFlowValues(arrayInput) {
        this.arrayAggingData = arrayInput;
    }

    getAgingWorkFlowValues() {
        return this.arrayAggingData;
    }

}