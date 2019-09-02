define(function (require) {
    var $ = require('jquery');
    var common = require('gs/uiFrame/js/common');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    require('app/components/assetPoolList/js/PoolCut_Interface');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var webProxy = require('gs/webProxy');
    var parentPoolId
    var GSDialog = require("gsAdminPages")
    var Vue = require('Vue');
    var PoolId;
    var PoolDb;
    $(function () {
        var TaskCode = common.getQueryString('TaskCode');
        PoolId = common.getQueryString('PoolId');
        parentPoolId = common.getQueryString('ParentPoolId');
        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=config&executeParams=";
        var params = [
        ['PoolId', PoolId, 'int']
        ];
        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeaderById');
        promise().then(function (response) {
            if (typeof response === 'string') { 
                PoolDb = JSON.parse(response)[0].PoolDBName; 
            }
            else { poolHeader = response; }
        });
        renderRibbon();
        $('#cancel').click(function () { Cancel(); });
    });
    function renderRibbon() {
        new Vue({
            el: "#AssetPoolCreationForm",
            data: {
                dataMode:'1',
                testMode:'1',
                trustId:'',
                trustList:[],
                taskCode:''
            },
            created:function(){
               var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
               var params = [
               ['language', '', 'string']
               ];
               var promise = webProxy.comGetData(params, svcUrl, 'TrustManagement.usp_GetTrusts');
               var self = this;
               promise().then(function (response) {
                  if (typeof response === 'string') { 
                    self.trustList = JSON.parse(response); 
                }
                else { poolHeader = response; }
            })
           },
           methods: {
            handleSubmit:function(){
             if(this.trustId=='-1')
             {
                 GSDialog.HintWindow('请选择产品');
             }
             else
             {


                 if(this.dataMode == '1')
                 {
                    if(this.testMode == '1')
                    {
                        this.taskCode = 'PoolDB_StressTest_AssetDetails';
                    }
                    else if(this.testMode == '2')
                    {
                        this.taskCode = 'PoolDB_SensitivityAnalysis_AssetDetails';
                    }
                }
                else if(this.dataMode == '2')
                {
                    if(this.testMode == '1')
                    {
                        this.taskCode = 'PoolDB_StressTest_PaymentRecords';
                    }
                    else if(this.testMode == '2')
                    {
                        this.taskCode = 'PoolDB_SensitivityAnalysis_PaymentRecords';
                    }
                }
                sVariableBuilder.AddVariableItem('PoolID', PoolId, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('TrustId', 1338, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('PoolDB', PoolDb, 'String', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 500,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: this.taskCode,
                    sContext: sVariable,
                    callback: function () {
                        sVariableBuilder.ClearVariableItem();
                        $('#modal-close', window.parent.document).trigger('click');
                    }
                });
                tIndicator.show();
            }
        }
    }
})
    };
    function Cancel() {
        $('#modal-close', parent.document).trigger('click');
    }
})
