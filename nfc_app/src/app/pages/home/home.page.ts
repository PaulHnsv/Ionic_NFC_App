/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable space-before-function-paren */
/* eslint-disable max-len */
/* eslint-disable no-bitwise */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-trailing-spaces */
/* eslint-disable object-shorthand */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { Ndef, NFC } from '@ionic-native/nfc/ngx';
import firebase from 'firebase/compat/app';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';

declare var paypal: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  presentingElement = undefined;
  cifrao: any = 'R$';

  price;
  tickets;
  valor;
  enviroment;
  payPalConfig: any;
  PAYPAL_CLIENT_ID_TEST =
    'AWxmH9te5kyuWyZx0nrW-A4-ZfczqzedhNsAjl7NGCaWSuvS1VF8kUWT_GxObaPm-JLn1cSrFf1ztUa1';
  PAYPAL_CLIENT_ID_LIVE = 'YOURLIVEKEY';
  PAYPAL_CLIENT_ID = this.PAYPAL_CLIENT_ID_TEST;
  readerMode$: any;

  email: any;
  displayName: any;
  isStudent: any;
  numeroCartao: any;
  user: any;
  paypal: any;
  saldo: number;
  integracao: boolean;
  messageCancelar = 'Cancelar recarga?';
  messageRecarga: 'Confirme a operação';
  

  private path = '/users';
  ref = this.afDB.list(this.path);
  valorPassagem: number;

  constructor(
    private afDB: AngularFireDatabase,
    private authservice: AuthService,
    private actionSheetCtrl: ActionSheetController,
    private nfc: NFC,
    private ndef: Ndef,
    private alertCtrl: AlertController
  ) {

    firebase.auth().onAuthStateChanged((user) => {
      console.log('AUTH_USER', user);
      if (user) {
        afDB
          .object(`/users/${authservice.getUID()}`)
          .snapshotChanges()
          .subscribe((action) => {
            console.log(action.payload.val());
            this.user = action.payload.val();
            this.email = this.user.email;
            this.numeroCartao = this.user.numeroCartao;
            this.isStudent = this.user.isStudent;
            this.displayName = this.user.displayName;
            this.saldo = this.user.saldo;
            this.integracao = this.user.habilitaIntegracao;
            this.valorPassagem = this.isStudent ? 2.2 : 4.4;
          });
      }
    });
  }

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');

    const flags = this.nfc.FLAG_READER_NFC_A | this.nfc.FLAG_READER_NFC_V;
    this.readerMode$ = this.nfc.readerMode(flags).subscribe(
      (tag) => this.pagamento(JSON.stringify(tag)),
      (err) => this.errorPayment(err)
    );

    this.price = this.valor + ' $';
    this.enviroment = '';
    if (this.PAYPAL_CLIENT_ID === this.PAYPAL_CLIENT_ID_TEST) {
      this.enviroment = 'sandbox';
    } else {
      this.enviroment = 'live';
    }

    paypal
      .Buttons({
        env: this.enviroment,
        client: {
          sandbox: this.PAYPAL_CLIENT_ID,
        },
        style: {
          layout: 'horizontal',
          color: 'black',
          shape: 'pill',
          label: 'paypal',
          tagline: false,
        },
        commit: false,
        createOrder: (data, actions) =>
          actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: this.valor,
                  currency: 'BRL',
                },
              },
            ],
          }),
        // Finalize the transaction
        onApprove: (data, actions) =>
          //console.log(data)
          //console.log(actions)
          actions.order
            .capture()
            .then((details) => {
              // Show a success message to the buyer
              console.log(details);
              const status = details.status;
              const id = details.id;
              if (status === 'COMPLETED') {
                this.validPurchase(status);
              } else {
                //Status not completed...
              }
              console.log(
                'Transaction completed by ' +
                  details.payer.name.given_name +
                  '!'
              );
            })
            .catch((err) => {
              console.log(err);
              // deal with error
            }),
        onError: (err) => {
          // Show an error page here, when an error occurs
          console.log(err);
          // deal with error
        },
      })
      .render('#paypal-button');
  }

  ngOnDestroy() {
    // Do something on page destroy
  }

  canDismiss = async (message: string) => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: message,
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

  async pagamento(data) {
    var listaOnibus: any[];
    var integracaoOnibusMetro = false;
    var valorPassagem;

    if(this.saldo >= this.valorPassagem){
      if (this.user.isStudent) {
        valorPassagem = this.saldo - this.valorPassagem;
        this.saldo = valorPassagem;
        this.saldo.toFixed(2);
      }
      else if (!this.user.isStudent){
        if(data.identificador === 1 && !this.integracao){
          valorPassagem = this.saldo - this.valorPassagem;
          this.saldo = valorPassagem;
          this.saldo.toFixed(2);
          this.integracao = true;
          integracaoOnibusMetro = true;
          listaOnibus.push(data.indicadorSecundario);
        }
        else if(data.identificador === 1 && this.integracao){
          if(listaOnibus.includes(data.indicadorSecundario)){
            valorPassagem = this.saldo - this.valorPassagem;
            this.saldo = valorPassagem;
            this.saldo.toFixed(2);
            this.integracao = false;
          }
          else if(integracaoOnibusMetro){
            valorPassagem = this.saldo - 3.25;
            this.saldo = valorPassagem;
            this.saldo.toFixed(2);
            integracaoOnibusMetro = false;
          }
          else{
            listaOnibus.push(data.indicadorSecundario);
          }
        }
        else if(data.identificador === 2 && !this.integracao){
          valorPassagem = this.saldo - this.valorPassagem;
          this.saldo = valorPassagem;
          this.saldo.toFixed(2);
          this.integracao = true;
          integracaoOnibusMetro = true;
        }
        else if(data.identificador === 2 && this.integracao && integracaoOnibusMetro){
          valorPassagem = this.saldo - 3.25;
          this.saldo = valorPassagem;
          this.saldo.toFixed(2);
          integracaoOnibusMetro = false;
        }
      }
  
      this.ref.update(this.authservice.getUID(), {
        saldo: this.saldo,
        habilitaIntegracao: this.integracao === true ? false : true,
      });
      const alert = await this.alertCtrl.create({
        header: `Pagamento realizado com sucesso. A tarifa paga foi de: ${valorPassagem} e seu novo saldo é de: ${this.saldo}`,
        buttons: [
          {
            text: 'Ok',
            role: 'confirm',
            handler: () => {
            }
          }
        ]
      });
      await alert.present();
    }
    else{
      const alert = await this.alertCtrl.create({
        header: `Seu saldo é insuficiente para realizar esta transação, por favor, tente novamente após realizar a recarga.`,
        buttons: [
          {
            text: 'Ok',
            role: 'confirm',
            handler: () => {
            }
          }
        ]
      });
      await alert.present();
    }
  }

  validPurchase(details) {
    console.log(details);
    this.ref.update(this.authservice.getUID(), {
      saldo: Number(this.valor) + this.saldo,
    });
    this.valor = 0;
  }

  errorPayment(error) {}

  setValorCarregado() {
    this.valor = this.tickets * this.valorPassagem;
    this.valor = this.valor.toFixed(2);
    console.log(this.valor);
  }

}
