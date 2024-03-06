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
    private static void testrfPrototypeCtrl() {
        List<Account> accounts = createAccount();
        Test.StartTest();
        PageReference pageRef = Page.rfPrototypeVF;
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
        PageReference pageRef = Page.rfPrototypeVF;
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
    
    private static List<Account> createAccount() {
        List<Account> accounts = new List<Account>();
        accounts.add(new Account(Name = 'Test Account'));
        insert accounts;
        return accounts;
    }
}