export class IRequestCreditCard {
    CustomerId: number
    UserId: number
    User: string
    NameOnCard: string
    prefixsuffix: number
    CCNumber: string
    CCType: string
    ExpDate: number
    Line1: string
    Line2: string
    Line3: string
    City: string
    State: string
    Country: string
    Zip1: string
    Zip2: string
    CCID: number
    ActivitySource: string
    SubSystem: string
    DefaultFlag: boolean
    IsDeletePreviousCard: boolean
    IsCardChanging: boolean
    isAddressEnable: boolean
}