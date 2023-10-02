global without sharing class rfPrototypeCtrl {
    public SObject sObj {get;set;}
    public Id sObjId {get;set;}

    public Boolean developmentMode {get;set;}
    public String bundleDomain {get;set;}
    public String bundleId {get;set;}
    public String sessionId {get;set;}
    public Boolean userInterfacePreview {get;set;}
    public Boolean advancedConfiguration {get;set;}
    public Boolean maintenanceMode {get;set;}

    //Login related code
    global String username {get; set;}


    //Signup related code
    public String firstName {get; set;}
    public String lastName {get; set;}
    public String email {get; set;}
    public String password {get; set {password = value == null ? value : value.trim(); } }
    public String confirmPassword {get; set { confirmPassword = value == null ? value : value.trim(); } }
    public String communityNickname {get; set { communityNickname = value == null ? value : value.trim(); } }

    //@AuraEnabled(Cacheable = true)
    public static String getSessionId() {
        return UserInfo.getSessionId();
    }

    public rfPrototypeCtrl(ApexPages.StandardController stdController){
        System.debug('rfPrototypeCtrl(ApexPages.StandardController)');
        this.sobj = stdController.getRecord();
        this.sObjId = stdController.getId();
        bundleDomain = String.isNotBlank(ApexPages.currentPage().getParameters().get('bundleDomain')) ? ApexPages.currentPage().getParameters().get('bundleDomain') : bundleDomain;
        this.checkBundleId();
        maintenanceMode = false;
    }
    public rfPrototypeCtrl(){
        System.debug('rfPrototypeCtrl()');
        bundleDomain = String.isNotBlank(ApexPages.currentPage().getParameters().get('bundleDomain')) ? ApexPages.currentPage().getParameters().get('bundleDomain') : bundleDomain;
        sessionId = rfPrototypeCtrl.getSessionId();
        this.checkBundleId();
        maintenanceMode = false;
    }

    private void checkBundleId(){
        bundleId = '.reactforce1';
        bundleId = String.isNotBlank(ApexPages.currentPage().getParameters().get('bundleId')) ? ApexPages.currentPage().getParameters().get('bundleId') : bundleId;
        System.debug('bundleId:'+bundleId);
    }

    public PageReference rerenderPage() {
        System.debug('hello from controllerMethod');
        System.debug('ApexPages.currentPage():'+Apexpages.currentPage());

        Pagereference newLink = new PageReference('/apex/rfPrototypeVf');
        newLink.setRedirect(true);
        return newLink;
    }

    public static void logControllerInfo(){
        System.debug('UserInfo.getUserId:'+UserInfo.getUserId());
        System.debug('UserInfo.getProfileId:'+UserInfo.getProfileId());
    }

    @RemoteAction
    @AuraEnabled
    public static String callInternalApi(String method, String requestURI, String requestEntityStr, String params, String headers) {
        System.debug('ApiInternalEntryCtrl.callInternalApi(method, requestURI, requestEntityStr, params, headers)');
        
        Map<String,String> paramMap = new Map<String,String>();
        paramMap = (Map<String,String>) JSON.deserialize(params, Map<String,String>.Class);
        System.debug('paramMap:'+paramMap);

        Map<String,String> headerMap = new Map<String,String>();
        headerMap = (Map<String,String>) JSON.deserialize(headers, Map<String,String>.Class);
        System.debug('headerMap:'+headerMap);

        /* This code may not exist in the backend.  It needs to be dynamically constructed*/

        Callable handlerClass = null;
        try{
            Type internalHandlerType = Type.forName('ApiInternalEntry.CallableEntryPoint');
            System.debug('internalHandlerType:'+internalHandlerType);

            handlerClass = (Callable) internalHandlerType.newInstance();
            System.debug('handlerClass:'+handlerClass);

        } catch (Exception e){
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
        System.debug('sfPrototypeAllCtrl.callInternalApi()');
        System.debug('method:'+method);
        System.debug('requestURI:'+requestURI);
        System.debug('requestEntityStr:'+requestEntityStr);
        System.debug('params:'+params);
        System.debug('headers:'+headers);

        String response = '{"response": "Learn about Reactforce here.", "result": []}';
        system.debug('callInternalApi response:'+response);
        return response;
    }


    //Login related code
    global PageReference login() {
    	username = '';
    	password = '';
    	username = Apexpages.currentPage().getParameters().get('usernameJS');
    	password = Apexpages.currentPage().getParameters().get('passwordJS');
    	System.debug('>>>>>username -->'+username);
    	System.debug('>>>>>username -->'+password);
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
    		System.debug(credentialObj);
	    	String username = '';
	    	String password = '';
	    	if(credentialObj != null){
				JSONParser parser = JSON.createParser(credentialObj);
				while (parser.nextToken() != null) {
				 	if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME && parser.getText() == 'email') {
				 		parser.nextToken();
				 		username = parser.getText();
				 	}
				 	else if(parser.getCurrentToken() == System.JSONToken.FIELD_NAME && parser.getText() == 'password'){
				 		parser.nextToken();
				 		password = parser.getText();
				 	}
				}
	    	}

	    	System.debug('>>>>>username-->'+username);
	    	System.debug('>>>>>password-->'+password);
	    	String startUrl = '/';
	    	if(System.currentPageReference() != null){
	    		startUrl = System.currentPageReference().getParameters().get('startURL');
	    	}
            resultObj.startURL = startUrl;
	        PageReference redirectURL = Site.login(username, password, startUrl);
	        if(redirectURL != null){
	        	resultObj.isSuccess = true;
    			resultObj.result = redirectURL.getURL();
	        }
	        else {
	        	resultObj.result = 'Username or Password is invalid !';
	        }
	        
    	} catch(Exception e){
    		resultObj.result = 'Error - '+e.getMessage();
    	}
    	System.debug(JSON.serialize(resultObj));
    	return resultObj;
    }


    //Signup related code
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
            for (String error : errors)  {
                ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, error));
            }
            
            // This message is used for debugging. Do not display this in the UI to the end user.
            // It has the information around why the user creation failed.
            System.debug(ex.getMessage());
        }

        String startUrl = '/';
        if(System.currentPageReference() != null){
            startUrl = System.currentPageReference().getParameters().get('startURL');
        }
        
        if (userId != null) { 
            if (password != null && password.length() > 1) {
                return Site.login(userName, password, startUrl);
            }
            else {
                PageReference page = System.Page.rfPrototypeSelfRegConfirm;
                page.setRedirect(true);
                return page;
            }
        }
        return null;
    }

    @RemoteAction
    @AuraEnabled
    global Static ProcessingResult registerUser(String firstName, String lastName, String email, String password, String confirmPassword, String communityNickname){
        ProcessingResult resultObj = new ProcessingResult ();
    	resultObj.isSuccess = false;
    	resultObj.result = 'Opps ! An error had occured, please contact your admin !';
    	try {
            List<User> existingPortalUsers = [SELECT Id FROM User WHERE Email = :email OR Username = :email];
            if (existingPortalUsers.size() == 0) 
            {
                resultObj.isSuccess = true;
                resultObj.result = 'Success';
    	        return resultObj;
            }	    	
            resultObj.result = 'User already exists.';
    	} catch(Exception e){
    		resultObj.result = 'Error - '+e.getMessage();
    	}
    	System.debug(JSON.serialize(resultObj));
    	return resultObj;
    }
    
    public class ReactforceCtrlException extends Exception {}

    global class ProcessingResult {
    	public Boolean isSuccess {get;set;}
    	public String result {get;set;}
        public string email {get;set;}
        public string startURL {get;set;}
        public string userId {get;set;}
        public string identifier {get;set;}
        // public PageReference pageReference {get;set;}
    }


    //Attachments and content version related code
    @RemoteAction
    @AuraEnabled
    public static Id saveAttachment(Id parentId, String fileName, String base64Data, String contentType, String fileId) {
        // check if fileId id ''(Always blank in first chunk), then call the saveTheFile method,
        //  which is save the check data and return the attachemnt Id after insert,
        //  next time (in else) we are call the appentTOFile() method
        //   for update the attachment with remains chunks
        if (fileId == '') {
            fileId = saveTheAttachment(parentId, fileName, base64Data, contentType);
        } else {
            appendToAttachment(fileId, base64Data);
        }
        
        return Id.valueOf(fileId);
    }
    
    public static Id saveTheAttachment(Id parentId, String fileName, String base64Data, String contentType) {
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        
        Attachment oAttachment = new Attachment();
        oAttachment.parentId = parentId;
        
        oAttachment.Body = EncodingUtil.base64Decode(base64Data);
        oAttachment.Name = fileName;
        oAttachment.ContentType = contentType;
        
        insert oAttachment;        
        return oAttachment.Id;
    }
    
    private static void appendToAttachment(Id fileId, String base64Data) {
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');        
        Attachment a = [
            SELECT Id, Body
            FROM Attachment
            WHERE Id = : fileId
        ];
        
        String existingBody = EncodingUtil.base64Encode(a.Body);        
        a.Body = EncodingUtil.base64Decode(existingBody + base64Data);        
        update a;
    }


    @RemoteAction
    @AuraEnabled
    public static Id saveContentVersion(String fileName, String base64Data, String fileId) {
        // check if fileId id ''(Always blank in first chunk), then call the saveTheFile method,
        //  which is save the check data and return the attachemnt Id after insert,
        //  next time (in else) we are call the appentTOFile() method
        //   for update the attachment with remains chunks
        if (fileId == '') {
            fileId = saveTheContentVersion(fileName, base64Data);
        } else {
            appendToContentVersion(fileId, base64Data);
        }
        
        return Id.valueOf(fileId);
    }
    
    public static Id saveTheContentVersion(String fileName, String base64Data) {
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        
        ContentVersion cv = new ContentVersion();
        cv.Title = fileName;
        cv.PathOnClient = fileName;
        cv.VersionData =  EncodingUtil.base64Decode(base64Data);        
        cv.IsMajorVersion = false; 
        cv.origin = 'C';
        
        insert cv;        
        return cv.Id;
    }
    
    private static void appendToContentVersion(Id fileId, String base64Data) {
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');        
        ContentVersion cv = [
            SELECT Id, VersionData
            FROM ContentVersion
            WHERE Id = : fileId
        ];
        
        String existingBody = EncodingUtil.base64Encode(cv.VersionData);        
        cv.VersionData = EncodingUtil.base64Decode(existingBody + base64Data);        
        update cv;
    }

    @RemoteAction
    @AuraEnabled
    public static String getContentVersion(Id fileId) {
        ContentVersion cv = [
            SELECT Id, VersionData, Title, FileType
            FROM ContentVersion
            WHERE Id = : fileId
        ];
        
        String body = EncodingUtil.base64Encode(cv.VersionData);
        Map<String, String> response = new Map<String, String>();
        response.put('VersionData', body);
        response.put('Id', cv.Id);
        response.put('Title', cv.Title);
        response.put('FileType', cv.FileType);

        return JSON.serialize(response);
    }

    @RemoteAction
    @AuraEnabled
    public static String getAttachment(Id fileId) {
        Attachment attachemnt = [
            SELECT Id, Body, Name, ContentType
            FROM Attachment
            WHERE Id = : fileId
        ];
        
        String body = EncodingUtil.base64Encode(attachemnt.Body);
        Map<String, String> response = new Map<String, String>();
        response.put('Body', body);
        response.put('Id', attachemnt.Id);
        response.put('Name', attachemnt.Name);
        response.put('ContentType', attachemnt.ContentType);

        return JSON.serialize(response);
    }

    @RemoteAction
    @AuraEnabled
    global Static ProcessingResult emailLogin(String email){
        System.debug('emailLogin()');
        System.debug('this.userEmail:'+email);
        List<User> users = [SELECT Id from User where Email = :email];
        System.debug('usr:'+users.size());        

        ProcessingResult resultObj = new ProcessingResult ();
        resultObj.isSuccess = false;
    	resultObj.result = 'Email is not valid!';
        if(users.size() > 0){
            resultObj.result = 'Email is valid!';
            String loginIdentifier = System.UserManagement.initPasswordlessLogin(users[0].Id, Auth.VerificationMethod.EMAIL);
            resultObj.isSuccess = true;
            resultObj.userId = users[0].Id;
            resultObj.identifier = loginIdentifier;
        }
        return resultObj;
    }
    
    global PageReference verifyEmailLogin() {
        String startUrl = '/';
        String userId = System.currentPageReference().getParameters().get('userId');
        String identifier = System.currentPageReference().getParameters().get('identifier');
        String verificationCode = System.currentPageReference().getParameters().get('verificationCode');        
		System.debug('verifyEmailLogin()');
        System.debug('startUrl:'+startUrl);
        Auth.VerificationResult res = System.UserManagement.verifyPasswordlessLogin(userId, Auth.VerificationMethod.EMAIL, identifier, verificationCode, startUrl);
        System.debug('res:'+String.valueOf(res));
        if(res.success == true){
     		return res.redirect;
        }
        return null;
    }

    @RemoteAction
    @AuraEnabled
    global Static ProcessingResult registerUserEmail(String userEmail) {
        System.debug('registerUserEmail()');        
        Account acct = [SELECT Id from Account WHERE Name = 'Portal Users' Limit 1];
        Contact cont = new Contact();
        cont.AccountId = acct.Id;
        cont.LastName = 'Unverified Passwordless User';
        cont.Email = userEmail;
        insert cont;
        
        
        Profile prof = [SELECT Id from Profile where Name = 'vfCommunityVfCCPLogin User' LIMIT 1];

        Long CURRENT_TIME = DateTime.now().getTime();
		String timeString = String.valueOf(CURRENT_TIME);
		String alias = timeString.substring(timeString.length() - 8);
        String nickname = userEmail.substring(22)+'.'+CURRENT_TIME;
        String username = userEmail + '.' + CURRENT_TIME;

        User u = new user();
        u.LastName = 'Test 1';
        u.Email = userEmail;
        u.Alias = alias;
        u.Username = username; //NOTE - this will need to be unique each sign up
        u.CommunityNickname = nickname;
        u.LocaleSidKey = 'en_US';
        u.TimeZoneSidKey = 'GMT';
        u.ProfileID = prof.Id; //hvcpu
        u.LanguageLocaleKey = 'en_US';
        u.EmailEncodingKey = 'UTF-8';
        u.ContactId = cont.Id;
        System.debug('u:'+u);
        //insert u;
 
        String identifier = System.UserManagement.initSelfRegistration(Auth.VerificationMethod.Email, u);
        System.debug('this.registrationIdentifier:'+identifier);


        ProcessingResult resultObj = new ProcessingResult ();
        resultObj.isSuccess = false;
    	resultObj.result = 'Username is not valid';
        if(u != null){
            resultObj.result = 'Username is valid';
            resultObj.isSuccess = true;
            resultObj.userId = u.Id;
            resultObj.identifier = identifier;
        }
        return resultObj;
    }

    global PageReference verifyEmailRegistration() {
		System.debug('verifyEmailRegistration()');
        String startUrl = '/';
        if(System.currentPageReference() != null){
            startUrl = System.currentPageReference().getParameters().get('startURL');
        }
        String identifier = System.currentPageReference().getParameters().get('identifier');
        String verificationCode = System.currentPageReference().getParameters().get('verificationCode');
        Auth.VerificationResult res = System.UserManagement.verifySelfRegistration(Auth.VerificationMethod.EMAIL, identifier, verificationCode, startUrl);
        System.debug('res:'+String.valueOf(res));
        if(res.success == true){
     		return res.redirect;
        }
        return null;
    }

    @RemoteAction
    @AuraEnabled
    global Static ProcessingResult createLead(String firstName, String lastName, String email, String company){
        System.debug('createLead()');

        ProcessingResult resultObj = new ProcessingResult();
        resultObj.isSuccess = false;
        try {
            Lead lead = new Lead();
            lead.FirstName = firstName;
            lead.LastName = lastName;
            lead.Email = email;
            lead.Company = company;
            insert lead;

            resultObj.isSuccess = true;
            resultObj.result = 'Success';
    	} catch(Exception e){
    		resultObj.result = 'Error - '+e.getMessage();
    	}
        return resultObj;
    }

    public class rfPrototypeCtrlException extends Exception{}
}