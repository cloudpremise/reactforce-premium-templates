import React from "react";
import Api from "../Api";
import stateReducer from "../hooks/stateReducer";
import Input from '@salesforce/design-system-react/components/input';
import Button from '@salesforce/design-system-react/components/button';
import Spinner from '@salesforce/design-system-react/components/spinner';
import Combobox from '@salesforce/design-system-react/components/combobox';
import AccountModal from "../components/Modals/Account";
import Confirmation from "../components/Modals/Confirmation";
import InlineIcon from "../components/Icons/InlineIcon";
import Icon from '@salesforce/design-system-react/components/icon';

const SObjectApi = (props) => {
    let defaultState = {
        AccountId: "",
        apiType: "standard",
        apiTypeSelection: [{id: 'standard', label: 'Standard Api'}],
        loading: false,
        sobject: null,
        accountModal: false,
        deleteModal: false,
        errorMessage: null
    };
    const [state, setState] = React.useReducer(stateReducer, defaultState);
    const apiTypes = [
        {
            'id': 'standard',
            'label': 'Standard Api'
        },
        {
            'id': 'internal',
            'label': 'Internal Api'
        }
    ];

    function handleChange(event, name){
        setState({
            type: "update",
            state: {
                [name]: event.target.value
            }
        });
    }
    function loadSObject(){
        if(state.AccountId.length <= 0){
            return;
        }
        Api.apiType = state.apiType;
        Api.callApi({sobjecttypename: "Account", Id: state.AccountId}).then(data => {
            setState({
                type: "update",
                state: {
                    sobject: data,
                    accountModal: true,
                    loading: false,
                    errorMessage: null
                }
            });
        }).catch(err => {
            if(typeof(err) === "object" && err.hasOwnProperty("error")){
                err['message'] = err.error;
            }
            setState({
                type: "update",
                state: {
                    loading: false,
                    errorMessage: err.message
                }
            });
        });
        setState({
            type: "update",
            state: {
                loading: true,
                errorMessage: null
            }
        });
    }
    function onAccountModal(status = false){
        setState({
            type: "update",
            state: {
                accountModal: status,
                errorMessage: null,
                sobject: null
            }
        });
    }
    function onAccountModalSuccess(id){
        setState({
            type: "update",
            state: {
                accountModal: false,
                AccountId: id,
                sobject: null,
                errorMessage: null
            }
        });
    }
    function handleRowAction(item, action){
        let newState = {
            [action.value+"Modal"]: true
        };
        setState({
            type: "update",
            state: newState
        });      
	}
    function onConfirmationModal(status = true){
        setState({
            type: "update",
            state: {
                deleteModal: status,
                errorMessage: null
            }
        });
    }
    function onDeleteModalSuccess(){
        let method = 'DELETE';

        Api.callApi({sobjecttypename: "Account", Id: state.AccountId}, method).then(data => {
            setState({
                type: "update",
                state: {
                    accountModal: false,
                    deleteModal: false,
                    errorMessage: null
                }
            });
        }).catch(err => {
            setState({
                type: "update",
                state: {
                    accountModal: false,
                    deleteModal: false,
                    errorMessage: err.message
                }
            });
        });

        setState({
            type: "update",
            state: {
                saving: true,
                errorMessage: null
            }
        });
    }
    function onRenderMenuItem(props){
        const {assistiveText, selected, option} = props;
        return (
            <span
                className={'slds-truncate '+ option.disabled ? '' : 'slds-disabled-text'}
                title={option.label}
            >
                {
                    selected ?
                        <Icon
                            assistiveText={{ label: option.label }}
                            category="utility"
                            icon={require("@salesforce/design-system-react/icons/utility/check").default}
                            name='check'
                            size="x-small"
                            className={"slds-listbox__icon-selected slds-listbox__icon-selected-custom slds-m-right_xx-small"}
                        />
                    :
                    null
                }
                {selected ? (
                    <span className="slds-assistive-text">
                        {assistiveText.optionSelectedInMenu}
                    </span>
                ) : null}{' '}
                {option.type === 'deselect' ? (
                    <em>{option.label}</em>
                ) : (
                    option.label
                )}
            </span>
        )
    }
    return (
        <div className="slds-p-horizontal_small">
            <div className="slds-grid slds-gutters slds-grid_vertical-align-end slds-m-bottom_x-small">
                <div className="slds-col slds-size_1-of-8">
                    <Combobox
                        events={{
                            onSelect: (event, data) => {
                                setState({
                                    type: "update",
                                    state: {
                                        apiType: data.selection[0].id,
                                        apiTypeSelection: data.selection,
                                    }
                                });
                            },
                        }}
                        labels={{
                            label: 'Api Type',
                            placeholder: 'Api Type',
                        }}
                        options={apiTypes}
                        selection={state.apiTypeSelection}
                        onRenderMenuItem={onRenderMenuItem}
                        classNameContainer={"customize-combobox"}
                        value={state.apiType}
                        variant="readonly"
                        input={{
                            props: {
                                iconRight: (
                                    <InlineIcon
                                        category="utility"
                                        name="down"
                                        iconPosition="right"
                                        size="x-small"
                                        color="grey"
                                        inputIcon
                                        combobox
                                    />
                                )
                            }
                        }}
                    />
                </div>
                <div className="slds-col slds-size_4-of-8">
                    <Input 
                        label="Account Id"
                        onChange={(event) => handleChange(event, "AccountId")}
                        value={state.AccountId}
                    />
                </div>
                <div className="slds-col slds-size_2-of-8">
                    <Button
                        label="Get Account"
                        variant="brand"
                        onClick={() => loadSObject()}
                        style={{marginTop: "31px"}}
                    />
                    <Button
                        label="Create Account"
                        variant="brand"
                        onClick={() => onAccountModal(true)}
                        style={{marginTop: "31px"}}
                    />
                </div>
            </div>
            {
                state.errorMessage !== null && !state.accountModal ?
                    <p>{state.errorMessage}</p>
                :
                null
            }
            {
                state.loading ?
                    <div className="slds-is-relative" style={{marginTop: "30px"}}>
                        <Spinner
                            size="medium"
                            variant="brand"
                            assistiveText={{ label: 'Loading...' }}
                            isInline
                        />
                    </div>
                :
                    state.accountModal ?
                        <AccountModal
                            item={state.sobject}
                            open={true}
                            onCancel={() => onAccountModal()}
                            onSuccess={(id) => onAccountModalSuccess(id)}
                            onDelete={onDeleteModalSuccess}
                            onObjectAction={(action) => handleRowAction(state.row, {value: action})}
                        />
                    :
                    null
            }
            {
                state.deleteModal ?
                    <Confirmation
                        open={state.deleteModal}
                        item={state.sobject}
                        onCancel={() => onConfirmationModal(false)}
                        onSuccess={onDeleteModalSuccess}
                        message={"Are you sure you want to delete?"}
                        saving={state.saving}
                        errorMessage={state.errorMessage}
                    />
                :
                null
            }
        </div>
    )
};

export default SObjectApi;