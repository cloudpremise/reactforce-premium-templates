import { LightningElement, track, api } from 'lwc';
import premiumAll from '@salesforce/resourceUrl/premiumAll';
import callInternalApi from '@salesforce/apex/premiumAllCtrl.callInternalApi';
import callSampleInternalApi from '@salesforce/apex/premiumAllCtrl.callSampleInternalApi';
import login from '@salesforce/apex/premiumAllCtrl.login';
import registerUser from '@salesforce/apex/premiumAllCtrl.registerUser';
import saveAttachment from '@salesforce/apex/premiumAllCtrl.saveAttachment';
import saveContentVersion from '@salesforce/apex/premiumAllCtrl.saveContentVersion';
import getContentVersion from '@salesforce/apex/premiumAllCtrl.getContentVersion';
import getAttachment from '@salesforce/apex/premiumAllCtrl.getAttachment';
import emailLogin from '@salesforce/apex/premiumAllCtrl.emailLogin';
import registerUserEmail from '@salesforce/apex/premiumAllCtrl.registerUserEmail';
import createLead from '@salesforce/apex/premiumAllCtrl.createLead';
import getSessionId from '@salesforce/apex/premiumAllCtrl.getSessionId';

export default class Reactforce extends LightningElement {
    @track reactAppUrl;
    @track channel;
    @track iframe;
    @track sessionId;
    @api bundleDomain;
    @api page;

    async connectedCallback() {
        try{
            this.sessionId = await getSessionId();
            if(this.page.length <= 0){
                this.page = "home";
            }
            var queryString = '?'+'chunkResources='+premiumAll+'&cssResources='+premiumAll+'&page='+this.page;
            // Load the React app URL from the Static Resource
            if(this.bundleDomain.length > 0){
                this.reactAppUrl = this.bundleDomain + "/" + queryString;
            }else{
                this.reactAppUrl = premiumAll + '/index.html' + queryString + '&landingResources='+premiumAll;
            }

            this.channel = new MessageChannel();
            this.channel.port1.onmessage = this.handleMessage.bind(this);
        }catch(e){ console.log("error", e.message); }
    }
    handleIframeLoad(evt){
        if(typeof(this.channel) === "undefined" || typeof(this.channel.port2) === "undefined"){
            return;
        }
        var payload = {
            action: "containerSystemMessage",
            sessionId: this.sessionId,
            params: [{
                name: "establishMessageChannel",
                value: "1"
            }]
        }
        this.iframe = evt.target;
        // this.iframe.onmessage = this.handleMessage.bind(this);
        this.iframe.contentWindow.postMessage(JSON.stringify(payload), "*", [this.channel.port2]);        
    }
    handleMessage(evt){
        // if(evt.data.source === 'react-devtools-content-script'){
        //     return;
        // }
        var eventData = JSON.parse(evt.data);
        var args = eventData.arguments;
        var payload = args.payload;
        if(payload.hasOwnProperty("action") && payload.action === "resize"){
            console.log("v.containerHeight", payload.size.height);
            return;
        }
        var callbackId = payload.callbackId;
        var actionName = "callInternalApi";
        if(payload.hasOwnProperty("action")){
            actionName = payload.action;
        }
        
        try{
            var port1 = this.channel.port1;
            var method = this.findMethod(actionName);
            method(payload.params).then((result) => {
                port1.postMessage(JSON.stringify({ //Send message to react app with data and callback id so that actual callback function is triggered.
                    action: "containerUserMessage",
                    params: [{
                        data: result,
                        callbackId: callbackId
                    }]
                }));
            }).catch(err => {
                console.log("Catch Error", err);
            });
        }catch(e){ console.log("error", e.message); }
    }
    findMethod(actionName){
        var method = callInternalApi;
        switch(actionName){
            case 'callSampleInternalApi':
                method = callSampleInternalApi;
                break;
            case 'login':
                method = login;
                break;
            case 'registerUser':
                method = registerUser;
                break;
            case 'saveAttachment':
                method = saveAttachment;
                break;
            case 'saveContentVersion':
                method = saveContentVersion;
                break;
            case 'getContentVersion':
                method = getContentVersion;
                break;
            case 'getAttachment':
                method = getAttachment;
                break;
            case 'emailLogin':
                method = emailLogin;
                break;
            case 'registerUserEmail':
                method = registerUserEmail;
                break;
            case 'createLead':
                method = createLead;
                break;
            default:
                break;
        }
        return method;
    }
}