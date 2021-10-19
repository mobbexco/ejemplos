import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';

import Mobbex from '@mobbex/sdk';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public mobbexIntentToken: string;
  public detectedInstallments: any[] = [];


  public cardNumber: string;
  public cardholderName: string;
  public cardholderIdentification: string;
  public cardExp: string;
  public cardSecurityCode: string;

  public selectedInstallment: string;

  private detectDefer: any;


  constructor(public loadingController: LoadingController) { }

  async ngOnInit() {
    this.mobbexIntentToken = 'token generado del lado servidor';

    Mobbex.setPublicKey('tu public key');
    Mobbex.card.init(this.mobbexIntentToken);
  }

  onChangeCardNumber(cn: string) {
    // Do not detect if length is < 6
    if (cn && cn.length >= 6) {
      // Create a Defer to avoid calling mobbex hundred of times
      if (!!this.detectDefer) {
        clearTimeout(this.detectDefer);
      }

      this.detectDefer = setTimeout(async () => {
        // Execute Mobbex Card Detec
        const { result, data } = await Mobbex.card.detect(cn.substring(0, 6), {
          installments: true
        });

        console.info(data);

        this.detectedInstallments = data.installments;
      }, 100);
    }
  }

  onChangeCardExp(value: string) {
    console.info(value);

    const dateRegex = /^(0[1-9]|1[0-2])\/(\d{2})$/;
    const dateParts: string[] = value.split('\/');
    const curDate = new Date();

    if (value.length < 5) {
      // this.onError && this.onError({ type: "expiration", error: "EXPIRATION:INCOMPLETE_DATE" });
      console.info('INCOMPLETE_DATE');
    } else if (!dateRegex.test(value)) {
      // this.onError && this.onError({ type: "expiration", error: "EXPIRATION:INVALID_DATE" });
      console.log('INVALID_DATE');
    } else {
      const month = dateParts[0];
      const year = dateParts[1];

      // Valdate if its expired
      const curMonth = curDate.getMonth(),
        curYear = curDate.getFullYear();

      if (parseInt(`20${year}`) <= curYear || parseInt(month) < (curMonth + 1) && parseInt(`20${year}`) <= curYear) {
        // this.onError && this.onError({ type: "expiration", error: "EXPIRATION:EXPIRED" });
        console.log('EXPIRED');
      } else {
        // Just keep it because is OK
        console.info('DATE OK');
      }
    }
  }

  public async onPaymentClicked($event) {
    const loading = await this.loadingController.create({ message: 'Procesando...' });
    await loading.present();

    try {

      const exp = this.cardExp.split('\/');

      // Create Card Temporary Token
      const token = await Mobbex.card.createToken({
        card: {
          number: this.cardNumber,
          month: exp[0],
          year: exp[1],
          name: this.cardholderName,
          identification: this.cardholderIdentification,
          securityCode: this.cardSecurityCode
        }
      });

      if (!token || token.result === false || !token.data) {
        loading.dismiss();
        // this.onError && this.onError({ type: "operation", error: token.error });
        console.error('Token Failed', token.error);
        return;
      }

      // Process the Transaction on Mobbex
      const response = await Mobbex.operation.process({
        intentToken: this.mobbexIntentToken,
        source: token.data.token,
        installment: this.selectedInstallment,
      });

      // Save on Wallet
      // const response = await Mobbex.operation.process({
      //   intentToken: this.mobbexIntentToken,
      //   source: token.data.token,
      //   installment: this.selectedInstallment,
      //   wallet: true
      // });

      // Change Source on Subscription
      // const subsResponse = await Mobbex.subscription.changeSource({
      //   subscription: "",
      //   subscriber: "",
      //   priority: "primary"
      // }, tokenResponse.data.token);

      loading.dismiss();

      if (response.result === false && response.error) {
        // this.onError && this.onError({ type: "operation", error: response.error });
        console.error(response.error);

        return;
      }

    } catch (e) {
      loading.dismiss();
    }
  }
}
