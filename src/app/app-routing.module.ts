import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ConsentCollectorModule } from './consent-collector/consent-collector.module';

const routes: Routes = [
  {
		path: '',
		children: [
			{
				path: 'consentcollector',
				loadChildren: () =>
					import(
						'./consent-collector/consent-collector.module'
					).then((m) => m.ConsentCollectorModule)
			}
		]
	},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {enableTracing: true, scrollPositionRestoration: 'enabled'})
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
