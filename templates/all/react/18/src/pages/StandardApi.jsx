import React from "react";
import useApi from "../hooks/useApi";
import stateReducer from "../hooks/stateReducer";
import Input from '@salesforce/design-system-react/components/input';
import Button from '@salesforce/design-system-react/components/button';
import Spinner from '@salesforce/design-system-react/components/spinner';

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
    return (
        <div className="slds-p-horizontal_small">
            <div className="slds-grid slds-gutters">
                <div className="slds-col">
                    <Input 
                        label="Account Id"
                        onChange={(event) => handleChange(event, "AccountId")}
                        className="slds-m-bottom_x-small"
                        value={state.AccountId}
                    />
                </div>
                <div className="slds-col">
                    <Button
                        label="Get Account"
                        variant="brand"
                        onClick={() => loadAccountInfo()}
                        style={{marginTop: "31px"}}
                    />
                </div>
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