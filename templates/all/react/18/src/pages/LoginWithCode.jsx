import React from "react";
import Card from '@salesforce/design-system-react/components/card';
import Input from '@salesforce/design-system-react/components/input';
import Button from '@salesforce/design-system-react/components/button';
import { loginWithCodeAdapter } from "../ApexAdapter";

const LoginWithCode = (props) => {
    const [state, setState] = React.useState({
        email: "",
        code: "",
        userId: "",
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
        const { email, verifyCode, identifier, code, userId } = state;
        if(verifyCode){
            let completeFunc = null;
            if(typeof(window.onLoginFormComplete) === "function"){
                completeFunc = window.onLoginFormComplete;
            }
            window.onLoginFormComplete = function(request, event, data){
                setState({
                    ...state,
                    loading: false,
                    errorMessage: 'Verification code is not valid!'
                });

                if(completeFunc !== null){
                    window.onLoginFormComplete = completeFunc;
                }
            }
            window.verifyEmailLoginAF(userId, identifier, code);
        }else{
            loginWithCodeAdapter(email, (data) => {
                if(typeof(data) === "object" && data.hasOwnProperty("isSuccess") && data.isSuccess){
                    setState({
                        ...state,
                        identifier: data.identifier,
                        userId: data.userId,
                        loading: false,
                        verifyCode: true
                    });
                }else{
                    let message = 'Email is not valid!';
                    if(typeof(data) === "object" && data.hasOwnProperty("result")){
                        message = data.result;
                    }
                    setState({
                        ...state,
                        loading: true,
                        errorMessage: message
                    });
                    console.log("Login Failed");
                }
            });
        }
        
        setState({
            ...state,
            loading: true,
            errorMessage: null
        });
    }
    return (
        <div className="slds-m-around_medium">
            <div className="slds-grid slds-wrap slds-grid_align-center">
                <form className="slds-size_1-of-3" onSubmit={(e) => onSubmit(e)} noValidate>
                    <Card heading="Login">
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
                                        label={"Email Address"}
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
                                        label="Login"
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

export default LoginWithCode;