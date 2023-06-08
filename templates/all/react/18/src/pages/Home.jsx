import React from "react";
import { getSessionId } from "../ApexAdapter";
import { useNavigate } from "react-router-dom";
import useApexAdapter from "../hooks/useApexAdapter";

const Home = (props) => {
    const [loading, state] = useApexAdapter({});
    const navigate = useNavigate();
    React.useEffect(() => {
        const sessionId = getSessionId();
        if(typeof(sessionId) === "string" && sessionId.length <= 0){
            return navigate("/landing", { replace: true });
        }
    });
    
    return (
        <div className="slds-p-horizontal_medium">
            <div className="slds-text-heading_small">
                Home page for authenticated users.
            </div>
            <p className="slds-m-top_medium slds-text-heading_small slds-text-color_destructive">
                {
                    loading === false && state.response !== null ?
                        state.response
                    :
                        null
                }
            </p>
        </div>
    )
}

export default Home;