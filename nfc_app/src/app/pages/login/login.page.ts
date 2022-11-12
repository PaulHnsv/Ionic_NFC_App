import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(public authService: AuthService, private router: Router, private nav: NavController) { }

  ngOnInit() {
  }

  goToLoginpage(){
    this.nav.navigateForward(['loginscreen'])
  }

  registerUser(){
    this.nav.navigateForward('singup')
  }

  loginGoogle(){
    try{
      this.authService.loginWithGoogle().then(
        resp =>{
          console.log(resp);
          this.router.navigate(['tabs']);
        }
      )
    }
    catch (error) {
      console.log(error);
    }
  }
}
