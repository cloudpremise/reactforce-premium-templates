global with sharing class rfPrototypeUrlRewriter implements Site.UrlRewriter {

    global PageReference mapRequestUrl(PageReference myFriendlyUrl){
        System.debug('rfPrototypeUrlRewriter.mapRequestUrl()');
        System.debug('myFriendlyUrl:'+myFriendlyUrl);

        //if we are in production, remove the 'schooladmin/' from the url redirect as it is assumed by the custom url
    
        String sanitizedUrl = String.valueOf(myFriendlyUrl);
        sanitizedUrl = sanitizedUrl.replace('rfPrototype/','');
        
        System.debug('sanitizedUrl:'+sanitizedUrl);
        
        
        
        String url = myFriendlyUrl.getUrl();   
        System.debug('url:'+url);
        
        //List<Log__c> logs = new List<Log__c>();
        //String log = 'SiteUrlRewriter()\n';
        //log += 'myFriendlyUrl='+String.valueOf(myFriendlyUrl)+'\n';
        //log += 'url='+url+'\n';
        //logs.add(new Log__c(Log__c = log));
        

        Pagereference pageref = null;
        if(url == '/login'){
        // } else if(url.startsWith('/secur/logout.jsp')){
        //} else if(url.startsWith('/_ui/system/security/ChangePassword')){

        } else if(url.startsWith('/_ui/')){
        } else if(url.startsWith('/ui/')){
        } else if(url.startsWith('/secur/')){
       // } else if(url.startsWith('/SchoolAdminSiteLogin')){
        } else if(url.startsWith('/rfPrototypeVf')){
        } else if(url.startsWith('/Idp')){
       // } else if(url.startsWith('/SchoolAdminForgotPassword')){
       // } else if(url.startsWith('/_nc_external/identity/ui/login/ForgotPasswordInterstitial')){ // Added to allow Password Reset page for new school admin portal 17th June 2020
        } else if(url.startsWith('/_nc_external/identity/selfregistration/SelfRegVerificationStart')){   
        } else if(url.startsWith('/_nc_external/identity/selfregistration/SelfRegVerificationFinish')){                       
       // } else if(url.startsWith('/schooladminforgotpasswordconfirm')){
       // } else if(url.startsWith('/SchoolAdminForgotPasswordConfirm')){
       // } else if(url.startsWith('/SchoolAdminChangePassword')){
        //} else if(url.startsWith('/_nc_external')){
        } else if(url.startsWith('/CommunitiesSelfReg')){
        } else if(url.startsWith('/apex/Exception')){
        
       // } else if(url.startsWith('/00O')){ // added to give access to customize recport for admins 16th April 2020 

        // } else if(url.startsWith('/resource/')){            
        // } else if(url.startsWith('/static/')){           
        // } else if(url.startsWith('/sCSS/')){       
        // } else if(url.startsWith('/jslibrary/')){       
        // } else if(url.startsWith('/faces/')){

        } else if(url.startsWith('/apexremote')){


        } else {
            
            //pageref = new Pagereference('/SchoolAdminPortalHome?rte='+myFriendlyURL);    
            //pageref = new Pagereference('/SchoolAdminPortalHome?rte='+sanitizedUrl);   
            pageref = new Pagereference('/rfPrototypeVf?rte='+sanitizedUrl);          
        }

        //GlobalSettings__c gs = GlobalSettings__c.getOrgDefaults();
        //if(gs.DebugLevel__c = 'FINE'){
        //insert logs;           
        //}


        System.debug('pageRef:'+pageRef);
        return pageref;


        //return null;
    }
    //The second global method maps the internal ids to URLs
    global List<PageReference> generateUrlFor(List<PageReference> mySalesforceUrls){
        System.debug('rfPrototypeUrlRewriter.generateUrlFor');
        System.debug('mySalesforceUrls:'+mySalesforceUrls);

        return null;
    
    }
}