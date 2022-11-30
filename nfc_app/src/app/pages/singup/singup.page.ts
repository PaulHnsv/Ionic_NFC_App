/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/naming-convention */
import { Router } from '@angular/router';

import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import {
  AlertController,
  LoadingController,
  NavController,
} from '@ionic/angular';

import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-singup',
  templateUrl: './singup.page.html',
  styleUrls: ['./singup.page.scss'],
})
export class SingupPage implements OnInit {
  validationMessages = {
    names: [
      { type: 'required', message: 'Por favor entre com seu nome completo' },
    ],
    numeroCartao: [
      {type: 'required', message: 'Por favor entre com o número do seu bilhete'},
      {type: 'minlength', message: 'O número inserido precisa ter no mínimo 8 caracteres.'}
    ],
    cpf: [
      {type: 'required', message: 'Por favor entre com o número do seu cpf'},
      {type: 'minlength', message: 'O cpf inserido precisa ter no mínimo 11 caracteres.'}
    ],
    email: [
      { type: 'required', message: 'Por favor entre com seu Email' },
      { type: 'pattern', message: 'O email inserido está incorreto.' },
    ],
    password: [
      { type: 'required', message: 'Por favor entre com sua Senha' },
      {type: 'minlength', message: 'A senha inserida precisa ter no mínimo 8 caracteres.'},
    ],
  };

  student: boolean;
  numeroCartao: any;
  ValidationFormUser: FormGroup;
  private path = '/users';

  constructor(
    public formBuilder: FormBuilder,
    public authService: AuthService,
    private alertCtrl: AlertController,
    public loadingController: LoadingController,
    private router: Router,
    private nav: NavController,
    private afDB: AngularFireDatabase
  ) {}

  ngOnInit() {
    this.ValidationFormUser = this.formBuilder.group({
      names: new FormControl('', Validators.compose([Validators.required])),
      numeroCartao: new FormControl(
        '',
        Validators.compose([Validators.required, Validators.minLength(9)])
      ),
      cpf: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(11),
        ])
      ),
      email: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])
      ),
      password: new FormControl(
        '',
        Validators.compose([Validators.required, Validators.minLength(8)])
      ),
    });
  }

  registerUser(value) {
    this.showAlert();
    try {
      this.authService.userRegistration(value).then(
        (response) => {
          console.log(response);
          // eslint-disable-next-line radix
          this.numeroCartao = parseInt(value.numeroCartao);
          this.student = this.numeroCartao  % 2  === 0 ? true : false;
          const ref = this.afDB.list(this.path);
            ref.update(response.user.uid, {
              displayName: value.names,
              email: value.email,
              numeroCartao: this.numeroCartao,
              cpf: value.cpf,
              password: value.password,
              uid: response.user.uid,
              isStudent: this.student,
              saldo: 0,
              habilitaIntegracao: false
            });
            this.loadingController.dismiss();
            this.router.navigate(['loginscreen']);
        },
        (error) => {
          this.loadingController.dismiss();
          this.errorLoading(error.message);
        }
      );
    } catch (erro) {
      console.log(erro);
    }
  }

  async showAlert() {
    var load = await this.loadingController.create({
      message: 'Por favor espere...',
    });
    await load.present();
  }

  async errorLoading(response: any) {
    const loading = await this.alertCtrl.create({
      header: 'Erro ao registrar usuário',
      message: response,
      buttons: [
        {
          text: 'ok',
          handler: () => {
            this.nav.navigateBack(['singup']);
          },
        },
      ],
    });
    await loading.present();
  }
}
