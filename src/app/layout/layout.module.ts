import { ViolatorContextService } from './../shared/services/violator.context.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';
import { RouterModule } from '@angular/router';
import { CapitalizePipe } from "../shared/pipes/convert-captlize.pipe";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,  
      
  ],
  declarations: [
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
    MenuComponent,CapitalizePipe
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    MenuComponent
  ],
  providers: [ViolatorContextService]
})
export class LayoutModule { }
