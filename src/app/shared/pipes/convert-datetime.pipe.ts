import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'customDateTimeFormat',
})
// export class CustomDateTimeFormatPipe implements PipeTransform {
//     transform(value: any) {
//         if (value) {
//             //    var datePipe = new DatePipe("en-US");
//             //   value = datePipe.transform(value, 'MM/dd/yyyy h:mm:ss a');
//             if (typeof (value) == 'object') {
//                 let monthVal, dayVal,minVal;
//                 var newValue = new Date(value);
//                 monthVal = newValue.getMonth() + 1;
//                 dayVal = newValue.getDate();
//                 if (newValue.getMonth() < 9) {
//                     monthVal = '0' + (newValue.getMonth() + 1)
//                 }
//                 if (newValue.getDate() < 9) {
//                     dayVal = '0' + (newValue.getDate())
//                 }
//                 if(newValue.getMinutes()<10){
//                     minVal='0'+newValue.getMinutes();
//                 }
//                 else{
//                     minVal=newValue.getMinutes();
//                 }
//                 value = newValue.getFullYear() + "/" + monthVal + '/' + dayVal + ' ' + newValue.getHours() + ':' + minVal + ':' + newValue.getSeconds();

//             }
//             let time = '';
//             let dd = value.substr(8, 2);
//             let MM = value.substr(5, 2);
//             let yyyy = value.substr(0, 4);
//             let date = `${MM}/${dd}/${yyyy}`;
//             let hh = parseInt(value.substr(11, 2));
//             let mm = value.substr(14, 2);
//             let ss = value.substr(17, 2);
//             let a = 'AM'
//             if (hh > 12) {
//                 hh = hh - 12;
//                 a = 'PM';
//             }
//             if (hh == 12) {
//                 a = 'PM'
//             }
//             time = `${hh}:${mm}:${ss} ${a}`;
//             value = `${date} ${time}`;
//             return value;
//         }
//         else {
//             return 'N/A';
//         }
//     }
// }

export class CustomDateTimeFormatPipe implements PipeTransform {
    transform(value: any) {
        if (value) {
            //   value = ""
            value = new Date(value);
            if (typeof (value) == 'object') {
                let monthVal, dayVal, minVal, minHours, minMintues, minSeconds;
                var newValue = new Date(value);
                monthVal = newValue.getMonth() + 1;
                dayVal = newValue.getDate();
                if (newValue.getMonth() < 9) {
                    monthVal = '0' + (newValue.getMonth() + 1)
                }
                if (newValue.getDate() < 10) {
                    dayVal = '0' + (newValue.getDate())
                }
                if (newValue.getHours() < 10) {
                    minHours = '0' + newValue.getHours();
                } else {
                    minHours = newValue.getHours();
                }
                if (newValue.getMinutes() < 10) {
                    minMintues = '0' + newValue.getMinutes();
                } else {
                    minMintues = newValue.getMinutes();
                }
                if (newValue.getSeconds() < 10) {
                    minSeconds = '0' + newValue.getSeconds();
                }
                else {
                    minSeconds = newValue.getSeconds();
                }
                value = newValue.getFullYear() + "/" + monthVal + '/' + dayVal + ' ' + minHours + ':' + minMintues + ':' + minSeconds;

            }
            let time = '';
            let dd = value.substr(8, 2);
            let MM = value.substr(5, 2);
            let yyyy = value.substr(0, 4);
            let date = `${MM}/${dd}/${yyyy}`;
            let hh = value.substr(11, 2);
            let mm = value.substr(14, 2);
            let ss = value.substr(17, 2);
            let a = 'AM'
            if (parseInt(hh) > 12) {
                hh = parseInt(hh) - 12;
                if (hh.toString().length == 1) {
                    hh = "0" + hh;
                }
                a = 'PM';
            }
            if (parseInt(hh) == 12) {
                if (hh.toString().length == 1) {
                    hh = "0" + hh;
                }
                a = 'PM'
            }
            time = `${hh}:${mm}:${ss} ${a}`;
            value = `${date} ${time}`;
            return value;
        }
        else {
            return 'N/A';
        }
    }
}