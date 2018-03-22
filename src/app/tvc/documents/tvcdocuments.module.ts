import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TvcReceivedDocumentsComponent } from './tvc-received-documents.component';
import { DocumentsModule } from "../../csc/documents/documents.module";
import { TvcSentDocumentsComponent } from "./tvc-sent-documents.component";

@NgModule({
  imports: [
    CommonModule,
    DocumentsModule
  ],
  declarations: [TvcReceivedDocumentsComponent, TvcSentDocumentsComponent]
})
export class TvcDocumentsModule { }
