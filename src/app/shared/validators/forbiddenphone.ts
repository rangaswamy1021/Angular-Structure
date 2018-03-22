import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn } from '@angular/forms';

/** A hero's name can't match the given regular expression */
export function forbiddenPhoneValidator(): ValidatorFn {
    var phoneZeros: string = "^\(000\) 000-0000$";
    var exp = new RegExp(phoneZeros);
    console.log(exp);
    return (control: AbstractControl): { [key: string]: any } => {
        const forbidden = "(000) 000-0000" == control.value;
        console.log(forbidden);
        return forbidden ? { 'forbiddenPhone': { value: control.value } } : null;
    };
}

@Directive({
    selector: '[appForbiddenPhone]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenPhoneValidator, multi: true }]
})

export class ForbiddenPhoneValidator implements Validator {

    validate(control: AbstractControl): { [key: string]: any } {
        return forbiddenPhoneValidator()(control);
    }
}