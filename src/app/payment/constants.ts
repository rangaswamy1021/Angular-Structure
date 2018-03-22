export enum CreditCardType {
    AMEX,
    DINERS,
    DISCOVER,
    JCB,
    MASTER,
    VISA
}

export enum AccountIntegration {
    CreateAccount,
    MakePayment,
    Refund
}

export enum PaymentMode {
    None = 0,
    Other,
    Bank,
    CreditCard,
    MoneyOrder,
    Cash,
    Cheque,
    Promo,
    DebitCard,
    NetBanking,
    OtherAccount,
    FeeConvAcc,
    ADJPlus1,
    ADJMinus1,
    Reversal,
    GC,
    Multiple,
    COLL,
    ACH
}

export enum AccountStatus {
    AC, // ACTIVE
    CL, // CLOSED
    CO, // Collections      
    COCL, // Collection Closed
    COPD, // Collection Paid        
    CORR, // Collection Refund Request        
    COWO, // Collection Write-Off        
    CP, // Collection Pending        
    IN, // Inactive        
    NA, //  New Account        
    PC, // Pending Closed    
    PN, // Pending Negative    
    PW, // Pending Write-off       
    RR, // Refund Requested      
    SU, // Suspended        
    VS, // Voluntary Suspension
    PA, // pending for active        
    VIO, // Violator      
    WO  // Write Off 
}


export enum RevenueCategory {
    Revenue,
    NonRevenue
}

export enum ParentPaymentMode {
    AllTransaction,
    Other,
    OnlinePmt,
    OfflinePmt,
    Adjustment,
    Reversal,
}
export enum PaymentStatus {
    InProcess,
    Success,
    Failed,
    Reversal,
    CheckBounce,
}

export enum PaymentFor {
    Adminhearing,
    Violation,
    PaymentPlanDownPayment
}