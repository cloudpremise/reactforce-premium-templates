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
        <div className="slds-p-left_medium slds-text-heading_small">
            Home page for authenticated users.
        </div>
    )
}

export default Home;