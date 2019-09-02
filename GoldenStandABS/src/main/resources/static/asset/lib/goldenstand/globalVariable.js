//define({
//    dataProcessServiceUrl: location.protocol + '//' + location.hostname + '//goldenstandabs/service/DataProcessService.svc/jsAccessEP/'
//});

define(function () {
    var uriHostInfo = location.protocol + "//" + location.host;
    var GlobalVariable = function () { };
    GlobalVariable.prototype = {
        SslHost: uriHostInfo + '/',
        TaskProcessEngineServiceURL: uriHostInfo + '/TaskProcessEngine/SessionManagementService.svc/jsAccessEP/',
        //PoolCutServiceURL: this.uriHostInfo + '/PoolCut/PoolCutService.svc/jsAccessEP/',
        //DataProcessServiceUrl: this.uriHostInfo + "/TrustManagementService/DataProcessService.svc/jsAccessEP/",

        PoolCutServiceURL: uriHostInfo + '/GoldenStandABS/service/PoolCutService.svc/jsAccessEP/',
        DataProcessServiceUrl: uriHostInfo + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/",
        DocumentServiceUrl: uriHostInfo + "/GoldenStandABS/service/DocumentManagement.svc/jsAccessEP/",
        QuickFrame: uriHostInfo + "/GoldenStandABS",
        QuickFrameServiceUrl: uriHostInfo + '/GoldenStandABS/service/FrameService.svc/',
        TrustManagementServiceUrl: uriHostInfo + '/GoldenStandABS/service/TrustManagementService.svc/jsAccessEP/',
        BondPaymentScheduleServiceUrl: uriHostInfo + '/GoldenStandABS/service/BondPaymentScheduleService.svc/jsAccessEP/',
        PaymentScheduleServiceUrl: uriHostInfo + '/GoldenStandABS/service/PaymentScheduleService.svc/jsAccessEP/',
        //CashFlowStudioServiceUrl: 'https://' + domain + '/GoldenStandABS/Service/CashFlowStudioService.svc/jsAccessEP/',
        SessionManagementServiceUrl: uriHostInfo + '/GoldenStandABS/service/SessionManagementService.svc/jsAccessEP/',
        QuickWizardServiceUrl: uriHostInfo + '/GoldenStandABS/service/WizardService.svc/',

        CashFlowEngineServiceHostURL: uriHostInfo + '/CashFlowEngine/',
        TaskProcessEngineServiceHostURL: uriHostInfo + '/TaskProcessEngine/',
        TrustManagementServiceHostURL: uriHostInfo + '/GoldenStandABS/www/',
        BusinessRuleEngineServiceHostURL: uriHostInfo + '/BusinessRuleEngine/',
        TaskProcessStudioServiceHostURL: uriHostInfo + '/TaskProcessStudio/',
        TrustManagementService: uriHostInfo + '/TrustManagementService',

        CommonServicesUrl: uriHostInfo + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/",
        WorkflowConfig: "http://172.16.6.192/WorkFlowStudio/Pages/index.html",//项目管理接入工作流新建新建及未启动接口
        WorkflowBase: "http://172.16.6.192/WorkflowEngine/Pages/workflowRecord.html",//项目管理接入工作流已启动接口

        Language_EN: 'en-US',
        Language_CN: 'zh-CN',
        Language_Default: 'zh-CN',
        Language_Set: 'ck_LanguageSet',

        Business_Unique: 'unique',
        Business_Trust: 'trust',
        Business_User: 'user',
        Business_Org: 'org',

        UiTempl_Stand: 'qw_KO_StandView',
        UiTempl_Grid: 'qw_KO_GridView',
        UiTempl_Tab: 'qw_KO_TabView'

    }

    return new GlobalVariable();
})