import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	constructor(
		private router: Router,
		private fb: FormBuilder,
	) {

		const consentCollectorArtifactValue =
			localStorage.getItem('consentCollectorArtifactValue') != null
				? JSON.parse(
						localStorage.getItem('consentCollectorArtifactValue') ??
							''
				  )
				: null;

		this.consentCollectorArtifact = this.fb.group({
			aiuEmail: [
				consentCollectorArtifactValue == null
					? ''
					: consentCollectorArtifactValue.aiuEmail,
				[Validators.email]
			],
			aiuName: [
				consentCollectorArtifactValue == null
					? ''
					: consentCollectorArtifactValue.aiuName,
				[Validators.min(1), Validators.max(100)]
			],
			purpose: [
				consentCollectorArtifactValue == null
					? ''
					: consentCollectorArtifactValue.purpose,
				[Validators.required, Validators.min(1)]
			],
			itemType: [
				consentCollectorArtifactValue == null
					? ''
					: consentCollectorArtifactValue.itemType,
				[Validators.required, Validators.min(1)]
			],
			itemInp: [
				consentCollectorArtifactValue == null
					? ''
					: consentCollectorArtifactValue.itemInp,
				[Validators.required, Validators.min(1)]
			],
			dateInput: [
				consentCollectorArtifactValue == null
					? ''
					: consentCollectorArtifactValue.dateInput,
				[Validators.required, Validators.min(1)]
			],
			dpName: [
				consentCollectorArtifactValue == null
					? ''
					: consentCollectorArtifactValue.dpName,
				[Validators.required, Validators.min(1), Validators.max(100)]
			],
			dpID: [
				consentCollectorArtifactValue == null
					? ''
					: consentCollectorArtifactValue.dpID,
				[Validators.required, Validators.min(1)]
			],
			aipEmail: [
				consentCollectorArtifactValue == null
					? ''
					: consentCollectorArtifactValue.aipEmail,
				[Validators.required, Validators.email]
			],
			aipName: [
				consentCollectorArtifactValue == null
					? ''
					: consentCollectorArtifactValue.aipName,
				[Validators.required, Validators.min(1), Validators.max(100)]
			]
		});
	}

	itemTypeDropdownList: any = [];
	selectedItemType: any = [];
	itemTypeDropdownSettings = {};

	purposeDropdownList: any = [];
	selectedPurposes: any = [];
	purposeDropdownSettings = {};

	consentCollectorArtifact: any;
	submitClicked = false;
	ngOnInit() {
		this.itemTypeDropdownList = [
			{ item_id: '1', item_text: 'Resource Group' },
			{ item_id: '2', item_text: 'Resource' }
		];
		this.selectedItemType = [];
		this.itemTypeDropdownSettings = {
			singleSelection: true,
			idField: 'item_id',
			textField: 'item_text',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			allowSearchFilter: true
		};

		this.purposeDropdownList = [
			{ item_id: 'B1', item_text: 'Logistics' },
			{ item_id: 'B2', item_text: 'Insurance' },
			{ item_id: 'B3', item_text: 'Agricultural credit' },
			{ item_id: 'B4', item_text: 'Market-related services' },
			{ item_id: 'B5', item_text: 'Storage-related services' }
		];
		this.selectedPurposes = [];
		this.purposeDropdownSettings = {
			singleSelection: false,
			idField: 'item_id',
			textField: 'item_text',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			itemsShowLimit: 2,
			allowSearchFilter: true
		};
	}
	validateForm() {
		this.submitClicked = true;
		if (this.validate()) {
			const consentCollectorArtifactValue: any = {
				aipName: this.consentCollectorArtifact.controls.aipName.value,
				aipEmail: this.consentCollectorArtifact.controls.aipEmail.value,
				dpID: this.consentCollectorArtifact.controls.dpID.value,
				dpName: this.consentCollectorArtifact.controls.dpName.value,
				dateInput:
					this.consentCollectorArtifact.controls.dateInput.value,
				itemInp: this.consentCollectorArtifact.controls.itemInp.value,
				itemType: this.consentCollectorArtifact.controls.itemType.value,
				purpose: this.consentCollectorArtifact.controls.purpose.value,
				aiuName: this.consentCollectorArtifact.controls.aiuName.value,
				aiuEmail: this.consentCollectorArtifact.controls.aiuEmail.value
			};
			localStorage.setItem(
				'consentCollectorArtifactValue',
				JSON.stringify(consentCollectorArtifactValue)
			);
			localStorage.setItem(
				'userConsent',
				JSON.stringify(consentCollectorArtifactValue)
			);
			this.router.navigate([`consentcollector/summary`]);
		} else {
			//TODO : remove
			localStorage.removeItem('consentCollectorArtifactValue');
		}
	}

	validate() {
		return (
			this.consentCollectorArtifact.status === 'VALID' &&
			((this.consentCollectorArtifact.controls.aiuName.value === '' &&
				this.consentCollectorArtifact.controls.aiuEmail.value === '') ||
				(this.consentCollectorArtifact.controls.aiuName.value !== '' &&
					this.consentCollectorArtifact.controls.aiuEmail.value !==
						''))
		);
	}

	OnDestroy() {
		localStorage.removeItem('consentCollectorArtifactValue');
	}

	// public findInvalidControls() {
	//   const invalid = [];
	//   const controls = this.consentCollectorArtifact.controls;
	//   for (const name in controls) {
	//       if (controls[name].invalid) {
	//           invalid.push(name);
	//       }
	//   }
	//   return invalid;
	// }
}
