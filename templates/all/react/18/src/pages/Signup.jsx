import React from "react";
import Card from '@salesforce/design-system-react/components/card';
import Input from '@salesforce/design-system-react/components/input';
import Button from '@salesforce/design-system-react/components/button';
import { registerAdapter } from "../ApexAdapter";

const Signup = (props) => {
    const [state, setState] = React.useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        communityNickname: "",
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
        const { firstName, lastName, email, password, confirmPassword, communityNickname } = state;
        registerAdapter(firstName, lastName, email, password, confirmPassword, communityNickname, (data) => {
            if(typeof(data) === "object" && data.hasOwnProperty("isSuccess") && data.isSuccess){
                //Apex function available through visual force page
                window.registerAF(firstName, lastName, email, password, confirmPassword, communityNickname);
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
        setState({
            ...state,
            loading: true,
            errorMessage: null
        });
    }
    function isFormValid(){
        const { firstName, lastName, email, password, confirmPassword, communityNickname } = state;
        if(firstName.length > 0 && lastName.length > 0 && email.length > 0 && communityNickname.length > 0 && password.length && confirmPassword === password){
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
                            <Input
                                name="firstName"
                                type="text"
                                label={"First Name"}
                                value={state.firstName}
                                onChange={(e) => handleChange(e, "firstName")}
                                required
                            />
                            <Input
                                name="lastName"
                                type="text"
                                label={"Last Name"}
                                value={state.lastName}
                                onChange={(e) => handleChange(e, "lastName")}
                                required
                            />
                            <Input
                                name="communityNickname"
                                type="text"
                                label={"Nickname"}
                                value={state.communityNickname}
                                onChange={(e) => handleChange(e, "communityNickname")}
                                required
                            />
                            <Input
                                name="email"
                                type="email"
                                label={"Email"}
                                value={state.email}
                                onChange={(e) => handleChange(e, "email")}
                                required
                            />
                            <Input
                                name="password"
                                type="password"
                                label={"Password"}
                                value={state.password}
                                onChange={(e) => handleChange(e, "password")}
                                required
                            />
                            <Input
                                name="confirmPassword"
                                type="password"
                                label={"Confirm Password"}
                                value={state.confirmPassword}
                                onChange={(e) => handleChange(e, "confirmPassword")}
                                required
                                errorText={
                                    (state.password.langth > 0 && state.password.langth > 0 && state.password !== state.confirmPassword0) ?
                                        "Confirm Password not matched with Password."
                                    :
                                    null
                                }
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
                                type="submit"
                            />
                        </div>
                    </Card>
                </form>
            </div>
            
        </div>
    )
};

export default Signup;