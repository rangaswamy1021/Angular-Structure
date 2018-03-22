export enum PhoneType {
    DayPhone,
    EveningPhone,
    MobileNo,
    WorkPhone,
    HomePhone,
    Fax
}

export class AppSettings {
    public static KYCDocument = '1';
}

export enum ActivitySource {
    Internal,
    External,
    BatchProcess,
    RetailerWeb,
    ConcessionaireWeb,
    IVRService
}

export enum SubSystem {
    CSC,
    FMC,
    IMC,
    SAC,
    TVC,
    RTL,
    COURT
}

export enum AddressTypes {
    Primary,
    Business,
    Home,
    Mailing,
    Shipping,
    Secondary,
    Other,
    DmvAddr,
}

export enum EmailType {
    PrimaryEmail,
    SecondaryEmail,

}

export enum SourceOfEntry {
    Online,
    Offline,
    Violation,
    none
}

export enum UserType {
    Individual,
    Business,
    Agency
}

export enum CustomerStatus {
    C,
    V
}

export enum LoginStatus {
    Active,
    InActive
}

export enum LookupTypeCodes {
    DocConfigs,
    DocumentsLinked,
    Languages,
    Complaints,
    CustomerStatements,
    Invoices,
    Statement,
    LastChance,
    SentEmails,
    Activity_Categories,
    Refund,
    CsrActivity,
    Transactions,
    Reversals,
    Adjustments,
    TripActivity,
    SpecialAlerts,
    Violations,
    Vehicles,
    Tags,
    Statements,
    Payments,
    CustomActivity,
    Court,
    Account,
    POInvoice,
    LaneTypes,
    LaneDirections,
    TripImages,
    TransactionFeeMode,
    FeesAppliedfor,
    CourtDocuments,
    EvidencePacket
}


interface Idictionary {
    key: string,
    value: string
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
    NA, // New Account
    PC, // Pending Closed
    PN, // Pending Negative
    PW, // Pending Write-off
    RR, // Refund Requested
    SU, // Suspended
    VS, // Voluntary Suspension
    PA, // pending for active
    VIO, // Violator
    WO // Write Off
}

export enum BalanceTypes {
    VioDepBal,
    PostBal,
    RefundBal,
    VIOBAL,
    TagBal,
    CollBal,
    TollBal,
    ADMHERIFEE,
}

export enum Adjustments {

    D, // Debit
    C // Credit
}

export enum ApplicationTransactionTypes {

    COLLACADJDR,
    CSCACADJDRPOST,
    CSCACADJDR,
    COLLACADJCR,
    CSCACADJCRPOST,
    CSCACADJCR,
    TAGRETURN,
    ASSIGNTAG
}

export enum TollType {

    POSTPAID,
    PREPAID
}

export enum AdjustmentCategory {
    Violation,
    Collection,
    PrePaid,
    PostPaid,
}

export enum ComplaintStatus {
    ASSIGNED,
    OPENED,
    REJECTED,
    RESOLVED,
    MERGE,
    CLOSED,
    ONHOLD,
    REASSIGNED,
    REOPENED,
    TRANSFERRED
}

export enum BalanceType {
    CollBal,
    PostBal,
    TollBal,
    Other,
    VioBal,
    ADVANCEPAYMENT,
    ADMHERIFEE
}

export enum RevenueCategory {
    Revenue,
    NonRevenue
}
export enum DocumentTypes {
    //Account,
    General,
    CloseAccountReq,
    PurchaseOrderInVoice,
    PaymentReceipt,
    Invoices,
    PrintInterface,
    Statement,
    CCItem,
    BusinessDocument,
    AdHocStatements,
    CloseAccRequest,
    LastChance,
    Email,
    AccActivity
}
export enum Activities {
    ACCOUNT,
    COURT,
    CustomActivity,
    PAYMENTS,
    Statements,
    TRANSPONDERS,
    VEHICLES,
    Violations,
    SPECIALALERTS,
    TRIPACTIVITY,
    ADJUSTMENTS,
    REVERSALS,
    Transactions,
    CSRACTIVITY,
    RETAILER,
    INVOICES,
}

export enum Features {
    ACCOUNTADJUSTMENTS,
    ACCOUNTCONFIG,
    ACCOUNTFLAGS,
    ACCOUNTGROUPS,
    ACCOUNTHOLDERDETAILS,
    ACCOUNTING,
    ACCOUNTSECURITY,
    ACCOUNTSTATUSCHANGES,
    ACCOUNTSUBGROUPS,
    ACTIVECOLLECTION,
    ACTIVECOLLECTIONRESPONSE,
    ACTIVITIES,
    ACTIVITIESSEARCH,
    ADDITIONALACCOUNTCONTACTS,
    ADDRESS,
    ADHOCSTATEMENT,
    ADJUSTMENTAPPROVALREQUEST,
    ADMINHEARINGTRANSFER,
    ADVANCESEARCH,
    AGENCY,
    AGINGWORKFLOW,
    ALERTSETTINGS,
    APPLICATIONPARAMETERS,
    AUTOPAY,
    AuditLog,
    BANKACCOUNTS,
    BASICSEARCH,
    BLOCKLIST,
    BULKEMAIL,
    BULKMANAGETAGS,
    BUSINESSPROCESS,
    CASHMANAGEMENT,
    CATEGORYTYPES,
    CHANGEOFPLAN,
    CHARTOFACCOUNTS,
    CLERKCLOSEOUT,
    CLERKRECONCILIATION,
    CLOSEACCOUNT,
    COLLECTIONS,
    COMPLAINTCONFIG,
    COMPLAINTTURNAROUNDTIME,
    CONFIGURATION,
    CONTACTINFORMATION,
    CONTRACT,
    CONVERTFACILITYANDTAGTOHEXTAG,
    CONVERTTOCUSTOMERFROMVIOLATOR,
    CORREPONDENCEHISTORY,
    COSTCENTERCODES,
    COURTSELECTION,
    CREATEACCOUNT,
    CREATECORRESPONDENSE,
    CREDITCARDRECONCILIATION,
    CREDITCARDS,
    CSCCREATECOMPLAINT,
    CSCDASHBOARD,
    CSCFRONTDESK,
    CSCMANAGECOMPLAINTS,
    CSCPAYMENTDETAILS,
    CSCTRACKCOMPLAINT,
    CSRRELATIONS,
    CUSTOMERNSFADJUSTMENTS,
    CUSTOMERRECEIVEDDOCUMENTS,
    CUSTOMERRECONCILIATION,
    CUSTOMERSENTDOCUMENTS,
    CUSTOMERTAGLIST,
    CUSTOMERTRANSACTIONACTIVITIES,
    DAILYADJUSTMENTS,
    DELIVERYOPTIONS,
    DELIVERYSTATUS,
    DISCOUNTS,
    DISPUTE,
    DISPUTETRANSACTION,
    DLINKDOCUMENTS,
    DMV,
    DOCKET,
    DOCUMENTCONFIG,
    DOCUMENTDELIVERYSTATUS,
    DOCUMENTS,
    EMAIL,
    EXCEPTIONLISTREVIEW,
    EXCLUDEDCUSTOMERS,
    FEETYPES,
    FINANCECONFIG,
    FINANCEDASHBOARD,
    FINANCERECONCILIATION,
    FISCALYEAR,
    FISCALYEARCONFIG,
    FULFILLMENT,
    GENERALCONFIG,
    GENERALJOURNAL,
    GENERALLEDGER,
    HEARINGS,
    HELPDESKDASHBOARD,
    HELPDESKMANAGERSEMAILSETTINGS,
    ICNASSIGN,
    ICNCLOSE,
    ICNCONFIG,
    ICNCOUNTOUT,
    ICNHISTORY,
    ICNRECONCILE,
    ICNVERIFY,
    INVENTORY,
    INVENTORYCONFIG,
    INVENTORYITEMS,
    INVENTORYRETAILERREPORT,
    LOCATIONSREQUEST,
    LOCATIONSDISTRIBUTION,
    INVENTORYTRACKING,
    INVOICEADJUSTMENTS,
    INVOICEAGING,
    INVOICECONFIG,
    INVOICECONFIGURATIONS,
    INVOICESSEARCH,
    INVOICETEXT,
    ISSUEREFUND,
    ISSUEVEPPASS,
    ITEMS,
    ITEMTYPES,
    JOURNALLINEITEMS,
    KYC,
    LANES,
    LOCATIONS,
    MANAGEDISCOUNTS,
    MANAGEEXCEPTIONS,
    MANAGEEZPASSOUTBOUNDTRANSACTION,
    MANAGETRANSACTIONTYPES,
    MANAGEVEPPASSTYPES,
    MANAGEWRONGADDRESS,
    MANUALGLLINEITEMS,
    MANUALGLTRANSACTIONS,
    MANUALJOURNALENTRIES,
    MERGECUSTOMERS,
    MOVETOCUSTOMER,
    MULTIPLEBATCHES,
    NDTEV,
    NTEV,
    OVERPAYMENTTRANSFER,
    OPERATIONALLOCATIONS,
    PAYADVANCETOLLS,
    PAYBYPLATELIST,
    PAYMENT,
    PAYMENTHISTORY,
    PAYMENTPLAN,
    PAYMENTPLANCONFIG,
    PAYMENTREVERSALS,
    PERIODCLOSING,
    PERIODS,
    PHONE,
    PLANS,
    PLAZAS,
    POSOUTLETPAYMENT,
    PRINTINTERFACE,
    PRIVATECOLLECTIONS,
    PRIVILEGES,
    PROFILE,
    PROMOS,
    PURCHASEORDER,
    PURCHASEORDERDETAILS,
    RECENTACTIVITES,
    REDEEMREWARDS,
    REFERRAL,
    REFUNDQUEUE,
    REFUNDREQUEST,
    REOPENACCOUNT,
    REPLENISHMENTCONFIG,
    REPRINT,
    RESETPASSWORDATTEMPTS,
    RETAILER,
    RETAILERACCOUNTSREPORT,
    RETAILERRECHARGE,
    RETAILERTRANSACTIONSREPORT,
    RETAILERUSER,
    RETURNEDPOITEMS,
    RETURNPURCHASEORDER,
    REWARDPOINTSCONFIG,
    ROLES,
    SEARCHVIOALATOR,
    SECURITYCONFIG,
    SENDEMAIL,
    SHIPMENT,
    SHIPMENTDELIVERY,
    SHIPMENTTYPES,
    SPECIALALERTS,
    SPECIALJOURNAL,
    SPECIALJOURNALASSOCIATIONS,
    SPECIALJOURNALSETUP,
    SPLITCUSTOMER,
    SSTHISTORY,
    STATEMENTCONFIG,
    SUBCHARTOFACCOUNTS,
    SUBSIDIARYLEDGER,
    TAG,
    TAGCONFIG,
    TAGINVENTORY,
    TAGVSFINANCERECONCILIATION,
    TOLLRATES,
    TOLLRECONCILIATION,
    TOLLSCHEDULES,
    TOLLVIOLATIONNOTICE,
    TRAFFICCITATION,
    TRANSACTIONERRORREPORT,
    TRANSACTIONHISTORY,
    TRANSACTIONREVENUERECONCILIATION,
    TRANSACTIONTYPELINEITEMS,
    TRANSACTIONTYPES,
    TRIALBALANCE,
    TRIPHISTORY,
    TRIPSTATUSUPDATE,
    TRIPTRANSACTIONS,
    TRIPVSFINANCERECONCILIATION,
    TVCCREATECOMPLAINT,
    TVCDASHBOARD,
    TVCFRONTDESK,
    TVCISSUEREFUND,
    TVCMANAGECOMPLAINTS,
    TVCPAYMENT,
    TVCRECEIVEDDOCUMENTS,
    TVCREFUNDQUEUE,
    TVCREFUNDREQUEST,
    TVCSENTDOCUMENTS,
    TVCTRACKCOMPLAINT,
    TVCVEHICLES,
    TXNPOSTCONFIG,
    UNIDENTIFIEDPAYMENTS,
    UPDATEADDRESS,
    USERS,
    VEHICLELIST,
    VEHICLES,
    VENDOR,
    VEPPASS,
    VIEWBATCH,
    VIEWEXPIRINGTAGS,
    VIEWPAYMENTPLAN,
    VIOLATIONACTIVITIES,
    VIOLATIONADJUSTMENT,
    VIOLATIONCONFIG,
    VIOLATIONSUMMARY,
    VIOLATIONTRIPHISTORY,
    VIOLATOR,
    VIOLATORADDRESS,
    VIOLATORINVOICE,
    VIOLATORNSFADJUSTMENTS,
    VIOLATORPAYMENTHISTORY,
    VIOLATORSEARCH,
    VIOLATORTRANSACTIONACTIVITIES,
    WARRANTY,
    WARRANTYTRACKINGREPORT,
    MANAGESECONDARYACCOUNTS,
    WEBPAGES,
    RETAILERORDER,
    IMCDASHBOARD,
    TAGHISTORY,
    ICN,
    MANAGENONREVENUETAGS,
    MBSLOADBALANCE
}

export enum TxnTypeCategories {
    AllTransaction,
    Adjustment,
    Fee,
    PaymentBank,
    PaymentCard,
    PaymentCash,
    PaymentCheque,
    Refund,
    Reversal,
    Transfer,
    NSFFee,
    Payment
}

export enum VendorStatus {
    Active,
    InActive,
}

export enum VendorUserTypes {
    NonCustomer,
    POS,
    Concessioner,
    SpecialAccess,
    IOPCustomer,
    InternalCustomer,
    VEPCustomer,
    Individual,
    Vendor
}
export enum InvoicesStatus {
    PAID,
    PARTIALPAID,
    TRANSFERRED,
    INIT,
    WRITEOFF,
    DISMISSED,
    DISMISSREQUESTED
}

export enum CorrespondenceActionType {
    AddressUpdate,
    CorrespondenceOnly,
    Both
}


export enum ConfigurationType {
    ACCOUNTCONFIG,
    ADMINCONFIG,
    COMPLAINTCONFIG,
    FINANCECONFIG,
    GENERALCONFIG,
    ICNCONFIG,
    INVENTORYCONFIG,
    INVOICECONFIG,
    REPLENISHMENTCONFIG,
    TAGCONFIG,
    TXNPOSTCONFIG,
    VIOLATIONCONFIG,
    SECURITYCONFIG,
    DASHBOARDMONITORINGCONFIG,
    DOCUMENTCONFIG,
    STATEMENTCONFIG,
    REWARDPOINTSCONFIG
}
export enum DataType {
    INT,
    STRING,
    DECIMAL,
    BOOLEAN,
    NVARCHAR,
    MONEY,
    BIT
}
export enum BulkEmail {
    Inactive,
    Init,
    Posted,
    AccountStatus,
    AccountType,
    ReplenishmentType,
    Email,
    CustomerId,
    ZipCode
}

export enum SubFeatures {
    ACCOUNTINFORMATION,
    BATCHINFORMATION,
    COMPANYINFORMATION,
    DISCOUNTASSOCIATE,
    FEEASSOCIATE,
    IMCDASHBOARD,
    PAYMENTINFO,
    PLANSELECTION,
    PREFERENCES,
    VEHICLEINFORMATION,
    VERIFYPAYMENT,
    PAYMENTPLANSETUP,
    RECEIVESHIPMENT,
    PAYMENT,
    PLAZADDITIONALINFORMATION,
    TAGHISTORY,
    CONTACTINFORMATION,
    SHIPMENTDETAILS,
    PROFILEINFO,
    PERSONALIZATIONINFO,
    CHANGEPASSWORD,
    PAYMENTPLANTERM,
    ITEMINFORMATION,
    CREATEVIOLATOR
}
export enum Actions {
    ACCOUNT,
    ACCOUNTHOLD,
    ACCOUNTHOLDREMOVE,
    ACCOUNTSPAYABLE,
    ACCOUNTSRECEIVABLE,
    ACCOUNTSUMMARY,
    ACTIVATE,
    ACTIVE,
    ADD,
    ADJUSTMENT,
    ADMINHEARING,
    ADMINHEARINGREQUEST,
    AFFIDAVIT,
    ALLOW,
    APPROVE,
    ARVSAP,
    ASSETS,
    ASSIGN,
    ASSIGNDISCOUNTS,
    ASSIGNPASS,
    ASSIGNTOMASTER,
    ASSOCIATETAG,
    AUTOPAY,
    AUTOPAYHOLD,
    BALANCESHEET,
    BANK,
    BULKUPLOAD,
    CANCEL,
    CASH,
    CC,
    CHANGEPLAN,
    CHEQUE,
    CLOSE,
    CLOSED,
    COMMIT,
    COMPLETEBATCH,
    CONFIGURATION,
    CONVERT,
    CORRSPONDENCE,
    COUNTOUT,
    CREATE,
    CREATEVIOLATOR,
    CREDITCARD,
    CUSTOM,
    CUSTOMER,
    DEACTIVATE,
    DEACTIVE,
    DELETE,
    DELINK,
    DLINK,
    DOCUMENTDELIVERY,
    DOCUMENTUPDATE,
    EDIT,
    EDITDUEDATE,
    EMI,
    EXPENDITURE,
    FORGOTUSERNAME,
    FULFILL,
    FUNDFLOW,
    GIFTCERTIFICATE,
    HISTORY,
    HOLD,
    IMAGEVIEW,
    INCOMETRENDING,
    INQUIRY,
    INVOICEAGING,
    INVOICESUMMARY,
    ITEMSREQUEST,
    ITEMSREQUESTREJECT,
    JUDGEMENT,
    LANES,
    LIABILITIES,
    LINK,
    LOCATIONS,
    MANAGE,
    MERGE,
    MO,
    MONEYORDER,
    NSF,
    ONHOLD,
    OPEN,
    OVERPAYMENT,
    OVERPAYMENTTRANSFER,
    PAYMENT,
    PLAZAS,
    POSOUTLETFULFILLMENT,
    PREDEFINED,
    PREVIEW,
    PRINTPDF,
    PROCESS,
    PROMO,
    PURCHASE,
    RATES,
    REASSIGN,
    RECEIVE,
    RECENTACTIVITIES,
    RECHARGE,
    RECONCILE,
    REDEEMED,
    REJECT,
    RELEASE,
    RELINK,
    REOPEN,
    REPORTING,
    REPROCESS,
    REQUEST,
    RESCHEDULE,
    RESET,
    RESETPASSWORD,
    RESETPIN,
    RESOLVE,
    RETAILERFULFILLMENT,
    RETAILERFULFILLMENTSEARCH,
    RETAILERFULFILLMENTVIEW,
    REVENUE,
    REVERSE,
    REVIEW,
    SCAN,
    SCHEDULES,
    SEARCH,
    SPLIT,
    SST,
    STATEMENTLINK,
    STATUS,
    SYSTEMHEALTHSTATUS,
    SYSTEMSSTATUS,
    TAGDELIVERY,
    TERMEDIT,
    THRESHOLDALARMS,
    TOP5INVOICES,
    TRANSACTION,
    TRANSACTIONPOSTING,
    TRANSFER,
    UNLOCK,
    UPDATE,
    UPLOAD,
    VERIFY,
    VIEW,
    VIEWBATCH,
    VIEWCOMPLAINT,
    VIEWDETAILS,
    VIEWPDF,
    VOIDBY
}


export enum CourtDocuments {
    Affidavit,
    ComplaintSummary,
    OwnershipProof,
    TollBill,
    FirstNotice,
    SecondNotice,
    FinalNotice,
    PrintInterface,
    AccountSummary,
    OtherDocument,
    EvidencePacket,
}


export const defaultCulture = "en-US";


