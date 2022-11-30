/* eslint-disable @typescript-eslint/naming-convention */

import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  email: any;
  displayName: any;
  isStudent: any;
  numeroCartao: any;
  user: any;
  image: any;
  paypal: any;
  cartao: string;
  saldo: any;

  constructor(private database: AngularFirestore, private authservice: AuthService, private afDB: AngularFireDatabase) {

    firebase.auth().onAuthStateChanged(user => {
      console.log('AUTH_USER', user);
      if (user) {
        afDB.object(`/users/${authservice.getUID()}`).snapshotChanges().subscribe(action => {
          console.log(action.payload.val());
          this.user = action.payload.val();
          this.email = this.user.email;
          this.numeroCartao = this.user.numeroCartao;
          this.isStudent = this.user.isStudent;
          this.displayName = this.user.displayName;
          this.saldo = this.user.saldo;
          if(this.isStudent){
            this.cartao = 'Bilhete Estudante';
            this.image = 'assets/images/estudante-antigo.jpg';
          }
          else{
            this.cartao = 'Bilhete Comum';
            this.image = 'assets/images/comum.jpg';
          }
        });
      }
    });
   }

  ngOnInit() {
  }
}
