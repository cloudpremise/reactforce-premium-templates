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
import Textarea from '../Textarea';
import Spinner from '@salesforce/design-system-react/components/spinner';
import Api from "../../../../assets/js/utils/Api";


const Worker = (props) => {
    let defaultState = {
        Name: "",
        ApexClass__c: "",
        BatchScope__c: "200",
        scheduleType: [],
        ScheduleType__c: "",
        CronExpression__c: "",
        CronJobDetailName__c: "",
        CronTriggerId__c: "",
        DefaultBatchQuery__c: "",
        Description__c: "",
        Rate__c: "",
        RatePer__c: "",
        ratePer: [],
        Task__c: "",
        Type__c: "",
        jobType: [],
        modifiedFields: {},
        error: true,
        errorMessage: null,
        loading: false,
        deleteModal: false,
        hasModifiedFields: false
    };
    if(props.item !== null){
        defaultState = {
            ...defaultState,
            ...props.item,
            scheduleType: [{
                id: props.item.ScheduleType__c,
                label: props.item.ScheduleType__c
            }],
            jobType: [{
                id: props.item.Type__c,
                label: props.item.Type__c
            }]
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
    function handleSelectChange(data, selectionName, name){
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
        let value = null;
        if(selection.length > 0){
            value = selection[0].id;
        }
        setState({
            type: "update",
            state: {
                [selectionName+"InputValue"]: '',
                [selectionName]: selection,
                [name]: value,
                hasModifiedFields: true
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
    function getScheduleTypeOptions(){
        const options = [
            {
                id: "Cron",
                label: "Cron"
            },
            {
                id: "Fixed Rate",
                label: "Fixed Rate"
            }
        ];
        return options;
    }
    function getRatePerSelection(){
        if(state.ratePer.length > 0){
            return state.ratePer;
        }
        if(state.RatePer__c.length <= 0){
            return [];
        }
        return [{
            id: state.RatePer__c,
            label: state.RatePer__c
        }]
    }
    function getRateTypeOptions(){
        const options = [
            {
                id: "Minutes",
                label: "Minutes"
            },
            {
                id: "Hours",
                label: "Hours"
            },
            {
                id: "Days",
                label: "Days"
            }
        ];
        return options;
    }
    function getJobTypeOptions(){
        const options = [
            {
                id: "BatchApex",
                label: "BatchApex"
            },
            {
                id: "Queueable",
                label: "Queueable"
            },
            {
                id: "Future",
                label: "Future"
            }
        ];
        return options;
    }
    function onSuccess(){
        const data = {
            sObject: {
                Name: state.Name,
                ApexClass__c: state.ApexClass__c,
                BatchScope__c: state.BatchScope__c,
                ScheduleType__c: state.ScheduleType__c,
                DefaultBatchQuery__c: state.DefaultBatchQuery__c,
                Description__c: state.Description__c,
                Task__c: state.Task__c,
                Type__c: state.Type__c,
                attributes: {
                    type: "M2_Worker__c"
                }
            }
        };

        if(state.ScheduleType__c === "Cron"){
            data.sObject = {
                ...data.sObject,
                CronExpression__c: state.CronExpression__c,
                CronJobDetailName__c: state.CronJobDetailName__c,
            };
            if(state.CronTriggerId__c.length > 0){
                data.sObject['CronTriggerId__c'] = state.CronTriggerId__c;
            }
        }else{
            data.sObject = {
                ...data.sObject,
                Rate__c: state.Rate__c,
                RatePer__c: state.RatePer__c,
            };
        }

        let route = '/v1/sobject';
        let method = 'POST';
        if(state.hasOwnProperty("Id") && state.Id.length > 0){
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
        const { Name, ApexClass__c, ScheduleType__c, CronExpression__c, Rate__c, RatePer__c, Type__c } = state;
        if(Name.length > 0 && ScheduleType__c.length > 0 && ApexClass__c.length > 0 && Type__c.length > 0){
            if(ScheduleType__c === "Cron" && CronExpression__c.length > 0){
                return true;
            }else if(Rate__c.length > 0 && RatePer__c.length > 0){
                return true;
            }
            return false;
        }
        return false;
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
                            assistiveText={{ label: 'Saving Job...' }}
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
                        <Button key="cancel" label="Cancel" onClick={props.onCancel} />
                        {
                            props.item !== null ?
                                <>
                                {
                                    props.item.hasOwnProperty("CronTriggerId__c") && props.item.CronTriggerId__c.length > 0 ?
                                        <Button key="save" label="Unschedule" disabled={state.hasModifiedFields} variant="neutral" onClick={() => props.onWorkerAction("unschedule")} />
                                    :
                                    <Button key="save" label="Schedule" disabled={state.hasModifiedFields} variant="neutral" onClick={() => props.onWorkerAction("schedule")} />
                                }
                                    
                                    <Button key="save" label="Run Now" disabled={state.hasModifiedFields} variant="neutral" onClick={() => props.onWorkerAction("runjob")} />
                                    <Button key="save" label="Delete" variant="neutral" onClick={() => props.onWorkerAction("delete")} />
                                </>
                            :
                            null
                        }
                        <Button key="save" label="Save & Close" variant="brand" disabled={!isFormValid()} onClick={onSuccess} />
                    </>
            ]}
            onRequestClose={props.onCancel}
            heading="New Job"
        >
            <div className="slds-p-around_medium">
                <Input
                    label="Job Name"
                    onChange={(event) => handleChange(event, "Name")}
                    className="slds-m-bottom_x-small"
                    value={state.Name}
                    required={true}
                />
                <Input
                    label="Apex Class"
                    onChange={(event) => handleChange(event, "ApexClass__c")}
                    className="slds-m-bottom_x-small"
                    value={state.ApexClass__c}
                    required={true}
                />
                <Input
                    label="Batch Scope"
                    onChange={(event) => handleChange(event, "BatchScope__c")}
                    className="slds-m-bottom_x-small"
                    type="number"
                    minValue={1}
                    maxValue={200}
                    value={state.BatchScope__c}
                />
                <Combobox
                    events={{
                        onSelect: (event, data) => handleSelectChange(data, "scheduleType", "ScheduleType__c")
                    }}
                    labels={{
                        label: "Schedule Type"
                    }}
                    options={getScheduleTypeOptions()}
                    onRenderMenuItem={onRenderMenuItem}
                    selection={state.scheduleType}
                    value={state.ScheduleType__c}
                    variant="readonly"
                    classNameContainer={"customize-combobox slds-m-bottom_x-small"}
                    required={true}
                    // errorText={((state.ScheduleType__c.length <= 0) ?  'Complete this field.' : null)}
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
                {
                    state.ScheduleType__c === "Cron" ?
                        <>
                            <Input
                                label="Cron Expression"
                                onChange={(event) => handleChange(event, "CronExpression__c")}
                                className="slds-m-bottom_x-small"
                                value={state.CronExpression__c}
                                required={true}
                            />
                            <Input
                                label="Cron Job Detail Name"
                                onChange={(event) => handleChange(event, "CronJobDetailName__c")}
                                className="slds-m-bottom_x-small"
                                value={state.CronJobDetailName__c}
                            />
                            <Input
                                label="Cron Trigger Id"
                                onChange={(event) => handleChange(event, "CronTriggerId__c")}
                                className="slds-m-bottom_x-small"
                                value={state.CronTriggerId__c}
                                disabled
                            />
                        </>
                    :
                    null
                }
                <Textarea 
                    label="Default Batch Query"
                    onChange={(event) => handleChange(event, "DefaultBatchQuery__c")}
                    classNameContainer={"slds-m-bottom_x-small"}
                    value={state.DefaultBatchQuery__c}
                />
                <Textarea 
                    label="Description"
                    onChange={(event) => handleChange(event, "Description__c")}
                    classNameContainer={"slds-m-bottom_x-small"}
                    value={state.Description__c}
                />
                {
                    state.ScheduleType__c === "Fixed Rate" ?
                        <>
                            <Input
                                label="Rate"
                                onChange={(event) => handleChange(event, "Rate__c")}
                                className="slds-m-bottom_x-small"
                                type="number"
                                value={state.Rate__c}
                                required={true}
                                minValue={1}
                            />
                            <Combobox
                                events={{
                                    onSelect: (event, data) => handleSelectChange(data, "ratePer", "RatePer__c")
                                }}
                                labels={{
                                    label: "Rate Per"
                                }}
                                options={getRateTypeOptions()}
                                onRenderMenuItem={onRenderMenuItem}
                                selection={getRatePerSelection()}
                                value={state.RatePer__c}
                                variant="readonly"
                                classNameContainer={"customize-combobox slds-m-bottom_x-small"}
                                required={true}
                                // errorText={((state.RatePer__c.length <= 0) ?  'Complete this field.' : null)}
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
                        </>
                    :
                    null
                }
                <Input
                    label="Task"
                    onChange={(event) => handleChange(event, "Task__c")}
                    className="slds-m-bottom_x-small"
                    value={state.Task__c}
                />
                <Combobox
                    events={{
                        onSelect: (event, data) => handleSelectChange(data, "jobType", "Type__c")
                    }}
                    labels={{
                        label: "Job Type"
                    }}
                    options={getJobTypeOptions()}
                    onRenderMenuItem={onRenderMenuItem}
                    selection={state.jobType}
                    value={state.Type__c}
                    variant="readonly"
                    classNameContainer={"customize-combobox slds-m-bottom_x-small"}
                    required={true}
                    // errorText={((state.Type__c.length <= 0) ?  'Complete this field.' : null)}
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
        </Modal>
    )
};

Worker.defaultProps = {
    item: null
}
Worker.propTypes = {
    classes: PropTypes.object,
    onCancel: PropTypes.func,
    onSuccess: PropTypes.func,
    onDelete: PropTypes.func,
    open: PropTypes.bool,
    item: PropTypes.object
};

export default connect(mapStateToProps)(Worker);