import { Component, OnInit,} from '@angular/core';
import { ActionSheetController,} from '@ionic/angular';
import { PayPal, PayPalPayment, PayPalConfiguration, PayPalPaymentDetails } from '@ionic-native/paypal/ngx';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  presentingElement = undefined;

  constructor(private actionSheetCtrl: ActionSheetController, private payPal: PayPal) {

  }

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
  }
 
  canDismiss = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Você tem certeza?',
      buttons: [
        {
          text: 'Sim',
          role: 'confirm',
        },
        {
          text: 'Não',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    return role === 'confirm';
  };

  comprar(){
    this.payPal.init({
      PayPalEnvironmentSandbox: 'AWxmH9te5kyuWyZx0nrW-A4-ZfczqzedhNsAjl7NGCaWSuvS1VF8kUWT_GxObaPm-JLn1cSrFf1ztUa1',
      PayPalEnvironmentProduction: ''
    }).then(() => {
      this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
        rememberUser: true,
        acceptCreditCards: true,
        languageOrLocale: 'pt-BR',
        merchantName: 'SPTrans'
      })).then(() => {
        let detail = new PayPalPaymentDetails('4.30', '0.00', '0.00');
        let payment = new PayPalPayment('4.30', 'BRL', 'SPTrans', 'Sale', detail);
        this.payPal.renderSinglePaymentUI(payment).then(
        (response) => {
          console.log('Pagamento Realizado', response)
        }, 
        () => {
          console.log('erro ao renderizar o pagamento do paypal');
        })
      })
    })
  }

}
