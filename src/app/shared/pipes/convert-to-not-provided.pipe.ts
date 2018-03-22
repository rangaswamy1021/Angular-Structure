import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'DisplayNotProvided'
})
export class DisplayNotProvidedPipe implements PipeTransform {

    transform(value: string): string {
        if (value && value.length > 0)
            return value;
        else
            return "Not Provided";
    }
}