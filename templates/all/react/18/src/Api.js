import axios from 'axios';
import apexAdapter from "./ApexAdapter";
import { translateNamespace } from "./hooks/useApexAdapter";

const ApiHelper = {
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
                cancelToken: cancelTokenSource.token
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
                cancelToken: cancelTokenSource.token
            }).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err);
            });
        });
    }
};

export default ApiHelper;