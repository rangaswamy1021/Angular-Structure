import { RefundRequestComponent } from './refund-request.component';
import { RefundQueueComponent } from './refund-queue.component';
import { IssueRefundComponent } from './issue-refund.component';
import { CustomerRefundFormComponent } from './customer-refund-form.component';
import { ViolatorRefundFormComponent } from './violator-refund-form.component';
export const refundChildren=[{
    path:'issue-refund',
    component:IssueRefundComponent
},{
    path:'refund-queue',
    component:RefundQueueComponent
},{
    path:'refund-request',
    component:RefundRequestComponent
},{
    path:'violator-refund-form',
    component:ViolatorRefundFormComponent
},{
    path:'customer-refund-form',
    component:CustomerRefundFormComponent
}]