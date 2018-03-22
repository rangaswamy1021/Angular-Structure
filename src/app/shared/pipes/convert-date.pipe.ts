import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'customDateFormat',
})
export class customDateFormatPipe implements PipeTransform {
    transform(value: any) {
        if(value){
        value = new Date(value);
        //var datePipe = new DatePipe("en-US");
        //value = datePipe.transform(value, 'MM/dd/yyyy');
        let monthVal, dayVal;
        var newValue = new Date(value);
        monthVal = newValue.getMonth() + 1;
        dayVal = newValue.getDate();
        if (newValue.getMonth() < 9)
        {
            monthVal = '0' + (newValue.getMonth() + 1)
        } 
        if (newValue.getDate() <= 9)
        {
            dayVal = '0' + (newValue.getDate())
        }

        value = newValue.getFullYear() + "/" + monthVal + '/' + dayVal;
        let dd = value.substr(8, 2);
        let MM = value.substr(5, 2);
        let yyyy = value.substr(0, 4);
        let date = `${MM}/${dd}/${yyyy}`;
        value = `${date}`;
        return value;
        }else{
            return 'N/A';
        }
    }
}