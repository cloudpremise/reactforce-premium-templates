import React from "react";
import { CometD } from "cometd";
import Button from '@salesforce/design-system-react/components/button';
import apexAdapter from "../ApexAdapter";
import { getSessionId } from "../ApexAdapter";
import  { Navigate } from 'react-router-dom';

let sessionId = getSessionId();
const cometdUrl = window.location.protocol + "//" + window.location.hostname + "/cometd/52.0/";
const cometd = new CometD();
cometd.websocketEnabled = false;

class StreamingApi extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            actions: [],
            connected: false,
            status: "Initialized",
            topic: "Push_Contact",
            subscribedTopic: "",
            messages: []
        };
    }
    componentDidMount(){
        const sessionId = getSessionId();
        cometd.configure({
            url: cometdUrl,
            requestHeaders: {
                "Authorization": "OAuth " + sessionId
            },
            appendMessageTypeToURL: false
        });

        cometd.addListener("/meta/handshake", (data) => this.onEvent(data));
        cometd.addListener("/meta/connect", (data) => {
            this.onEvent(data, () => {
                this.subscribeTopic(this.state.topic);
            });
        });
        cometd.addListener("/meta/unsuccessful", (data) => this.onEvent(data));
        cometd.addListener("/meta/disconnect", (data) => {
            this.onEvent(data, () => {
                cometd.handshake();
            });
        });
        cometd.addListener("/meta/subscribe", (data) => this.onEvent(data));
        cometd.addListener("/meta/unsubscribe", (data) => this.onEvent(data));
        cometd.handshake();
    }
    componentWillUnmount(){
        cometd.disconnect();
    }
    onEvent(action, callback = null){
        const { actions } = this.state;
        let connected = this.state.connected;
        if(!connected || action.channel !== "/meta/connect"){
            actions.push(action);
        }
        if(callback === null){
            callback = () => {};
        }

        let status = this.state.status;
        if(action.channel === "/meta/handshake"){
            status = "Handshake Successful";
        }else if(!connected && action.channel === "/meta/connect"){
            status = "Connected";
            connected = true;
        }else if(action.channel === "/meta/disconnect"){
            status = "Disconnected";
        }
        this.setState({
            actions: actions,
            connected: connected,
            status: status
        }, callback);
    }
    subscribeTopic(topic){
        if(this.state.subscribedTopic === topic){
            return;
        }
        cometd.subscribe("/topic/"+topic, (data) => {
            this.onEvent(data);
            if(data.data.event.type === "created"){
                this.getMessageDetails(data);
            }
        });
        this.setState({
            subscribedTopic: topic
        })
    }
    getMessageDetails(action){
        const params = {
            "sObjectTypeName": "Contact",
            'id': action.data.sobject.Id
        };

        let headers = {};
        let method = 'GET';
        let route = '/v1/sobject';
        apexAdapter(method, route, {}, params, headers, (result, event) =>{
            const response = JSON.parse(result);
			const data = response.result;
            const { actions, messages } = this.state;
            messages.push(data[0]);
            actions.push({
                channel: "/topic/Contact",
                data: data
            })
            this.setState({
                actions: actions,
                messages: messages
            })
        });
    }
    getActionHeading(action){
        let heading = "";
        switch(action.channel){
            case "/meta/handshake":
                heading = "Handshake Successful";
                break;
            case "/meta/unsuccessful":
                heading = "Handshake Unsuccessful";
                break;
            case "/meta/connect":
                heading = "Connection Established";
                break;
            case "/meta/disconnect":
                heading = "Disconnected";
                break;
            case "/meta/subscribe":
                heading = "Subscribed to "+action.subscription;
                break;
            case "/meta/unsubscribe":
                heading = "Unsubscribed to "+action.subscription;
                break;
            case "/topic/Contact":
                heading = "Message Received From: "+action.channel;
                break;
            case "/topic/SMS":
                heading = "Message Received";
                break;
            case "PushTopic":
                heading = "PushTopic Created";
                break;
            default:
                break;
        }
        return heading;
    }
    renderActions(){
        const { actions } = this.state;
        let html = [];
        for(let i = (actions.length - 1); i >= 0; i--){
            const action = actions[i];
            let heading = this.getActionHeading(action);
            if (action.id !== undefined) {
                heading = action.id + ". " + heading;
            }
            html.push(
                <div className="std" key={i}>
                    <span className="heading">{heading}</span><br/>
                    <span className="body">
                        <pre>
                            {JSON.stringify(action,null,2)}
                        </pre>
                    </span>
                </div>
            )
        }
        return html;
    }
    onTopicChange(event){
        this.setState({
            topic: event.target.value
        });
    }
    createTopic(){
        const { actions } = this.state;
        const data = {
            sObject: {
                attributes: {
                    "type":"PushTopic"
                },
                "Name": "Push_Contact",
                "Query": "SELECT Id, FirstName, LastName FROM Contact",
                "ApiVersion": 58.0,
                "NotifyForOperationCreate": true,
                "NotifyForOperationUpdate": true,
                "NotifyForOperationUndelete": true,
                "NotifyForOperationDelete": true,
                "NotifyForFields": "All",
            }
        };

        let headers = {};
        let method = 'POST';
        let route = '/v1/sobject';
        apexAdapter(method, route, data, {}, headers, (result, event) =>{
            const response = JSON.parse(result);
			const data = response.result;
            data['id'] = data.Id;
            data['channel'] = 'PushTopic';
            actions.push(data);
            this.setState({
                actions: actions,
            });
        });
    }

    render(){
        const { topic, subscribedTopic, status } = this.state;
        sessionId = getSessionId();
        if(typeof(sessionId) === "string" && sessionId.length <= 0){
            return <Navigate to="/home" />
        }
        return (
            <div className="cTextMessageComponent">
                <div className="">
                    <div className="slds-grid slds-gutters">
                        <div className="slds-col">
                            <div className="slds-form-element">
                                <label className="slds-form-element__label" htmlFor="select-01">Push Topic</label>
                                <div className="slds-form-element__control">
                                    <div className="slds-select_container">
                                        <select onChange={(event) => this.onTopicChange(event)} className="slds-select" id="select-01">
                                            <option value="">Select Topic</option>
                                            <option value="Push_Contact">Push_Contact</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="slds-col slds-align-bottom">
                            <Button
                                label="Subscribe Topic"
                                variant="brand"
                                onClick={() => this.subscribeTopic(topic)}
                                disabled={(subscribedTopic === topic)}
                            />
                            <Button
                                label="Create Push_Contact"
                                variant="brand"
                                onClick={() => this.createTopic()}
                            />
                        </div>
                        <div className="slds-col"></div>
                        <div className="slds-col"></div>
                        <div className="slds-col"></div>
                        <div className="slds-col"></div>
                    </div>
                    
                    <div id="streamContainer">
                        <div>
                            <span id="status">{status}</span>
                            <span id="pollIndicator">&bull;</span>
                        </div>
                        <div id="streamBody">
                            {this.renderActions()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default StreamingApi;