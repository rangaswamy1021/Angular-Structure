import { IPaging } from '../../../shared/models/paging';
export interface ITollScheduleRequest {
    TollScheduleHdrId: Number;
    TollScheduleHdrDesc: String;
    ScheduleType: String;
    StartEffectiveDate :any;
    EndEffectiveDate :any;
    Interval: Number;
    TollRateIdString: String;
    TollRangeString: String;
    IsActive: boolean;
    PerformedBy: String;
    UserId: Number;
    LoginId: number;
    ActivitySource: String;
    Paging: IPaging,
    ViewFlag: String;
    EntryLaneCode: String;
    EntryLaneType: String;
    EntryLaneDirection: String;
    EntryPlazaCode: String;
    ExitPlazaCode: String;
    PlazaPriceMode: String;
    TransactionType: String;
    TxnMehtod: String;
}