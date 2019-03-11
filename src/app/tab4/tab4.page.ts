import {Component, OnInit} from '@angular/core';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import { CommonService } from '../services/common.service';


@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})

export class Tab4Page implements OnInit {
    private apiToken: string;
    private budget: string;
    private headers: { Authorization: string };
    private budgets: any;
    private budgetID: any;
    public display = {
        apiToken : '',
        budget: '',
        numAccounts: 0
    };
    private parsedAccounts: any;
    constructor(private storage: Storage, private http: HTTP,
                public alertController: AlertController, private commonService: CommonService,
                private loadingController: LoadingController) {}

    ngOnInit() {
        this.storage.get('apiToken').then((val) => {
            if (val != null) {
                this.apiToken = val;
                this.display.apiToken = `xxxxxxx-${this.apiToken.substr(-6)}`;
                this.headers = {
                    'Authorization': `Bearer ${val}`
                };
                this.getCurrentBudget();
            } else {
                this.commonService.createToast('Access Token not available');
            }
        });
    }

    getAccountDetails() {
        this.storage.get('accounts').then((val) => {
            if (val != null) {
                this.display.numAccounts = (JSON.parse(val)).length;
            } else {
                this.commonService.createToast('Account details not available');
            }
        });
    }

    getCurrentBudget() {
        this.storage.get('budgetID').then((val) => {
            if (val != null) {
                this.display.budget = (JSON.parse(val)).name;
                this.budgetID = (JSON.parse(val)).id;
                this.getStoredBudgets();
                this.getAccountDetails();
            } else {
                this.commonService.createToast('Budget information not available');
            }
        });
    }

    getStoredBudgets() {
        this.storage.get('budgets').then((val) => {
            if (val != null) {
                this.budgets = JSON.parse(val);
            } else {
                this.updateBudgets();
            }
        });
    }

    doRefresh(event) {
        this.updateBudgets();
        this.updateAccounts();
        setTimeout(() => {
            console.log('Refresh operation has ended');
            event.target.complete();
        }, 500);
    }

    updateAccounts() {
        this.http.get(`https://api.youneedabudget.com/v1/budgets/${this.budgetID}`, {}, this.headers).then(data => {
            this.parsedAccounts = JSON.parse(data.data).data.budget.accounts;
            this.storage.set('accounts', JSON.stringify(this.parsedAccounts));
            this.display.numAccounts = this.parsedAccounts.length;
            this.commonService.createToast('Accounts updated successfully');
        }).catch(error => {
                console.log(error.error);
            });

    }

    async updateBudgets() {
        const loading = await this.loadingController.create({});
        loading.present().then(() => {
            this.http.get(`https://api.youneedabudget.com/v1/budgets/`, {}, this.headers).then(data => {
                this.budgets = JSON.parse(data.data).data.budgets;
                this.storage.set('budgets', JSON.stringify(this.budgets));
                this.commonService.createToast('Budgets updated successfully');
                loading.dismiss();
            }).catch(error => {
                if(error.status === 401)
                    this.commonService.createToast('Add a valid Access token');
                loading.dismiss();
            });
        });
    }

    paypalLink() {
        window.open('https://www.paypal.me/akashjames');
    }

    async updateAPI() {
        const alert = await this.alertController.create({
            header: 'Set your Access Token',
            inputs: [
                {
                    name: 'api',
                    type: 'text',
                    placeholder: 'Paste your Access Token'
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        console.log('Confirm Cancel');
                    }
                }, {
                    text: 'Set',
                    handler: (data) => {
                        this.apiToken = data.api;
                        this.headers = {
                            'Authorization': `Bearer ${this.apiToken}`
                        };
                        this.storage.set('apiToken', this.apiToken);
                        this.commonService.createToast('Access Token has been set');
                        this.display.apiToken = `xxxxxxx-${this.apiToken.substr(-6)}`;
                        this.updateBudgets();
                    }
                }
            ]
        });

        await alert.present();
}

    async setBudget() {
        const budgetInputs = [];
        for ( const x of this.budgets) {
            budgetInputs.push({type: 'radio', label: x.name, value: `${x.name} || ${x.id}`});
        }

        const alert = await this.alertController.create({
            header: 'Choose Budget',
            inputs: budgetInputs,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        console.log('Confirm Cancel');
                    }
                }, {
                    text: 'Ok',
                    handler: (data) => {
                        this.commonService.createToast('Budget has been set');
                        const budgetInfo = {
                            id: data.split(' || ')[1],
                            name: data.split(' || ')[0]
                        };
                        this.storage.set('budgetID', JSON.stringify(budgetInfo));
                        this.budgetID = budgetInfo.id;
                        this.display.budget = budgetInfo.name;
                        this.updateAccounts();
                    }
                }
            ]
        });

        await alert.present();
    }

}

