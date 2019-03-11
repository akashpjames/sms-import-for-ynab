import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


@Injectable()

export class CommonService {
    private message: any;

    constructor(private storage: Storage,
                public toastController: ToastController,
                private http: HTTP,
                private loadingController: LoadingController) {}

    set(message) {
        this.message = message;
    }

    clear() {
        this.message = '';
    }

    get() {
        return this.message;
    }

    createToast(message) {
        const toast = this.toastController.create({
            message: message,
            color: 'dark',
            duration: 1500,
            position: 'top'
        });
        toast.then((x) => {
            x.present();
        });
    }

    getHeaders() {
        this.storage.get('apiToken').then((val) => {
            if (val != null) {
                return {'Authorization': `Bearer ${val}`};
            } else {
                this.createToast('Access Token not available');
                return null;
            }
        });
    }

    // getBudgetID() {
    //     return Promise (resolve, reject){
    //         this.storage.get('budgetID').then((val) => {
    //             if (val != null) {
    //                 resolve JSON.parse(val).id;
    //             } else {
    //                 this.createToast('Please update budget');
    //                 resolve null;
    //             }
    //         });
    //     }
    // }

    getDateAsText(date, type){
        date = new Date(date);
        var year = date.getFullYear();
        if (year === 2001) {
            date.setFullYear(new Date().getFullYear());
            year = date.getFullYear();
        }
        var month = date.getMonth();
        var datey = date.getDate();

        if(type === 'first')
            return `${datey}-${monthNames[month]}-${year}`;
        else
            return `${month + 1}-${monthNames[datey - 1]}-${year}`;
    }
    //
    // await updateAccounts(budgetID, headers) {
    //     const loading = await this.loadingController.create({});
    //     loading.present().then(() => {
    //         this.http.get(`https://api.youneedabudget.com/v1/budgets/${budgetID}`, {}, headers).then(data => {
    //             const parsedAccounts = JSON.parse(data.data).data.budget.accounts;
    //             this.storage.set('accounts', JSON.stringify(parsedAccounts));
    //             this.createToast('Accounts updated successfully');
    //             loading.dismiss();
    //             return parsedAccounts.length;
    //         }).catch(error => {
    //             loading.dismiss();
    //             console.log(error.error);
    //         });
    //     });
    // }

}