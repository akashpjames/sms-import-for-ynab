import {Component, OnInit} from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, ActionSheetController } from '@ionic/angular';
import { CommonService } from '../services/common.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';


let headers: any;
// let budgetID: any;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

    message: string;
    gotMessage: any;
    selectedText: string;
    text: string;
    price: string;
    generated: string;
    date: string;
    memo: string;
    account: string;
    templateName: string;
    dynamic: any;
    // private accounts: any;
    private templates: any[];
    public availableTemplates: any = [];

    constructor(private storage: Storage,
                private commonService: CommonService,
                public navCtrl: NavController,
                public actionSheetController: ActionSheetController,
                public androidPermissions: AndroidPermissions) {
        this.templateName = '';
        this.message = '';
        this.gotMessage = false;
        this.selectedText = '';
        this.text = '';
        this.price = '';
        this.generated = '';
        this.date = '';
        this.memo = '';
        this.dynamic = [];
    }

    deleteTemplate(item) {
        this.availableTemplates = this.availableTemplates.filter(x => x.name !== item.name);
        this.storage.set('templates', JSON.stringify(this.availableTemplates));
    }

    doRefresh(event) {
        this.updateAvailableTemplates(event);
        // setTimeout(() => {
        //     console.log('Updating accounts');
        //     event.target.complete();
        // }, 500);
    }

    async presentActionSheet(data) {
        const actionSheet = await this.actionSheetController.create({
            buttons: [{
                text: 'Delete',
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                    this.deleteTemplate(data);
                    this.commonService.createToast('Template Deleted');
                }
            }]
        });
        await actionSheet.present();
    }

    selectMessage() {
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_SMS).then(
            success => {
                if (!success.hasPermission) {
                    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_SMS).
                    then(() => {
                            this.navCtrl.navigateForward('/select-message');
                        },
                        (err) => {
                            console.error(err);
                        });
                } else {
                    this.navCtrl.navigateForward('/select-message');
                }
            },
            err => {
                this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_SMS).
                then((success) => {
                        this.navCtrl.navigateForward('/select-message');
                    },
                    (error) => {
                        console.error(error);
                    });
            });
    }

    // updateAccounts() {
    //     this.storage.get('accounts').then((val) => {
    //         if (val === null) {
    //             this.platform.ready().then((readySource) => {
    //                 this.http.get(`https://api.youneedabudget.com/v1/budgets/${budgetID}`, {}, headers).then(data => {
    //                     const parsedAccounts = JSON.parse(data.data).data.budget.accounts;
    //                     this.storage.set('accounts', JSON.stringify(parsedAccounts));
    //                 })
    //                     .catch(error => {
    //                         console.log(error.error); // error message as string
    //                     });
    //             });
    //         } else {
    //             this.accounts = JSON.parse(val);
    //         }
    //     });
    // }

    ngOnInit() {

        this.storage.get('apiToken').then((val) => {
            if (val === null) {
                this.commonService.createToast('Access Token not available');
            } else {
                const apiToken = val;
                headers = {
                    'Authorization': `Bearer ${apiToken}`
                };
            }
        });

        // this.storage.get('budgetID').then((val) => {
        //     if (val === null) {
        //         this.commonService.createToast('Set Budget in Settings');
        //     } else {
        //         budgetID = val;
        //     }
        // });
        // this.updateAccounts();

        this.updateAvailableTemplates(null);

    }

    updateAvailableTemplates(e) {
        this.storage.get('templates').then((val) => {
            if (e) {
                e.target.complete();
            }
            if (val != null) {
                this.availableTemplates = JSON.parse(val);
            }
        });
    }

}


