define(function (require) {
    var $ = require('jquery');
    var kendo = require('kendo.all.min');
    var common = require('gs/uiFrame/js/common');
    var dataOperate = require('app/transactionManage/script/dataOperate');
    var jQui = require('jquery-ui');
    var taskProcessIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    require('date_input');
    require('app/components/assetPoolList/js/PoolCut_Interface');
   // console.log();
    (function AllocationTrust() {
        $('.date-plugins').date_input();
        //$('#ImportAssetInfo .form-control').change(function () {
        //    CommonValidation.ValidControlValue($(this));
        //});
        $("#btnUpload").click(function () {
            var reportingDate = $("#reportingDate").val();
            var myselect = document.getElementById("select");
            var index = myselect.selectedIndex;
            var op = myselect.options[index].value;
            if (reportingDate != null) {
                var filePath = $('#fileBasePool').val();
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                UploadFile("fileBasePool", fileName, 'transactionData', function () {
                    var TrustId = window.location.href.substring(window.location.href.lastIndexOf('=') + 1);
                    var ReportingDate = $('#reportingDate').val();
                    var dir = 'E:/TSSWCFServices/TrustManagementService/TrustFiles/' + TrustId + '/Asset/';
                    sVariableBuilder.AddVariableItem("TrustId", TrustId, 'NVarChar');
                    sVariableBuilder.AddVariableItem("ReportingDate", ReportingDate, "NVarChar");
                    //sVariableBuilder.AddVariableItem("SourceFilePath_BasePool", dir + files[0].name, "NVarChar");
                    var sVariable = sVariableBuilder.BuildVariables();
                    var TaskCode;
                    if (op == 1) {
                        var TaskCode = 'TransferAsset';
                    } else if (op == 2) {
                        var TaskCode = 'RedeemAsset';
                    } else if (op == 3) {
                        var TaskCode = 'Clear_buy';
                    } else {
                        alert("请选择资产类型");
                    }
                    var tIndicator = new taskProcessIndicator({
                        width: 550,
                        height: 600,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: TaskCode,
                        sContext: sVariable,
                        callback: function () {
                            window.location.href = location.protocol + '//' + location.host + '/GoldenStandABS/www/transactionManage/updata/viewTransactionUpData.html';
                            //"https://abs-dit.goldenstand.cn/GoldenStandABS/www/transactionManage/updata/viewTransactionUpData.html"
                        }
                    });
                    tIndicator.show();
                });
               
            } else {
                alert("输入有误！");
                return false;
            }
           
        })
    })();
})