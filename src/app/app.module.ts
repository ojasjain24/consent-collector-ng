import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ConsentCollectorModule } from './consent-collector/consent-collector.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [		
    RouterModule.forChild([]),
    AppRoutingModule,
    NgbModule,
    BrowserModule,
    ConsentCollectorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
