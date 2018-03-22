import { ISystemActivities } from './../../../shared/models/systemactivitiesrequest';
export interface IManageSpecialJournalRequest {
    code: string,
    specialJournalName: string,
    specialJournalDesc: string,
    description: string,
    status: boolean,
    loginId: number,
    userId: number,
    user: string,
    isViewed: boolean,
    activitySource: string,
    specialJournalId: number,
    reCount: number,
    isDelete: boolean,
    systemActivity: ISystemActivities
    chartofAccounts: any;
}



