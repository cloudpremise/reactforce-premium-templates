import React from "react";
import { getSessionId } from "../ApexAdapter";
import { useNavigate } from "react-router-dom";

const Route3 = (props) => {
    const sessionId = getSessionId();
    const navigate = useNavigate();
    if(typeof(sessionId) === "string" && sessionId.length <= 0){
        return navigate("/", { replace: true });
    }
    return (
        <div>
            Route3 for authenticated users.
        </div>
    )
}

export default Route3;