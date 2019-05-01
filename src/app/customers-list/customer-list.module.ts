import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersListComponent } from './customer-list/customers-list.component';


@NgModule({
  imports: [
        CommonModule
    ],
    declarations:[
        CustomersListComponent
    ],
    exports: [
        CustomersListComponent  
    ]
})
export class CustomersListModule { }