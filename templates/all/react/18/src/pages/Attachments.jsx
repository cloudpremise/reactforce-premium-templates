import React from "react";
import Input from '@salesforce/design-system-react/components/input';
import stateReducer from "../hooks/stateReducer";
import Api from "../Api";
import axios from "axios";
import { saveAttachment } from "../ApexAdapter";
import Spinner from '@salesforce/design-system-react/components/spinner';

const Attachments = (props) => {
    const MAX_FILE_SIZE = 4500000; //Max file size 4.5 MB 
    const CHUNK_SIZE = 750000; //Chunk Max size 750Kb 
    const [state, setState] = React.useReducer(stateReducer, {
        parentId: "00Q0p000003PlmT",
        files: null,
        cancelToken: null,
        attachment: null,
        attachmentId: "",
        attachmentBody: null
    });

    function handleChange(event, name){
        setState({
            type: "update",
            state: {
                [name]: event.target.value,
            }
        });
	}

    function handleFileChange(event, name){
        setState({
            type: "update",
            state: {
                [name]: event.target.files,
            }
        });
	}

    function toBase64(file){
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    async function handleSubmit(){
        const { parentId, files } = state;
        if(files === null || files.length <= 0){
            return;
        }
        const file = files[0];
        let fileContents = await toBase64(file);
        const requestData = {
            Body: fileContents,
            ContentType: file.type,
            Name: file.name,
            ParentId: parentId,
            IsPrivate: false,
            Description: file.name,
        };
        var base64 = 'base64,';
        var dataStart = fileContents.indexOf(base64) + base64.length;
        fileContents = fileContents.substring(dataStart);
        uploadProcess(file, fileContents);

        setState({type: "update", state: {
            loading: true,
            attachment: requestData
        }});
    }

    function uploadProcess(file, fileContents) {
        if (file.size > MAX_FILE_SIZE) {
            return;
        }
        // set a default size or startpostiton as 0 
        var startPosition = 0;
        // calculate the end size or endPostion using Math.min() function which is return the min. value   
        var endPosition = Math.min(fileContents.length, startPosition + CHUNK_SIZE);

        // start with the initial chunk, and set the attachId(last parameter)is null in begin
        uploadInChunk(file, fileContents, startPosition, endPosition, '');
    }

    function uploadInChunk(file, fileContents, startPosition, endPosition, attachId = '') {
        var getchunk = fileContents.substring(startPosition, endPosition);
        const { parentId } = state;
        saveAttachment(parentId, file.name, encodeURIComponent(getchunk), file.type, attachId, (result) => {
            console.log(result);
            attachId = result;
            startPosition = endPosition;
            endPosition = Math.min(fileContents.length, startPosition + CHUNK_SIZE);
            if (startPosition < endPosition) {
                uploadInChunk(file, fileContents, startPosition, endPosition, attachId);
            }else{
                setState({type: "update", state: {
                    loading: false,
                    attachmentId: attachId
                }});
            }
        });        
    }

    async function handleGetAttachment(){
        const { attachmentId, attachment } = state;
        if(attachmentId === null || attachmentId.length <= 0){
            return;
        }
        const cancelToken = axios.CancelToken.source();
        Api.getFileBlob("/sobjects/Attachment/"+attachmentId+"/Body", cancelToken).then(async function(blob){
            console.log(blob);
            const fileContents = await toBase64(blob);

            var a = document.createElement("a");
            document.body.appendChild(a);
            a.href = fileContents;
            a.target = "_blank";
            a.download = attachment.Name;
            a.click();

            setState({type: "update", state: {
                loading: false,
                cancelToken: null,
                attachmentBody: fileContents
            }});
        }).catch(err => {
            console.log(err);
            setState({type: "update", state: {
                loading: false,
                error: true,
                errorMessage: err.message,
                cancelToken: null
            }});
        });

        setState({type: "update", state: {
            loading: true,
            cancelToken: cancelToken
        }});
    }
    console.log(state);
    return (
        <div className="slds-p-around_medium">
            <div className="slds-grid slds-grid_vertical-stretch slds-wrap slds-gutters">
                <div className="slds-p-bottom_small slds-order_1 slds-medium-order_2 slds-col slds-size_12-of-12 slds-medium-size_6-of-12">
                    <Input
                        label="Salesforce Id"
                        onChange={(event) => handleChange(event, "parentId")}
                        className="slds-m-bottom_small"
                        value={state.parentId}
                    />
                    <div className="slds-form-element slds-m-bottom_medium">
                        <span className="slds-form-element__label" id="file-selector-primary-label-105">Attachment</span>
                        <div className="slds-form-element__control">
                            <div className="slds-file-selector slds-file-selector_files">
                                <div className="slds-file-selector__dropzone">
                                    <input type="file" onChange={(event) => handleFileChange(event, "files")} className="slds-file-selector__input slds-assistive-text" accept="image/*" id="file-upload-input-107" aria-labelledby="file-selector-primary-label-105 file-selector-secondary-label106" />
                                    <label className="slds-file-selector__body" htmlFor="file-upload-input-107" id="file-selector-secondary-label106">
                                    <span className="slds-file-selector__button slds-button slds-button_neutral">
                                        <svg className="slds-button__icon slds-button__icon_left" aria-hidden="true">
                                        <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#upload"></use>
                                        </svg>Upload Files</span>
                                        <span className="slds-file-selector__text slds-medium-show">or Drop Files</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        className="slds-button slds-button_brand"
                        onClick={() => handleSubmit()}
                    >
                        Upload
                    </button>
                </div>
                <div className="slds-p-bottom_small slds-order_1 slds-medium-order_2 slds-col slds-size_12-of-12 slds-medium-size_6-of-12">
                    <Input
                        label="Attachment Id"
                        onChange={(event) => handleChange(event, "attachmentId")}
                        className="slds-m-bottom_small"
                        value={state.attachmentId}
                    />
                    <button
                        className="slds-button slds-button_brand"
                        onClick={() => handleGetAttachment()}
                    >
                        Get Attachment
                    </button>
                </div>
            </div>
            {
                state.loading ?
                    <Spinner
                        assistiveText={{ label: "Loading ..." }}
                        hasContainer={false}
                        size="large"
                        variant="brand"
                    />
                :
                null
            }
            {
                state.attachmentBody !== null ?
                    <img src={state.attachmentBody} alt="attachment" />
                :
                null
            }
        </div>
    )
};

export default Attachments;