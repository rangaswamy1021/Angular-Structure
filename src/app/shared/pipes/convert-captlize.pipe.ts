import { PipeTransform, Pipe } from "@angular/core";

@Pipe({ name: 'capitalize' })
export class CapitalizePipe implements PipeTransform {

    transform(value: any) {
        if (value) {
            value = value.toLowerCase();
            return value.replace(/\b\w/g, first => first.toLocaleUpperCase());
        }
    }

}