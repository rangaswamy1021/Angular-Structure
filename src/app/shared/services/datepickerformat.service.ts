
import { Injectable } from '@angular/core';


@Injectable()
export class DatePickerFormatService {
    constructor() {
    }
    getFormattedDate(dateObj) {
        return new Date(dateObj.month + '/' + dateObj.day + '/' + dateObj.year);
    }
    getFormattedDateRange(dateObj) {
        if (dateObj) {
            let dateArray = [];
            let sDate = dateObj.beginDate;
            let eDate = dateObj.endDate;
            dateArray = [new Date(sDate.month + '/' + sDate.day + '/' + sDate.year), new Date(eDate.month + '/' + eDate.day + '/' + eDate.year)]
            return dateArray;
        }
        //debugger;
    }
}
