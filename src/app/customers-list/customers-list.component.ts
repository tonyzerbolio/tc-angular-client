import { Component, OnInit } from '@angular/core';
import { RestApiService } from "../shared/rest-api.service";

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.css']
})
export class CustomersListComponent implements OnInit {

  Customer: any = [];

  constructor(
    public restApi: RestApiService
  ) { }

  ngOnInit() {
    this.loadCustomers()
  }

  // Get customers list
  loadCustomers() {
    return this.restApi.getCustomers().subscribe((data: {}) => {
      this.Customer = data;
    })
  }

}
