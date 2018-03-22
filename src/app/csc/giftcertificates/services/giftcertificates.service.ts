import { HttpService } from './../../../shared/services/http.service';
import { IGiftCertificateResponse } from './../models/gift-certificate.response';
import { IGiftCertificateRequest } from './../models/gift-certificate.request';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map'


@Injectable()
export class GiftCertificateService {
    constructor(private http: HttpService, private _http: Http) { }
    private giftcertificateUrl = 'GiftCertificates/';
    private myheaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });

   

    CreateGiftCertificate(GiftCertificate: IGiftCertificateRequest): Observable<IGiftCertificateRequest[]> {
        let obj = JSON.stringify(GiftCertificate);
        return this.http.postHttpMethod(this.giftcertificateUrl + 'CreateGiftCertificate', obj) ;

    }
}