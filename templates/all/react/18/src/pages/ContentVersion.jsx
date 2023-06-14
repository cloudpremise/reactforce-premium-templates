import React from "react";
import Input from '@salesforce/design-system-react/components/input';
import stateReducer from "../hooks/stateReducer";
import axios from "axios";
import { saveContentVersion } from "../ApexAdapter";
import Spinner from '@salesforce/design-system-react/components/spinner';

const ContentVersion = (props) => {
    const MAX_FILE_SIZE = 4500000; //Max file size 4.5 MB 
    const CHUNK_SIZE = 750000; //Chunk Max size 750Kb 
    const [state, setState] = React.useReducer(stateReducer, {
        parentId: "00Q0p000003PlmT",
        files: null,
        cancelToken: null,
        contentVersion: null,
        contentVersionId: "",
        contentVersionBody: null
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
        const { files } = state;
        if(files === null || files.length <= 0){
            return;
        }
        const cancelToken = axios.CancelToken.source();
        const file = files[0];
        let fileContents = await toBase64(file);
        setState({type: "update", state: {
            loading: true,
            cancelToken: cancelToken,
        }});
        var base64 = 'base64,';
        var dataStart = fileContents.indexOf(base64) + base64.length;
        fileContents = fileContents.substring(dataStart);        
        uploadProcess(file, fileContents);
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
        saveContentVersion(file.name, encodeURIComponent(getchunk), attachId, (result) => {
            attachId = result;
            startPosition = endPosition;
            endPosition = Math.min(fileContents.length, startPosition + CHUNK_SIZE);
            if (startPosition < endPosition) {
                uploadInChunk(file, fileContents, startPosition, endPosition, attachId);
            }else{
                setState({type: "update", state: {
                    loading: false,
                    cancelToken: null,
                    contentVersion: null,
                    contentVersionId: attachId
                }});
            }
        });        
    }

    async function handleGetContentVersion(){
        const { contentVersionId, files } = state;
        if(contentVersionId === null || contentVersionId.length <= 0){
            return;
        }
        getContentVersion(contentVersionId, async (data) => {
            const result = JSON.parse(data);
            const byteCharacters = atob(result.VersionData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const file = files[0];
            const byteArray = new Uint8Array(byteNumbers);
            var blob = new Blob([byteArray], {type: file.type});
            const fileContents = await toBase64(blob);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.href = fileContents;
            a.target = "_blank";
            a.download = result.Title;
            a.click();

            setState({type: "update", state: {
                loading: false,
                cancelToken: null,
                contentVersionBody: fileContents
            }});
        }); 
        const cancelToken = axios.CancelToken.source();
        setState({type: "update", state: {
            loading: true,
            cancelToken: cancelToken
        }});
    }
    function isImage(){
        const { files } = state;
        if(files === null){
            return false;
        }
        const file = files[0];
        return (file.type.indexOf("image") !== -1);
    }
    return (
        <div className="slds-p-around_medium">
            <div className="slds-grid slds-grid_vertical-stretch slds-wrap slds-gutters">
                <div className="slds-p-bottom_small slds-order_1 slds-medium-order_2 slds-col slds-size_12-of-12 slds-medium-size_6-of-12">
                    <div className="slds-form-element slds-m-bottom_medium">
                        <span className="slds-form-element__label" id="file-selector-primary-label-105">Content Version</span>
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
                        label="Content Version Id"
                        onChange={(event) => handleChange(event, "contentVersionId")}
                        className="slds-m-bottom_small"
                        value={state.contentVersionId}
                    />
                    <button
                        className="slds-button slds-button_brand"
                        onClick={() => handleGetContentVersion()}
                    >
                        Get Content Version
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
                state.contentVersionBody !== null && isImage() ?
                    <img src={state.contentVersionBody} alt="contentVersion" />
                :
                null
            }
        </div>
    )
};

export default ContentVersion;