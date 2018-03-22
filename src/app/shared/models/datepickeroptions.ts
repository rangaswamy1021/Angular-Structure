import { IMyDrpOptions } from 'mydaterangepicker';
import { IMyOptions, IMyDpOptions } from "mydatepicker";

export interface ICalOptions extends IMyDpOptions {
    showClearBtn?: boolean;
    indicateInvalidDateRange?: boolean;
    showApplyBtn?: boolean;
    showClearDateRangeBtn?:boolean;
     showClearDateBtn?:boolean;
}


