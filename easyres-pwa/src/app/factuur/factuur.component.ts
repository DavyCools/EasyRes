import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MsalService } from '../services/msal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FactuurService } from '../services/factuur.service';
import { IFactuur } from '../services/common.service';
import { staticViewQueryIds } from '@angular/compiler';
import { FacturenComponent } from '../facturen/facturen.component';
import { Action } from 'rxjs/internal/scheduler/Action';
import { async } from 'q';
import { ActionSequence } from 'protractor';

//declare var paypal;

@Component({
  selector: 'app-factuur',
  templateUrl: './factuur.component.html',
  styleUrls: ['./factuur.component.scss']
})
export class FactuurComponent implements OnInit {

  //@ViewChild('paypal', { static: true }) FacturenComponent: ElementRef;

  constructor(private msalService: MsalService, private route: ActivatedRoute, private factuurService: FactuurService, private router: Router) { }

  UserId: string;
  TafelNr: number;
  RestaurantId: number;
  factuurLoading: boolean = true;
  factuurFailed: boolean = false;
  factuur: IFactuur;
  
  Facturen: IFactuur[];
  BetaaldList: IFactuur[];
  NietBetaaldList: IFactuur[];

  seconden: number = 10;

  ngOnInit() {
    this.TafelNr = Number(this.route.snapshot.paramMap.get('TafelNr'));
    this.RestaurantId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.msalService.isLoggedIn()) {
      this.GetUserObjectId();
      this.GenerateFactuur();
      this.loadStripe();
    }
    /*
    paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: this.factuur.id,
                amount: {
                  currency_code: 'USD',
                  Value: this.factuur.totaalPrijs
                }
              }
            ]

          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          this.factuur.betaald = true;
        },
        onError: err => {
          console.log(err);
          console.log(this.factuur.totaalPrijs);
        }

      })
      .render(this.FacturenComponent.nativeElement);*/
  }

  loadStripe() {
    if(!window.document.getElementById('stripe-script')) {
      var s = window.document.createElement("script");
      s.id = "stripe-script";
      s.type = "text/javascript";
      s.src = "https://checkout.stripe.com/checkout.js";
      window.document.body.appendChild(s);
    }
}
interval;
pay(amount) {
  var handler = (<any>window).StripeCheckout.configure({
    key: 'pk_test_0RlhLI3CtX2sYzCZFlVBNwIm00P6N37NJh',
    locale: 'auto',
    token: (token: any) => {
      // You can access the token ID with `token.id`.
      // Get the token ID to your server-side code for use.
      //console.log(token)
      this.factuur.betaald = true;
      this.factuurService.UpdateFactuur(this.factuur).subscribe();
      this.interval = setInterval(() => {
        this.RedirectFacturen(); 
        }, 1000);
    }
  });

  handler.open({
    name: 'EasyRes Factuur',
    description: this.factuur.restaurant.naam,
    amount: amount * 100,
    currency: "eur",
  });

}
  RedirectFacturen(){
    if(this.seconden <= 1){
      this.router.navigate(['/facturen']);
      this.seconden = 10;
      clearInterval(this.interval);
    }
    else{
      this.seconden--;
    }
  }

  GetUserObjectId() {
    this.UserId = this.msalService.getUserObjectId();
  }

  GenerateFactuur() {
    this.factuurFailed = false;
    this.factuurLoading = true;
    this.factuurService.GenerateFactuur(this.UserId, this.RestaurantId, this.msalService.getUserEmail()).subscribe(
      res => {
        this.GetFactuur();
      },
      err => {
        this.factuurFailed = true;
        this.factuurLoading = false;
      },
      () => { });
  }

  GetFactuur() {
    this.factuurService.GetFactuur(this.UserId, this.RestaurantId).subscribe(res => {
      this.factuur = res;
      this.factuurLoading = false;
    });
  }

  Checklist() {
    this.BetaaldList = [];
    this.NietBetaaldList = [];

    this.Facturen.forEach(element => {
      if (element.betaald) {
        this.BetaaldList.push(element);
      }
      else if (element.betaald == false) {
        this.NietBetaaldList.push(element);
      }
    });
  }

}