import React from "react";
import { getSessionId } from "../ApexAdapter";
import { useNavigate } from "react-router-dom";

const Route2 = (props) => {
    const sessionId = getSessionId();
    const navigate = useNavigate();
    if(typeof(sessionId) === "string" && sessionId.length <= 0){
        return navigate("/", { replace: true });
    }
    return (
        <div>
            Route2 for authenticated users.
        </div>
    )
}

export default Route2;