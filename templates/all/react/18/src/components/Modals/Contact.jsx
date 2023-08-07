import React from "react";
import PropTypes from "prop-types";
import Modal from '@salesforce/design-system-react/components/modal'; 
import Button from '@salesforce/design-system-react/components/button';
import stateReducer from "../../hooks/stateReducer";
import Input from '@salesforce/design-system-react/components/input';
import Spinner from '@salesforce/design-system-react/components/spinner';
import Api from "../../Api";


const Contact = (props) => {
    let defaultState = {
        Id: "",
        AccountId: "",
        FirstName: "",
        LastName: "",
        Name: "",
        Email: "",
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
        const data = {
            sObject: {
                Name: "",
                Email: "",
                Phone: "",
                attributes: {
                    type: "Contact"
                }
            }
        };

        data.sObject = {
            ...data.sObject,
            Name: state.FirstName+" "+state.LastName,
            FirstName: state.FirstName,
            LastName: state.LastName,
            Email: state.Email,
            Phone: state.Phone,
        };

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
        const { FirstName, LastName, Email, Phone } = state;
        if(FirstName.length > 0 && LastName.length > 0 && Email.length > 0 && Phone.length > 0){
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
                            assistiveText={{ label: 'Saving Contact...' }}
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
                                <Button key="delete" label="Delete" variant="neutral" onClick={() => props.onWorkerAction("delete")} />
                            :
                            null
                        }
                        <Button key="save" label="Save & Close" variant="brand" disabled={!isFormValid()} onClick={onSuccess} />
                    </>
            ]}
            onRequestClose={props.onCancel}
            heading="New Contact"
        >
            <div className="slds-p-around_medium">
                <Input
                    label="First Name"
                    onChange={(event) => handleChange(event, "FirstName")}
                    className="slds-m-bottom_x-small"
                    value={state.FirstName}
                    required={true}
                />
                <Input
                    label="Last Name"
                    onChange={(event) => handleChange(event, "LastName")}
                    className="slds-m-bottom_x-small"
                    value={state.LastName}
                    required={true}
                />
                <Input
                    label="Email"
                    onChange={(event) => handleChange(event, "Email")}
                    className="slds-m-bottom_x-small"
                    type="email"
                    value={state.Email}
                    required={true}
                />
                <Input
                    label="Phone"
                    onChange={(event) => handleChange(event, "Phone")}
                    className="slds-m-bottom_x-small"
                    value={state.Phone}
                    required={true}
                />
            </div>
        </Modal>
    )
};

Contact.defaultProps = {
    item: null
}
Contact.propTypes = {
    classes: PropTypes.object,
    onCancel: PropTypes.func,
    onSuccess: PropTypes.func,
    onDelete: PropTypes.func,
    open: PropTypes.bool,
    item: PropTypes.object
};

export default Contact;