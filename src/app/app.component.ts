import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'consent-collector-ng';
  constructor(
		public router: Router
	) {}
  
  open() {
		this.router.navigate([`/consentcollector`]);
	}
}
