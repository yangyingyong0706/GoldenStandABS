define(function (require) {
    var $ = require('jquery');
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var enter = common.getQueryString('uploadType');
    $(function () {
        //下载来源添加 ,资产模板  
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_信用卡.xlsx', '下载', '资产导入模板_信用卡.xlsx', 'downLoadCard');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_CLO.xlsx', '下载', '资产导入模板_CLO.xlsx', 'downLoadPLoan');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_消费.xlsx', '下载', '资产导入模板_消费.xlsx', 'downLoadCLoan');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_ABN.xlsx', '下载', '资产导入模板_ABN.xlsx', 'downLoadPaper');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_车贷.xlsx', '下载', '资产导入模板_车贷.xlsx', 'downLoadCarLoan');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_房贷.xlsx', '下载', '资产导入模板_房贷.xlsx', 'downLoadHLoan');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_应收账款.xlsx', '下载', '资产导入模板_应收账款.xlsx', 'downLoadRcv');
       
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_消费.csv', '下载', '资产导入模板_消费.csv', 'downLoadCLoanCSV');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_车贷.csv', '下载', '资产导入模板_车贷.csv', 'downLoadCarloansCSV');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_融资租赁.xlsx', '下载', '资产导入模板_融资租赁.xlsx', 'downLoadFinanceLease');

        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/全账户_订单文件.csv', '下载', '全账户_订单文件.csv', 'downLoadFullAccount_orderFile');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/全账户_账户文件.csv', '下载', '全账户_账户文件.csv', 'downLoadFullAccount_AccountFile');
    })
    //字节流下载,对IE浏览器不工作的部分进行了调整
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
        };
        oReq.send();
    }
    function downLoanExcelInIE(blob, desName) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, desName);

        }
    }
})