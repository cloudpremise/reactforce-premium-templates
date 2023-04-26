import React from "react";
import { getSessionId } from "../ApexAdapter";
import { useNavigate } from "react-router-dom";

const Landing = (props) => {
    const sessionId = getSessionId();
    const navigate = useNavigate();
    if(typeof(sessionId) === "string" && sessionId.length > 0){
        return navigate("/home", { replace: true });
    }
    return (
        <div>
            Landing page for unauthenticated users.
        </div>
    )
}

export default Landing;