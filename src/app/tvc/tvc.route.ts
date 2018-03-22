import { DmvHistoryComponent } from './violatoraccounts/dmv-history.component';
import { CreateViolatorComponent } from './disputes/create-violator.component';
import { AuthGuard } from './../common/guard.guard';
import { TripHistoryComponent } from './violatordetails/trip-history.component';
import { UpdateContactDetailsComponent } from './violatordetails/update-contact-details.component';
import { ConvertToCustomerComponent } from './violatordetails/convert-to-customer.component';
import { SstHistoryComponent } from './violatordetails/sst-history.component';
import { ViewCorrespondenceComponent } from './violatordetails/view-correspondence.component';
import { ViolationTransferToCustomerComponent } from './violatordetails/violation-transfer-to-customer.component';
import { ViolationTripHistoryComponent } from './violatordetails/violation-trip-history.component';
import { AdminHearingComponent } from './violatordetails/admin-hearing.component';
import { TripAdjustmentsComponent } from './violatordetails/trip-adjustments.component';
import { PaymentPlanComponent } from './paymentdetails/payment-plan.component';
import { ViolatorSummaryComponent } from './violatordetails/violator-summary.component';
import { TransactionActivitiesComponent } from './violatordetails/transaction-activities.component';
import { ActivityDetailsComponent } from "./violatordetails/activity-details.component";
import { PaymentHistoryComponent } from './paymentdetails/payment-history.component';
import { OverPaymentTransferComponent } from "./violatordetails/over-payment-transfer.component";
import { ViolationPaymentComponent } from "./paymentdetails/violation-payment.component";
import { VerifyViolationPaymentComponent } from "./paymentdetails/verify-violation-payment.component";
import { ViolationPaymentConfirmationComponent } from "./paymentdetails/violation-payment-confirmation.component";
import { CreateCorrespondenceComponent } from './violatordetails/create-correspondence.component';
import { TransactionStatusUpdateComponent } from './violatordetails/transaction-status-update.component';
import { InvoiceSearchComponent } from "./search/invoice-search.component";
import { ViolationSearchComponent } from "./search/violation-search.component";
import { RefundRequestComponent } from "../refunds/refund-request.component";
import { IssueRefundComponent } from "../refunds/issue-refund.component";
import { RefundQueueComponent } from "../refunds/refund-queue.component";
import { FrontDeskComponent } from "../helpdesk/front-desk.component";
import { AssignToMasterComplaintsComponent } from "../helpdesk/assign-to-master-complaints.component";
import { TrackComplaintsComponent } from "../helpdesk/track-complaints.component";
import { CreateComplaintComponent } from "../helpdesk/create-complaint.component";
import { ManageComplaintsComponent } from "../helpdesk/manage-complaints.component";
import { ViewComplaintsComponent } from "../helpdesk/view-complaints.component";
import { TvcDashboardComponent } from "./tvcdashboard/tvc-dashboard.component";
import { AffidavitSearchViolatorComponent } from "./disputes/affidavit-search-violator.component";
import { NonLiabilityComponent } from "./disputes/non-liability.component";
import { ViolationTransferComponent } from "./disputes/violation-transfer.component";
import { ViewPaymentPlanDetailsComponent } from "./paymentdetails/view-payment-plan-details.component";
import { NsfCheckDetailsComponent } from "./paymentdetails/nsf-check-details.component";
import { InvoiceAdjustmentsComponent } from './violatordetails/invoice-adjustments.component';
import { ManageVehiclesComponent } from './violatordetails/manage-vehicles.component';
import { BatchInvoiceDetailsComponent } from "../invoices/batch-invoice-details.component";
import { ViewInvoiceDetailsComponent } from "../invoices/view-invoice-details.component";
import { ViolationPaymentHistoryComponent } from './paymentdetails/violation-payment-history.component';
import { DashboardComplaintComponent } from "../helpdesk/dashboard-complaint.component";
import { TvcReceivedDocumentsComponent } from "./documents/tvc-received-documents.component";
import { InvoiceOverpaymentTransferComponent } from "./violatordetails/invoice-overpayment-transfer.component";
import { ViolatorRefundFormComponent } from '../refunds/violator-refund-form.component';
import { TvcSentDocumentsComponent } from "./documents/tvc-sent-documents.component";
import { ViewDisputesComponent } from './disputes/view-disputes.component';





export const tvcChildren = [
    {
        path: "violatordetails",
        children: [
            {
                path: 'trips-Search',
                component: TransactionActivitiesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'trip-Search',
                component: TransactionActivitiesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'trip-adjustments',
                component: TripAdjustmentsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'activity-details',
                component: ActivityDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'admin-hearing',
                component: AdminHearingComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'violation-trip-history',
                component: ViolationTripHistoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'violation-transfer-to-customer',
                component: ViolationTransferToCustomerComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'view-correspondence',
                component: ViewCorrespondenceComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'sst-history',
                component: SstHistoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'convert-to-customer',
                component: ConvertToCustomerComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'invoice-overpayment-transfer',
                component: InvoiceOverpaymentTransferComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'violator-summary',
                component: ViolatorSummaryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'create-correspondence',
                component: CreateCorrespondenceComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'transaction-status-update',
                component: TransactionStatusUpdateComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'update-contact-details',
                component: UpdateContactDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'trip-history',
                component: TripHistoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'trip-history',
                component: TripHistoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'app-update-con',
                component: UpdateContactDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'invoice-adjustments',
                component: InvoiceAdjustmentsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-vehicles',
                component: ManageVehiclesComponent,
                canActivate: [AuthGuard]
            },
        ]
    },
    {
        path: "paymentdetails",

        children: [
            {
                path: 'payment-history',
                component: ViolationPaymentHistoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "payment-plan",
                component: PaymentPlanComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "payment-plan-details",
                component: PaymentPlanComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'violation-payment',
                component: ViolationPaymentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'violation-makepayment',
                component: ViolationPaymentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'verify-violation-payment',
                component: VerifyViolationPaymentComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'violation-payment-confirmation',
                component: ViolationPaymentConfirmationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'view-payment-plan-details',
                component: ViewPaymentPlanDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'view-payment-plan',
                component: ViewPaymentPlanDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'nsf-check-details',
                component: NsfCheckDetailsComponent,
                canActivate: [AuthGuard]
            },
        ]
    },
    {
        path: 'violatoraccounts',
        children: [
            {
                path: 'create-violator',
                component: CreateViolatorComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'dmv-history',
                component: DmvHistoryComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: 'violatordetails',
        children: [
            {
                path: 'create-correspondence',
                component: CreateCorrespondenceComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'update-con',
                component: UpdateContactDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'activity-details',
                component: ActivityDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'over-payment-transfer',
                component: OverPaymentTransferComponent,
                canActivate: [AuthGuard],
                pathMatch: 'full'
            },
            {
                path: 'admin-hearing',
                component: AdminHearingComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'trip-adjustments',
                component: TripAdjustmentsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'convert-to-customer',
                component: ConvertToCustomerComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'sst-history',
                component: SstHistoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'transaction-status-update',
                component: TransactionStatusUpdateComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'trip-history',
                component: TransactionActivitiesComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'view-correspondence',
                component: ViewCorrespondenceComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'violator-summary',
                component: ViolatorSummaryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'violation-transfer-to-customer',
                component: ViolationTransferToCustomerComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'violation-trip-history',
                component: ViolationTripHistoryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manage-vehicles',
                component: ManageVehiclesComponent,
                canActivate: [AuthGuard]
            },


        ]
    },
    {
        path: "search",

        children: [
            {
                path: 'invoice-search',
                component: InvoiceSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'invoices-search',
                component: InvoiceSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'violation-search',
                component: ViolationSearchComponent,
                canActivate: [AuthGuard]
            },

        ]
    },
    {
        path: "documents",

        children: [
            {
                path: 'receive-documents',
                component: TvcReceivedDocumentsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'sent-documents',
                component: TvcSentDocumentsComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "invoices",

        children: [
            {
                path: 'batch-invoice-details',
                component: BatchInvoiceDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'view-invoice-details',
                component: ViewInvoiceDetailsComponent,
                canActivate: [AuthGuard]
            },

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
        path: 'violator-refund-form',
        component: ViolatorRefundFormComponent,
        canActivate: [AuthGuard]

    },
    {
        path: 'front-desk',
        component: FrontDeskComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'assign-to-master-complaints',
        component: AssignToMasterComplaintsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'track-complaint',
        component: TrackComplaintsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'create-complaint',
        component: CreateComplaintComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'manage-complaints',
        component: ManageComplaintsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'view-complaints',
        component: ViewComplaintsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'tvcdashboard',
        children: [
            {
                path: 'tvc-dashboard',
                component: TvcDashboardComponent,
                canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: 'disputes',
        children: [
            {
                path: 'affidavit-search-violator',
                component: AffidavitSearchViolatorComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'non-liability',
                component: NonLiabilityComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'non-liability/:id',
                component: NonLiabilityComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'violation-transfer',
                component: ViolationTransferComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'create-violator',
                component: CreateViolatorComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'view-disputes',
                component: ViewDisputesComponent
                // canActivate: [AuthGuard]
            }
        ]
    },
    {
        path: "customerdetails",
        children: [
            {
                path: 'search/invoice-search',
                component: InvoiceSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'search/invoices-search',
                component: InvoiceSearchComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'invoices/batch-invoice-details',
                component: BatchInvoiceDetailsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'invoices/view-invoice-details',
                component: ViewInvoiceDetailsComponent,
                canActivate: [AuthGuard]
            }
        ]


    },
    {
        path: 'invoice-adjustments',
        component: InvoiceAdjustmentsComponent,
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
    }
]
