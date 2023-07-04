import React from "react";
import { useNavigate } from "react-router-dom";
import Checkbox from '@salesforce/design-system-react/components/checkbox';

const Settings = (props) => {
    let state = {
        tabs: {
            home: true,
            contacts: false,
            users: false,
            standardapi: true,
            internalapi: false,
            streamingapi: true,
            attachments: true,
            contentversion: true,
            lds: true,
            sobjectapi: false
        }
    }
    let savedTabs = localStorage.getItem("reactforce_settings");
    if(savedTabs !== null){
        try{
            savedTabs = JSON.parse(savedTabs);
            state = savedTabs;
        }catch(e){ }
    }
    const navigate = useNavigate();
    function handleCheckbox(e, name){
        let newState = {
            ...state,
            tabs: {
                ...state.tabs,
                [name]: e.target.checked
            }
        };
        localStorage.setItem("reactforce_settings", JSON.stringify(newState));
        let url = window.location.pathname;
        url = url.replace(props.basename, "");
        navigate(url);
        window.history.replaceState(null, document.title, props.basename+url+window.location.search);
    }
    return (
        <div className="slds-p-horizontal_small">
            <div className="slds-grid slds-gutters slds-grid_vertical-align-end slds-m-bottom_small">
                <div className="slds-col slds-size_2-of-8">
                    <Checkbox
                        id="settings-home"
                        labels={{
                            label: 'Home',
                            toggleEnabled: null,
                            toggleDisabled: null
                        }}
                        onChange={(e) => handleCheckbox(e, "home")}
                        checked={state.tabs.home}
                        variant="toggle"
                    />
                    <Checkbox
                        id="settings-contacts"
                        className="slds-m-top_small"
                        labels={{
                            label: 'Contacts',
                            toggleEnabled: null,
                            toggleDisabled: null
                        }}
                        onChange={(e) => handleCheckbox(e, "contacts")}
                        checked={state.tabs.contacts}
                        variant="toggle"
                    />
                    <Checkbox
                        id="settings-users"
                        className="slds-m-top_small"
                        labels={{
                            label: 'Users',
                            toggleEnabled: null,
                            toggleDisabled: null
                        }}
                        onChange={(e) => handleCheckbox(e, "users")}
                        checked={state.tabs.users}
                        variant="toggle"
                    />
                    <Checkbox
                        id="settings-standardapi"
                        className="slds-m-top_small"
                        labels={{
                            label: 'Standard Api',
                            toggleEnabled: null,
                            toggleDisabled: null
                        }}
                        onChange={(e) => handleCheckbox(e, "standardapi")}
                        checked={state.tabs.standardapi}
                        variant="toggle"
                    />
                    <Checkbox
                        id="settings-internalapi"
                        className="slds-m-top_small"
                        labels={{
                            label: 'Internal Api',
                            toggleEnabled: null,
                            toggleDisabled: null
                        }}
                        onChange={(e) => handleCheckbox(e, "internalapi")}
                        checked={state.tabs.internalapi}
                        variant="toggle"
                    />
                    <Checkbox
                        id="settings-streamingapi"
                        className="slds-m-top_small"
                        labels={{
                            label: 'Streaming Api',
                            toggleEnabled: null,
                            toggleDisabled: null
                        }}
                        onChange={(e) => handleCheckbox(e, "streamingapi")}
                        checked={state.tabs.streamingapi}
                        variant="toggle"
                    />
                    <Checkbox
                        id="settings-attachments"
                        className="slds-m-top_small"
                        labels={{
                            label: 'Attachments',
                            toggleEnabled: null,
                            toggleDisabled: null
                        }}
                        onChange={(e) => handleCheckbox(e, "attachments")}
                        checked={state.tabs.attachments}
                        variant="toggle"
                    />
                    <Checkbox
                        id="settings-contentversion"
                        className="slds-m-top_small"
                        labels={{
                            label: 'Content Version',
                            toggleEnabled: null,
                            toggleDisabled: null
                        }}
                        onChange={(e) => handleCheckbox(e, "contentversion")}
                        checked={state.tabs.contentversion}
                        variant="toggle"
                    />
                    <Checkbox
                        id="settings-lds"
                        className="slds-m-top_small"
                        labels={{
                            label: 'Lds',
                            toggleEnabled: null,
                            toggleDisabled: null
                        }}
                        onChange={(e) => handleCheckbox(e, "lds")}
                        checked={state.tabs.lds}
                        variant="toggle"
                    />
                    <Checkbox
                        id="settings-sobjectapi"
                        className="slds-m-top_small"
                        labels={{
                            label: 'SObject Api',
                            toggleEnabled: null,
                            toggleDisabled: null
                        }}
                        onChange={(e) => handleCheckbox(e, "sobjectapi")}
                        checked={state.tabs.sobjectapi}
                        variant="toggle"
                    />
                </div>
            </div>
        </div>
    )
}

export default Settings;