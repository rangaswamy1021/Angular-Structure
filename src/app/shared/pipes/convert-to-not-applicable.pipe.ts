import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'DisplayNA'
})
export class DisplayNAPipe implements PipeTransform {

    transform(value: string): string {
        if (value && value.length > 0)
            return value;
        else
            return "N/A";

    }
}