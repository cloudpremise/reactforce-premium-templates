import React from "react";
import PropTypes from "prop-types";
import Modal from '@salesforce/design-system-react/components/modal'; 
import Button from '@salesforce/design-system-react/components/button';
import stateReducer from "../../hooks/stateReducer";
import Input from '@salesforce/design-system-react/components/input';
import Spinner from '@salesforce/design-system-react/components/spinner';
import { getConnection } from "../../hooks/useJsforce";


const JsforceAccount = (props) => {
    let defaultState = {
        Id: "",
        AccountId: "",
        Name: "",
        Website: "",
        Phone: "",
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
    function onSuccess(){
        if(props.item !== null){
            // data.sObject = {
            //     ...props.item,
            // };
        }

        let data = {
            Name: state.Name,
            Phone: state.Phone,
            Website: state.Website,
        };
        const conn = getConnection();
        if(state.hasOwnProperty("Id") && state.Id.length > 0){
            data = {
                ...data,
                Id: state.Id,
            };
            conn.sobject("Account").update(data, function(err, ret) {
                if (err || !ret.success) { return console.error(err, ret); }
                setState({
                    type: "update",
                    state: {
                        sobject: data,
                        accountModal: true,
                        loading: false
                    }
                });
                props.onSuccess(data);
            });
        }else{
            conn.sobject("Account").create(data, function(err, ret) {
                if (err || !ret.success) { return console.error(err, ret); }
                setState({
                    type: "update",
                    state: {
                        sobject: data,
                        accountModal: true,
                        loading: false
                    }
                });
                data = {
                    ...data,
                    Id: ret.id,
                    CreatedDate: new Date().toISOString()+"+0000"
                };
                props.onSuccess(data);
            });
        }

        setState({type: "update", state: {
            loading: true,
        }});
    }
    function isFormValid(){
        const { Name } = state;
        if(Name.length > 0){
            return true;
        }
        return false;
    }
    return (
        <Modal
            isOpen={props.open}
            portalClassName="slds-scope"
            footer={[
                state.loading ?
                    <div key="spinner" className="slds-is-relative" style={{height: "45px"}}>
                        <Spinner
                            size="medium"
                            variant="brand"
                            assistiveText={{ label: 'Saving Account...' }}
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
                                <Button key="delete" label="Delete" variant="neutral" onClick={() => props.onObjectAction("delete")} />
                            :
                            null
                        }
                        <Button key="save" label="Save & Close" variant="brand" disabled={!isFormValid()} onClick={onSuccess} />
                    </>
            ]}
            onRequestClose={props.onCancel}
            heading={(props.item !== null ? "Update Account" : "New Account")}
        >
            <div className="slds-p-around_medium">
                <Input
                    label="Account Name"
                    onChange={(event) => handleChange(event, "Name")}
                    className="slds-m-bottom_x-small"
                    value={state.Name}
                    required={true}
                />
                <Input
                    label="Phone"
                    onChange={(event) => handleChange(event, "Phone")}
                    className="slds-m-bottom_x-small"
                    value={state.Phone}
                />
                <Input
                    label="Website"
                    onChange={(event) => handleChange(event, "Website")}
                    className="slds-m-bottom_x-small"
                    value={state.Website}
                />
            </div>
        </Modal>
    )
};

JsforceAccount.defaultProps = {
    item: null
}
JsforceAccount.propTypes = {
    classes: PropTypes.object,
    onCancel: PropTypes.func,
    onSuccess: PropTypes.func,
    onDelete: PropTypes.func,
    open: PropTypes.bool,
    item: PropTypes.object
};

export default JsforceAccount;