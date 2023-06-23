import React from "react";
import useApi from "../hooks/useApi";
import stateReducer from "../hooks/stateReducer";
import Input from '@salesforce/design-system-react/components/input';
import Button from '@salesforce/design-system-react/components/button';
import Spinner from '@salesforce/design-system-react/components/spinner';
import Alert from '@salesforce/design-system-react/components/alert'; 

const StandardApi = (props) => {
    let defaultState = {
        AccountId: ""
    };
    const [state, setState] = React.useReducer(stateReducer, defaultState);
    const [loading, account, adapterState, setAdapterState] = useApi("/sobjects/Account/"+state.AccountId, {}, false, null, false);
    function handleChange(event, name){
        setState({
            type: "update",
            state: {
                [name]: event.target.value
            }
        });
    }
    function loadAccountInfo(){
        setAdapterState({
            loading: false,
            callApi: true,
            RF_OFFSET: adapterState.RF_OFFSET + state.RF_LIMIT
        });
    }
    function onErrorClose(){
        setAdapterState({
            loading: false,
            callApi: false,
            errors: null
        });
    }
    return (
        <div className="slds-p-horizontal_small">
            <div className="slds-grid slds-gutters slds-grid_vertical-align-end slds-m-bottom_x-small">
                <div className="slds-col slds-size_1-of-2">
                    <Input 
                        label="Account Id"
                        onChange={(event) => handleChange(event, "AccountId")}
                        value={state.AccountId}
                    />
                    
                </div>
                <div className="slds-col slds-size_1-of-2">
                    <Button
                        label="Get Account"
                        variant="brand"
                        onClick={() => loadAccountInfo()}
                        style={{marginTop: "31px"}}
                    />
                </div>
            </div>
            <div className="slds-grid slds-gutters slds-grid_vertical-align-end slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                    {
                        adapterState.errors !== null && Array.isArray(adapterState.errors) ?
                            <div>
                                {
                                    adapterState.errors.map((error, key) => {
                                        return (
                                            <Alert
                                                key={key}
                                                labels={{
                                                    heading: error.message,
                                                }}
                                                variant="error"
                                                dismissible
                                                onRequestClose={() => onErrorClose()}
                                                className="slds-grid_align-start"
                                            />
                                        )
                                    })
                                }
                            </div>
                        :
                        null
                    }
                </div>
                <div className="slds-col slds-size_1-of-2">&nbsp;</div>
            </div>
            {
                loading ?
                    <div className="slds-is-relative" style={{marginTop: "30px"}}>
                        <Spinner
                            size="medium"
                            variant="brand"
                            assistiveText={{ label: 'Loading...' }}
                            isInline
                        />
                    </div>
                :
                    account !== null && account.hasOwnProperty("Name") ?
                        account.Name
                    :
                    null
            }
        </div>
    )
};

export default StandardApi;