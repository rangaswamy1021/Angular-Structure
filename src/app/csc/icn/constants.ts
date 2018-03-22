export enum ICNStatus {
        None = 0,
        Closed = 1,
        Counted = 2,
        Open = 3,
        Reconciled = 4,
        Reopened = 5,
        Variance = 6,
        Verified = 7,
        NotAssigned = 8,
        CHANGEFUND = 9,
        ICN = 10,
        SELFLOAD = 11,
        CARRYFORWARD = 12,
        ICNCOUNTOUT = 13,
        ICNASSIGNED = 14
}

export enum ICNItemActionGroup {
        Replacement,
        Assigned,
        Returned,
        Alloted
}

export enum CashType{
        Float,
        Deposit
}