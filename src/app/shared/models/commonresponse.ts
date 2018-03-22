export interface ICommonResponse {
    CountryCode: string,
    CountryId: number,
    CountryName: string,
    CustomerId: number,
    LookUpTypeCode: string,
    LookUpTypeCodeDesc: string,
    LookUpTypeCodeId: number,
    ParentLookUpTypeCodeId: number,
    ReturnValue: string[],
    StateCode: string,
    StateId: number,
    StateName: string,
    UserName: string
}

export interface ICommon {
    LookUpTypeCode: string,
    CountryCode: string
}
