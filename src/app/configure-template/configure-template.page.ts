import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, AlertController} from '@ionic/angular';
import { CommonService } from '../services/common.service';
import { HTTP } from '@ionic-native/http/ngx';


@Component({
    selector: 'app-configure-template',
    templateUrl: './configure-template.page.html',
    styleUrls: ['./configure-template.page.scss']
})
export class ConfigureTemplatePage implements OnInit {
    public selectedMsg: any;
    public accounts: any;
    gotMessage: any;
    selectedText: string;
    text: string;
    price: string;
    generated: string;
    date: string;
    memo: string;
    account: any;
    templateName: string;
    dynamic: any;
    private templates: any[];
    private availableTemplates: any;
    public phrase: any;
    public expenseType: any;
    private dateType: string;
    private budgetID: any;
    private headers: any;

    constructor(public navCtrl: NavController,
                private commonService: CommonService,
                private storage: Storage,
                public alertController: AlertController,
                private http: HTTP) {
        this.templateName = '';
        this.gotMessage = false;
        this.selectedText = '';
        this.text = '';
        this.price = '';
        this.generated = '';
        this.date = '';
        this.memo = '';
        this.dynamic = [];
    }

    ngOnInit() {
        this.selectedMsg = this.commonService.get();

        this.storage.get('accounts').then((val) => {
            if (val === null) {
                this.commonService.createToast('Update accounts from settings');
                //this.updateAccounts(null);
            } else {
                this.accounts = JSON.parse(val);
            }
        });

        this.storage.get('budgetID').then((val) => {
                        if (val != null) {
                            this.budgetID = JSON.parse(val).id;
                        } else {
                            this.budgetID = null;
                            this.commonService.createToast('Please update budget');
                        }
                    });

        // this.headers = this.commonService.getHeaders();
        // this.commonService.getBudgetID().then(x => this.budgetID = x);
    }

    goBack() {
        this.navCtrl.navigateBack('/select-message');
    }

    doRefresh(event) {
        //this.updateAccounts(event);
    }

    updateAccounts(e) {
        if (this.budgetID === null || this.headers === null) {
            this.commonService.createToast('Access token or Budget is not set');
        } else {
            this.http.get(`https://api.youneedabudget.com/v1/budgets/${this.budgetID}`, {}, this.headers).then(data => {
                const parsedAccounts = JSON.parse(data.data).data.budget.accounts;
                this.accounts = parsedAccounts;
                this.commonService.createToast('Accounts updated');
                this.storage.set('accounts', JSON.stringify(parsedAccounts));
                if (e) {
                    e.target.complete();
                }
            })
                .catch(error => {
                    this.commonService.createToast('Error updating accounts');
                    console.log(error.error); // error message as string
                    if (e) {
                        e.target.complete();
                    }
                });
        }
    }

    async checkDate(date) {
        const firstDate = this.commonService.getDateAsText(date, 'first');
        const secondDate = this.commonService.getDateAsText(date, 'second');

        const alert = await this.alertController.create({
            header: 'Choose correct date',
            inputs: [     {
                type: 'radio',
                label: firstDate,
                value: 'firstType',
                checked: true
            }, {
                type: 'radio',
                label: secondDate,
                value: 'secondType'
            }, {
                type: 'radio',
                label: 'Auto Fetch',
                value: 'autoFetch'
            }],
            buttons: [
                {
                    text: 'Ok',
                    handler: (data) => {
                        this.dateType = data;
                    }
                }
            ]
        });

        await alert.present();

    }

    showSelectedText() {
        if (window.getSelection) {
            this.text = window.getSelection().toString();
        }
    }

    setPrice() {
        this.showSelectedText();
        if (this.text.length) {
            this.price = this.text;
            window.getSelection().empty();
        } else {
            this.commonService.createToast('Price not set. Select text and click on button');
        }
    }

    setDate() {
        this.showSelectedText();
        if (this.text.length) {
            this.checkDate(this.text);
            this.date = this.text;
            window.getSelection().empty();
        } else {
            this.commonService.createToast('Date not set. Select text and click on button');
        }
    }

    setMemo() {
        this.showSelectedText();
        if (this.text.length) {
            this.memo = this.text;
            window.getSelection().empty();
        } else {
            this.commonService.createToast('Memo not set. Select text and click on button');
        }
    }

    setPhrase() {
        this.showSelectedText();
        if (this.text.length) {

            this.phrase = this.text;
            this.storage.get('templates').then((val) => {
                if (val === null) {
                    this.templates = [];
                } else {
                    this.templates = JSON.parse(val);
                }
                this.templates[this.templates.length] = {'phrase': this.phrase};
                this.storage.set('templates', JSON.stringify(this.templates));
            });
            window.getSelection().empty();
        } else {
            this.commonService.createToast('Unique text not set. Select text and click on button');
        }
    }

    setAdditional() {
        this.showSelectedText();
        if (this.text.length) {
            this.dynamic.push(this.text);
            window.getSelection().empty();
        } else {
            this.commonService.createToast('Variable text not set. Select text and click on button');
        }
    }

    generateTemplate() {
        // This will create the `lastUpdate` entry if it is not there. So, if at least one template exists => `lastUpdate` variable is available
        this.checkAndUpdateLastTime();

        if (this.budgetID === null) {
            this.commonService.createToast('Budget is not set');
        } else {
            if (this.price.length && this.phrase.length && this.date.length && this.templateName.length && this.account.id.length && this.expenseType.length) {
                this.generated = this.selectedMsg.replace(this.price, '{{price}}');
                this.generated = this.generated.replace(this.memo, '{{memo}}');
                this.generated = this.generated.replace(this.date, '{{date}}');
                for (let i = 0; i < this.dynamic.length; i++) {
                    const text = `{{variable${i}}}`;
                    this.generated = this.generated.replace(this.dynamic[i], text);
                }
                const details = {
                    phrase: this.phrase,
                    name: this.templateName,
                    account: this.account.id,
                    type: this.expenseType,
                    template: this.generated,
                    dateType: this.dateType,
                    accountName: this.account.name,
                    budgetID: this.budgetID};

                this.storage.get('templates').then((val) => {
                    // Here templates won't be null. So no need of null check. Because identifier as phrase would be there for sure.
                    this.templates = JSON.parse(val);
                    this.templates[this.templates.length - 1] = details;
                    this.storage.set('templates', JSON.stringify(this.templates));
                    this.availableTemplates = this.templates;
                });

                this.commonService.createToast('Template has been generated');
                this.navCtrl.navigateBack('/tabs/tab2');
            }
        }

    }

    checkAndUpdateLastTime() {
        this.storage.get('lastUpdate').then((val) => {
            if (val == null) {
                this.storage.set('lastUpdate', new Date().getTime());
            }
        });
    }

}
