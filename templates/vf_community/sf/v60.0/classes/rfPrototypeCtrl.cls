/***************************************************************************** 
Copyright 2024 CloudPremise LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the “Software”), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

global with sharing class rfPrototypeCtrl {
    public SObject sObj {get;set;}
    public Id sObjId {get;set;}
    public Boolean developmentMode {get;set;}
    public String bundleDomain {get;set;}
    public String bundleId {get;set;}
    public String sessionId {get;set;}
    public Boolean userInterfacePreview {get;set;}
    public Boolean advancedConfiguration {get;set;}
    public String sitePath {get;set;}

    global String username {get; set;}
    public String firstName {get; set;}
    public String lastName {get; set;}
    public String email {get; set;}
    public String password {get; set {password = value == null ? value : value.trim(); } }
    public String confirmPassword {get; set { confirmPassword = value == null ? value : value.trim(); } }
    public String communityNickname {get; set { communityNickname = value == null ? value : value.trim(); } }

    @AuraEnabled
    public static String getSessionId() {
        return UserInfo.getSessionId();
    }

    public rfPrototypeCtrl(ApexPages.StandardController stdController) {
        this.sobj = stdController.getRecord();
        this.sObjId = stdController.getId();
        bundleDomain = String.isNotBlank(ApexPages.currentPage().getParameters().get('bundleDomain')) ? ApexPages.currentPage().getParameters().get('bundleDomain') : bundleDomain;
        this.checkBundleId();
        sitePath = Site.getPathPrefix();
    }

    public rfPrototypeCtrl() {
        bundleDomain = String.isNotBlank(ApexPages.currentPage().getParameters().get('bundleDomain')) ? ApexPages.currentPage().getParameters().get('bundleDomain') : bundleDomain;
        sessionId = rfPrototypeCtrl.getSessionId();
        this.checkBundleId();
        sitePath = Site.getPathPrefix();
    }

    private void checkBundleId() {
        bundleId = '.reactforce1';
        bundleId = String.isNotBlank(ApexPages.currentPage().getParameters().get('bundleId')) ? ApexPages.currentPage().getParameters().get('bundleId') : bundleId;
    }

    public PageReference rerenderPage() {
        Pagereference newLink = new PageReference('/apex/rfPrototypeVf');
        newLink.setRedirect(true);
        return newLink;
    }

    @RemoteAction
    @AuraEnabled
    public static String callInternalApi(String method, String requestURI, String requestEntityStr, String params, String headers) {
        Map<String,String> paramMap = new Map<String,String>();
        paramMap = (Map<String,String>) JSON.deserialize(params, Map<String,String>.Class);
        Map<String,String> headerMap = new Map<String,String>();
        headerMap = (Map<String,String>) JSON.deserialize(headers, Map<String,String>.Class);

        /* This code may not exist in the backend.  It needs to be dynamically constructed*/
        Callable handlerClass = null;
        try {
            Type internalHandlerType = Type.forName('ApiInternalEntry.CallableEntryPoint');
            handlerClass = (Callable) internalHandlerType.newInstance();
        } catch (Exception e) {
            throw new rfPrototypeCtrlException('API is not installed');
        }

        Map<String, Object> args = new Map<String, Object>();
        args.put('httpMethod', method);
        args.put('requestUri', requestURI);
        args.put('requestEntityStr', requestEntityStr);
        args.put('params',paramMap);
        args.put('headers',headerMap);
        return JSON.serialize(handlerClass.call('invoke', args));
    }

    @RemoteAction
    @AuraEnabled
    public static String callSampleInternalApi(String method, String requestURI, String requestEntityStr, String params, String headers) {
        String response = '{"response": "Learn about Reactforce here.", "result": []}';
        return response;
    }

    global PageReference login() {
    	username = '';
    	password = '';
    	username = Apexpages.currentPage().getParameters().get('usernameJS');
    	password = Apexpages.currentPage().getParameters().get('passwordJS');
        String startUrl = System.currentPageReference().getParameters().get('startURL');
        PageReference redirectURL = Site.login(username, password, startUrl);
        return redirectURL;
    }
    
    @RemoteAction
    @AuraEnabled
    global Static ProcessingResult login(String credentialObj){
    	ProcessingResult resultObj = new ProcessingResult ();
    	resultObj.isSuccess = false;
    	resultObj.result = 'Opps ! An error had occured, please contact your admin !';
    	try {
	    	String username = '';
	    	String password = '';
	    	if(credentialObj != null) {
				JSONParser parser = JSON.createParser(credentialObj);
				while (parser.nextToken() != null) {
				 	if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME && parser.getText() == 'email') {
				 		parser.nextToken();
				 		username = parser.getText();
				 	} else if(parser.getCurrentToken() == System.JSONToken.FIELD_NAME && parser.getText() == 'password') {
				 		parser.nextToken();
				 		password = parser.getText();
				 	}
				}
	    	}

	    	String startUrl = '/';
	    	if(System.currentPageReference() != null) {
	    		startUrl = System.currentPageReference().getParameters().get('startURL');
	    	}
            resultObj.startURL = startUrl;
	        PageReference redirectURL = Site.login(username, password, startUrl);
	        if(redirectURL != null) {
	        	resultObj.isSuccess = true;
    			resultObj.result = redirectURL.getURL();
	        } else {
	        	resultObj.result = 'Username or Password is invalid !';
	        }
    	} catch(Exception e) {
    		resultObj.result = 'Error - '+e.getMessage();
    	}
    	return resultObj;
    }

    private boolean isValidPassword() {
        return password == confirmPassword;
    }

    global PageReference registerUser() {
        firstName = Apexpages.currentPage().getParameters().get('firstNameJS');
        lastName = Apexpages.currentPage().getParameters().get('lastNameJS');
        email = Apexpages.currentPage().getParameters().get('emailJS');
        password = Apexpages.currentPage().getParameters().get('passwordJS');
        confirmPassword = Apexpages.currentPage().getParameters().get('confirmPasswordJS');
        communityNickname = Apexpages.currentPage().getParameters().get('communityNicknameJS');

        // it's okay if password is null - we'll send the user a random password in that case
        if (!isValidPassword()) {
            ApexPages.Message msg = new ApexPages.Message(ApexPages.Severity.ERROR, Label.site.passwords_dont_match);
            ApexPages.addMessage(msg);
            return null;
        }    

        // String profileId = null; // To be filled in by customer.
        String roleEnum = null; // To be filled in by customer.
        String accountId = ''; // To be filled in by customer.
        String userName = email;
        User u = new User();
        u.Username = userName;
        u.Email = email;
        u.FirstName = firstName;
        u.LastName = lastName;
        u.CommunityNickname = communityNickname;
        // u.ProfileId = profileId;
        
        String userId;
        try {
            userId = Site.createExternalUser(u, accountId, password);
        } catch(Site.ExternalUserCreateException ex) {
            List<String> errors = ex.getDisplayMessages();
            for (String error : errors) {
                ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, error));
            }
        }

        String startUrl = '/';
        if(System.currentPageReference() != null) {
            startUrl = System.currentPageReference().getParameters().get('startURL');
        }
        
        if (userId != null) { 
            if (password != null && password.length() > 1) {
                return Site.login(userName, password, startUrl);
            } else {
                PageReference page = System.Page.rfPrototypeSelfRegConfirm;
                page.setRedirect(true);
                return page;
            }
        }
        return null;
    }

    @RemoteAction
    @AuraEnabled
    global Static ProcessingResult registerUser(String firstName, String lastName, String email, String password, String confirmPassword, String communityNickname) {
        ProcessingResult resultObj = new ProcessingResult ();
    	resultObj.isSuccess = false;
    	resultObj.result = 'Opps ! An error had occured, please contact your admin !';
    	try {
            List<User> existingPortalUsers = [SELECT Id FROM User WHERE Email = :email OR Username = :email];
            if (existingPortalUsers.size() == 0) {
                resultObj.isSuccess = true;
                resultObj.result = 'Success';
    	        return resultObj;
            }	    	
            resultObj.result = 'User already exists.';
    	} catch(Exception e) {
    		resultObj.result = 'Error - '+e.getMessage();
    	}
    	return resultObj;
    }
    
    global class ProcessingResult {
    	global Boolean isSuccess {get;set;}
    	global String result {get;set;}
        global string email {get;set;}
        global string startURL {get;set;}
    }

    public class rfPrototypeCtrlException extends Exception{}
}