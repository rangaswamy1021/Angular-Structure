import { IPaging } from './../../../shared/models/paging';

export interface IShipmentservicetypesresponse {
    ServiceTypeId: number;
    ServiceTypeName: string;
    ServiceDescription: string;
    Cost: number;
    IsActive: boolean;
    ZipCode: number;
    PerformedBy: string;
    RecordCount: number;
    ShipmentStatus: string;
}