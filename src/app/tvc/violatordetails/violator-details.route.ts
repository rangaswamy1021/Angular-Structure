import { TripHistoryComponent } from './trip-history.component';
import { UpdateContactDetailsComponent } from './update-contact-details.component';
import { TransactionStatusUpdateComponent } from './transaction-status-update.component';
import { CreateCorrespondenceComponent } from './create-correspondence.component';
import { ViolatorSummaryComponent } from './violator-summary.component';
import { OverPaymentTransferComponent } from './over-payment-transfer.component';
import { ConvertToCustomerComponent } from './convert-to-customer.component';
import { SstHistoryComponent } from './sst-history.component';
import { ViewCorrespondenceComponent } from './view-correspondence.component';
import { ViolationTransferToCustomerComponent } from './violation-transfer-to-customer.component';
import { ViolationTripHistoryComponent } from './violation-trip-history.component';
import { AdminHearingComponent } from './admin-hearing.component';
import { ActivityDetailsComponent } from './activity-details.component';
import { TripAdjustmentsComponent } from './trip-adjustments.component';
import { AuthGuard } from './../../common/guard.guard';
import { TransactionActivitiesComponent } from './transaction-activities.component';



export const violatorDetailsChildren=[
            {
                path: 'trip-Search',
                component: TransactionActivitiesComponent,
                canActivate:[AuthGuard]
            },
            {
                path: 'trip-adjustments',
                component: TripAdjustmentsComponent,
                canActivate:[AuthGuard]
            },
            {
                path: 'activity-details',
                component: ActivityDetailsComponent,
                canActivate:[AuthGuard]
            },
            {
                path:'admin-hearing',
                component:AdminHearingComponent,
                canActivate:[AuthGuard]
            },
            {
                path:'violation-trip-history',
                component:ViolationTripHistoryComponent,
                canActivate:[AuthGuard]
            },
            {
                path:'violation-transfer-to-customer',
                component:ViolationTransferToCustomerComponent,
                canActivate:[AuthGuard]
            },
            {
                path:'view-correspondence',
                component:ViewCorrespondenceComponent,
                canActivate:[AuthGuard]
            },
             {
                path:'sst-history',
                component:SstHistoryComponent,
                canActivate:[AuthGuard]
            },
             {
                path:'convert-to-customer',
                component:ConvertToCustomerComponent,
                canActivate:[AuthGuard]
            },
            {
                path: 'overpayment',
                component: OverPaymentTransferComponent,
                canActivate:[AuthGuard]
            },
            {
                path: 'violation-summary',
                component: ViolatorSummaryComponent,
                canActivate:[AuthGuard]
            },
            {
                path: 'create-correspondence',
                component: CreateCorrespondenceComponent,
                canActivate:[AuthGuard]
            },
            {
                path: 'transaction-status-update',
                component: TransactionStatusUpdateComponent,
                canActivate:[AuthGuard]
            },
            {
                path: 'update-contact-details',
                component: UpdateContactDetailsComponent,
                canActivate:[AuthGuard]
            },
            {
                path: 'trip-history',
                component: TripHistoryComponent,
                canActivate:[AuthGuard]
            },
        ]