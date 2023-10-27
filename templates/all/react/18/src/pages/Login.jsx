import React from "react";
import Card from '@salesforce/design-system-react/components/card';
import Input from '@salesforce/design-system-react/components/input';
import Button from '@salesforce/design-system-react/components/button';
import { loginAdapter } from "../ApexAdapter";

const Login = (props) => {
    const [state, setState] = React.useState({
        email: "",
        password: "",
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
        const requestData = {
            email: state.email,
            password: state.password,
            startUrl: state.startUrl
        }
        loginAdapter(requestData, (data) => {
            if(typeof(data) === "object" && data.hasOwnProperty("isSuccess") && data.isSuccess){
                //Apex function available through visual force page
                window.loginAF(state.email, state.password);
            }else{
                let message = 'Username or Password is invalid!';
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
        setState({
            ...state,
            loading: true,
            errorMessage: null
        });
    }
    return (
        <div className="slds-m-around_medium">
            <div className="slds-grid slds-wrap slds-grid_align-center">
                <form className="slds-size_1-of-1 slds-small-size_8-of-12 slds-medium-size_1-of-3">
                    <Card heading="Login">
                        <div className="slds-p-around_medium">
                            <Input
                                name="email"
                                type="email"
                                label={"Email Address"}
                                value={state.email}
                                onChange={(e) => handleChange(e, "email")}
                            />
                            <Input
                                name="password"
                                type="password"
                                label={"Password"}
                                value={state.password}
                                onChange={(e) => handleChange(e, "password")}
                            />
                            {
                                state.errorMessage !== null ?
                                    <p className="slds-m-top_medium slds-text-color_destructive">{state.errorMessage}</p>
                                :
                                    null
                            }
                            <Button
                                className="slds-m-top_medium"
                                label="Send"
                                variant="brand"
                                onClick={(e) => onSubmit(e)}
                            />
                        </div>
                    </Card>
                </form>
            </div>
            
        </div>
    )
};

export default Login;