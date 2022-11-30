import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import {AuthService} from 'src/app/services/auth.service';

@Component({
  selector: 'app-loginscreen',
  templateUrl: './loginscreen.page.html',
  styleUrls: ['./loginscreen.page.scss'],
})
export class LoginscreenPage implements OnInit {

  validationUserMessage={
    email:[
      {type:'required', message:'Por favor entre com seu Email'},
      {type:'pattern', message:'O email inserido está incorreto.'},
    ],
    password:[
      {type:'required', message:'Por favor entre com sua senha'},
      {type:'minlength', message:'A senha inserida precisa ter no mínimo 8 caracteres.'},
    ],
  };

  validationFormUser: FormGroup;
  private path = '/users';

  // eslint-disable-next-line max-len
  constructor(public formBuilder: FormBuilder, public authService: AuthService, private router: Router, private nav: NavController, private alertCtrl: AlertController, private afDB: AngularFireDatabase) { }

  ngOnInit() {
    this.validationFormUser = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(8)
      ]))
    });
  }

  loginUser(value){
    try {
      this.authService.loginFireAuth(value).then(
        resp =>{
          console.log(resp);
          this.authService.setUser({
            username : resp.user.displayName,
            uid: resp.user.uid
          });
          this.router.navigate(['tabs']);
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  registerUser(){
    this.nav.navigateForward('singup');
  }

  loginGoogle(){
    try{
      this.authService.loginWithGoogle().then(
        resp =>{
          const ref = this.afDB.list(this.path);
          if (resp.key) {
            ref.update(resp.user.uid, {
              displayName: resp.names,
              email: resp.email,
              numeroCartao: resp.numeroCartao,
              cpf: resp.cpf,
              password: resp.password,
              uid: resp.user.uid,
              isStudent: false,
            });

          } else {
            ref.update(resp.user.uid, {
              displayName: resp.names,
              email: resp.email,
              numeroCartao: resp.numeroCartao,
              cpf: resp.cpf,
              password: resp.password,
              uid: resp.user.uid,
              isStudent: false,
            });
          console.log(resp);
          this.authService.setUser({
            username : resp.user.displayName,
            uid: resp.user.uid
          });
          this.router.navigate(['tabs']);
          }
        },
        error =>{
          console.log(error);
        }
      );
    }
    catch (error) {
      console.log(error);
    }
  }

  async resetPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Entre com seu email para resetar sua senha',
      inputs: [
        {
          placeholder: 'Email',
          name: 'email',
          type: 'text'
        },
      ],
      buttons: [
        {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
                console.log('Confirm Cancel');
            }
        },
        {
            text: 'Ok',
            handler: (data) => {
              this.serviceResetPassword(data);
          }
        }
    ]
    });

    await alert.present();
  }

  serviceResetPassword(value){
    try {
      this.authService.resetEmailPassword(value).then(
        resp =>{
          console.log(resp);
          this.alertConfirmReset();
        },
        error =>{
          console.log(error);
          this.alertResetFailed(error.message);
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  async alertConfirmReset() {
    const alert = await this.alertCtrl.create({
      header: 'Verifique seu email para resetar sua senha.',
      buttons: [
        {
            text: 'Ok',
        }
      ]
    });
    await alert.present();
  }

  async alertResetFailed(value) {
    const alert = await this.alertCtrl.create({
      header: value,
      buttons: [
        {
            text: 'Ok',
        }
      ]
    });
    await alert.present();
  }
}
