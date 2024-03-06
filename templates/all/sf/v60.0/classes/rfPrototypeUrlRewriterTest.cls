@isTest
private with sharing class rfPrototypeUrlRewriterTest {
    @isTest
    private static void testMapRequestUrl() {
        Test.StartTest();
        PageReference pageRef = Page.rfPrototypeVF;
        Test.setCurrentPage(pageRef);
        rfPrototypeUrlRewriter instance = new rfPrototypeUrlRewriter();
        PageReference result = instance.mapRequestUrl(pageRef);
        Test.StopTest();
        System.assertEquals(true, result.getRedirect(), 'The page should be redirected');
    }
    
    @isTest
    private static void testGenerateUrlFor() {
        List<PageReference> pageReferences = new List<PageReference>();
        Test.StartTest();
        PageReference pageRef = Page.rfPrototypeVF;
        Test.setCurrentPage(pageRef);
        pageReferences.add(pageRef);
        rfPrototypeUrlRewriter instance = new rfPrototypeUrlRewriter();
        List<PageReference> results = instance.generateUrlFor(pageReferences);
        Test.StopTest();
        System.assertEquals(null, results, 'Result should be empty.');
    }
}