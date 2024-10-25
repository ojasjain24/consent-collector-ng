import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsentCollectorRoutingModule } from './consent-collector-routing.module';
import { HomeComponent } from './home/home.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SummaryComponent } from './summary/summary.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
	declarations: [HomeComponent, SummaryComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		NgMultiSelectDropDownModule.forRoot(),
		ConsentCollectorRoutingModule,
		HttpClientModule
	]
})
export class ConsentCollectorModule {}
