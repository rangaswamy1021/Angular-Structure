import { AlertsCommunicationsComponent } from './customerservice/alerts-communications.component';
import { IcnVerificationComponent } from './icn/icn-verification.component';
import { IcnReconciliationComponent } from './icn/icn-reconciliation.component';
import { IcnCloseComponent } from './icn/icn-close.component';
import { IcnAssignDetailsComponent } from './icn/icn-assign-details.component';
import { IcnCountOutComponent } from './icn/icn-count-out.component';
import { ExceptionListReviewComponent } from './exceptionlists/exception-list-review.component';
import { CreateAccountIntermediateComponent } from './customeraccounts/create-account-intermediate.component';
import { PayAAdvanceTollsToCustomerComponent } from './customeraccounts/pay-a-advance-tolls-to-customer.component';
import { SplitVerifyPaymentComponent } from './customeraccounts/split-verify-payment.component';
import { SplitThankYouComponent } from './customeraccounts/split-thank-you.component';
import { SplitPreviewComponent } from './customeraccounts/split-preview.component';
import { TermsConditionsComponent } from './customeraccounts/terms-conditions.component';
import { SentDocumentsComponent } from './documents/sent-documents.component';
import { KycDocumentsComponent } from './documents/kyc-documents.component';
import { PayAAdvanceTollsComponent } from './search/pay-a-advance-tolls.component';
import { TransactionProcessingErrorReportComponent } from './exceptionlists/transaction-processing-error-report.component';
import { ManageExceptionListComponent } from './exceptionlists/manage-exception-list.component';
import { CscDashboardComponent } from './dashboard/csc-dashboard.component';
import { VerifyUnidentifiedPaymentComponent } from './customeraccounts/verify-unidentified-payment.component';
import { ManageAutoPayComponent } from './customerdetails/manage-auto-pay.component';
import { ReferralprogramComponent } from './customerservice/referral-program.component';
import { ManageReferralComponent } from './customeraccounts/manage-referral.component';
import { AdjustmentRequestsComponent } from './customeraccounts/adjustment-requests.component';
import { AssociateTagComponent } from './../tags/associate-tag.component';
import { VepPassThankYouComponent } from './veppasses/vep-pass-thank-you.component';
import { VepPassVerifyMakePaymentComponent } from './veppasses/vep-pass-verify-make-payment.component';
import { VepPassDetailsComponent } from './veppasses/vep-pass-details.component';
import { ResetPasswordAttemptsComponent } from './customeraccounts/reset-password-attempts.component';
import { GetTagDetailsComponent } from './../tags/get-tag-details.component';
import { RequestNewTagsComponent } from './../tags/request-new-tags.component';

import { DocumentCustomerSearchComponent } from './documents/document-customer-search.component';
import { AccountFlagsComponent } from './customerservice/account-flags.component';
import { ReOpenAccountComponent } from './customeraccounts/re-open-account.component';
import { AccountSummaryComponent } from './customerdetails/account-summary.component';
import { ManageGiftCertificatesComponent } from './giftcertificates/manage-gift-certificates.component';
import { AddGiftCertificateComponent } from './giftcertificates/add-gift-certificate.component';
import { InvoicesSearchComponent } from './search/invoices-search.component';
import { AuthGuard } from './../common/guard.guard';
import { BasicSearchComponent } from './search/basic-search.component';
import { ActivitiesSearchComponent } from './search/activities-search.component';
import { AdvanceCscSearchComponent } from './search/advance-csc-search.component';
import { LinkDocumentComponent } from "./documents/link-document.component";
import { DeLinkDocumentComponent } from "./documents/de-link-document.component";
import { ScannedDocumentComponent } from "./documents/scanned-document.component";
import { CreateAccountPersonalInformationComponent } from "./customeraccounts/create-account-personal-information.component";
import { CreateAccountPlanSelectionComponent } from "./customeraccounts/create-account-plan-selection.component";
import { CloseAccountComponent } from "./customerservice/close-account.component";
import { TransactionHistoryComponent } from './customerdetails/transaction-history.component';
import { DeliveryOptionsComponent } from "./customerservice/delivery-options.component";
import { ReopenAccountsummaryComponent } from "./customerdetails/reopen-accountsummary.component";
import { ManageDiscountsComponent } from "./customerservice/manage-discounts.component";
import { SecuritySettingsComponent } from "./customerdetails/security-settings.component";
import { RecentActivityComponent } from "./customerdetails/recent-activity.component";
import { ContactInformationComponent } from "./customerdetails/contact-information.component";

import { RequestStatementComponent } from "./customerdetails/request-statement.component";

import { PaymentModesComponent } from "./customeraccounts/payment-modes.component";
import { ManageBlocklistComponent } from "./customeraccounts/manage-blocklist.component";
import { ReceivedDocumentsComponent } from "./documents/received-documents.component";
import { CustomerPreferencesComponent } from './customeraccounts/customer-preferences.component';
import { CreateAccountVehicleInformationComponent } from './customeraccounts/create-account-vehicle-information.component';
import { PayByPlateListComponent } from './customeraccounts/pay-by-plate-list.component';
import { UnidentifiedPaymentsComponent } from "./customeraccounts/unidentified-payments.component";
import { MergeAccountsComponent } from "./customeraccounts/merge-accounts.component";
import { AccountAdjustmentsComponent } from './customerdetails/account-adjustments.component';
import { TransactionAcitivitiesComponent } from "./customerdetails/transaction-acitivities.component";
import { SplitSearchComponent } from "./customeraccounts/split-search.component";
import { SplitAccountComponent } from "./customeraccounts/split-account.component";
import { SplitPlanSelectionComponent } from "./customeraccounts/split-plan-selection.component";
import { SplitPaymentComponent } from "./customeraccounts/split-payment.component";
import { SplitVehiclesComponent } from "./customeraccounts/split-vehicles.component";
import { ChangeOfPlanComponent } from "./customerservice/change-of-plan.component";


import { InvoiceDetailsComponent } from "../invoices/invoice-details.component";
import { InvoicesummaryComponent } from "../invoices/invoicesummary.component";

import { NsfAdjustmentsComponent } from './customerdetails/nsf-adjustments.component';
import { RedeemRewardsComponent } from './customerdetails/redeem-rewards.component';
import { AdditionalContactsComponent } from './customerservice/additional-contacts.component';
import { TransactionTransferComponent } from "./customerdetails/transaction-transfer.component";
import { CustomerMakePaymentComponent } from "./customerdetails/customer-make-payment.component";
import { CustomerVerifyPaymentComponent } from "./customerdetails/customer-verify-payment.component";
import { CustomerPaymentConfirmationComponent } from "./customerdetails/customer-payment-confirmation.component";
import { TransactionActivityDetailsComponent } from "./customerdetails/transaction-activity-details.component";
import { AddVehicleComponent } from '../vehicles/add-vehicle.component';
import { GetVehiclesComponent } from '../vehicles/get-vehicles.component';
import { DeleteVehicleComponent } from '../vehicles/delete-vehicle.component';
import { UpdateVehicleComponent } from '../vehicles/update-vehicle.component';
import { SearchVehicleComponent } from '../vehicles/search-vehicle.component';
import { BulkuploadComponent } from '../vehicles/bulkupload.component';
import { RefundRequestComponent } from '../refunds/refund-request.component';
import { IssueRefundComponent } from '../refunds/issue-refund.component';
import { RefundQueueComponent } from '../refunds/refund-queue.component';
import { VerifyMakepaymentComponent } from "../payment/verify-makepayment.component";
import { PaymentConfirmationComponent } from "../payment/payment-confirmation.component";
import { PaymentHistoryComponent } from "../payment/payment-history.component";
import { PaymentGiftcertificateComponent } from "../payment/payment-giftcertificate.component";
import { AddCreditcardComponent } from "../payment/add-creditcard.component";
import { AddBankinformationComponent } from "../payment/add-bankinformation.component";
import { DashboardComplaintComponent } from "../helpdesk/dashboard-complaint.component";
import { ManageComplaintsComponent } from "../helpdesk/manage-complaints.component";
import { CreateComplaintComponent } from "../helpdesk/create-complaint.component";
import { AssignToMasterComplaintsComponent } from "../helpdesk/assign-to-master-complaints.component";
import { ViewComplaintsComponent } from "../helpdesk/view-complaints.component";
import { TrackComplaintsComponent } from "../helpdesk/track-complaints.component";
import { FrontDeskComponent } from "../helpdesk/front-desk.component";
import { CustomerRefundFormComponent } from '../refunds/customer-refund-form.component';
import { ClerkReconciliationReportComponent } from "./reports/clerk-reconciliation-report.component";
import { CscPaymentDetailsComponent } from './reports/csc-payment-details.component';
import { IcnHistoryComponent } from './reports/icn-history.component';
import { CustomerTagListComponent } from './reports/customer-tag-list.component';
import { ClerkCloseOutReportComponent } from './reports/clerk-close-out-report.component';
import { AccountStatusChangesComponent } from './reports/account-status-changes.component';
import { PaymentReversalsComponent } from './reports/payment-reversals.component';
import { CustomerVehiclesListComponent } from './reports/customer-vehicles-list.component';
import { DailyAdjustmentsComponent } from "./reports/daily-adjustments.component";
import { DocumentViolatorSearchComponent } from './documents/document-violator-search.component';
import { PaymentHistoryDetailsComponent } from './customerdetails/payment-history-details.component';
import { EzPassOutboundTransactionsCorrectionsComponent } from './reports/ez-pass-outbound-transactions-corrections.component';
import { ManageTagsComponent } from './customerdetails/manage-tags.component';
import { AddBankDetailsComponent } from './customerservice/add-bank-details.component';
import { AddCreditCardDetailsComponent } from './customerservice/add-credit-card-details.component';
import { UnbilledTransactionsComponent } from './customerdetails/unbilled-transactions.component';
import { DisputeTransactionComponent } from "./customerdetails/dispute-transaction.component";

export const cscRoutes = [
    {
        path: "search",

        children: [
            {
                path: 'basic-search',
                component: BasicSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'advance-csc-search',
                component: AdvanceCscSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'activities-search',
                component: ActivitiesSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'pay-a-advance-tolls',
                component: PayAAdvanceTollsComponent,
                canActivate: [AuthGuard]
            }
        ]
    }

    // {
    //     path: "gift-certificate",

    //     children: [
    //         {
    //             path: 'add',
    //             component: AddGiftCertificateComponent,
    //         },
    //         {
    //             path: 'manage',
    //             component: ManageGiftCertificatesComponent,
    //         }
    //     ]
    // },

    , {
        path: "customerdetails",

        children: [
            {
                path: 'account-summary',
                component: AccountSummaryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-auto-pay',
                component: ManageAutoPayComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'account-adjustments',
                component: AccountAdjustmentsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'additional-contacts',
                component: AdditionalContactsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'contact-information',
                component: ContactInformationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'nsf-adjustments',
                component: NsfAdjustmentsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'kyc-documents',
                component: KycDocumentsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'transaction-history',
                component: TransactionHistoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'reopen-accountsummary',
                component: ReopenAccountsummaryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'security-settings',
                component: SecuritySettingsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'recent-activity',
                component: RecentActivityComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'contactinformation',
                component: ContactInformationComponent,
            },
            {
                path: 'requestStatement',
                component: RequestStatementComponent,
            },
            {
                path: 'account-adjustments',
                component: AccountAdjustmentsComponent,
            },
            {
                path: 'transaction-activities',
                component: TransactionAcitivitiesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'un-billedtransactions',
                component: UnbilledTransactionsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'request-statement',
                component: RequestStatementComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'sent-documents',
                component: SentDocumentsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'transaction-activity-details',
                component: TransactionActivityDetailsComponent
            },
            {
                path: 'nsf-adjustments',
                component: NsfAdjustmentsComponent,
            },
            {
                path: 'redeem-rewards',
                component: RedeemRewardsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'AdditionalContactsComponent',
                component: AdditionalContactsComponent
            },
            {
                path: 'transaction-transfer',
                component: TransactionTransferComponent,
            },
            {
                path: 'customer-make-payment',
                component: CustomerMakePaymentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'customer-makepayment',
                component: CustomerMakePaymentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'customer-verify-payment',
                component: CustomerVerifyPaymentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'customer-payment-confirmation',
                component: CustomerPaymentConfirmationComponent,
                canActivate: [AuthGuard]
            }
            ,
            {
                path: 'transaction-transfer',
                component: TransactionTransferComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'payment-history-details',
                component: PaymentHistoryDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-tags',
                component: ManageTagsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-tags/:id',
                component: ManageTagsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'dispute-transaction',
                component: DisputeTransactionComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "payment",
        children: [
            {

                path: 'verify-makepayment',
                component: VerifyMakepaymentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'payment-confirmation',
                component: PaymentConfirmationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'payment-history',
                component: PaymentHistoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'gift-certificate',
                component: PaymentGiftcertificateComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'add-creditcard',
                component: AddCreditcardComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'add-bankinformation',
                component: AddBankinformationComponent,
                canActivate: [AuthGuard]
            }

        ]
    },
    {
        path: "customeraccounts",

        children: [
            {
                path: 're-open-account',
                component: ReOpenAccountComponent,
                canActivate: [AuthGuard]
            },

            {
                path: 'create-account-plan-selection',
                component: CreateAccountPlanSelectionComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'payment-modes',
                component: PaymentModesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-referral',
                component: ManageReferralComponent,
            },
            {
                path: 'manage-blocklist',
                component: ManageBlocklistComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'reset-password-attempts',
                component: ResetPasswordAttemptsComponent,
                canActivate: [AuthGuard]
            }, {
                path: 'customer-preferences',
                component: CustomerPreferencesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'create-account-vehicle-information',
                component: CreateAccountVehicleInformationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'pay-by-plate-list',
                component: PayByPlateListComponent,
                canActivate: [AuthGuard]

            },
            {
                path: 'unidentified-payments',
                component: UnidentifiedPaymentsComponent,
                canActivate: [AuthGuard]

            },
            {
                path: 'verify-unidentified-payment',
                component: VerifyUnidentifiedPaymentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'adjustment-requests',
                component: AdjustmentRequestsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'create-account-personal-information',
                component: CreateAccountPersonalInformationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'merge-accounts',
                component: MergeAccountsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-referral',
                component: ManageReferralComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'terms-conditions',
                component: TermsConditionsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'transaction-history',
                component: TransactionHistoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'transaction-processing-errors',
                component: TransactionProcessingErrorReportComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'split-search',
                component: SplitSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'split-account',
                component: SplitAccountComponent,
            },
            {
                path: 'split-plan-selection',
                component: SplitPlanSelectionComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'split-vehicles',
                component: SplitVehiclesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'split-payment',
                component: SplitPaymentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'split-preview',
                component: SplitPreviewComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'split-search',
                component: SplitSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'split-thank-you',
                component: SplitThankYouComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'split-verify-payment',
                component: SplitVerifyPaymentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'pay-a-advance-toll-to-customer',
                component: PayAAdvanceTollsToCustomerComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'pay-a-advance-toll-to-customer/:id',
                component: PayAAdvanceTollsToCustomerComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'create-account-intermediate',
                component: CreateAccountIntermediateComponent,
                canActivate: [AuthGuard]
            }

        ]
    },
    {
        path: "documents",
        children: [
            {
                path: 'scanned-document',
                component: ScannedDocumentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'link-document',
                component: LinkDocumentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'de-link-document',
                component: DeLinkDocumentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'document-customer-search',
                component: DocumentCustomerSearchComponent,
                //canActivate: [AuthGuard]
            },
            {
                path: 'document-violator-search',
                component: DocumentViolatorSearchComponent,
                //canActivate: [AuthGuard]
            },
            {
                path: 'receive-documents',
                component: ReceivedDocumentsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'sent-documents',
                component: SentDocumentsComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "customerservice",
        children: [
            {
                path: 'close-account',
                component: CloseAccountComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'alerts-communications',
                component: AlertsCommunicationsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'add-bank-details',
                component: AddBankDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'add-credit-card-details',
                component: AddCreditCardDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'referral-program',
                component: ReferralprogramComponent,
            },
            {
                path: 'manage-discounts',
                component: ManageDiscountsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'account-flags',
                component: AccountFlagsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-autopay',
                component: ManageAutoPayComponent,
            },
            {
                path: 'delivery-options',
                component: DeliveryOptionsComponent,
                canActivate: [AuthGuard]

            },
            {
                path: 'change-of-plan',
                component: ChangeOfPlanComponent,
                canActivate: [AuthGuard]
            }
            ,
            {
                path: 'additional-contacts',
                component: AdditionalContactsComponent,
                canActivate: [AuthGuard]
            },
        ]
    }, {
        path: "veppasses",
        children: [
            {
                path: 'vep-pass-details',
                component: VepPassDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'vep-pass-verify-make-payment',
                component: VepPassVerifyMakePaymentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'vep-pass-thank-you',
                component: VepPassThankYouComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'vep-pass-details/:status',
                component: VepPassDetailsComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: 'dashboard',
        children: [
            {
                path: 'csc-dashboard',
                component: CscDashboardComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "exceptionlists",

        children: [
            {
                path: 'manage-exception-list',
                component: ManageExceptionListComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'exception-list-review',
                component: ExceptionListReviewComponent,
                canActivate: [AuthGuard]
            },
        ]
    },
    {
        path: "icn",

        children: [
            {
                path: 'icn-count-out',
                component: IcnCountOutComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'icn-assign-details',
                component: IcnAssignDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'icn-close',
                component: IcnCloseComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'icn-reconciliation',
                component: IcnReconciliationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'icn-verification',
                component: IcnVerificationComponent,
                canActivate: [AuthGuard]
            },
        ]
    },
    {
        path: "vehicles",

        children: [
            {
                path: 'add-vehicle',
                component: AddVehicleComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'get-vehicles',
                component: GetVehiclesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'delete-vehicle',
                component: DeleteVehicleComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'update-vehicle',
                component: UpdateVehicleComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'search-vehicle',
                component: SearchVehicleComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'update-vehicle/:id',
                component: UpdateVehicleComponent,
                canActivate: [AuthGuard]
            },

            {
                path: 'delete-vehicle/:id',
                component: DeleteVehicleComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'upload-vehicle',
                component: BulkuploadComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'delete-vehicle/:id/:id2',
                component: DeleteVehicleComponent,
                canActivate: [AuthGuard]
            }

        ]
    },
    {
        path: "invoices",

        children: [
            {
                path: 'invoice-details',
                component: InvoiceDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'invoice-summary',
                component: InvoicesummaryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'invoices-search',
                component: InvoicesSearchComponent,
                canActivate: [AuthGuard]
            }


        ]
    },
    {
        path: 'refund-request',
        component: RefundRequestComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'issue-refund',
        component: IssueRefundComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'refund-queue',
        component: RefundQueueComponent,
        canActivate: [AuthGuard]

    },
    {
        path: 'customer-refund-form',
        component: CustomerRefundFormComponent,
        canActivate: [AuthGuard]

    },
    {
        path: "helpdesk",
        children: [
            {
                path: 'dashboard-complaint',
                component: DashboardComplaintComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-complaints',
                component: ManageComplaintsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'create-complaint',
                component: CreateComplaintComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'assign-to-master-complaints',
                component: AssignToMasterComplaintsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'view-complaints',
                component: ViewComplaintsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'track-complaint',
                component: TrackComplaintsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'front-desk',
                component: FrontDeskComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "tags",

        children: [
            {
                path: 'get-tag-details',
                component: GetTagDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'request-new-tags',
                component: RequestNewTagsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'associate-tags',
                component: AssociateTagComponent,
                canActivate: [AuthGuard]
            },

        ]

    },
    {
        path: 'reports',

        children: [
            {
                path: 'clerk-reconciliation-report',
                component: ClerkReconciliationReportComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'csc-payment-details',
                component: CscPaymentDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'icn-history',
                component: IcnHistoryComponent,
                canActivate: [AuthGuard]
            },

            {
                path: 'customer-tag-list',
                component: CustomerTagListComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'clerk-close-out-report',
                component: ClerkCloseOutReportComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'account-status-changes',
                component: AccountStatusChangesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'payment-reversals',
                component: PaymentReversalsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'customer-vehicles-list',
                component: CustomerVehiclesListComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'daily-adjustments',
                component: DailyAdjustmentsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'ez-pass-outbound-transactions-corrections',
                component: EzPassOutboundTransactionsCorrectionsComponent,
                canActivate: [AuthGuard]
            }


        ]
    }

];
