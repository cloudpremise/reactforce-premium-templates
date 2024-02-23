import React from "react";
import { getSessionId } from "../ApexAdapter";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import stateReducer from "../hooks/stateReducer";
import Spinner from '@salesforce/design-system-react/components/spinner';
import Accordion from '@salesforce/design-system-react/components/accordion';
import AccordionPanel from '../components/Accordion/AccordionPanel';
import Input from '@salesforce/design-system-react/components/input';
import InlineIcon from "../components/Icons/InlineIcon";
import Icon from '@salesforce/design-system-react/components/icon';
import Combobox from '@salesforce/design-system-react/components/combobox';
import Textarea from '@salesforce/design-system-react/components/textarea';
import Api from "../Api";
import comboboxFilterAndLimit from '@salesforce/design-system-react/components/combobox/filter';
import Button from '../components/Button';

const UiApi = (props) => {
    const objectType = "Account";
    const navigate = useNavigate();
    let defaultState = {
        Id: '',
        expandedPanels: {},
        layout: null,
        objectInfo: null,
        successMessage: null
    };
    let layout = null;
    let objectInfo = null;
    const [state, setState] = React.useReducer(stateReducer, defaultState);
    const [loading] = useApi("/ui-api/layout/"+objectType+"?mode=create", {}, false, (data) => {
        layout = data;
        const newState = getFieldsState(layout, objectInfo);
        setState({
            type: "update",
            state: {
                layout: layout,
                ...newState
            }
        });
    });
    useApi("/ui-api/object-info/"+objectType, {}, false, (data) => {
        objectInfo = data;
        const newState = getFieldsState(layout, objectInfo);
        setState({
            type: "update",
            state: {
                objectInfo: objectInfo,
                ...newState
            }
        });
    });
    React.useEffect(() => {
        const sessionId = getSessionId();
        if(typeof(sessionId) === "string" && sessionId.length <= 0){
            return navigate("/landing", { replace: true });
        }
    });
    function togglePanel(name){
        setState({
            type: "update",
            state: {
                expandedPanels: {
                    ...state.expandedPanels,
                    [name]: !state.expandedPanels[name],
                },
            }
        });
    }
    function loadPicklists(layoutComponent){
        let url = "/ui-api/object-info/"+objectType+"/picklist-values/012000000000000AAA";
        Api.standardApi(url).then((response) => {
            let newState = {};
            if(typeof(response) === "object" && response.hasOwnProperty("picklistFieldValues")){
                for(const key in response.picklistFieldValues){
                    newState[key+"PicklistValues"] = response.picklistFieldValues[key].values;
                }
            }
            setState({
                type: "update",
                state: newState
            });
        }).catch(err => {
            setState({
                type: "update",
                state: {
                    errorMessage: err.message
                }
            });
        });
    }
    function loadReferencePicklists(field, layoutComponent){
        const referenceInfo = field.referenceToInfos[0];
        let url = "/sobjects/"+referenceInfo.apiName;
        Api.standardApi(url).then((response) => {
            let newState = {};
            let items = [];
            response.recentItems.map((item) => {
                items.push({
                    Id: item.Id,
                    label: item.Name
                });
                return null;
            });
            newState[layoutComponent.apiName+"PicklistValues"] = items;
            setState({
                type: "update",
                state: newState
            });
        }).catch(err => {
            setState({
                type: "update",
                state: {
                    errorMessage: err.message
                }
            });
        });
    }
    function getFieldsState(layout, objectInfo){
        let newState = {};
        if(layout === null || objectInfo === null){
            return newState;
        }
        const fields = objectInfo.fields;
        layout.sections.map((section, key) => {
            section.layoutRows.map((row) => {
                row.layoutItems.map((layoutItem) => {
                    const layoutComponent = layoutItem.layoutComponents[0];
                    let apiName = layoutComponent.apiName;
                    let field = null;
                    if(layoutComponent.componentType === 'Field' && fields.hasOwnProperty(apiName)){
                        field = fields[apiName];
                    }
                    if(field === null){
                        return null;
                    }
                    let value = "";
                    // if(props.item !== null && props.item.hasOwnProperty(apiName)){
                    //     value = props.item[apiName];
                    // }
                    newState[apiName] = value;
                    if(field.dataType === "PICKLIST" || field.dataType === "Picklist" || field.dataType === "Reference"){
                        newState[apiName+"PicklistValues"] = [];
                        newState[apiName+"Selection"] = [];
                    }
                    if(field.dataType === "Reference"){
                        loadReferencePicklists(field, layoutComponent);
                    }
                    return null;
                });
                return null;
            });
            return null;
        });
        loadPicklists();
        return newState;
    }
    function renderLayout(){
        const { layout, objectInfo } = state;
        if(layout === null || objectInfo === null){
            return null;
        }
        const fields = objectInfo.fields;
        return (
            <Accordion id="application-settings-accordion">
                {
                    layout.sections.map((section, key) => {
                        return (
                            <AccordionPanel
                                summary={section.heading}
                                id={"panel-panel"+section.id}
                                expanded={((!!state.expandedPanels["panel"+section.id]) || (section.collapsible === false))}
                                onTogglePanel={() => togglePanel("panel"+section.id)}
                                key={key}
                            >
                                {
                                    section.layoutRows.map((row, rowKey) => {
                                        return (
                                            <div className="slds-grid slds-gutters" key={rowKey}>
                                                {
                                                    row.layoutItems.map((layoutItem, layoutkey) => {
                                                        const layoutComponent = layoutItem.layoutComponents[0];
                                                        let field = null;
                                                        if(layoutComponent.componentType === 'Field' && fields.hasOwnProperty(layoutComponent.apiName)){
                                                            field = fields[layoutComponent.apiName];
                                                        }
                                                        return (
                                                            <div className="slds-col slds-size_1-of-2" key={layoutkey}>
                                                                {
                                                                    layoutComponent.componentType === "EmptySpace" ?
                                                                        <div>&nbsp;</div>
                                                                    :
                                                                        (!layoutItem.editableForNew || !layoutItem.editableForUpdate) ?
                                                                            <div className="slds-form-element slds-m-bottom_x-small slds-m-right_small">
                                                                                <label className="slds-form-element__label" htmlFor="settings-owner">{layoutItem.label}</label>
                                                                                <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_right">
                                                                                    
                                                                                </div>
                                                                            </div>
                                                                        :
                                                                        renderField(layoutItem, field)
                                                                }
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        )
                                    })
                                }
                            </AccordionPanel>
                        )
                    })
                }
            </Accordion>
        )
    }
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
    function getPicklist(field, layoutComponent){
        let picklists = state[layoutComponent.apiName+"PicklistValues"];
        // const isDependentPicklist = field.isDependentPicklist;
        // if(isDependentPicklist && field.controllingPicklist.length > 0){
        //     const fieldValue = state[field.controllingPicklist];
        //     if(fieldValue && picklists.hasOwnProperty(fieldValue)){
        //         picklists = picklists[fieldValue];
        //     }
        // }

        if(!Array.isArray(picklists)){
            return [];
        }
        let list = [{
            id: '',
            label: '--None--'
        }];
        if(field.dataType === 'Reference'){
            list = [];
        }
        picklists.map(item => {
            // Handle for dependent fields
            if(typeof(item) === "string"){
                item = {
                    label: item
                }
            }
            let id = item.label;
            if(item.hasOwnProperty("Id")){
                id = item.Id;
            }
            list.push({
                id: id,
                label: item.label
            });
            return null;
        });
        return list;
    }
    function renderField(layoutItem, field){
        if(field === null){
            return null;
        }
        const layoutComponent = layoutItem.layoutComponents[0];
        let fieldElement = null;
        // const isDependentPicklist = field.isDependentPicklist;
        // if(isDependentPicklist && field.controllingPicklist.length > 0){
        //     const fieldValue = state[field.controllingPicklist];
        //     if(!fieldValue || fieldValue.length <= 0){
        //         return null;
        //     }
        // }
        switch(field.dataType){
            case 'STRING':
            case 'EMAIL':
            case 'String':
            case 'Email':
                let inputType = 'text';
                if(field.dataType === 'EMAIL' || field.dataType === 'Email'){
                    inputType = 'email';
                }
                fieldElement = (
                    <Input
                        label={layoutItem.label}
                        onChange={(event) => handleChange(event, layoutComponent.apiName)}
                        className="slds-m-bottom_x-small"
                        value={state[layoutComponent.apiName]}
                        required={layoutItem.required}
                        disabled={(state.Id.length > 0)}
                        type={inputType}
                    />
                );
                break;
            case 'TEXTAREA':
            case 'TextArea':
                fieldElement = (
                    <Textarea
                        label={layoutItem.label}
                        onChange={(event) => handleChange(event, layoutComponent.apiName)}
                        className="slds-m-bottom_x-small"
                        value={state[layoutComponent.apiName]}
                        required={layoutItem.required}
                        disabled={(state.Id.length > 0)}
                    />
                );
                break;
            case 'PICKLIST':
            case 'Picklist':
                fieldElement = (
                    <Combobox
                        events={{
                            onSelect: (event, data) => {
                                // const fieldName = getDependingField(field);
                                let newState = {};
                                // if(fieldName){
                                //     newState[fieldName+"Selection"] = [{id: '', label: ''}];
                                //     newState[fieldName] = "";
                                // }
                                setState({
                                    type: "update",
                                    state: {
                                        [layoutComponent.apiName]: data.selection[0].id,
                                        [layoutComponent.apiName+"Selection"]: {
                                            ...data.selection,
                                            icon: (
                                                <InlineIcon
                                                    assistiveText={{ label: 'Type' }}
                                                    category="standard"
                                                    name="account"
                                                />
                                            ),
                                        },
                                        ...newState
                                    }
                                });
                            },
                        }}
                        labels={{
                            label: layoutItem.label,
                            placeholder: layoutItem.label,
                        }}
                        options={getPicklist(field, layoutComponent)}
                        selection={state[layoutComponent.apiName+"Selection"]}
                        onRenderMenuItem={onRenderMenuItem}
                        classNameContainer={"slds-m-bottom_x-small customize-combobox"}
                        value={state[layoutComponent.apiName]}
                        required={layoutItem.required}
                        disabled={(state.Id.length > 0)}
                        variant="readonly"
                        input={{
                            props: {
                                disabled: (state.Id.length > 0),
                                required: layoutItem.required,
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
                );
                break;
            case 'Reference':
                // const referenceInfo = field.referenceToInfos[0];
                const value = state[layoutComponent.apiName];
                const selection = state[layoutComponent.apiName+"Selection"];
                fieldElement = (
                    <Combobox
                        // optionsSearchEntity={[
                        //     {
                        //         id: "recent-"+layoutComponent.apiName,
                        //         label: "Recent "+referenceInfo.apiName+"s"
                        //     },
                        // ]}
                        events={{
                            onSelect: (event, data) => {
                                const selection = data.selection;
                                if(selection.length > 0 && selection[0].hasOwnProperty("type") && (selection[0].type === "header" || selection[0].type === "footer")){
                                    return;
                                }
                                // const fieldName = getDependingField(field);
                                let newState = {};
                                // if(fieldName){
                                //     newState[fieldName+"Selection"] = [{id: '', label: ''}];
                                //     newState[fieldName] = "";
                                // }
                                setState({
                                    type: "update",
                                    state: {
                                        [layoutComponent.apiName]: selection[0].id,
                                        [layoutComponent.apiName+"Selection"]: selection,
                                        ...newState
                                    }
                                });
                            },
                        }}
                        labels={{
                            label: layoutItem.label,
                            placeholder: layoutItem.label,
                        }}
                        // options={getPicklist(field, layoutComponent)}
                        options={
                            comboboxFilterAndLimit({
                                inputValue: value,
                                options: getPicklist(field, layoutComponent),
                                selection: selection,
                            })
                        }
                        selection={selection}
                        onRenderMenuItem={onRenderMenuItem}
                        classNameContainer={"slds-m-bottom_x-small customize-combobox"}
                        value={state[layoutComponent.apiName]}
                        required={layoutItem.required}
                        disabled={(state.Id.length > 0)}
                        variant="inline-listbox"
                        input={{
                            props: {
                                iconRight: (
                                    selection.length > 0 ? (
                                        <InlineIcon
                                            category="utility"
                                            iconPosition="right"
                                            name="close"
                                            size="x-small"
                                            onClick={(event, data) => {
                                                setState({
                                                    type: "update",
                                                    state: {
                                                        [layoutComponent.apiName]: '',
                                                        [layoutComponent.apiName+"Selection"]: [],
                                                    }
                                                });
                                            }}
                                            inputIcon
                                            combobox
                                        />
                                    ) : (
                                        <InlineIcon inputIcon category="utility" size="x-small" name="search"/>
                                    )
                                )
                            }
                        }}
                    />
                );
                break;
            default:
                break;
        }
        return fieldElement;
    }
    function handleSubmit(){
        const { layout, objectInfo } = state;
        if(layout === null || objectInfo === null){
            return;
        }
        const requestData = {};
        layout.sections.map((section) => {
            section.layoutRows.map((row) => {
                row.layoutItems.map((layoutItem) => {
                    const layoutComponent = layoutItem.layoutComponents[0];
                    let apiName = layoutComponent.apiName;
                    if(layoutComponent.componentType !== 'Field'){
                        return null;
                    }
                    if(!layoutItem.editableForNew){
                        return null;
                    }
                    requestData[apiName] = state[apiName];
                    return null;
                });
                return null;
            });
            return null;
        });

        const url = "/sobjects/"+objectType;
        Api.standardApiPost(url, requestData).then((response) => {
            setState({
                type: "update",
                state: {
                    successMessage: objectType+" has been created."
                }
            });
        }).catch(err => {
            console.log(err);
        });

        console.log("requestData", requestData);
    }
    return (
        <div className="slds-p-horizontal_medium">
            <div className="slds-text-heading_small slds-m-bottom_medium">
                {
                    loading ?
                        <Spinner
                            size="medium"
                            variant="brand"
                            assistiveText={{ label: 'Loading...' }}
                        />
                    :
                    renderLayout()
                }
                {
                    loading === false ?
                        <div className="slds-grid slds-gutters">
                            <div className="slds-col slds-size_1-of-2">
                                {
                                    state.successMessage !== null ?
                                        <p className="slds-text-color_success slds-m-bottom_small">{state.successMessage}</p>
                                    :
                                        null
                                }
                                <Button variant="brand" onClick={() => handleSubmit()}>Save</Button>
                            </div>
                        </div>
                    :
                    null
                }
            </div>
        </div>
    )
}

export default UiApi;