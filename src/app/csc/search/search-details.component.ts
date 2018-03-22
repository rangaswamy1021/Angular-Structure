import { Component, OnInit, Input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';


@Component({
  selector: 'app-search-details',
  templateUrl: './search-details.component.html',
  styleUrls: ['./search-details.component.scss']
})
export class SearchDetailsComponent implements OnInit {
  @Input() Search: number = 1;
  SearchTypes = [
    {
      id: 1,
      Value: 'Basic'
    },
    {
      id: 2,
      Value: 'Advanced'
    },
    {
      id: 3,
      Value: 'Activities'
    },
    {
      id: 4,
      Value: 'Invoices'
    },
  ];
  selectedEntry;

  constructor(private router: Router) { }

  ngOnInit() {

  }
  onSelectionChange(entry) {
    this.selectedEntry = entry;
    if (entry == 1) {
      let link = ['/csc/search/basic-search'];
      this.router.navigate(link);
    }
    else if (entry == 2) {
      let link = ['/csc/search/advance-csc-search'];
      this.router.navigate(link);
    }
    else if (entry == 3) {
      // let link = ['refund/refund-queue'];
      let link = ['/csc/search/activities-search'];
      this.router.navigate(link);
      // window.location.assign("/csc/search/activity");
    }
    else if (entry == 4) {
      let link = ['csc/invoices/invoices-search'];
      this.router.navigate(link);
    }
  }
}
