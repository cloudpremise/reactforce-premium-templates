import React from "react";
import stateReducer from "../hooks/stateReducer";
import Input from '@salesforce/design-system-react/components/input';
import Button from '@salesforce/design-system-react/components/button';
import Combobox from '@salesforce/design-system-react/components/combobox';
import Tabs from '@salesforce/design-system-react/components/tabs'; 
import TabsPanel from '@salesforce/design-system-react/components/tabs/panel';
import Textarea from '@salesforce/design-system-react/components/textarea';
import Api from "../Api";
import InlineIcon from "../components/Icons/InlineIcon";

const InternalApi = (props) => {
    let defaultState = {
        url: window.location.origin+"/apexremote/v1/sobject",
        method: "GET",
        methodSelection: [{id: 'get', label: 'GET'}],
        queryParams: [],
        headers: [],
        body: [],
        rawData: "",
        response: "",
        errorMessage: null,
        activeBodyTab: 0,
        urlEditMode: false,
        statusCode: null
    };
    const [state, setState] = React.useReducer(stateReducer, defaultState);
    const methods = [
        {
            'id': 'get',
            'label': 'GET'
        },
        {
            'id': 'post',
            'label': 'POST'
        },
        {
            'id': 'delete',
            'label': 'DELETE'
        },
        {
            'id': 'patch',
            'label': 'PATCH'
        }
    ];
    function handleUrlChange(event, name){
        const valueArray = event.target.value.split("?");
        let queryParams = [];
        if(valueArray.hasOwnProperty(1)){
            let paramsArray = valueArray[1].split("&");
            for(let i = 0; i < paramsArray.length; i++){
                let param = paramsArray[i];
                const paramArray = param.split("=");
                const key = paramArray[0];
                let value = "";
                if(paramArray.hasOwnProperty(1)){
                    value = paramArray[1];
                }
                queryParams[i] = {
                    key: key,
                    value: value
                }
            }
        }
        setState({
            type: "update",
            state: {
                urlEditMode: true,
                [name]: event.target.value,
                queryParams: queryParams
            }
        });
    }
    function prepareRouteUrl(){
        let url = state.url;
        if(!state.urlEditMode){
            url = url.split("?")[0];
            url += prepareQueryString();
        }
        return url;
    }
    function prepareQueryString(){
        const { queryParams } = state;
        let queryString = "";
        if(queryParams.length > 0){
            queryString += "?";
        }
        for(let i = 0; i < queryParams.length; i++){
            if(i > 0){
                queryString += "&";
            }
            queryString += queryParams[i]['key'];
            if(queryParams[i]['value'].length > 0){
                queryString += "="+queryParams[i]['value'];
            }
        }
        return queryString;
    }
    function handleInputChange(dataKey, event, name, key){
        const data = state[dataKey];
        let param = {
            key: "",
            value: ""
        };
        if(data.hasOwnProperty(key)){
            param = data[key];
        }
        data[key] = {
            ...param,
            [name]: event.target.value
        }
        setState({
            type: "update",
            state: {
                urlEditMode: false,
                [dataKey]: data
            }
        });
    }
    function handleInputRemove(dataKey, key){
        const data = state[dataKey];
        let newData = [];
        for(let i = 0; i <= data.length; i++){
            if(i === key || !data.hasOwnProperty(i)){
                continue;
            }
            newData.push(data[i]);
        }
        setState({
            type: "update",
            state: {
                urlEditMode: false,
                [dataKey]: newData
            }
        });
    }
    function handleChange(event, name){
        setState({
            type: "update",
            state: {
                [name]: event.target.value
            }
        });
    }
    function renderInputs(dataKey){
        const data = state[dataKey];
        const html = [];
        for(let i = 0; i <= data.length; i++){
            let inputValue = {
                key: "",
                value: ""
            };
            if(data.hasOwnProperty(i)){
                inputValue = data[i];
            }
            html.push((
                <div key={i} className={"slds-grid slds-gutters slds-grid_vertical-align-end "+(i > 0 ? 'slds-m-top_medium' : '')}>
                    <div className="slds-col">
                        <Input 
                            label={i === 0 ? "Key" : null}
                            onChange={(event) => handleInputChange(dataKey, event, "key", i)}
                            value={inputValue.key}
                            className="slds-input-has-icon slds-input-has-icon_right"
                        />
                    </div>
                    <div className="slds-col">
                        <Input 
                            label={i === 0 ? "Value" : null}
                            onChange={(event) => handleInputChange(dataKey, event, "value", i)}
                            value={inputValue.value}
                            className="slds-input-has-icon slds-input-has-icon_right"
                            iconRight={(
                                i !== data.length ?
                                    <InlineIcon
                                        name="close"
                                        category="utility"
                                        inputIcon
                                        onClick={() => handleInputRemove(dataKey, i)}
                                    />
                                :
                                null
                            )}
                        />
                    </div>
                </div>
            ));
        }
        return html;
    }
    function prepareData(dataObj){
        let data = {};
        for(let i = 0; i < dataObj.length; i++){
            const key = dataObj[i]['key'];
            const value = dataObj[i]['value'];
            if(value.length > 0){
                data[key] = value;
            }
        }
        return data;
    }
    function sendRemoteRequest(){
        const { body, methodSelection, queryParams, headers, activeBodyTab, rawData } = state;
        let data = prepareData(body);
        if(activeBodyTab === 1){
            if(rawData.length > 0){
                try{
                    data = JSON.parse(rawData);
                }catch(e){ console.log(e); }
            }else{
                data = {};
            }
        }
        const params = prepareData(queryParams);
        const headersObj = prepareData(headers);
        let method = 'GET';
        if(methodSelection.length > 0){
            method = methodSelection[0].label;
        }
        let url = window.location.origin+"/apexremote";
        let route = state.url.split("?")[0];
        route = route.replace(url, "");
        Api.apexAdapter(params, route, method, data, headersObj).then((data, statusCode) => {
            const response = JSON.stringify(data, null, '\t');
            setState({
                type: "update",
                state: {
                    response: response,
                    statusCode: statusCode
                }
            });  
        }).catch(err => {
            const response = JSON.stringify(err, null, '\t');
            let statusCode = 500;
            if(typeof(err) === "object" && err.hasOwnProperty("statusCode")){
                statusCode = err.statusCode;
            }
            setState({type: "update", state: {
                response: response,
                statusCode: statusCode
            }});
        });
        setState({
            type: "update",
            state: {
                loading: true
            }
        });
    }
    function onBodyTabChange(tab){
        setState({
            type: "update",
            state: {
                activeBodyTab: tab
            }
        });
    }
    return (
        <div className="slds-p-horizontal_small slds-is-relative">
            <div className="slds-grid slds-gutters slds-grid_vertical-align-end slds-m-bottom_medium">
                <div className="slds-col slds-col-method slds-size_1-of-8">
                    <Combobox
                        events={{
                            onSelect: (event, data) => {
                                setState({
                                    type: "update",
                                    state: {
                                        method: data.selection[0].label,
                                        methodSelection: data.selection,
                                    }
                                });
                            },
                        }}
                        labels={{
                            label: 'Method',
                            placeholder: 'Method',
                        }}
                        options={methods}
                        selection={state.methodSelection}
                        value={state.method}
                        variant="readonly"
                    />
                </div>
                <div className="slds-col slds-size_5-of-8">
                    <Input 
                        label="Route"
                        onChange={(event) => handleUrlChange(event, "url")}
                        value={prepareRouteUrl()}
                    />
                </div>
                <div className="slds-col slds-col-method slds-size_2-of-8">
                    <Button
                        variant="brand"
                        label="Send"
                        onClick={() => sendRemoteRequest()}
                        className="slds-send-request-btn"
                    />
                </div>
            </div>
            <Tabs>
                <TabsPanel label="Params">
                    <h3>Query Params</h3>
                    {renderInputs('queryParams')}
                </TabsPanel>
                <TabsPanel label="Headers">
                    <h3>Headers</h3>
                    {renderInputs('headers')}
                </TabsPanel>
                {
                    state.method !== 'GET' ?
                        <TabsPanel label="Body">
                            <h3>Body</h3>
                            <Tabs
                                onSelect={(tab) => onBodyTabChange(tab)}
                                selectedIndex={state.activeBodyTab}
                            >
                                <TabsPanel label="x-www-form-urlencoded">
                                    {renderInputs('body')}
                                </TabsPanel>
                                <TabsPanel label="raw">
                                    <Textarea
                                        rows={5}
                                        onChange={(e) => handleChange(e, "rawData")}
                                        value={state.rawData}
                                        className="slds-textarea-rawdata"
                                        classNameContainer="slds-p-bottom_medium"
                                    />
                                </TabsPanel>
                            </Tabs>
                        </TabsPanel>
                    :
                    null
                }
            </Tabs>
            <Textarea
                label={
                    state.statusCode ?
                        <>
                            Response (
                                <span>Status: {state.statusCode}</span>
                            )
                        </>
                    :
                        "Response"
                }
                rows={15}
                readOnly
                value={state.response}
                className="slds-textarea-response"
                classNameContainer="slds-p-bottom_medium"
            />
        </div>
    )
};

export default InternalApi;