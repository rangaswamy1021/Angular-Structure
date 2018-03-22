export interface IBlocklistRequest {
    CCAccountId: number,
    CCNumber: string,
    Line1: string,
    Line2: string,
    Line3: string,
    City: string,
    State: string,
    Country: string,
    Zip1: string,
    Zip2: string,
    CCExpiryMonth: string,
    BlockListId: number,
    CustomerId: number,
    FirstName: string,
    MiddleName: string,
    LastName: string,
    EmailAddress: string,
    EmailAddress1: string,
    EmailAddress2: string,
    PhoneNumber: string,
    DayPhoneNumber: string,
    EveningPhoneNumber: string,
    MobilePhoneNumber: string,
    OfficePhoneNumber: string,
    VehicleNumber: string,
    FlagIndicator: boolean
    FlagReason: string,
    FieldValue: string,
    CreatedUser: string,
    UpdatedUser: string,
    CreatedDateTime: Date,
    UpdatedDateTime: Date
}