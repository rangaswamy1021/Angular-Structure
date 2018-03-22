import { Injectable } from "@angular/core";
import { HttpService } from "../../../shared/services/http.service";
import { Observable } from "rxjs/Observable";
import { IDMVDetails } from "../models/DMVDetails";

@Injectable()
export class ViolatorAccountsService {
    constructor(private http: HttpService) { }

    private dashboardUrl = 'tvcdashboard/';

    getDMVDetailsBaseOnVehicleNumber(vehicleNumber: String): Observable<IDMVDetails> {
        var service = { 'strVehicleNumber': vehicleNumber }
        return this.http.postHttpMethod(this.dashboardUrl + 'GetDMVDetailsBaseOnVehicleNumber', JSON.stringify(service)) ;
    }

}