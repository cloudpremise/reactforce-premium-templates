import React from 'react'
import { Route, Routes, useNavigate } from "react-router-dom";
import Popover from '@salesforce/design-system-react/components/popover';
import GlobalHeaderProfile from '@salesforce/design-system-react/components/global-header/profile';
import GlobalNavigationBar from '@salesforce/design-system-react/components/global-navigation-bar'; 
import GlobalNavigationBarRegion from '@salesforce/design-system-react/components/global-navigation-bar/region';
import GlobalHeader from './Header';
import { getSessionId } from "../ApexAdapter";

import Home from "../pages/Home";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

import Users from "../pages/Users";
import Contacts from "../pages/Contacts";
import StreamingApi from "../pages/StreamingApi";
import Attachments from "../pages/Attachments";
import ContentVersion from "../pages/ContentVersion";
import StandardApi from "../pages/StandardApi";
import InternalApi from "../pages/InternalApi";
import Lds from "../pages/Lds";

/* eslint-disable max-len */
/* eslint-disable react/prop-types */

// Profile content is currently the contents of a generic `Popover` with markup copied from https://www.lightningdesignsystem.com/components/global-header/. This allows content to have tab stops and focus trapping. If you need a more specific/explicit `GlobalHeaderProfile` content, please create an issue.
const HeaderProfileCustomContent = (props) => (
	<div id="header-profile-custom-popover-content">
		<div className="slds-m-around_medium">
			<div className="slds-tile slds-tile_board slds-m-horizontal_small">
				<div className="slds-tile__detail">
					<p className="slds-truncate">
						<a href={props.basename+"/secur/logout.jsp"}>
							Log Out
						</a>
					</p>
				</div>
			</div>
		</div>
	</div>
);
HeaderProfileCustomContent.displayName = 'HeaderProfileCustomContent';

const Header = (props) => {
    const { basename, page } = props;
    let cdn = "";
    if(window.inlineApexAdaptor && window.inlineApexAdaptor.landingResources){
        cdn = window.inlineApexAdaptor.landingResources;
    }
    const logoUrl = cdn+"/assets/img/logo.png";
    const sessionId = getSessionId();
    return (
        <GlobalHeader
            logoSrc={logoUrl}
            onSkipToContent={() => {
                console.log('>>> Skip to Content Clicked');
            }}
            onSkipToNav={() => {
                console.log('>>> Skip to Nav Clicked');
            }}
            navigation={<NavigationBar basename={basename} page={page} />}
        >
            {
                sessionId.length > 0 ?
                    <GlobalHeaderProfile
                        popover={
                            <Popover
                                body={<HeaderProfileCustomContent basename={basename} />}
                                id="header-profile-popover-id"
                            />
                        }
                        // userName="Art Vandelay"
                    />
                :
                null
            }
        </GlobalHeader>
    )
};

const NavigationBar = (props) => {
    const url = props.page.replace(props.basename, "");
    const [state, setState] = React.useState({
        activeUrl: url
    });
    const sessionId = getSessionId();
    const navigate = useNavigate();
    function onUrlChange(event){
        let url = event.currentTarget.getAttribute("url");
        url = url.replace(props.basename, "");
        setState({activeUrl: url});
        navigate(url);
        window.history.replaceState(null, document.title, props.basename+url+window.location.search);
    }
    return (
        <GlobalNavigationBar>
            {
                sessionId.length > 0 ?
                    <GlobalNavigationBarRegion region="secondary" navigation>
                        <li className={'slds-context-bar__item '+(state.activeUrl === "/home" ? "slds-is-active" : "")}>
                            <span url="/home" onClick={(event) => onUrlChange(event)} className="slds-context-bar__label-action">
                                <span className='slds-truncate' title='Home'>Home</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item '+(state.activeUrl === "/contacts" ? "slds-is-active" : "")}>
                            <span url="/contacts" className="slds-context-bar__label-action" title='Streaming Api'>
                                <span className='slds-truncate' title='Contacts'>Contacts</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item '+(state.activeUrl === "/users" ? "slds-is-active" : "")}>
                            <span url="/users" className="slds-context-bar__label-action" title='Users'>
                                <span className='slds-truncate' title='Users'>Users</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item '+(state.activeUrl === "/standard-api" ? "slds-is-active" : "")}>
                            <span url="/standard-api" onClick={(event) => onUrlChange(event)} className="slds-context-bar__label-action" title='Standard Api'>
                                <span className='slds-truncate' title='Standard Api'>Standard Api</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item '+(state.activeUrl === "/internal-api" ? "slds-is-active" : "")}>
                            <span url="/internal-api" className="slds-context-bar__label-action" title='Internal Api'>
                                <span className='slds-truncate' title='Internal Api'>Internal Api</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item '+(state.activeUrl === "/streaming" ? "slds-is-active" : "")}>
                            <span url="/streaming" onClick={(event) => onUrlChange(event)} className="slds-context-bar__label-action" title='Streaming Api'>
                                <span className='slds-truncate' title='Streaming'>Streaming</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item '+(state.activeUrl === "/attachments" ? "slds-is-active" : "")}>
                            <span url="/attachments" onClick={(event) => onUrlChange(event)} className="slds-context-bar__label-action" title='Attachments'>
                                <span className='slds-truncate' title='Attachments'>Attachments</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item '+(state.activeUrl === "/content-version" ? "slds-is-active" : "")}>
                            <span url="/content-version" onClick={(event) => onUrlChange(event)} className="slds-context-bar__label-action" title='Content Version'>
                                <span className='slds-truncate' title='Content Version'>Content Version</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item '+(state.activeUrl === "/lds" ? "slds-is-active" : "")}>
                            <span url="/lds" onClick={(event) => onUrlChange(event)} className="slds-context-bar__label-action" title='Lds'>
                                <span className='slds-truncate' title='Lds'>Lds</span>
                            </span>
                        </li>
                    </GlobalNavigationBarRegion>
                :
                    <GlobalNavigationBarRegion region="secondary" navigation>
                        <li className={'slds-context-bar__item'}>
                            <span url={props.basename+"/login"} onClick={(event) => onUrlChange(event)} className="slds-context-bar__label-action">
                                <span className='slds-truncate' title='Login'>Login</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item'}>
                            <span url={props.basename+"/signup"} onClick={(event) => onUrlChange(event)} className="slds-context-bar__label-action">
                                <span className='slds-truncate' title='Signup'>Signup</span>
                            </span>
                        </li>
                    </GlobalNavigationBarRegion>
            }
            
        </GlobalNavigationBar>
    )
};
NavigationBar.displayName = "SLDSGlobalHeaderSearch";

const RouterComponent = class extends React.Component {
    render() {
        const { history, basename, page } = this.props;
        const sessionId = getSessionId();
        return (
            <>
                <div className={sessionId.length === 0 ? 'non-logged-in' : ''}>
                    <Header basename={basename} page={page} />
                    <NavigationBar basename={basename} page={page} />
                </div>
                <div id="global_wrapper">
                    <div id="global_content" style={{paddingTop: "15px", paddingBottom: "15px"}} data-testid="content">
                        <Routes>
                            <Route path="/" element={<Landing history={history} />} />
                            <Route path="/landing" element={<Landing history={history} />} />
                            <Route path="/home" element={<Home history={history} />} />
                            <Route path="/login" element={<Login history={history} basename={basename} page={page} />} />
                            <Route path="/signup" element={<Signup history={history} basename={basename} page={page} />} />


                            <Route path="/users" element={<Users history={this.history} />} />
                            <Route path="/contacts" element={<Contacts history={this.history} />} />
                            <Route path="/streaming" element={<StreamingApi history={history} />} />
                            <Route path="/attachments" element={<Attachments history={history} />} />
                            <Route path="/content-version" element={<ContentVersion history={history} />} />
                            <Route path="/standard-api" element={<StandardApi history={history} />} />
                            <Route path="/internal-api" element={<InternalApi history={history} />} />
                            <Route path="/lds" element={<Lds history={history} />} />
                        </Routes>
                    </div>
                </div>
            </>
        )
    }
}

export default RouterComponent;
