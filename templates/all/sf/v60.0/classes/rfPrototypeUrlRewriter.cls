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

global with sharing class rfPrototypeUrlRewriter implements Site.UrlRewriter {
    global PageReference mapRequestUrl(PageReference myFriendlyUrl) {
        //if we are in production, remove the 'schooladmin/' from the url redirect as it is assumed by the custom url
        String sanitizedUrl = String.valueOf(myFriendlyUrl);
        sanitizedUrl = sanitizedUrl.replace('rfPrototype/','');
        String url = myFriendlyUrl.getUrl();

        Pagereference pageref = null;
        if(url == '/login'){
        } else if(url.startsWith('/_ui/')){
        } else if(url.startsWith('/ui/')){
        } else if(url.startsWith('/secur/')){
        } else if(url.startsWith('/rfPrototypeVf')){
        } else if(url.startsWith('/Idp')){
        } else if(url.startsWith('/idp')){
        } else if(url.startsWith('/_nc_external/identity/selfregistration/SelfRegVerificationStart')){   
        } else if(url.startsWith('/_nc_external/identity/selfregistration/SelfRegVerificationFinish')){                       
        } else if(url.startsWith('/CommunitiesSelfReg')){
        } else if(url.startsWith('/apex/Exception')){
        } else if(url.startsWith('/apexremote')){
        } else {
            pageref = new Pagereference('/rfPrototypeVf?rte='+sanitizedUrl);          
        }
        return pageref;
    }

    //The second global method maps the internal ids to URLs
    global List<PageReference> generateUrlFor(List<PageReference> mySalesforceUrls) {
        return null;
    }
}