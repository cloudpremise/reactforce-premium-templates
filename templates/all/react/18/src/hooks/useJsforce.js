import React from "react";
import { getSessionId } from "../ApexAdapter";
import { translateNamespace } from "./useApexAdapter";

let connection = null;
const useJsforceRetrieve = (sObjectType, ids, justData = false, callBack = null) => {
    const [state, setState] = React.useState({
        loading: false,
        callApi: true,
        RF_LIMIT: 10,
        RF_OFFSET: 0,
        hasMore: false
    });
    let [data, setData] = React.useState(null);
    function getData(){
        const conn = getConnection();
        if(!conn){
            setAdapterState({
                loading: false,
                callApi: false
            });
            return;
        }
        setAdapterState({
            loading: true,
            callApi: false
        });
        conn.sobject(sObjectType).retrieve(ids, function(err, account) {
            if (err) { return console.error(err); }
            const newState = {
                loading: false,
                callApi: false,
                RF_OFFSET: state.RF_OFFSET,
                hasMore: false
            };
            setAdapterState(newState);
            setData(account);
            if(callBack !== null){
                callBack(account);
            }
        });
    }

    React.useEffect(() => {
        if(!state.callApi){
            return;
        }
        getData();
    });

    if(justData){
        return [data];
    }
    function setAdapterState(newState){
        newState = {
            ...state,
            ...newState
        };
        setState(newState);
    }
    if(callBack !== null){
        return [ state.loading, state, setAdapterState ];
    }
    return [ state.loading, data, state, setAdapterState ];
}
const useJsforceQuery = (query, justData = false, callBack = null) => {
    const [state, setState] = React.useState({
        loading: false,
        callApi: true,
        RF_LIMIT: 10,
        RF_OFFSET: 0,
        hasMore: false
    });
    let [data, setData] = React.useState(null);
    function getData(){
        const conn = getConnection();
        if(!conn){
            setAdapterState({
                loading: false,
                callApi: false
            });
            return;
        }
        setAdapterState({
            loading: true,
            callApi: false
        });
        conn.query(query, function(err, result) {
            if (err) { return console.error(err); }
            let hasMore = false;
			const data = translateNamespace(result.records);
            
            const newState = {
                loading: false,
                callApi: false,
                hasMore: hasMore
            };
            setAdapterState(newState);
            setData(data);
            if(callBack !== null){
                callBack(data);
            }
        });
    }

    React.useEffect(() => {
        if(!state.callApi){
            return;
        }
        getData();
    });

    if(justData){
        return [data];
    }
    function setAdapterState(newState){
        newState = {
            ...state,
            ...newState
        };
        setState(newState);
    }
    if(callBack !== null){
        return [ state.loading, state, setAdapterState ];
    }
    return [ state.loading, data, state, setAdapterState ];
}
const getConnection = () => {
    if(!window.inlineApexAdaptor || !window.inlineApexAdaptor.hasOwnProperty("jsforce")){
        return null;
    }
    if(connection === null){
        const sessionId = getSessionId();
        connection = new window.inlineApexAdaptor.jsforce.Connection({ accessToken: sessionId });
    }
    return connection;
}
export { useJsforceRetrieve, useJsforceQuery, getConnection };

export default useJsforceRetrieve;