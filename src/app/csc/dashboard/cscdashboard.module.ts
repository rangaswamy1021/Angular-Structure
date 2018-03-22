import { CscDashboardComponent } from './csc-dashboard.component';
import { DashBoardService } from './services/dashboard.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
@NgModule({
  imports: [
    CommonModule
    ],
  declarations: [CscDashboardComponent],
  providers:[DashBoardService]
})
export class CscDashboardModule { }
