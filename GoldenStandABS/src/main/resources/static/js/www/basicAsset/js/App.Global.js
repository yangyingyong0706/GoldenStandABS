define(function () {

    var uriHostInfo = location.protocol + "//" + location.host;

    var GlobalVariable = {
        SslHost: uriHostInfo + '/',
        TaskProcessEngineServiceURL: uriHostInfo + '/TaskProcessEngine/SessionManagementService.svc/jsAccessEP/',
        PoolCutServiceURL: uriHostInfo + '/GoldenStandABS/service/PoolCutService.svc/jsAccessEP/',
        DataProcessServiceUrl: uriHostInfo + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/",

        QuickFrame: uriHostInfo + "/GoldenStandABS"
    };

    return GlobalVariable;
});

