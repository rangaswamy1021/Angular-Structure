import { Component, OnInit } from '@angular/core';
import { ViolatorContextService } from "../../shared/services/violator.context.service";

@Component({
  selector: 'app-tvc-sent-documents',
  templateUrl: './tvc-sent-documents.component.html',
  styleUrls: ['./tvc-sent-documents.component.scss']
})
export class TvcSentDocumentsComponent implements OnInit {
  ViolatorAccountId: number;

  constructor(private violatorContext: ViolatorContextService) { }

  ngOnInit() {
    this.violatorContext.currentContext
      .subscribe(violatorContext => { this.ViolatorAccountId = violatorContext.accountId; }
      );
  }

}
