import { ISystemActivities } from './../../../shared/models/systemactivitiesrequest';

export interface IGiftCertificateRequest {

    GCNumber: string,
    GCPurhcaseAmount: string,
    CurrentValueAmount: string,
    Status: string,
    StatusDate: Date,
    GCPurhaseDate: Date,
    ExpiryDate: Date,
    PerformedBy: string,
    Range: string,
    SystemActivity: ISystemActivities
}


