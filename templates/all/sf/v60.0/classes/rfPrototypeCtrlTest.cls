@isTest
private with sharing class rfPrototypeCtrlTest {
    
    @testSetup
    private static void makeData() {
        DateTime myDateTime = DateTime.now();
        Profile p = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        User tuser = new User(
            firstname = 'tuserFname',
            lastName = 'tuserLastname',
            email = 'testExample@testExample.com',
            Username = 'tuser'+myDateTime.getTime()+'@testfg.org',
            EmailEncodingKey = 'ISO-8859-1',
            Alias = 'tuser',
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            LanguageLocaleKey = 'en_US',
            ProfileId = p.Id,
            Phone = '123-456-7890'
        );
        insert tuser;
    }
    
    @isTest
    private static void testGetSessionId() {
        Test.StartTest();
        String result = rfPrototypeCtrl.getSessionId();
        Test.StopTest();
        System.assertNotEquals(null, result, 'Result should not be empty.');
    }
    
    @isTest
    private static void testGetDomain() {
        Test.StartTest();
        String result = rfPrototypeCtrl.getDomain();
        Test.StopTest();
        System.assertNotEquals(null, result, 'Result should not be empty.');
    }
    
    @isTest
    private static void testGetSessionIdFromVFPage() {        
        Test.StartTest();
        PageReference pageRef = Page.ReactforceAllTemplateVF;
        Test.setCurrentPage(pageRef);
        String result = rfPrototypeCtrl.getSessionIdFromVFPage(pageRef);
        Test.StopTest();
        System.assertEquals('Unit.Test', result, 'Result should be same.');
    }
    
    @isTest
    private static void testRfPrototypeCtrl() {
        List<Account> accounts = createAccount();
        Test.StartTest();
        PageReference pageRef = Page.ReactforceAllTemplateVF;
        Test.setCurrentPage(pageRef);
        pageRef.getParameters().put('bundleDomain', String.valueOf(accounts[0].Id));
        pageRef.getParameters().put('bundleId', 'testBundleId');
        ApexPages.StandardController sc = new ApexPages.StandardController(accounts[0]);
        rfPrototypeCtrl instance = new rfPrototypeCtrl(sc);
        instance.developmentMode = false;
        instance.userInterfacePreview = false;
        instance.advancedConfiguration = false;
        Test.StopTest();
        System.assertEquals('testBundleId', instance.bundleId, 'Result should be same.');
    }
    
    @isTest
    private static void testRerenderPage() {
        Test.StartTest();
        rfPrototypeCtrl instance = new rfPrototypeCtrl();
        PageReference result = instance.rerenderPage();
        Test.StopTest();
        System.assertEquals(true, result.getRedirect(), 'The page should be redirected.');
    }
    
    @isTest
    private static void testLogControllerInfo() {
        Test.StartTest();
        rfPrototypeCtrl.logControllerInfo();
        Test.StopTest();
    }
    
    @isTest
    private static void testCallInternalApi() {
        Test.StartTest();
        List<Account> accounts = createAccount();
        String params = '{"sobjecttypename":"Account", "Id":"'+accounts[0].Id+'"}';
        String headers = '{"Content-Type":"application/json;charset=UTF-8"}';
        String result = rfPrototypeCtrl.callInternalApi('GET', '/v1/sobject/Account/', 'requestEntityStr', params, headers);
        Test.StopTest();
        Map<String, Object> resultMap = (Map<String, Object>)JSON.deserializeUntyped(result);
        System.assertEquals(200, resultMap.get('statusCode'), 'Result should be same.');
    }
    
    @isTest
    private static void testCallSampleInternalApi() {
        Test.StartTest();
        List<Account> accounts = createAccount();
        String params = '{"sobjecttypename":"Account", "Id":"'+accounts[0].Id+'"}';
        String headers = '{"Content-Type":"application/json;charset=UTF-8"}';
        String result = rfPrototypeCtrl.callSampleInternalApi('GET', '/v1/sobject/Account/', 'requestEntityStr', params, headers);
        Test.StopTest();
        System.assertEquals('{"response": "Learn about Reactforce here.", "result": []}', result, 'Result should be same.');
    }
    
    @isTest
    private static void testLoginWithoutParameter() {
        User user = new User();
        Map<Id, User> userMap = new Map<Id, User>([SELECT Id, Username FROM User WHERE Alias = 'tuser']);
        for(User userObj: userMap.Values()) {
            user = userObj;
        }
        Test.startTest();
        PageReference pageRef = Page.ReactforceAllTemplateVF;
        Test.setCurrentPage(pageRef);
        ApexPages.Standardcontroller sc = new ApexPages.Standardcontroller(user);
        ApexPages.currentPage().getParameters().put('usernameJS', user.Username);
        ApexPages.currentPage().getParameters().put('passwordJS', 'test@12345');
        ApexPages.currentPage().getParameters().put('startURL', System.Url.getOrgDomainURL().toExternalForm());
        rfPrototypeCtrl instance = new rfPrototypeCtrl();
        PageReference result = instance.login();
        Test.stopTest();
        System.assertEquals(null, result, 'Result should be empty.');
    }
    
    @isTest
    private static void testLoginWithParameter() {
        List<Account> accounts = createAccount();
        Test.startTest();
        String accountRecord = '{"Name":"'+accounts[0].Name+'"}';
        rfPrototypeCtrl.ProcessingResult resultObj = rfPrototypeCtrl.login(accountRecord);
        Test.stopTest();
        System.assertEquals('Username or Password is invalid !', resultObj.result, 'Result should be same.');
    }
    
    @isTest
    private static void testRegisterUserWithoutParameter() {
        Test.startTest();
        ApexPages.currentPage().getParameters().put('firstNameJS', 'tuserFname');
        ApexPages.currentPage().getParameters().put('lastNameJS', 'tuserLastname');
        ApexPages.currentPage().getParameters().put('emailJS', 'tusergh@example.com');
        ApexPages.currentPage().getParameters().put('passwordJS', 'test@12345');
        ApexPages.currentPage().getParameters().put('confirmPasswordJS', 'test@12345');
        ApexPages.currentPage().getParameters().put('communityNicknameJS', 'tuser');
        rfPrototypeCtrl instance = new rfPrototypeCtrl();
        PageReference result = instance.registerUser();
        Test.stopTest();
        System.assertEquals(null, result, 'Result should be same.');
    }
    
    @isTest
    private static void testRegisterUserWithParameterNewUser() {
        Test.startTest();
        rfPrototypeCtrl.ProcessingResult resultObj = rfPrototypeCtrl.registerUser('tuserFname', 'tuserLastname', 'tusergh1@example.com', 'test@12345', 'test@12345', 'tuser');
        Test.stopTest();
        System.assertEquals('Success', resultObj.result, 'Result should be same.');
    }
    
    @isTest
    private static void testRegisterUserWithParameterExistingUser() {
        User user = new User();
        Map<Id, User> userMap = new Map<Id, User>([SELECT Id, FirstName, LastName, Email, Alias FROM User WHERE Alias = 'tuser']);
        for(User userObj: userMap.Values()) {
            user = userObj;
        }
        Test.startTest();
        rfPrototypeCtrl.ProcessingResult resultObj = rfPrototypeCtrl.registerUser(user.FirstName, user.LastName, user.Email, 'test@12345', 'test@12345', user.Alias);
        Test.stopTest();
        System.assertEquals('User already exists.', resultObj.result, 'Result should be same.');
    }
    
    @isTest
    private static void testSaveAttachmentWithoutAttachment() {
        Test.startTest();
        List<Account> accounts = createAccount();
        Id result = rfPrototypeCtrl.saveAttachment(accounts[0].Id, 'Test File', 'Test Data', '.pdf', '');
        Test.stopTest();
        List<Attachment> attachemnts = [SELECT Id FROM Attachment];
        System.assertEquals(1, attachemnts.size(), 'Result should be same.');
    }
    
    @isTest
    private static void testSaveAttachmentWithAttachment() {
        List<Account> accounts = createAccount();
        Test.startTest();
    	Attachment attachment = new Attachment();
    	attachment.ParentId = accounts[0].Id;
    	attachment.Name = 'Test Attachment for Parent';
    	attachment.Body = Blob.valueOf('Test Data');
    	insert attachment;
        Id result = rfPrototypeCtrl.saveAttachment(accounts[0].Id, 'Test File', 'Test Data', '.pdf', attachment.Id);
        Test.stopTest();
        System.assertEquals(attachment.Id, result, 'Result should be same.');
    }
    
    @isTest
    private static void testSaveContentVersionWithoutContentVersion() {
        Test.startTest();
        Id result = rfPrototypeCtrl.saveContentVersion('Test File', 'Test Data', '');
        Test.stopTest();
        List<ContentVersion> contentVersions = [SELECT Id FROM ContentVersion];
        System.assertEquals(1, contentVersions.size(), 'Result should be same.');
    }
    
    @isTest
    private static void testSaveContentVersionWithContentVersion() {
        Test.startTest();
        ContentVersion cv = new Contentversion();
        cv.title = 'Test Data';
        cv.PathOnClient = 'test';
        cv.versiondata = EncodingUtil.base64Decode('This is version data');
        insert cv;
        Id result = rfPrototypeCtrl.saveContentVersion('Test File', 'Test Data', cv.Id);
        Test.stopTest();
        System.assertEquals(cv.Id, result, 'Result should be same.');
    }
    
    @isTest
    private static void testGetContentVersion() {
        Test.startTest();
        ContentVersion cv = new Contentversion();
        cv.title = 'Test Data';
        cv.PathOnClient = 'test';
        cv.versiondata = EncodingUtil.base64Decode('This is version data');
        insert cv;
        String result = rfPrototypeCtrl.getContentVersion(cv.Id);
        Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(result);
        Test.stopTest();
        System.assertEquals('Test Data', response.get('Title'), 'Result should be same.');
    }
    
    @isTest
    private static void testGetAttachment() {
        Test.startTest();
        List<Account> accounts = createAccount();
    	Attachment attachment = new Attachment();
    	attachment.ParentId = accounts[0].Id;
    	attachment.Name = 'Test Attachment for Parent';
    	attachment.Body = Blob.valueOf('Test Data');
    	insert attachment;
        String result = rfPrototypeCtrl.getAttachment(attachment.Id);
        Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(result);
        Test.stopTest();
        System.assertEquals('Test Attachment for Parent', response.get('Name'), 'Result should be same.');
    }
    
    @isTest
    private static void testEmailLogin() {
        User user = new User();
        Map<Id, User> userMap = new Map<Id, User>([SELECT Id, Email FROM User WHERE Alias = 'tuser']);
        for(User userObj: userMap.Values()) {
            user = userObj;
        }  
        Test.startTest();
        ApexPages.currentPage().getParameters().put('identifier', 'Test');
        rfPrototypeCtrl.ProcessingResult resultObj = rfPrototypeCtrl.emailLogin('testExample@testExample.com');
        Test.stopTest();
        System.assertEquals('Email is not valid!', resultObj.result, 'Result should be same.');
    }
    
    @isTest
    private static void testVerifyEmailLogin() {
        Test.startTest();
        ApexPages.currentPage().getParameters().put('identifier', 'Test');
		rfPrototypeCtrl instance = new rfPrototypeCtrl();
        PageReference result = instance.verifyEmailLogin();
        Test.stopTest();
        System.assertEquals(null, result, 'Result should be empty.');
    }
    
    @isTest
    private static void testRegisterUserEmail() {
        Account account = new Account(Name = 'Portal Users');
        insert account;
        //User user = new User();
        //Map<Id, User> userMap = new Map<Id, User>([SELECT Id, Email FROM User WHERE Alias = 'tuser']);
        //for(User userObj: userMap.Values()) {
        //    user = userObj;
        //}
        Test.startTest();
        rfPrototypeCtrl.ProcessingResult resultObj = rfPrototypeCtrl.registerUserEmail('abcdefTestExample@testExample.com');
        Test.stopTest();
        System.assertEquals(false, resultObj.isSuccess, 'Result should be false.');
    }

	@isTest
    private static void testVerifyEmailRegistration() {
        Test.startTest();
        ApexPages.currentPage().getParameters().put('identifier', 'Test');
		rfPrototypeCtrl instance = new rfPrototypeCtrl();
        PageReference result = instance.verifyEmailRegistration();
        Test.stopTest();
        System.assertEquals(null, result, 'Result should be empty.');
    }
    
    @isTest
    private static void testCreateLead() {
        Test.StartTest();
        rfPrototypeCtrl.ProcessingResult instance = new rfPrototypeCtrl.ProcessingResult();
        instance.Email = 'test@gmail.com';
        instance.userId = '12345';
        instance.identifier = 'test';
        instance = rfPrototypeCtrl.createLead('Test', 'Lead', 'test@test.com', 'Test Company');
        Test.StopTest();
        List<Lead> leads = [Select Id FROM Lead];
        System.assertEquals(1, leads.size(), 'Result should be same.');
        System.assertEquals(true, instance.isSuccess, 'Result should be inserted successfully.');
    }
    
    private static List<Account> createAccount() {
        List<Account> accounts = new List<Account>();
        accounts.add(new Account(Name = 'Test Account'));
        insert accounts;
        return accounts;
    }
}