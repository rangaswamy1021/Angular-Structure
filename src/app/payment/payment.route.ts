import { VerifyMakepaymentComponent } from './verify-makepayment.component';
import { PaymentConfirmationComponent } from './payment-confirmation.component';
import { BankInformationComponent } from './bank-information.component';
import { CreditCardInformationComponent } from './credit-card-information.component';
import { PaymentHistoryComponent } from './payment-history.component';
import { MakePaymentComponent } from './make-payment.component';
import { PaymentGiftcertificateComponent } from "./payment-giftcertificate.component";
import { AddCreditcardComponent } from './add-creditcard.component';
import { AddBankinformationComponent } from './add-bankinformation.component';
import { AuthGuard } from "../common/guard.guard";

export const paymentChildren = [
    /* {
         path: 'make-payment',
         component: MakePaymentComponent,
         canActivate: [AuthGuard]
     },
     {
         path: 'payment-history',
         component: PaymentHistoryComponent,
         canActivate: [AuthGuard]
     },
     {
         path: 'credit-card-info',
         component: CreditCardInformationComponent,
         canActivate: [AuthGuard]
     },
     {
         path: 'bank-info',
         component: BankInformationComponent,
         canActivate: [AuthGuard]
     },
     {
         path: 'gift-certificate',
         component: PaymentGiftcertificateComponent,
         canActivate: [AuthGuard]
     },
     {
         path: 'verify-makepayment',
         component: VerifyMakepaymentComponent
         //canActivate: [AuthGuard]
     },
     {
         path: 'payment-confirmation',
         component: PaymentConfirmationComponent,
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
     },
     {
         path: 'make-payment',
         component: MakePaymentComponent,
         canActivate: [AuthGuard]
     }*/
]