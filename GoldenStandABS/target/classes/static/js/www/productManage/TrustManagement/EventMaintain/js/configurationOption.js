define(function (require) {
    var $ = require("jquery");
    require("anyDialog");
    var GsDialog = require("gsAdminPages");
    var vue = require("Vue");
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var trustId = common.getQueryString("tid");
    var datas = {
        EventListInTrust: [],
        scenarioNames: []
    }
    $(function () {
        getScenarioListByTrustId(trustId)
        function getScenarioListByTrustId(trustId) {
            var executeParam = {
                'SPName': "usp_GetTrustPaymentScenario", 'SQLParams': [
                    { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
                ]
            };
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                datas.EventListInTrust.push(data);
            });
            $.each(datas.EventListInTrust, function (i, v) {
                $.each(v, function (j, k) {
                    datas.scenarioNames.push(k);
                })
            })
        }
        var app = new vue({
            el: "#app",
            data: datas,
        })

    })
})