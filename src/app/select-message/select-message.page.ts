import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController } from '@ionic/angular';
import { CommonService } from '../services/common.service';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';

declare var SMS: any;

@Component({
  selector: 'app-select-message',
  templateUrl: './select-message.page.html',
  styleUrls: ['./select-message.page.scss']
})

export class SelectMessagePage implements OnInit {

  params: any;
    public retrievedMessages: any = [];
    private options: { box: string; indexFrom: number; maxCount: number };

  constructor( public navCtrl: NavController, private commonService: CommonService,
               public androidPermissions: AndroidPermissions, public actionSheetController: ActionSheetController
             ) {


  }

  ngOnInit() {
      this.checkPermissionAndSync();
  }

    goBack() {
        this.navCtrl.navigateBack('tabs/tab2');
    }

    checkPermissionAndSync() {
        this.options = { box : 'inbox', indexFrom : 0, maxCount : 10};
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_SMS).then(
            success => {
                this.ReadSMSList(this.options);
            },
            err => {
                this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_SMS).
                then((success) => {
                        this.ReadSMSList(this.options);
                    },
                    (err) => {
                        console.error(err);
                    });
            });
    }

    ReadSMSList(options) {
        if (SMS) {
            SMS.listSMS(options, (ListSms) => {
                    for (const message of ListSms) {
                        this.retrievedMessages.push(message);
                    }
                },
                error => {
                    alert(JSON.stringify(error));
                });
        }
    }

    loadMore() {
      this.options.indexFrom = this.options.indexFrom + 10;
      this.ReadSMSList(this.options);
    }

    async presentActionSheet(data) {
        const actionSheet = await this.actionSheetController.create({
            buttons: [{
                text: 'Choose',
                role: 'destructive',
                icon: 'done-all',
                handler: () => {
                    this.commonService.set(data);
                    this.navCtrl.navigateForward('/configure-template');
                }
            }]
        });
        await actionSheet.present();
    }
}
