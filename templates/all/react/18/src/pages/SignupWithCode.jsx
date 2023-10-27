import React from "react";
import Card from '@salesforce/design-system-react/components/card';
import Input from '@salesforce/design-system-react/components/input';
import Button from '@salesforce/design-system-react/components/button';
import { signupWithCodeAdapter } from "../ApexAdapter";

const SignupWithCode = (props) => {
    const [state, setState] = React.useState({
        email: "",
        code: "",
        identifier: "",
        verifyCode: false,
        startUrl: "/",
        loading: false,
        errorMessage: null
    });
    function handleChange(e, name){
        setState({
            ...state,
            [name]: e.target.value,
        });
    }
    function onSubmit(e){
        e.preventDefault();
        if(!isFormValid()){
            return;
        }
        const { email, verifyCode, identifier, code } = state;
        if(verifyCode){
            let completeFunc = null;
            if(typeof(window.onRegistrationFormComplete) === "function"){
                completeFunc = window.onRegistrationFormComplete;
            }
            window.onRegistrationFormComplete = function(request, event, data){
                setState({
                    ...state,
                    loading: false,
                    errorMessage: 'Unable to complete signup!'
                });

                if(completeFunc !== null){
                    window.onRegistrationFormComplete = completeFunc;
                }
            }
            window.verifyEmailRegistrationAF(identifier, code);
            // verifySignupCodeAdapter(identifier, code, (data) => {
            //     if(typeof(data) === "object" && data.hasOwnProperty("isSuccess") && data.isSuccess){
            //         window.verifyEmailRegistrationAF(identifier, code);
            //     }else{
            //         let message = 'Unable to verify code.';
            //         if(typeof(data) === "object" && data.hasOwnProperty("result")){
            //             message = data.result;
            //         }
            //         setState({
            //             ...state,
            //             loading: true,
            //             errorMessage: message
            //         });
            //         console.log("Signup Failed");
            //     }
            // });
        }else{
            signupWithCodeAdapter(email, (data) => {
                if(typeof(data) === "object" && data.hasOwnProperty("isSuccess") && data.isSuccess){
                    setState({
                        ...state,
                        identifier: data.identifier,
                        loading: false,
                        verifyCode: true
                    });
                }else{
                    let message = 'User already exists.';
                    if(typeof(data) === "object" && data.hasOwnProperty("result")){
                        message = data.result;
                    }
                    setState({
                        ...state,
                        loading: true,
                        errorMessage: message
                    });
                    console.log("Signup Failed");
                }
            });
        }
        
        setState({
            ...state,
            loading: true,
            errorMessage: null
        });
    }
    function isFormValid(){
        const { email } = state;
        if(email.length > 0){
            return true;
        }
        return false;
    }
    return (
        <div className="slds-m-around_medium">
            <div className="slds-grid slds-wrap slds-grid_align-center">
                <form className="slds-size_1-of-1 slds-small-size_8-of-12 slds-medium-size_1-of-3" onSubmit={(e) => onSubmit(e)} noValidate>
                    <Card heading="Signup">
                        <div className="slds-p-around_medium">
                            {
                                state.verifyCode ?
                                    <Input
                                        name="code"
                                        type="text"
                                        label={"Code"}
                                        value={state.code}
                                        onChange={(e) => handleChange(e, "code")}
                                    />
                                :
                                    <Input
                                        name="email"
                                        type="email"
                                        label={"Email"}
                                        value={state.email}
                                        onChange={(e) => handleChange(e, "email")}
                                        required
                                    />
                            }
                            {
                                state.errorMessage !== null ?
                                    <p className="slds-m-top_medium slds-text-color_destructive">{state.errorMessage}</p>
                                :
                                    null
                            }
                            {
                                state.verifyCode ?
                                    <Button
                                        className="slds-m-top_medium"
                                        label="Verify Account"
                                        variant="brand"
                                        type="submit"
                                    />
                                :
                                    <Button
                                        className="slds-m-top_medium"
                                        label="Signup"
                                        variant="brand"
                                        type="submit"
                                    />
                            }
                        </div>
                    </Card>
                </form>
            </div>
            
        </div>
    )
};

export default SignupWithCode;