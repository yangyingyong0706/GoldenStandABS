define(function (require) {
    var $ = require('jquery');
    var common = require('gs/uiFrame/js/common');
    require('app/components/assetPoolList/js/PoolCut_Interface');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var webProxy = require('gs/webProxy');
    var GSDialog = require("gsAdminPages")
    $(function () {
        $('#uploadData').click(function () {
            $('#uploadData').addClass("activeBorderBottom").siblings().removeClass('activeBorderBottom');
            $('#AssetPoolCreationForm').show();
            $('.downloadTemplateContent').hide();
        })
        $('#downloadTemplate').click(function () {
            $('#downloadTemplate').addClass("activeBorderBottom").siblings().removeClass('activeBorderBottom');
            $('#AssetPoolCreationForm').hide();
            $('.downloadTemplateContent').show();
        })
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/CashFlowOA/回款现金流管理分期实际回款模板.xlsx', '下载', '回款现金流管理分期实际回款模板.xlsx', 'downLoadCFOAPD');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/CashFlowOA/回款现金流管理分期实际回款模板.csv', '下载', '回款现金流管理分期实际回款模板.csv', 'downLoadCFOAPDCSV');
    });
    function downLoadExcelForSyn(filePath, innerText, desName, id) {
        var oReq = new XMLHttpRequest();
        //var desPath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_信用卡.xlsx";
        var uriHostInfo = location.protocol + "//" + location.host;
        var url = encodeURI(uriHostInfo + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/" + "getStream?" + 'filePath=' + filePath);
        oReq.open("POST", url, true);
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var content = oReq.response;

            var elink = document.createElement('a');
            elink.innerHTML = innerText;
            elink.download = desName;
            //elink.style.display = 'none';

            var blob = new Blob([content]);
            elink.onload = function (e) {
                window.URL.revokeObjectURL(e.href); // 清除释放

            };
            if (window.navigator && window.navigator.msSaveOrOpenBlob) { //判断是否为IE浏览器
                document.getElementById(id).appendChild(elink);

                $('body').on('click', '#' + id, function () {
                    downLoanExcelInIE(blob, desName);

                })
            }
            else {
                elink.href = URL.createObjectURL(blob);
                document.getElementById(id).appendChild(elink);
            }
            //elink.click();
            //document.body.removeChild(elink);
        };
        oReq.send();
    }
    function downLoanExcelInIE(blob, desName) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, desName);

        }
    }
})
