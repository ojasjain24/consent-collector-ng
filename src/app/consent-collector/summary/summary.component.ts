import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as forge from 'node-forge';
import { hextob64, KJUR, pemtohex } from 'jsrsasign';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
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
  // KJUR = require('jsrsasign');
  newcms1dmp: any;
  newcms1: any;
  parsedInfo: any;
  sigval: any;
  cades_t_1: any;
  cades_t_1dmp: any;
  pem: any;
  selectedkeyFileName: any;
  selectedCertFileName: any;
  selectedPfxFileName: any;

  constructor(public router: Router, private http: HttpClient) {}
  consentCollectorArtifactValue: any;
  inputFileValue: any;
  ngOnInit(): void {
    this.consentCollectorArtifactValue =
      localStorage.getItem('consentCollectorArtifactValue') != null
        ? JSON.parse(
            localStorage.getItem('consentCollectorArtifactValue') ?? ''
          )
        : null;
    if (this.consentCollectorArtifactValue === null) {
      this.router.navigate([`/consentcollector`]);
    }
    this.userConsent = localStorage.getItem('userConsent');
  }

  editDetails() {
    this.router.navigate([`/`]);
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

  delete(type: any) {
    if (type === 'pfx') {
      this.selectedPfxFileName = null;
      localStorage.removeItem('extractedCertificate');
      localStorage.removeItem('extractedPrivateKey');
      this.pfxFileInput.nativeElement.value = null;
    }

    if (type === 'key') {
      this.selectedkeyFileName = null;
      localStorage.removeItem('extractedPrivateKey');

      this.keyFileInput.nativeElement.value = null;
    }
    if (type === 'cert') {
      this.selectedCertFileName = null;
      localStorage.removeItem('extractedCertificate');
      this.certificateFileInput.nativeElement.value = null;
    }

    this.enableSign();
  }

  handleKeyFileSelect(event: any) {
    this.selectedPfxFileName = null;
    this.selectedkeyFileName = event.target.files[0].name;

    const selectedFile = event.target.files;
    if (!selectedFile) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event: any) => {
      // console.log(event.target);
      const privateKeyPEM = event.target.result;
      localStorage.setItem('extractedPrivateKey', privateKeyPEM);
      this.enableSign();
      // this.keyFile.nativeElement.innerText=this.keyFileInput.nativeElement.value.split('\\').pop();
    };

    reader.readAsText(selectedFile);
    return true;
  }

  enableSign() {
    if (
      localStorage.getItem('extractedCertificate') != null &&
      localStorage.getItem('extractedPrivateKey') != null
    ) {
      this.signEnabled = true;
    } else {
      this.signEnabled = false;
    }
  }

  handleCertFileSelect(event: any) {
    this.selectedPfxFileName = null;
    this.selectedCertFileName = event.target.files[0].name;

    const selectedFile = event.target.files;
    if (!selectedFile) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const certificatePEM = event.target.result;

      localStorage.setItem('extractedCertificate', certificatePEM);
      this.enableSign();
      // this.certificateFile.nativeElement.innerText=this.certificateFileInput.nativeElement.value.split('\\').pop();
    };

    reader.readAsText(selectedFile);
    return true;
  }

  handlePfxFileSelect(event: any) {
    this.selectedCertFileName = null;
    this.selectedkeyFileName = null;
    this.selectedPfxFileName = event.target.files[0].name;
    const selectedFile = event.target.files;
    // console.log('PFX : ' + event.target);
    if (!selectedFile) {
      return;
    }
    // this.pfxFile.nativeElement.innerText=this.pfxFileInput.nativeElement.value.split('\\').pop();
    this.uploadPfx(selectedFile);
  }

  uploadPfx(selectedFile: any) {
    //// console.log("FILEINPUT : "+selectedFile);

    if (selectedFile.length > 0) {
      const file: Blob = selectedFile[0];
      const reader = new FileReader();
      // console.log('EXTRACT CERTIFICATE TO BE CALLED' + typeof file);

      reader.onload = (event: any) => {
        const pfxData = new Uint8Array(event.target.result);
        this.extractCertificates(pfxData);
        // console.log('EXTRACT CERTIFICATE CALLED');
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please select a valid '.pfx' file");
    }
  }

  extractCertificates(pfxData: any) {
    let pemPrivateKey;
    // console.log('EXTRACT BEGIN');
    try {
      const password: any = prompt('Enter the password for the PKCS#12 file:');
      const p12Der: any = forge.util.createBuffer(pfxData);
      const p12Asn1: any = forge.asn1.fromDer(p12Der);
      const p12: any = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

      const certificateBags = p12.getBags({
        bagType: forge.pki.oids['certBag'],
      });
      // console.log(certificateBags);

      const certificates = certificateBags[forge.pki.oids['certBag']].map(
        (bag: any) => forge.pki.certificateToPem(bag.cert)
      );

      // console.log(certificates);
      const privateKeyBag = p12.getBags({
        bagType: forge.pki.oids['pkcs8ShroudedKeyBag'],
      });
      const privateKey =
        privateKeyBag[forge.pki.oids['pkcs8ShroudedKeyBag']][0].key;
      // console.log(privateKey);

      pemPrivateKey = forge.pki.privateKeyToPem(privateKey);
      // console.log(pemPrivateKey);

      // console.log('EXTRACT DONE');
      localStorage.setItem('extractedPrivateKey', pemPrivateKey);
      localStorage.setItem('extractedCertificate', certificates[0]);
      this.enableSign();
    } catch (error) {
      console.error('Error extracting certificates and private key:', error);
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
    const certificateFile = localStorage.getItem('extractedCertificate');
    const keyFile = localStorage.getItem('extractedPrivateKey');
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
    const certPEM = localStorage.getItem('extractedCertificate');
    const prvKeyPEM = localStorage.getItem('extractedPrivateKey');

    const paramOrg = {
      version: 1,
      hashalgs: ['sha256'],
      econtent: {
        type: 'data',
        content: {
          hex: '616161',
          alg: 'sha256',
          prov: 'cryptojs',
        },
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
                type: 'data',
              },
              {
                attr: 'messageDigest',
                hex: 'abcd',
              },
            ],
          },
          sigalg: 'SHA256withRSA',
          signkey: '',
        },
      ],
    };

    const param = JSON.parse(JSON.stringify(paramOrg));
    param.sinfos[0].id = { type: 'isssn', cert: certPEM };

    param.sinfos[0].signkey = prvKeyPEM;
    param.certs = [certPEM];
    const consentUuid = uuidv4();
    this.userConsent = JSON.parse(this.userConsent);
    const time = new Date(Date.now() - 1000).toISOString();
    let consentArtifact: any = {
      id: consentUuid,
      aip: 'mailto:' + this.userConsent.aipEmail,
      dataPrincipal: {
        id: this.userConsent.dpID,
        idType: 'PPB Number',
      },
      purposes: this.userConsent.purpose.map((purpose: any) => {
        return { code: purpose.item_id };
      }),
      itemId: this.userConsent.itemInp[0].item_id,
      itemType: this.userConsent.itemType[0].item_text
        .replaceAll(' ', '_')
        .toLowerCase(),
      expiry: new Date(this.userConsent.dateInput).toISOString(),
      createdAt: time,
      consentUseLogTo: 'https://consent.adex.iudx.io',
      dataAccessLogTo: 'https://gateway.adex.iudx.io',
    };

    if (this.userConsent.aiuEmail != '') {
      consentArtifact.aiu = 'mailto:' + this.userConsent.aiuEmail;
    }


    param.econtent.content = { str: JSON.stringify(consentArtifact) };

    const sattrs = param.sinfos[0].sattrs.array;

    sattrs.push({ attr: 'signingTime' });
    sattrs.push({ attr: 'signingCertificateV2', array: [certPEM] });
    const sd = new KJUR.asn1.cms.SignedData(param);

    const hCmsSignedData = sd.getContentInfoEncodedHex();
    let pem = KJUR.asn1.ASN1Util.getPEMStringFromHex(hCmsSignedData, 'CMS');

    const logUuid = uuidv4();
console.log(this.userConsent.activeTab);
    const logArtifact = {
      id: logUuid,
      timestamp: time,
      eventType: 'CONSENT_CREATED',
      logFrom:
        this.userConsent.activeTab === 1
          ? consentArtifact.aiu
          : consentArtifact.aip,
      itemId: consentArtifact.itemId,
      itemType: consentArtifact.itemType,
      artifact: hextob64(hCmsSignedData),
    };
	this.userConsent = JSON.stringify(this.userConsent);

    const paramLog = JSON.parse(JSON.stringify(paramOrg));
    paramLog.sinfos[0].id = { type: 'isssn', cert: certPEM };

    paramLog.sinfos[0].signkey = prvKeyPEM;
    paramLog.certs = [certPEM];
    paramLog.econtent.content = { str: JSON.stringify(logArtifact) };

    const sattrsLog = paramLog.sinfos[0].sattrs.array;

    sattrsLog.push({ attr: 'signingTime' });
    sattrsLog.push({ attr: 'signingCertificateV2', array: [certPEM] });
    const sdLog = new KJUR.asn1.cms.SignedData(paramLog);

    const hCmsSignedDataLog = sdLog.getContentInfoEncodedHex();
    let pemLog = KJUR.asn1.ASN1Util.getPEMStringFromHex(
      hCmsSignedDataLog,
      'CMS'
    );

    console.log(logArtifact);
    console.log(this.userConsent);

    const body = {
      consentArtifact: hextob64(hCmsSignedData),
      log: hextob64(hCmsSignedDataLog),
    };
    console.log(body);
    this.postConsentArtifact(body);
  }

  downloadCMS(pem: any) {
    const cmsContent = pem;
    const blob = new Blob([cmsContent], {
      type: 'application/octet-stream',
    });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'signed_document.cms';

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    localStorage.clear();
  }

  postConsentArtifact(body: any): void {
    const apiUrl = 'https://consent.adex.iudx.io/consent/artifacts';

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    this.http.post(apiUrl, body, { headers }).subscribe({
      next: (response) => console.log('Response:', response),
      error: (error) => console.error('Error:', error),
    });
  }
}
