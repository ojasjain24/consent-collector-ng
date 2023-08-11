import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as forge from 'node-forge';
// import {KJUR} from 'jsrsasign';

@Component({
	selector: 'app-summary',
	templateUrl: './summary.component.html',
	styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
	@ViewChild('pfxFile') pfxFile: any;
	@ViewChild('pfxFileInput') pfxFileInput: any;
	@ViewChild('certificateFile') certificateFile: any;
	@ViewChild('certificateFileInput') certificateFileInput: any;
	@ViewChild('keyFile') keyFile: any;
	@ViewChild('keyFileInput') keyFileInput: any;
	signEnabled: any = false;
	userConsent: any;
	KJUR = require('jsrsasign');
	newcms1dmp: any;
	newcms1: any;
	parsedInfo: any;
	sigval: any;
	cades_t_1: any;
	cades_t_1dmp: any;
	pem: any;

	constructor(
		public router: Router
	) {}
	consentCollectorArtifactValue: any;
	inputFileValue: any;
	ngOnInit(): void {	
		this.consentCollectorArtifactValue =
			localStorage.getItem('consentCollectorArtifactValue') != null
				? JSON.parse(
						localStorage.getItem('consentCollectorArtifactValue') ??
							''
				  )
				: null;
		if (this.consentCollectorArtifactValue === null) {
			this.router.navigate([`/consentcollector`]);
		}
		this.userConsent = localStorage.getItem('userConsent');
	}

	editDetails() {
		this.router.navigate([`/consentcollector`]);
	}

	downloadJson(myJson: any) {
		const sJson: any = JSON.stringify(myJson);
		const element: any = document.createElement('a');
		element.setAttribute(
			'href',
			'data:text/json;charset=UTF-8,' + encodeURIComponent(sJson)
		);
		element.setAttribute('download', 'consent-summary.json');
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}

	copyMessage(val: string) {
		alert('copied Successfully');
	}
	fileInput(event: any) {
		if (event.target.files.type !== '.pfx') {
			alert('File Type not valid');
			event.target.value = null;
		} else {
			this.inputFileValue = event.target.files;
		}
	}

	onUpload(type: any, event: any) {
		if (event != null) {
			alert('File uploaded sucessfuly');
			if (type === 'pfx') this.handlePfxFileSelect(event);
			if (type === 'key') this.handleKeyFileSelect(event);
			if (type === 'cert') this.handleCertFileSelect(event);
		} else {
			alert('Please select a file');
		}
	}

	handleKeyFileSelect(event: any) {
		const selectedFile = event.target.files;
		if (!selectedFile) {
			return;
		}

		const reader = new FileReader();
		reader.onload = (event: any) => {
			const privateKeyPEM = event.target.result;
			sessionStorage.setItem('extractedPrivateKey', privateKeyPEM);
			this.enableSign();
			// this.keyFile.nativeElement.innerText=this.keyFileInput.nativeElement.value.split('\\').pop();
		};

		reader.readAsText(selectedFile);
		return true;
	}

	enableSign() {
		if (
			sessionStorage.getItem('extractedCertificate') != null &&
			sessionStorage.getItem('extractedPrivateKey') != null
		) {
			this.signEnabled = true;
		}
	}

	handleCertFileSelect(event: any) {
		const selectedFile = event.target.files;
		if (!selectedFile) {
			return;
		}
		const reader = new FileReader();
		reader.onload = (event: any) => {
			const certificatePEM = event.target.result;

			sessionStorage.setItem('extractedCertificate', certificatePEM);
			this.enableSign();
			// this.certificateFile.nativeElement.innerText=this.certificateFileInput.nativeElement.value.split('\\').pop();
		};

		reader.readAsText(selectedFile);
		return true;
	}

	handlePfxFileSelect(event: any) {
		const selectedFile = event.target.files;
		//console.log('PFX : ' + event.target);
		if (!selectedFile) {
			return;
		}
		// this.pfxFile.nativeElement.innerText=this.pfxFileInput.nativeElement.value.split('\\').pop();
		this.uploadPfx(selectedFile);
	}

	uploadPfx(selectedFile: any) {
		// //console.log("FILEINPUT : "+selectedFile);

		if (selectedFile.length > 0) {
			const file: Blob = selectedFile[0];
			const reader = new FileReader();
			//console.log('EXTRACT CERTIFICATE TO BE CALLED' + typeof file);

			reader.onload = (event: any) => {
				const pfxData = new Uint8Array(event.target.result);
				this.extractCertificates(pfxData);
				//console.log('EXTRACT CERTIFICATE CALLED');
			};
			reader.readAsArrayBuffer(file);
		} else {
			alert("Please select a valid '.pfx' file");
		}
	}

	extractCertificates(pfxData: any) {
		let pemPrivateKey;
		//console.log('EXTRACT BEGIN');
		try {
			const password: any = prompt(
				'Enter the password for the PKCS#12 file:'
			);
			const p12Der: any = forge.util.createBuffer(pfxData);
			const p12Asn1: any = forge.asn1.fromDer(p12Der);
			const p12: any = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

			const certificateBags = p12.getBags({
				bagType: forge.pki.oids['certBag']
			});
			const certificates = certificateBags[forge.pki.oids['certBag']].map(
				(bag: any) => forge.pki.certificateToPem(bag.cert)
			);

			const privateKeyBag = p12.getBags({
				bagType: forge.pki.oids['pkcs8ShroudedKeyBag']
			});
			const privateKey =
				privateKeyBag[forge.pki.oids['pkcs8ShroudedKeyBag']][0].key;

			pemPrivateKey = forge.pki.privateKeyToPem(privateKey);

			console.log('EXTRACT DONE');
			sessionStorage.setItem('extractedPrivateKey', pemPrivateKey);
			sessionStorage.setItem('extractedCertificate', certificates[0]);
			this.enableSign();
		} catch (error) {
			// console.error(
			// 	'Error extracting certificates and private key:',
			// 	error
			// );
		}
	}

	convertCRTtoPEM(crtData: any) {
		const pemHeader = '-----BEGIN CERTIFICATE-----';
		const pemFooter = '-----END CERTIFICATE-----';
		const crtLines = crtData.split('\n');
		const encodedCert = crtLines
			.filter((line: any) => line.trim() !== '')
			.join('');
		const pemCert = pemHeader + '\n' + encodedCert + '\n' + pemFooter;
		return pemCert;
	}



	verify() {
		const certificateFile = sessionStorage.getItem('extractedCertificate');
		const keyFile = sessionStorage.getItem('extractedPrivateKey');
		if (!certificateFile || !keyFile) {
			alert('Please select the certificate and key');
			return;
		}
		this.sign();
	}

	/**
	 * signing using jsrsasign library CAdES
	 */
	sign() {
		const certPEM = sessionStorage.getItem('extractedCertificate');
		const prvKeyPEM = sessionStorage.getItem('extractedPrivateKey');

		const paramOrg = {
			version: 1,
			hashalgs: ['sha256'],
			econtent: {
				type: 'data',
				content: {
					hex: '616161',
					alg: 'sha256',
					prov: 'cryptojs'
				}
			},
			sinfos: [
				{
					version: 1,
					id: { type: 'isssn', cert: '' },
					hashalg: 'sha256',
					sattrs: {
						array: [
							{
								attr: 'contentType',
								type: 'data'
							},
							{
								attr: 'messageDigest',
								hex: 'abcd'
							}
						]
					},
					sigalg: 'SHA256withRSA',
					signkey: ''
				}
			]
		};

		const param = JSON.parse(JSON.stringify(paramOrg));
		param.sinfos[0].id = { type: 'isssn', cert: certPEM };

		param.sinfos[0].signkey = prvKeyPEM;
		param.certs = [certPEM];

		param.econtent.content = { str: this.userConsent };

		const sattrs = param.sinfos[0].sattrs.array;

		sattrs.push({ attr: 'signingTime' });
		sattrs.push({ attr: 'signingCertificateV2', array: [certPEM] });
		console.log('BEFORE SIGN '+ sattrs + "\n user consent " + this.userConsent);
		const sd = this.KJUR.asn1.cms.SignedData(param);
		console.log('AFTER SIGN '+sd);

		const hCmsSignedData = sd.getContentInfoEncodedHex();
		const pem: any = new this.KJUR.asn1.ASN1Util.getPEMStringFromHex(
			hCmsSignedData,
			'CMS'
		);

		this.newcms1 = hCmsSignedData;

		// this.newcms1dmp = ASN1HEX.dump(hCmsSignedData);

		this.downloadCMS(pem);
	}

	downloadCMS(pem: any) {
		const cmsContent = pem;
		const blob = new Blob([cmsContent], {
			type: 'application/octet-stream'
		});

		const downloadLink = document.createElement('a');
		downloadLink.href = URL.createObjectURL(blob);
		downloadLink.download = 'signed_document.cms';

		document.body.appendChild(downloadLink);
		downloadLink.click();

		document.body.removeChild(downloadLink);
		sessionStorage.clear();
	}
}
