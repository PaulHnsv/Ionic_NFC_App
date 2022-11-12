import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

export  interface UserPro{
  username: string;
  uid: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user : UserPro;

  constructor(public auth: AngularFireAuth) { }

  loginFireAuth(value){
    return new Promise<any> ((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(value.email, value.password).then(
        res => resolve(res),
        error => reject(error)
      )
    })
  }

  userRegistration(value){
    return new Promise<any> ((resolve, reject) =>{
      firebase.auth().createUserWithEmailAndPassword(value.email, value.password).then(
        res => resolve(res),
        error => reject(error)
      )
    })
  }

  loginWithGoogle() {   
    return new Promise<any> ((resolve, reject) => {
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/plus.login');
      firebase.auth().signInWithPopup(provider).then(
        res => resolve(res),
        error => reject(error)
      )
    })
  }

  resetEmailPassword(value){
    return new Promise<any> ((resolve, reject) => {
      var auth = firebase.auth();
      var emailAddress = value.email;
      auth.sendPasswordResetEmail(emailAddress).then(
        res => resolve(res),
        error => reject(error)
      )
    })
  }

  getUID(): string{
    return this.user.uid;
  }

  setUser(user: UserPro){
    return this.user = user;
  }
}
