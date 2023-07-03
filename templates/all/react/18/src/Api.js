import axios from 'axios';
import apexAdapter from "./ApexAdapter";
import { translateNamespace } from "./hooks/useApexAdapter";

const ApiHelper = {
    apiType: "standard",
    apexAdapter: function(params, route = '/v1/sobject', method = 'GET', data = {}, headers = {}){
        return new Promise(function(resolve, reject){
            apexAdapter(method, route, data, params, headers, (result, event) =>{
                let response = event;
                if(result !== null){
                    response = JSON.parse(result);
                }
                if(response.hasOwnProperty("statusCode")){
                    event = response;
                }
                if(event.statusCode !== 200 && event.statusCode !== 201){
                    return reject({message: event.message});
                }
                if(typeof(response) !== "object" || !response.hasOwnProperty("result")){
                    response = {result: []};
                }
                const data = translateNamespace(response.result);
                resolve(data);
            });
        });
    },
    standardApi: function(url, cancelTokenSource){
        return new Promise(function(resolve, reject){
            let headers = {
                'Authorization': "Bearer "+window.inlineApexAdaptor.sessionId,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };
            let ApiUrl = '/services/data/v57.0'+url;
            axios({
                url: ApiUrl,
                method: "GET",
                headers: headers,
                // cancelToken: cancelTokenSource.token
            }).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err);
            });
        });
    },
    getFileBlob: function(url){
        return new Promise(function(resolve, reject){
            let ApiUrl = '/services/data/v57.0'+url;
            var xhr = new XMLHttpRequest()
            xhr.open('GET', ApiUrl);
            xhr.responseType = 'blob';
            xhr.setRequestHeader("Authorization", "Bearer "+window.inlineApexAdaptor.sessionId);
            xhr.onload = function () {
                resolve(xhr.response);
            }
            xhr.send();
        });
    },
    standardApiPost: function(url, requestData, cancelTokenSource){
        return new Promise(function(resolve, reject){
            let headers = {
                'Authorization': "Bearer "+window.inlineApexAdaptor.sessionId,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            let ApiUrl = '/services/data/v57.0'+url;
            axios.post(ApiUrl, JSON.stringify(requestData), {
                headers: headers,
                // cancelToken: cancelTokenSource.token
            }).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err);
            });
        });
    },
    standardApiPatch: function(url, requestData, cancelTokenSource){
        return new Promise(function(resolve, reject){
            let headers = {
                'Authorization': "Bearer "+window.inlineApexAdaptor.sessionId,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            let ApiUrl = '/services/data/v57.0'+url;
            axios.patch(ApiUrl, JSON.stringify(requestData), {
                headers: headers,
                // cancelToken: cancelTokenSource.token
            }).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err);
            });
        });
    },
    standardApiDelete: function(url, requestData, cancelTokenSource){
        return new Promise(function(resolve, reject){
            let headers = {
                'Authorization': "Bearer "+window.inlineApexAdaptor.sessionId,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            let ApiUrl = '/services/data/v57.0'+url;
            axios.delete(ApiUrl, {
                headers: headers,
                // cancelToken: cancelTokenSource.token
            }).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err);
            });
        });
    },
    callApi: function(params, method = 'GET', data = {}, headers = {}){
        const self = this;
        return new Promise(function(resolve, reject){
            if(self.apiType === "internal"){
                let route = '/v1/sobject';
                // if(method === 'DELETE' && params.hasOwnProperty("sobjecttypename")){
                //     route += "/"+params.sobjecttypename;
                // }
                if(params.hasOwnProperty("Id")){
                    route += "/"+params.Id;
                }
                self.apexAdapter((method !== 'GET' ? {} : params), route, method, data, headers)
                    .then((data) => {
                        if(params.hasOwnProperty("Id")){
                            resolve(data[0]);
                        }else{
                            resolve(data);
                        }
                    }).catch(err => {
                        reject(err);
                    });
            }else{
                let route = '/sobjects';
                if(params.hasOwnProperty("sobjecttypename")){
                    route += "/"+params.sobjecttypename;
                }
                if(params.hasOwnProperty("Id")){
                    route += "/"+params.Id;
                }
                if(method !== 'GET' && data.hasOwnProperty("sObject")){
                    data = data.sObject;
                    delete data['Id'];
                }
                switch(method){
                    case 'GET':
                        self.standardApi(route)
                            .then((data) => {
                                resolve(data);
                            }).catch(err => {
                                reject(err);
                            });
                        break;
                    case 'POST':
                        self.standardApiPost(route, data)
                            .then((data) => {
                                resolve(data);
                            }).catch(err => {
                                reject(err);
                            });
                        break;
                    case 'PATCH':
                        self.standardApiPatch(route, data)
                            .then((data) => {
                                resolve(data);
                            }).catch(err => {
                                reject(err);
                            });
                        break;
                    case 'DELETE':
                        self.standardApiDelete(route, data)
                            .then((data) => {
                                resolve(data);
                            }).catch(err => {
                                reject(err);
                            });
                        break;
                    default:
                        break;
                }
            }
        });
    }
};

export default ApiHelper;