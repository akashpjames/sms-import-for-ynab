# sms-import-for-ynab
Android app which parses bank messages that can then be synced with YNAB. Helpful for those who are not able to use the auto import feature from YNAB.

<img src="https://i.imgur.com/ahDfDoM.png">

### Where to find the apk?
Go the the [Releases](https://github.com/akashpjames/sms-import-for-ynab/releases) tab and get the latest apk from `Assets` section.

### How to use this app [video]?
Check this [Youtube video](https://www.youtube.com/watch?v=1PT1QhzM5Mg) for a small tutorial.

### How to use this app [detailed instructions, if you didn't like the video]?
1. Set Access Token
    - Go to `Settings` tab (last one) in the app
    - Click on `Get Access Token` link at the bottom
    - Log in with your YNAB credentials
        - Scroll down and click on `Developer Settings`
        - Click on `New Token`
        - Key in your password again & click on Generate
        - Copy the whole generated token.
    - Paste the generate token in `SMS to YNAB` app after tapping on the `Access Token` card in the `Settings` page.
    - Tap on `Set`. If the access token is valid, you can choose budget now.
2. Choose your desired budget by tapping on the `Budget` card from `Settings` tab.
3. Accounts will be automatically updated now. `Accounts` card will display the number of accounts available in the selected budget.
4. Generate Template for incoming SMS
    - Go to the `Templates` tab (middle one).
    - Click on the `+` icon at the right bottom.
    - Choose the message type you want to parse. You will be navigated to `Configure Template` screen
        - Trigger: Select a unique text from this message which will act as the trigger. This text will be searched in the new messages to check whether it needs to be parsed or not. If the trigger phrase doesn't match, it will not try to parse the message.
        - Price: Choose the price text. Do not include anything other than the numbers. If it is like `spent USD14.00` in the message, select only `14.00`
        - Date: Choose the date text. There will be three options after selecting date text. Don't select options containing 'NaN' in them(I have to fix them :/). 'NaN' comes when the code is unable to fetch the appropriate date. In that case, use `Auto Fetch` option. It will ignore the selected date from text and use the SMS received date to send the data. It is always safe to use `Auto Fetch` option.
        - Memo: Choose the text which indicates where you have spend the money. Make sure you are not selecting any leading or trailing space.
        - Ignore: Use this to select text which are varying in every message. For instance, if the bank is notifying you about available balance or time in which the transaction is being carried out, choose them to ignore. Anything which is not static and is of no value to us should be ignored.
        - Give the template a name, choose the account and mark it as expense/income.
        - Finally click on `Generate Template`.
5. Wait for a new message to come with the trigger phrase in its content(For testing you can send a message to yourself and click on sync button).
6. Tap on the sync button from the home tab.
7. Voila! Your new message will be parsed and sent to YNAB.
8. Check Status
    - `SUCCESS` - Green on the right side of the card
    - `ERROR` - Red on the right side of the card
        - Tap on the failed message card to see error details
        - Create a [new issue](https://github.com/akashpjames/sms-import-for-ynab/issues/new/choose) if you think it needs to be fixed.
        
### How to debug in browser?
    npm install;
    ionic serve;

### How to debug in android?
- Enable USB debugging in your device
- Connect your android device
- Run this command: `ionic cordova run android`
