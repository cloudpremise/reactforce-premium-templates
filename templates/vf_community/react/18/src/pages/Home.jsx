import React from "react";
import { getSessionId } from "../ApexAdapter";
import { useNavigate } from "react-router-dom";

const Home = (props) => {
    const sessionId = getSessionId();
    const navigate = useNavigate();
    if(typeof(sessionId) === "string" && sessionId.length <= 0){
        return navigate("/", { replace: true });
    }
    return (
        <div>
            Home page for authenticated users.
        </div>
    )
}

export default Home;