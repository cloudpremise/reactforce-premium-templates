import React from "react";
import { getSessionId } from "../ApexAdapter";
import { useNavigate } from "react-router-dom";

const Home = (props) => {
    const navigate = useNavigate();
    React.useEffect(() => {
        const sessionId = getSessionId();
        if(typeof(sessionId) === "string" && sessionId.length <= 0){
            return navigate("/landing", { replace: true });
        }
    });
    
    return (
        <div className="slds-p-horizontal_medium">
            <div className="slds-text-heading_small slds-m-bottom_medium">
                Home page for authenticated users.
            </div>
            <a href="https://cloudpremise.gitbook.io/reactforce/" rel="noreferrer" target="_blank" className="slds-text-heading_small slds-text-color_destructive">
                Learn about Reactforce here.
            </a>
        </div>
    )
}

export default Home;