import React from "react";
import { connect } from "react-redux";
import { mapStateToProps } from "../../../../store/reducers/rootReducer";
import PropTypes from "prop-types";
import Modal from '@salesforce/design-system-react/components/modal'; 
import Button from '@salesforce/design-system-react/components/button';
import stateReducer from "../../../../store/reducers/stateReducer";
import Input from '@salesforce/design-system-react/components/input';
import Combobox from '@salesforce/design-system-react/components/combobox';
import classNames from 'classnames';
import Icon from '@salesforce/design-system-react/components/icon';
import InlineIcon from "../../Icons/InlineIcon";
import Spinner from '@salesforce/design-system-react/components/spinner';
import Api from "../../../../assets/js/utils/Api";
import Accordion from '@salesforce/design-system-react/components/accordion'; 
import AccordionPanel from '../../Salesforce2/AccordionPanel';
import Checkbox from '@salesforce/design-system-react/components/checkbox';


const Gateway = (props) => {
    let gateway = {
        DisplaySequence__c: 1,
        Id: "",
        Inactive__c: false,
        Name: "",
        Opt_In_Keywords__c: "",
        Opt_Out_Keywords__c: "",
        PhoneNumber__c: "",
        RecordTypeId: "",
        Sender_Pool__c: false,
        TwilioAccountSid__c: "",
        TwilioAuthToken__c: "",
        TwilioUseNotifyService__c: false,
        Twilio_Notify_ServiceSid__c: "",
        Voice_Type__c: "",
        WebHookIdentifier__c: "",
        Language__c: "",
        Messaging_Profile_ID__c: "",
        Telnyx_Api_key__c: "",
        Loop__c: "",
        Pause__c: "",
        CustomSMSServiceHandler__c: "",
        CustomWebServiceHandler__c: "",
        TelerivetAPIKey__c: "",
        TelerivetPhoneId__c: "",
        TelerivetProjectID__c: "",
        TelerivetSecret__c: "",
        TxtwireAPIKey__c: "",
        TxtWireNumber__c: "",
        TxtwireProgramID__c: "",
        TxtwireSourceAddress__c: "",
        TxtwireVersion__c: "",
    };
    let defaultState = {
        expandedPanels: {information: true, recordType: true, smsSubscriptions: true},
        modifiedFields: {},
        error: true,
        errorMessage: null,
        loading: false,
        deleteModal: false,
        hasModifiedFields: false,
        recordType: [],
        recordTypeLabel: "",
        nextStep: false,
        language: [],
        voiceType: [],
        gateway: gateway,
        ...gateway
    };
    if(props.item !== null){
        const { recordTypes } = props;
        let recordType = [];
        let recordTypeLabel = '';
        if(recordTypes !== null && recordTypes.length > 0){
            recordTypes.map((type) => {
                if(type.Id === props.item.RecordTypeId){
                    recordType.push({
                        id: type.Id,
                        label: type.Name
                    });
                    recordTypeLabel = type.Name;
                }
                return null;
            });
        }
        defaultState = {
            ...defaultState,
            ...props.item,
            nextStep: true,
            recordTypeLabel: recordTypeLabel,
            recordType: recordType,
            Inactive__c: (props.item.Inactive__c === "Yes")
        };
    }
    const [state, setState] = React.useReducer(stateReducer, defaultState);

    function handleChange(event, name){
        const value = event.target.value;
        setState({
            type: "update",
            state: {
                [name]: value,
                hasModifiedFields: true
            }
        });
    }
    // function togglePanel(name){
    //     setState({
    //         type: "update",
    //         state: {
    //             expandedPanels: {
    //                 ...state.expandedPanels,
    //                 [name]: !state.expandedPanels[name],
    //             },
    //         }
    //     });
    // }
    function onSuccess(newGateway = false){
        const data = {
            sObject: {
                Name: state.Name,
                DisplaySequence__c: state.DisplaySequence__c,
                Inactive__c: (state.Inactive__c ? "Yes" : "No"),
                WebHookIdentifier__c: state.WebHookIdentifier__c,
                RecordTypeId: state.RecordTypeId,
                attributes: {
                    type: "Gateway__c"
                }
            }
        };
        if(state.Opt_In_Keywords__c.length > 0){
            data['sObject']['Opt_In_Keywords__c'] = state.Opt_In_Keywords__c;
        }
        if(state.Opt_Out_Keywords__c.length > 0){
            data['sObject']['Opt_Out_Keywords__c'] = state.Opt_Out_Keywords__c;
        }

        switch(state.recordTypeLabel){
            case "Telnyx":
                data['sObject']['Telnyx_Api_key__c'] = state.Telnyx_Api_key__c;
                data['sObject']['Sender_Pool__c'] = state.Sender_Pool__c;
                data['sObject']['Messaging_Profile_ID__c'] = state.Messaging_Profile_ID__c;
                data['sObject']['PhoneNumber__c'] = state.PhoneNumber__c;
                break;
            case "Twilio":
            case "Twilio Voice":
                data['sObject']['TwilioAccountSid__c'] = state.TwilioAccountSid__c;
                data['sObject']['TwilioAuthToken__c'] = state.TwilioAuthToken__c;
                data['sObject']['PhoneNumber__c'] = state.PhoneNumber__c;
                if(state.recordTypeLabel === "Twilio"){
                    data['sObject']['TwilioUseNotifyService__c'] = state.TwilioUseNotifyService__c;
                    data['sObject']['Twilio_Notify_ServiceSid__c'] = state.Twilio_Notify_ServiceSid__c;
                }else{
                    data['sObject']['Language__c'] = state.Language__c;
                    data['sObject']['Voice_Type__c'] = state.Voice_Type__c;
                    data['sObject']['Loop__c'] = state.Loop__c;
                    data['sObject']['Pause__c'] = state.Pause__c;
                }
                break;
            case "Custom":
                data['sObject']['CustomSMSServiceHandler__c'] = state.CustomSMSServiceHandler__c;
                data['sObject']['CustomWebServiceHandler__c'] = state.CustomWebServiceHandler__c;
                break;
            case "Telerivet":
                data['sObject']['TelerivetAPIKey__c'] = state.TelerivetAPIKey__c;
                data['sObject']['TelerivetPhoneId__c'] = state.TelerivetPhoneId__c;
                data['sObject']['TelerivetProjectID__c'] = state.TelerivetProjectID__c;
                data['sObject']['TelerivetSecret__c'] = state.TelerivetSecret__c;
                break;
            case "Textwire":
                data['sObject']['TxtwireAPIKey__c'] = state.TxtwireAPIKey__c;
                data['sObject']['TxtWireNumber__c'] = state.TxtWireNumber__c;
                data['sObject']['TxtwireProgramID__c'] = state.TxtwireProgramID__c;
                data['sObject']['TxtwireSourceAddress__c'] = state.TxtwireSourceAddress__c;
                data['sObject']['TxtwireVersion__c'] = state.TxtwireVersion__c;
                break;
            default:
                break;
        }

        let route = '/v1/sobject';
        let method = 'POST';
        if(!newGateway && state.hasOwnProperty("Id") && state.Id.length > 0){
            route += "/"+state.Id;
            method = "PATCH";
            data.sObject = {
                ...data.sObject,
                Id: state.Id,
                attributes: state.attributes
            }
        }

        Api.apexAdapter({}, route, method, data).then(data => {
            setState({type: "update", state: {
                loading: false,
            }});
            props.onSuccess(data.result[0]);
        }).catch(err => {
            setState({type: "update", state: {
                loading: false,
                error: true,
                errorMessage: err.message
            }});
        });

        setState({type: "update", state: {
            loading: true,
        }});
    }
    function isFormValid(){
        return (state.RecordTypeId.length > 0 && state.Name.length > 0);
    }
    function handleCheckbox(e, name){
        let newState = {
            modifiedFields: {
                ...state.modifiedFields,
                [name]: (e.target.checked !== state[name])
            }
        };
        newState[name] = e.target.checked;
        setState({
            type: "update",
            state: newState
        });
    }
    function onEdit(status = true){
        let newState = {
            editMode: status
        };
        if(!status){
            newState = {
                modifiedFields: {}
            };
        }
        setState({
            type: "update",
            state: newState
        });
    }
    function onUndo(name){
        let newState = {
            [name]: state.gateway[name],
            modifiedFields: {
                ...state.modifiedFields,
                [name]: false
            }
        };
        setState({
            type: "update",
            state: newState
        });
    }
    function isModifiedField(name){
        return (state.modifiedFields.hasOwnProperty(name) && state.modifiedFields[name]);
    }
    function handleSelectChange(data, name, settingName){
        let selection = data.selection;
        if(selection.length > 0 && selection[0].hasOwnProperty("type") && (selection[0].type === "header" || selection[0].type === "footer")){
            if(selection[0].type === "header"){
                if(state.gatewayInputValue.length > 0 ){
                    console.log("onShowAllItems");
                }else{
                    console.log("onRecentItem");
                }
            }else{
                console.log("onAddItem");
            }
            selection = [];
            return;
        }
        let value = "";
        let label = "";
        if(selection.length > 0){
            value = selection[0].id;
            label = selection[0].label;
        }
        setState({
            type: "update",
            state: {
                [name+"InputValue"]: '',
                [name]: selection,
                [name+"Label"]: label,
                [settingName]: value,
                modifiedFields: {
                    ...state.modifiedFields,
                    [settingName]: (value !== state.gateway[settingName])
                }
            }
        });
    }
    function onRenderMenuItem(props){
        const {assistiveText, selected, option} = props;
        return (
            <span
                className={classNames('slds-truncate', {
                    'slds-disabled-text': option.disabled,
                })}
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
    function getRecordTypes(){
        const { recordTypes } = props;
        let options = [];
        if(recordTypes === null || recordTypes.length <= 0){
            return;
        }
        recordTypes.map((recordType) => {
            if(recordType.SobjectType !== "Gateway__c"){
                return null;
            }
            options.push({
                id: recordType.Id,
                label: recordType.Name
            });
            return null;
        });
        return options;
    }
    function languageTypes(){
        const options = [
            {
                id: "",
                label: "--None--"
            },
            {
                id: "en-US",
                label: "English (US)"
            },
            {
                id: "en-gb",
                label: "English (British)"
            },
            {
                id: "es-US",
                label: "Spanish"
            },
            {
                id: "fr-FR",
                label: "French"
            },
            {
                id: "de-DE",
                label: "German"
            },
        ];
        return options;
    }
    function getVoiceTypes(){
        const options = [
            {
                id: "--None--",
                label: "--None--"
            },
            {
                id: "Text to Voice",
                label: "Text to Voice"
            },
            {
                id: "File to Voice",
                label: "File to Voice"
            }
        ];
        return options;
    }
    function onNextStep(){
        setState({
            type: "update",
            state: {
                nextStep: true
            }
        })
    }
    function renderCustom(){
        return (
            <div className={"slds-grid slds-gutters slds-wrap"}>
                <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                    <Input 
                        label="Custom SMS Service Handler"
                        onChange={(event) => handleChange(event, "CustomSMSServiceHandler__c")}
                        className="slds-m-bottom_x-small"
                        value={state.CustomSMSServiceHandler__c}
                    />
                </div>
                <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                    <Input 
                        label="Custom Web Service Handler"
                        onChange={(event) => handleChange(event, "CustomWebServiceHandler__c")}
                        className="slds-m-bottom_x-small"
                        value={state.CustomWebServiceHandler__c}
                    />
                </div>
            </div>
        )
    }
    function renderTelnyx(){
        return (
            <div className={"slds-grid slds-gutters slds-wrap"}>
                <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                    <Input 
                        label="Telnyx API Key"
                        onChange={(event) => handleChange(event, "Telnyx_Api_key__c")}
                        className="slds-m-bottom_x-small"
                        value={state.Telnyx_Api_key__c}
                    />
                    <Input 
                        label="Phone Number"
                        onChange={(event) => handleChange(event, "PhoneNumber__c")}
                        className="slds-m-bottom_x-small"
                        value={state.PhoneNumber__c}
                    />
                </div>
                <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                    <div className={"slds-input-has-icon_right slds-input-has-icon modified_field_container"+(isModifiedField("Sender_Pool__c") ? ' modified_field' : '')} onDoubleClick={() => onEdit()}>
                        {
                            isModifiedField("Sender_Pool__c") ?
                                <InlineIcon
                                    name="undo"
                                    category="utility"
                                    size="xx-small"
                                    color="grey"
                                    className="slds-input__icon slds-input__icon_right"
                                    iconClassName="slds-icon-text-default"
                                    onClick={() => onUndo("Sender_Pool__c")}
                                />
                            :
                            null
                        }
                        <Checkbox
                            labels={{
                                label: "Sender Pool",
                                toggleDisabled: "",
                                toggleEnabled: ""
                            }}
                            variant="base"
                            checked={state.Sender_Pool__c}
                            onChange={(event) => handleCheckbox(event, "Sender_Pool__c")}
                            className="slds-m-bottom_x-small"
                            readOnly={(state.editMode === false)}
                        />
                    </div>
                    <Input 
                        label="Messaging Profile ID"
                        onChange={(event) => handleChange(event, "Messaging_Profile_ID__c")}
                        className="slds-m-bottom_x-small"
                        value={state.Messaging_Profile_ID__c}
                    />
                </div>
            </div>
        )
    }
    function renderTwilio(){
        return (
            <div className={"slds-grid slds-gutters slds-wrap"}>
                <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                    <Input 
                        label="Twilio AccountSid"
                        onChange={(event) => handleChange(event, "TwilioAccountSid__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TwilioAccountSid__c}
                    />
                    <Input 
                        label="Twilio AuthToken"
                        onChange={(event) => handleChange(event, "TwilioAuthToken__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TwilioAuthToken__c}
                    />
                    <Input 
                        label="Phone Number"
                        onChange={(event) => handleChange(event, "PhoneNumber__c")}
                        className="slds-m-bottom_x-small"
                        value={state.PhoneNumber__c}
                    />
                </div>
                <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                    <div className={"slds-input-has-icon_right slds-input-has-icon modified_field_container"+(isModifiedField("TwilioUseNotifyService__c") ? ' modified_field' : '')} onDoubleClick={() => onEdit()}>
                        {
                            isModifiedField("TwilioUseNotifyService__c") ?
                                <InlineIcon
                                    name="undo"
                                    category="utility"
                                    size="xx-small"
                                    color="grey"
                                    className="slds-input__icon slds-input__icon_right"
                                    iconClassName="slds-icon-text-default"
                                    onClick={() => onUndo("TwilioUseNotifyService__c")}
                                />
                            :
                            null
                        }
                        <Checkbox
                            labels={{
                                label: "Use Twilio Notify Service",
                                toggleDisabled: "",
                                toggleEnabled: ""
                            }}
                            variant="base"
                            checked={state.TwilioUseNotifyService__c}
                            onChange={(event) => handleCheckbox(event, "TwilioUseNotifyService__c")}
                            className="slds-m-bottom_x-small"
                        />
                    </div>
                    <Input 
                        label="Twilio Notify ServiceSid"
                        onChange={(event) => handleChange(event, "Twilio_Notify_ServiceSid__c")}
                        className="slds-m-bottom_x-small"
                        value={state.Twilio_Notify_ServiceSid__c}
                    />
                </div>
            </div>
        )
    }
    function renderTwilioVoice(){
        return (
            <div className={"slds-grid slds-gutters slds-wrap"}>
                <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                    <Input 
                        label="Twilio AccountSid"
                        onChange={(event) => handleChange(event, "TwilioAccountSid__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TwilioAccountSid__c}
                    />
                    <Input 
                        label="Twilio AuthToken"
                        onChange={(event) => handleChange(event, "TwilioAuthToken__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TwilioAuthToken__c}
                    />
                    <Input 
                        label="Phone Number"
                        onChange={(event) => handleChange(event, "PhoneNumber__c")}
                        className="slds-m-bottom_x-small"
                        value={state.PhoneNumber__c}
                    />
                </div>
                <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                    <Combobox
                        events={{
                            onSelect: (event, data) => handleSelectChange(data, "language", "Language__c")
                        }}
                        labels={{
                            label: "Voice",
                            placeholderReadOnly: ""
                        }}
                        options={languageTypes()}
                        onRenderMenuItem={onRenderMenuItem}
                        selection={state.language}
                        variant="readonly"
                        classNameContainer={"customize-combobox slds-m-bottom_x-small"}
                        required={true}
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
                    <Combobox
                        events={{
                            onSelect: (event, data) => handleSelectChange(data, "voiceType", "Voice_Type__c")
                        }}
                        labels={{
                            label: "Voice Type",
                            placeholderReadOnly: ""
                        }}
                        options={getVoiceTypes()}
                        onRenderMenuItem={onRenderMenuItem}
                        selection={state.voiceType}
                        variant="readonly"
                        classNameContainer={"customize-combobox slds-m-bottom_x-small"}
                        required={true}
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
            </div>
        )
    }
    function renderTelerivet(){
        return (
            <div className={"slds-grid slds-gutters slds-wrap"}>
                <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                    <Input 
                        label="API Key"
                        onChange={(event) => handleChange(event, "TelerivetAPIKey__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TelerivetAPIKey__c}
                    />
                    <Input 
                        label="Phone Id"
                        onChange={(event) => handleChange(event, "TelerivetPhoneId__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TelerivetPhoneId__c}
                    />
                </div>
                <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                    <Input 
                        label="Secret"
                        onChange={(event) => handleChange(event, "TelerivetSecret__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TelerivetSecret__c}
                    />
                    <Input 
                        label="Project Id"
                        onChange={(event) => handleChange(event, "TelerivetProjectID__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TelerivetProjectID__c}
                    />
                </div>
            </div>
        )
    }
    function renderTextWire(){
        return (
            <div className={"slds-grid slds-gutters slds-wrap"}>
                <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                    <Input 
                        label="API Key"
                        onChange={(event) => handleChange(event, "TxtwireAPIKey__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TxtwireAPIKey__c}
                    />
                    <Input 
                        label="Program Id"
                        onChange={(event) => handleChange(event, "TxtwireProgramID__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TxtwireProgramID__c}
                    />
                    <Input 
                        label="Version"
                        onChange={(event) => handleChange(event, "TxtwireVersion__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TxtwireVersion__c}
                    />
                </div>
                <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                    <Input 
                        label="Number"
                        onChange={(event) => handleChange(event, "TxtWireNumber__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TxtWireNumber__c}
                    />
                    <Input 
                        label="Txtwire Source Address"
                        onChange={(event) => handleChange(event, "TxtwireSourceAddress__c")}
                        className="slds-m-bottom_x-small"
                        value={state.TxtwireSourceAddress__c}
                    />
                </div>
            </div>
        )
    }
    function renderRecordTypeFields(){
        let html = null;
        switch(state.recordTypeLabel){
            case "Custom":
                html = renderCustom();
                break;
            case "Telnyx":
                html = renderTelnyx();
                break;
            case "Twilio":
                html = renderTwilio();
                break;
            case "Twilio Voice":
                html = renderTwilioVoice();
                break;
            case "Telerivet":
                html = renderTelerivet();
                break;
            case "Textwire":
                html = renderTextWire();
                break;
            default:
                break;
        }
        return html;
    }
    function renderAccordionPanels(){
        let panels = [];
        panels.push(
            <AccordionPanel
                summary="Information"
                id="panel-mogliGateways"
                expanded={!!state.expandedPanels['information']}
                // onTogglePanel={() => togglePanel('information')}
                key="information"
            >
                <div className={"slds-grid slds-gutters slds-wrap"}>
                    <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                        <Input 
                            label="Gateway Name"
                            onChange={(event) => handleChange(event, "Name")}
                            className="slds-m-bottom_x-small"
                            value={state.Name}
                            required={true}
                        />
                        <Input 
                            label="Display Sequence"
                            onChange={(event) => handleChange(event, "DisplaySequence__c")}
                            className="slds-m-bottom_x-small"
                            value={state.DisplaySequence__c}
                        />
                        <Input 
                            label="WebHook Identifier"
                            onChange={(event) => handleChange(event, "WebHookIdentifier__c")}
                            className="slds-m-bottom_x-small"
                            value={state.WebHookIdentifier__c}
                        />
                    </div>
                    <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                        <div className={"slds-input-has-icon_right slds-input-has-icon modified_field_container"+(isModifiedField("Inactive__c") ? ' modified_field' : '')} onDoubleClick={() => onEdit()}>
                            {
                                isModifiedField("Inactive__c") ?
                                    <InlineIcon
                                        name="undo"
                                        category="utility"
                                        size="xx-small"
                                        color="grey"
                                        className="slds-input__icon slds-input__icon_right"
                                        iconClassName="slds-icon-text-default"
                                        onClick={() => onUndo("Inactive__c")}
                                    />
                                :
                                null
                            }
                            <Checkbox
                                labels={{
                                    label: "Inactive",
                                    toggleDisabled: "",
                                    toggleEnabled: ""
                                }}
                                variant="base"
                                checked={state.Inactive__c}
                                onChange={(event) => handleCheckbox(event, "Inactive__c")}
                                className="slds-m-bottom_x-small"
                                readOnly={(state.editMode === false)}
                            />
                        </div>
                    </div>
                </div>
            </AccordionPanel>
        );
        const recordTypeFields = renderRecordTypeFields();
        if(recordTypeFields !== null){
            panels.push(
                <AccordionPanel
                    summary={state.recordTypeLabel}
                    id="panel-mogliGateways"
                    expanded={!!state.expandedPanels['recordType']}
                    // onTogglePanel={() => togglePanel('recordType')}
                    key="recordType"
                >
                    {recordTypeFields}
                </AccordionPanel>
            );
        }
        panels.push(
            <AccordionPanel
                summary="SMS Subscriptions"
                id="panel-smsSubscriptions"
                expanded={!!state.expandedPanels['smsSubscriptions']}
                // onTogglePanel={() => togglePanel('smsSubscriptions')}
                key="smsSubscriptions"
            >
                <div className={"slds-grid slds-gutters slds-wrap"}>
                    <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                        <Input 
                            label="Opt-In Keywords"
                            onChange={(event) => handleChange(event, "Opt_In_Keywords__c")}
                            className="slds-m-bottom_x-small"
                            value={state.Opt_In_Keywords__c}
                        />
                    </div>
                    <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
                        <Input 
                            label="Opt-Out Keywords"
                            onChange={(event) => handleChange(event, "Opt_Out_Keywords__c")}
                            className="slds-m-bottom_x-small"
                            value={state.Opt_Out_Keywords__c}
                        />
                    </div>
                </div>
            </AccordionPanel>
        );
        return panels;
    }
    
    return (
        <Modal
            isOpen={props.open}
            containerClassName="slds-scope"
            footer={[
                state.loading ?
                    <div key="spinner" className="slds-is-relative" style={{height: "45px"}}>
                        <Spinner
                            size="medium"
                            variant="brand"
                            assistiveText={{ label: 'Saving Gateway...' }}
                        />
                    </div>
                :
                    <>
                        {
                            state.error && state.errorMessage !== null ?
                                <p key="error" className="slds-m-bottom_small">{state.errorMessage}</p>
                            :
                            null
                        }
                        {
                            state.RecordTypeId.length > 0 && state.nextStep ?
                                <>
                                    <Button key="cancel" label="Cancel" onClick={props.onCancel} />
                                    <Button key="saveNew" label="Save & New" disabled={!isFormValid()} onClick={() => onSuccess(true)} />
                                    <Button key="save" label="Save" variant="brand" disabled={!isFormValid()} onClick={onSuccess} />
                                </>
                            :
                                <>
                                    <Button key="cancel" label="Cancel" onClick={props.onCancel} />
                                    <Button key="save" label="Next" variant="brand" disabled={(state.RecordTypeId.length <= 0)} onClick={onNextStep} />
                                </>
                        }
                        
                    </>
            ]}
            onRequestClose={props.onCancel}
            heading={"New Mogli: Gateway"+ (state.nextStep ? ": "+state.recordTypeLabel : "")}
        >
            <div className="slds-p-around_medium" style={state.nextStep ? {} : {minHeight: "250px"}}>
                {
                    state.RecordTypeId.length > 0 && state.nextStep ?
                        <Accordion id="gateways-accordion" className="slds-accordion-disable-arrows">
                            {renderAccordionPanels()}
                        </Accordion>
                    :
                    <Combobox
                        events={{
                            onSelect: (event, data) => handleSelectChange(data, "recordType", "RecordTypeId")
                        }}
                        labels={{
                            label: "Select a record type",
                            placeholderReadOnly: "Record Type"
                        }}
                        options={getRecordTypes()}
                        onRenderMenuItem={onRenderMenuItem}
                        selection={state.recordType}
                        variant="readonly"
                        classNameContainer={"customize-combobox slds-m-bottom_x-small"}
                        required={true}
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
                }
            </div>
        </Modal>
    )
};

Gateway.defaultProps = {
    item: null
}
Gateway.propTypes = {
    classes: PropTypes.object,
    onCancel: PropTypes.func,
    onSuccess: PropTypes.func,
    onDelete: PropTypes.func,
    open: PropTypes.bool,
    item: PropTypes.object
};

export default connect(mapStateToProps)(Gateway);