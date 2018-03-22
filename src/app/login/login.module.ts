import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { HttpModule } from '@angular/http';
import { TokenInterceptor } from '../shared/services/interceptor';
import { AuthGuard } from '../common/guard.guard';
import { HttpService } from '../shared/services/http.service';
import { LoginService } from './services/login.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from '../app.component';
import { SessionService } from '../shared/services/session.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './forgot-password.component';
import { UserProfileUpdateComponent } from './user-profile-update.component';
import { ChangePasswordComponent } from './change-password.component';
import { PopoverModule } from "ngx-bootstrap";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    PopoverModule.forRoot()
  ],
  declarations: [
    LoginComponent,
    ForgotPasswordComponent, UserProfileUpdateComponent, ChangePasswordComponent
  ],
  providers: [AuthGuard, HttpService, LoginService, SessionService, TokenInterceptor, {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class LoginModule { }
