import { Component} from '@angular/core';
import { Storage } from '@ionic/storage';
import { LoadingController, AlertController} from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { CommonService } from '../services/common.service';
// import { Queue } from './queue';


declare var require: any;
const reverseMustache = require('reverse-mustache');


declare var SMS: any;

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

    mykeys: any;
    messages: any = [];
    watchedMessages: any = [];
    templateToUse = '';
    templates: any = [];
    private timeToUpdate: any;
    expense: any = false;
    public syncedMessages: any = [];
    private syncedMessagesToPush: any = [];
    private messagesParsed: any;
    private responseRecvd: any;
    public showMeMessages: any;
    public showbuttons: any;
    private headers: { Authorization: string };
    private parsedMessagesTotal: number;
    public totalSyncs: number;

    constructor(private storage: Storage,
                public commonService: CommonService,
                public androidPermissions: AndroidPermissions,
                private http: HTTP,
                private loadingController: LoadingController,
                public alertController: AlertController
    ) {
        this.mykeys = [];
        this.messagesParsed = 0;
        this.responseRecvd = 0;
        this.showMeMessages = false;
        this.showbuttons = false;

        // document.addEventListener('onSMSArrive', (e) => {
        //     this.storage.get('messages').then((val) => {
        //         if (val === null) {
        //             this.messages = [];
        //         } else {
        //             this.messages = JSON.parse(val);
        //         }
        //         this.messages.push((<any>e).data.body);
        //         this.storage.set('messages', JSON.stringify(this.messages));
        //
        //     });
        //     console.log(e);
        // });
    }

    ngOnInit() {
        this.storage.get('totalSyncs').then((val) => {
            if (val === null) {
                this.totalSyncs = 0;
            } else {
                this.totalSyncs = val;
            }
        });

        this.storage.get('syncedMessages').then((val) => {
            if (val === null) {
                this.syncedMessages = [];
            } else {
                this.syncedMessages = JSON.parse(val);
            }
        });

        this.storage.get('apiToken').then((val) => {
            if (val != null) {
                this.headers = {
                    'Authorization': `Bearer ${val}`
                };
            } else {
                this.commonService.createToast('Access Token not available');
            }
        });
    }

    clearTemplates() {
        this.storage.clear().then(() => {
            this.commonService.createToast('All templates have been cleared');
        });
    }

    showConfig() {
        this.showbuttons = !this.showbuttons;
    }

    showAllKeys() {
        this.storage.forEach( (value, key) => {
            const obj = {
                key: key,
                value: value
            };
            this.mykeys.push(obj);
        });
    }

    deleteKey(data) {
        this.storage.remove(data.key);
    }

    async checkConnection(){
        const loading = await this.loadingController.create({
        });
        loading.present().then(() => {
            this.http.get(`https://api.youneedabudget.com/v1/budgets`, {}, {}).then(data => {
                //There won't be any success as we are not passing headers here
            }).catch(error => {
                if(error.status === 0)
                    this.commonService.createToast('Please check if internet is available or not');
                else
                    this.checkPermissionAndSync();
                loading.dismiss();
            });
        });
    }


    checkPermissionAndSync() {
        this.messages = [];
        this.parsedMessagesTotal = 0;
        const options = { box : 'inbox', indexFrom : 0, maxCount : 10};
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_SMS).then(
            success => {
                if (!success.hasPermission) {
                    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_SMS).
                    then((success) => {
                            this.ReadSMSList(options);
                        },
                        (err) => {
                            console.error(err);
                        });
                }
                this.ReadSMSList(options);
            },
            err => {
                this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_SMS).
                then((success) => {
                        this.ReadSMSList(options);
                    },
                    (err) => {
                        console.error(err);
                    });
            });
    }

    ReadSMSList(options) {
        this.storage.get('templates').then((val) => {
            if (val != null && val != '[]') {
                this.templates = JSON.parse(val);
                if (SMS) {
                    SMS.listSMS(options, (ListSms) => {
                            if (options.indexFrom === 0 && ListSms[0] && ListSms[0].date) {
                                this.timeToUpdate = new Date().getTime();
                            }
                            this.storage.get('lastUpdate').then((val) => {
                                // if (val != null) {
                                // Checking whether the 10th sms from the ListSMS is newer than the time we have in db
                                if (ListSms.length && ListSms[ListSms.length - 1].date > val) {
                                    this.messages = this.messages.concat(ListSms);
                                    this.ReadSMSList({box: 'inbox', indexFrom: (options.indexFrom + 10), maxCount: 10});
                                } else {
                                    // TODO see whether it creates duplicate messages
                                    // Finding those messages which are newer from the ListSMS and concating it with this.messages
                                    this.messages = this.messages.concat(ListSms.filter(x => x.date > val));
                                    this.storage.set('lastUpdate', this.timeToUpdate);
                                    if (this.messages.length === 0){
                                        this.commonService.createToast('No new messages with trigger phrase found');
                                    }
                                    for (const mess of this.messages) {
                                        /* TODO see whether the promise returned from this.parseSMS can be used
                                        for loading.dismiss(), this.responseRecvd++; */
                                        this.parsedMessagesTotal++;
                                        this.parseSMS(mess.body, mess.date);
                                    }
                                }
                                // }
                                // else {
                                //     // Setting up the message for the first time
                                //     this.messages = this.messages.concat(ListSms);
                                //     this.storage.set('lastUpdate', this.timeToUpdate);
                                //     for (const mess of this.messages) {
                                //         this.fetchData(mess.body);
                                //     }
                                // }
                            });
                        },
                        error => {
                            alert(JSON.stringify(error));
                        });
                }
            } else {
                this.commonService.createToast('No templates found');
            }
        });
    }

    // testParse() {
    //     this.fetchData('Hello! Your A/c no. 646776 has been debited by Rs. 142.56 on 12Feb19. Info: UPI/P2M/905216316474/000187200018251. Call 18605005555 (if in India) if you have not done this transaction.');
    // }

    // fetchData(smsToParse) {
    //     //TODO don't call this storage here. It should be part of READSMS. Read sms only if there are templates.
    //     // this.storage.get('templates').then((val) => {
    //         this.parseSMS(smsToParse);
    //     // });
    // }

    doRefresh(event) {
        this.checkPermissionAndSync();
        setTimeout(() => {
            event.target.complete();
        }, 500);
    }

    async parseSMS(smsToParse, smsDate) {
        if (this.templates && this.templates.length) {
            for (const x of this.templates) {
                if (smsToParse.includes(x['phrase'])) {
                    this.messagesParsed ++;
                    const payload = reverseMustache({
                        template:  x['template'],
                        content: smsToParse
                    });
                    if (payload === null) {
                        const body = {
                            'transaction': {
                                'account_id': null,
                                'amount': null,
                                'date': null,
                                'cleared': null,
                                'memo': null
                            }
                        };
                        const data = null;
                        const err = {
                            status: null,
                            error: `Trigger word matched. But template couldn't parse the data.`
                        };
                        this.updateSyncedMessages(body, smsToParse, {msg: data, state: 'error', resp: err}, x.accountName);
                    } else {
                        payload.type =  x['type'];
                        payload.account =  x['account'];
                        payload.date = new Date(payload.date);
                        if(x.dateType !== 'autoFetch') {
                            var year = new Date(payload.date).getFullYear();
                            //Handling messages with date like 28 Feb instead of 28 Feb 2019
                            if (year === 2001) {
                                payload.date.setFullYear(new Date().getFullYear());
                                year = new Date(payload.date).getFullYear();
                            }
                            var month = new Date(payload.date).getMonth() + 1;
                            var date = new Date(payload.date).getDate();
                        }
                        let requiredDate = '';
                        if (x.dateType === 'firstType') {
                            requiredDate = `${year}-${month}-${date}`;
                        } else if (x.dateType === 'secondType'){
                            requiredDate = `${year}-${date}-${month}`;
                        } else {
                            let messageDate = new Date(smsDate);
                            requiredDate = `${messageDate.getFullYear()}-${messageDate.getMonth()+1}-${messageDate.getDate()}`;
                        }
                        payload.price = payload.price.replace(',','');
                        payload.price = payload.price * 1000;
                        if (x['type'] === 'expense') {
                            payload.price = payload.price * -1;
                        }

                        const body = {
                            'transaction': {
                                'account_id': payload.account,
                                'amount': payload.price,
                                'date': requiredDate,
                                'cleared': 'Uncleared',
                                'memo': `${payload.memo}`
                            }
                        };

                        console.log(payload);
                        const budgetID = x.budgetID;
                        this.http.setDataSerializer('json');
                        // todo get takes time
                        if (!this.headers) {
                            this.storage.get('apiToken').then((val) => {
                                if (val != null) {
                                    this.headers = {
                                        'Authorization': `Bearer ${val}`
                                    };
                                    this.callPostRequest(budgetID, body, smsToParse, x.accountName);
                                } else {
                                    this.commonService.createToast('Access Token not available');
                                }
                            });
                        } else {
                            this.callPostRequest(budgetID, body, smsToParse, x.accountName);
                            // this.http.post(`https://api.youneedabudget.com/v1/budgets/${budgetID}/transactions`, body, this.headers)
                            //     .then(data => {
                            //         console.log(`Succesfully message data parsed and sent to YNAB`);
                            //         this.responseRecvd++;
                            //         this.updateSyncedMessages(body, smsToParse, {msg: data, state: 'success', resp: data}, x['accountName']);
                            //     })
                            //     .catch(err => {
                            //         this.responseRecvd++;
                            //         console.log(`#########Failed for this body`);
                            //         console.log(body);
                            //         console.error(err);
                            //         console.log('**************')
                            //         this.updateSyncedMessages(body, smsToParse, {msg: err, state: 'error', resp: err}, x['accountName']);
                            //     });
                        }
                    }

                } else if ( this.messages.length === this.parsedMessagesTotal) {
                    if (this.messagesParsed === 0) {
                        this.commonService.createToast('No new messages with trigger phrase found');
                    }
                }
            }
        }
    }

    callPostRequest(id, body, smsToParse, accountName) {
        this.http.post(`https://api.youneedabudget.com/v1/budgets/${id}/transactions`, body, this.headers)
            .then(data => {
                console.log(`Succesfully message data parsed and sent to YNAB`);
                this.updateSyncedMessages(body, smsToParse, {msg: data, state: 'success', resp: data}, accountName);
            })
            .catch(err => {
                console.log(`#########Failed for this body`);
                console.log(body);
                console.error(err);
                console.log('**************')
                this.updateSyncedMessages(body, smsToParse, {msg: err, state: 'error', resp: err}, accountName);
            });
    }

    async updateSyncedMessages(data, message, status, accountName ) {
        this.totalSyncs++;
        this.responseRecvd++;
        data.transaction.state = status.state;
        data.transaction.response = status.resp;
        message = message.substring(0, 137);
        message = `${message}...`
        data.transaction.message = message;
        data.transaction.accountName = accountName;
        this.syncedMessagesToPush.push(data);
        if (this.messagesParsed === this.responseRecvd) {
            const loading = await this.loadingController.create({});
            loading.present().then(() => {
                // this.storage.get('syncedMessages').then((val) => {
                // if (val === null) {
                //     this.syncedMessages = [];
                // } else {
                //     this.syncedMessages = JSON.parse(val);
                // }

                // Making sure that this.syncedMessages has only 20 messages in it
                for (const x of this.syncedMessagesToPush){
                    if (this.syncedMessages.length === 20) {
                        this.syncedMessages.shift();
                    }
                    this.syncedMessages.push(x);
                }
                this.storage.set('syncedMessages', JSON.stringify(this.syncedMessages)).then(x => {
                    this.syncedMessagesToPush = [];
                    loading.dismiss();
                   //  // TODO add class for new messages
                   // for ( let i = (this.syncedMessages.length - 1), j = 0; j < this.syncedMessagesToPush.length; j++, i--) {
                   //     this.syncedMessages[i].new = 'true';
                   // }
                });
                this.storage.set('totalSyncs', this.totalSyncs);
            });
            this.messagesParsed = this.responseRecvd = 0;
        }
    }

    async messageStatus(data) {
        if (data.state === 'error') {
            const alert = await this.alertController.create({
                header: 'Server Response',
                subHeader: `Error code: ${data.response.status}`,
                message: data.response.error,
                buttons: ['OK']
            });
            await alert.present();
        }
    }

    clearMessages() {
        this.messages = [];
        this.syncedMessages = [];
    }

    showMessages() {
        this.showMeMessages = !this.showMeMessages;
    }

    updateLastTime() {
        const date = new Date();
        date.setDate(date.getDate() - 2);
        this.storage.set('lastUpdate', date);
    }

    showSMS() {
        this.storage.get('messages').then((val) => {
            if (val === null) {
                this.watchedMessages = [];
            } else {
                this.watchedMessages = JSON.parse(val);
            }
        });
    }
}
