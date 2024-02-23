import React from 'react'
import { Route, Routes, useNavigate } from "react-router-dom";
import Popover from '@salesforce/design-system-react/components/popover';
import GlobalHeaderProfile from '@salesforce/design-system-react/components/global-header/profile';
import GlobalNavigationBar from '@salesforce/design-system-react/components/global-navigation-bar'; 
import GlobalNavigationBarRegion from '@salesforce/design-system-react/components/global-navigation-bar/region';
import GlobalHeader from './Header';
import { getSessionId } from "../ApexAdapter";
import Button from './Button';

import Home from "../pages/Home";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import LoginWithCode from "../pages/LoginWithCode";
import SignupWithCode from "../pages/SignupWithCode";

import Users from "../pages/Users";
import Contacts from "../pages/Contacts";
import StreamingApi from "../pages/StreamingApi";
import Attachments from "../pages/Attachments";
import ContentVersion from "../pages/ContentVersion";
import StandardApi from "../pages/StandardApi";
import InternalApi from "../pages/InternalApi";
import Lds from "../pages/Lds";
import SObjectApi from "../pages/SObjectApi";
import Settings from "../pages/Settings";
import UiApi from "../pages/UiApi";

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

const HeaderProfileCustomMenuButton = (props) => (
	<Button {...props}
        iconName="rows"
        iconVariant="border"
        className="slds-m-left_small slds-custom-menu-button"
    />
);
HeaderProfileCustomMenuButton.displayName = 'HeaderProfileCustomMenuButton';

const CustomNavigationBarRegion = (props) => (
	<Button {...props}
        iconName="close"
        iconVariant="global-header"
    />
);
CustomNavigationBarRegion.displayName = 'SLDSGlobalNavigationBarRegion';

const CustomNavigationBarPopover = (props) => (
	<div
        {...props}
        className='slds-navigation-popover'
    ></div>
);
CustomNavigationBarPopover.displayName = 'SLDSGlobalNavigationBarRegion';

const Header = (props) => {
    const url = props.page.replace(props.basename, "");
    const [state, setState] = React.useState({
        openMenu: false,
        activeUrl: url
    });
    const { basename, page } = props;
    let cdn = "";
    if(window.inlineApexAdaptor && window.inlineApexAdaptor.landingResources){
        cdn = window.inlineApexAdaptor.landingResources;
    }
    const logoUrl = cdn+"/assets/img/logo.png";
    const sessionId = getSessionId();
    function onMenuToggle(status = null){
        setState({
            ...state,
            openMenu: status
        });
    }
    function onLogoClick(){
        onUrlChange(null, (sessionId.length > 0 ? '/home' : '/'));
    }
    const navigate = useNavigate();
    function onUrlChange(event, url = ''){
        if(event){
            url = event.currentTarget.getAttribute("url");
        }
        url = url.replace(props.basename, "");
        setState({
            ...state,
            activeUrl: url,
            openMenu: false
        });
        navigate(url);
        window.history.replaceState(null, document.title, props.basename+url+window.location.search);
    }

    return (
        <GlobalHeader
            logoSrc={logoUrl}
            onLogoClick={() => onLogoClick()}
            onSkipToContent={() => {
                console.log('>>> Skip to Content Clicked');
            }}
            onSkipToNav={() => {
                console.log('>>> Skip to Nav Clicked');
            }}
            navigation={
                <NavigationBar
                    basename={basename}
                    page={page}
                    onMenuToggle={onMenuToggle}
                    className={state.openMenu ? 'slds-open-menu' : ''}
                    onUrlChange={onUrlChange}
                    activeUrl={state.activeUrl}
                />
            }
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
            <HeaderProfileCustomMenuButton
                onClick={() => onMenuToggle(true)}
            />
        </GlobalHeader>
    )
};

const NavigationBar = (props) => {
    const sessionId = getSessionId();
    let savedTabs = localStorage.getItem("reactforce_settings");
    let tabs = {
        home: true,
        contacts: false,
        users: false,
        standardapi: true,
        internalapi: false,
        streamingapi: true,
        attachments: true,
        contentversion: true,
        lds: true,
        sobjectapi: false,
        uiapi: false
    }
    if(savedTabs !== null){
        try{
            savedTabs = JSON.parse(savedTabs);
            tabs = savedTabs.tabs;
        }catch(e){ }
    }

    return (
        <GlobalNavigationBar
            className={"slds-custom-primary-navigation "+props.className}
        >
            {
                sessionId.length > 0 ?
                    <GlobalNavigationBarRegion region="secondary" navigation>
                        {
                            tabs.home ?
                                <li className={'slds-context-bar__item '+(props.activeUrl === "/home" ? "slds-is-active" : "")}>
                                    <span url="/home" onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action">
                                        <span className='slds-truncate' title='Home'>Home</span>
                                    </span>
                                </li>
                            :
                            null
                        }
                        {
                            tabs.contacts ?
                                <li className={'slds-context-bar__item '+(props.activeUrl === "/contacts" ? "slds-is-active" : "")}>
                                    <span url="/contacts" onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action" title='Streaming Api'>
                                        <span className='slds-truncate' title='Contacts'>Contacts</span>
                                    </span>
                                </li>
                            :
                            null
                        }
                        {
                            tabs.users ?
                                <li className={'slds-context-bar__item '+(props.activeUrl === "/users" ? "slds-is-active" : "")}>
                                    <span url="/users" onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action" title='Users'>
                                        <span className='slds-truncate' title='Users'>Users</span>
                                    </span>
                                </li>
                            :
                            null
                        }
                        {
                            tabs.standardapi ?
                                <li className={'slds-context-bar__item '+(props.activeUrl === "/standard-api" ? "slds-is-active" : "")}>
                                    <span url="/standard-api" onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action" title='Standard Api'>
                                        <span className='slds-truncate' title='Standard Api'>Standard Api</span>
                                    </span>
                                </li>
                            :
                            null
                        }
                        {
                            tabs.internalapi ?
                                <li className={'slds-context-bar__item '+(props.activeUrl === "/internal-api" ? "slds-is-active" : "")}>
                                    <span url="/internal-api" onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action" title='Internal Api'>
                                        <span className='slds-truncate' title='Internal Api'>Internal Api</span>
                                    </span>
                                </li>
                            :
                            null
                        }
                        {
                            tabs.streamingapi ?
                                <li className={'slds-context-bar__item '+(props.activeUrl === "/streaming" ? "slds-is-active" : "")}>
                                    <span url="/streaming" onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action" title='Streaming Api'>
                                        <span className='slds-truncate' title='Streaming'>Streaming</span>
                                    </span>
                                </li>
                            :
                            null
                        }
                        {
                            tabs.attachments ?
                                <li className={'slds-context-bar__item '+(props.activeUrl === "/attachments" ? "slds-is-active" : "")}>
                                    <span url="/attachments" onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action" title='Attachments'>
                                        <span className='slds-truncate' title='Attachments'>Attachments</span>
                                    </span>
                                </li>
                            :
                            null
                        }
                        {
                            tabs.contentversion ?
                                <li className={'slds-context-bar__item '+(props.activeUrl === "/content-version" ? "slds-is-active" : "")}>
                                    <span url="/content-version" onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action" title='Content Version'>
                                        <span className='slds-truncate' title='Content Version'>Content Version</span>
                                    </span>
                                </li>
                            :
                            null
                        }
                        {
                            tabs.lds ?
                                <li className={'slds-context-bar__item '+(props.activeUrl === "/lds" ? "slds-is-active" : "")}>
                                    <span url="/lds" onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action" title='Lds'>
                                        <span className='slds-truncate' title='Lds'>Lds</span>
                                    </span>
                                </li>
                            :
                            null
                        }
                        {
                            tabs.sobjectapi ?
                                <li className={'slds-context-bar__item '+(props.activeUrl === "/sobject-api" ? "slds-is-active" : "")}>
                                    <span url="/sobject-api" onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action" title='Sobject Api'>
                                        <span className='slds-truncate' title='Sobject Api'>Sobject Api</span>
                                    </span>
                                </li>
                            :
                            null
                        }
                        {
                            tabs.uiapi ?
                                <li className={'slds-context-bar__item '+(props.activeUrl === "/uiapi" ? "slds-is-active" : "")}>
                                    <span url="/uiapi" onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action" title='Settings'>
                                        <span className='slds-truncate' title='UI Api'>UI Api</span>
                                    </span>
                                </li>
                            :
                            null
                        }
                        <li className={'slds-context-bar__item '+(props.activeUrl === "/settings" ? "slds-is-active" : "")}>
                            <span url="/settings" onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action" title='Settings'>
                                <span className='slds-truncate' title='Settings'>Settings</span>
                            </span>
                        </li>
                    </GlobalNavigationBarRegion>
                :
                    <GlobalNavigationBarRegion region="secondary" navigation>
                        <li className={'slds-context-bar__item'}>
                            <span url={props.basename+"/login-react"} onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action">
                                <span className='slds-truncate' title='Login (React)'>Login (React)</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item'}>
                            <a href={props.basename+"/login"} className="slds-context-bar__label-action">
                                <span className='slds-truncate' title='Login (Salesforce)'>Login (Salesforce)</span>
                            </a>
                        </li>
                        <li className={'slds-context-bar__item'}>
                            <span url={props.basename+"/login-code"} onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action">
                                <span className='slds-truncate' title='Login With Code'>Login With Code</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item'}>
                            <span url={props.basename+"/signup-react"} onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action">
                                <span className='slds-truncate' title='Sign-Up (React)'>Sign-Up (React)</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item'}>
                            <a href={props.basename+"/CommunitiesSelfReg?locale=us"} className="slds-context-bar__label-action">
                                <span className='slds-truncate' title='Sign-Up (Salesforce)'>Sign-Up (Salesforce)</span>
                            </a>
                        </li>
                        <li className={'slds-context-bar__item'}>
                            <span url={props.basename+"/signup-code"} onClick={(event) => props.onUrlChange(event)} className="slds-context-bar__label-action">
                                <span className='slds-truncate' title='Signup With Code'>Signup With Code</span>
                            </span>
                        </li>
                        <li className={'slds-context-bar__item'}>
                            <a href={props.basename+"/IdpHome"+(window.location.search.length > 0 ? window.location.search+"&" : "?")+"locale=us"} className="slds-context-bar__label-action">
                                <span className='slds-truncate' title='Login (Vf)'>Login (Vf)</span>
                            </a>
                        </li>
                    </GlobalNavigationBarRegion>
            }
            <CustomNavigationBarRegion
                region="secondary"
                onClick={() => props.onMenuToggle(false)}
                className="slds-custom-navigation-close"
            />
            <CustomNavigationBarPopover onClick={() => props.onMenuToggle(false)} region="secondary" />
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
                    {/* <NavigationBar basename={basename} page={page} /> */}
                </div>
                <div id="global_wrapper">
                    <div id="global_content" style={{paddingTop: "15px", paddingBottom: "15px"}} data-testid="content">
                        <Routes>
                            <Route path="/" element={<Landing history={history} basename={basename} page={page} />} />
                            <Route path="/landing" element={<Landing history={history} basename={basename} page={page} />} />
                            <Route path="/home" element={<Home history={history} basename={basename} page={page} />} />
                            <Route path="/login-react" element={<Login history={history} basename={basename} page={page} />} />
                            <Route path="/signup-react" element={<Signup history={history} basename={basename} page={page} />} />
                            <Route path="/login-code" element={<LoginWithCode history={history} basename={basename} page={page} />} />
                            <Route path="/signup-code" element={<SignupWithCode history={history} basename={basename} page={page} />} />


                            <Route path="/users" element={<Users history={this.history} basename={basename} page={page} />} />
                            <Route path="/contacts" element={<Contacts history={this.history} basename={basename} page={page} />} />
                            <Route path="/streaming" element={<StreamingApi history={history} basename={basename} page={page} />} />
                            <Route path="/attachments" element={<Attachments history={history} basename={basename} page={page} />} />
                            <Route path="/content-version" element={<ContentVersion history={history} basename={basename} page={page} />} />
                            <Route path="/standard-api" element={<StandardApi history={history} basename={basename} page={page} />} />
                            <Route path="/internal-api" element={<InternalApi history={history} basename={basename} page={page} />} />
                            <Route path="/lds" element={<Lds history={history} basename={basename} page={page} />} />
                            <Route path="/sobject-api" element={<SObjectApi history={history} basename={basename} page={page} />} />
                            <Route path="/settings" element={<Settings history={history} basename={basename} page={page} />} />
                            <Route path="/uiapi" element={<UiApi history={history} basename={basename} page={page} />} />
                        </Routes>
                    </div>
                </div>
            </>
        )
    }
}

export default RouterComponent;
