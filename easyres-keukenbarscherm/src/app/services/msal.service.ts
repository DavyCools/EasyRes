import { Injectable } from '@angular/core';
import * as Msal from 'msal';
import { UserService, IUitbater } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MsalService {

  constructor(private userService: UserService, private router: Router) { }

  B2CTodoAccessTokenKey = 'b2c.access.token';

  uitbater: IUitbater;

  tenantConfig = {
    domain: 'https://EasyRes.b2clogin.com/tfp/EasyRes.onmicrosoft.com/',
    // Replace this with your client id
    clientID: 'a7005270-8e75-4608-9329-c5639a815ca5',
    signInPolicy: 'B2C_1_signin',
    signUpPolicy: 'B2C_1_signup',
    resetPasswordPolicy: 'B2C_1_resetpassword',
    editProfilePolicy: 'B2C_1_editprofile',
    redirectUri: 'https://easyres-keukenbarscherm.azurewebsites.net',
    b2cScopes: ['https://EasyRes.onmicrosoft.com/access-api/user_impersonation']
  };

  // Configure the authority for Azure AD B2C
  authority = this.tenantConfig.domain + this.tenantConfig.signInPolicy;

  /*
   * B2C SignIn SignUp Policy Configuration
   */
  clientApplication = new Msal.UserAgentApplication(
    this.tenantConfig.clientID, this.authority,
    function (errorDesc: any, token: any, error: any, tokenType: any) {
    },
    {
      validateAuthority: false
    }
  );


  public login(): void {
    this.clientApplication.authority = this.tenantConfig.domain + this.tenantConfig.signInPolicy;
    this.authenticate();
  }

  public signup(): void {
    this.clientApplication.authority = this.tenantConfig.domain + this.tenantConfig.signUpPolicy;
    this.authenticate();
  }

  public resetPassword(): void {
    this.clientApplication.authority = this.tenantConfig.domain + this.tenantConfig.resetPasswordPolicy;
    this.authenticate();
  }

  public editProfile(): void {
    this.clientApplication.authority = this.tenantConfig.domain + this.tenantConfig.editProfilePolicy;
    this.authenticate();
  }

  public authenticate(): void {
    const THIS = this;
    this.clientApplication.loginPopup(this.tenantConfig.b2cScopes).then(function (idToken: any) {
      THIS.clientApplication.acquireTokenSilent(THIS.tenantConfig.b2cScopes).then(
        function (accessToken: any) {
          THIS.saveAccessTokenToCache(accessToken);
        }, function (error: any) {
          THIS.clientApplication.acquireTokenPopup(THIS.tenantConfig.b2cScopes).then(
            function (accessToken: any) {
              THIS.saveAccessTokenToCache(accessToken);
            }, function (error: any) {
              console.log('error: ', error);
            });
        });
    }, function (errorDesc: any) {
      console.log('error: ', errorDesc);
      if (errorDesc.indexOf('AADB2C90118') > -1) {
        THIS.resetPassword();
      } else if (errorDesc.indexOf('AADB2C90077') > -1) {
        // Expired Token
        THIS.logout();
      }
    });
  }

  saveAccessTokenToCache(accessToken: string) {
    sessionStorage.setItem(this.B2CTodoAccessTokenKey, accessToken);
    if (this.isNew()) {
      this.userService.saveUserInDb(this.getUserObjectId()).subscribe();
    }
    this.isUitbater();
  }

  logout(): void {
    this.clientApplication.logout();
  }

  getUser() {
    return this.clientApplication.getUser();
  }

  isLoggedIn(): boolean {
    return this.clientApplication.getUser() != null;
  }

  isNew() {
    if (this.getUser().idToken['newUser']) {
      return true;
    }
    return false;
  }

  isUitbater() {
    this.userService.isuitbater(this.getUserObjectId()).subscribe(res =>{
      this.uitbater = res;
      if (this.uitbater.restaurantId === 0) {
        this.router.navigate(['/norestaurant']);
      }
    },
    err => {
      this.router.navigate(['/nouitbater']);
    });
  }

  getUserObjectId() {
    return this.getUser().idToken['oid'];
  }

  getUserFirstName() {
    return this.getUser().idToken['given_name'];
  }

  getUserFamilyName() {
    return this.getUser().idToken['family_name'];
  }

  getUserEmail(): string {
    return this.getUser().idToken['emails'][0];
  }
}

