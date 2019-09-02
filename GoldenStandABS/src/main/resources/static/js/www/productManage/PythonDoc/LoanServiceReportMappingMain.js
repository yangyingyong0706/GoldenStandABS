define(function (require) {
    var $ = require('jquery');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    require('gs/globalVariable');
    require('jquery.datagrid');
    require('jquery.datagrid.options');
    require('jquery.ztree.core');
    require('jquery.ztree.excheck');
    require('jquery.ztree.exedit');
    require('App.Global');
    require('asyncbox');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var common = require('common');
    require('anyDialog');
    require('app/productManage/PythonDoc/js/DashboardCommon');
    require('app/productManage/PythonDoc/js/LoanServiceReportMapping');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');
    var appName = webStorage.getItem('showId');
    webProxy = require('gs/webProxy');


    ///////
    var tid = common.getQueryString("tid") ? common.getQueryString("tid") : "39";
    $(function () {
        init();
        BindData(tid);

    });

    $("#btnImport").anyDialog({
        width: 600,	// 弹出框内容宽度
        height: 260, // 弹出框内容高度
        title: '解析原始贷款服务报告',	// 弹出框标题
        url: './Dashboard/UploadImportData.html?tid=' + tid,
        onClose: function () {

        }
    });

    $("#btnImportExcel").anyDialog({
        width: 600,	// 弹出框内容宽度
        height: 200, // 弹出框内容高度
        title: '上传转置报告',	// 弹出框标题
        url: './Dashboard/UploadImportExcelData.html?tid=' + tid,
        onClose: function () {

        }
    });
    function searchList() {

        var data = getList();
        bindAssetPaymentStatistics(data);
    }
    function getList() {
        var list = datagridData;
        $('.list-filters .filter').each(function () {
            var $this = $(this);
            var value = $this.val();
            if (!value || value.length < 1) { return true; }

            var param = $this.attr('name');
            var value = $this.val();
            var vls = value.split(',');
            list = $.grep(list, function (n, i) {
                return $.inArray(n[param], vls) >= 0;
            })
        });
        return list;
    }
    var preTrustCode = '';
    $("#PayDate").click(function () {

        if (preTrustCode != $("#TrustCode").val()) {
            preTrustCode = $("#TrustCode").val();
            bindPayData(datagridData);
        }
    });

    $("#PayDate1").click(function () {

        if (preTrustCode != $("#TrustCode").val()) {
            preTrustCode = $("#TrustCode").val();
            bindPayData1();
        }
    });

    $("#PayDate2").click(function () {

        if (preTrustCode != $("#TrustCode").val()) {
            preTrustCode = $("#TrustCode").val();
            bindPayData2(datagridData);
        }
    });
    var TaskProcessWProxy = (function () {

        function createSessionShowTask(appDomain, sessionVariables, taskCode) {
            //var wProxy = new webProxy();
            //var sContext = {
            //    appDomain: appDomain,
            //    sessionVariables: sessionVariables,
            //    taskCode: taskCode
            //};
            var tIndicator = new taskIndicator({
                width: 900,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: appDomain,
                taskCode: taskCode,
                sContext: sessionVariables,
                callback: function () {

                    //window.location.reload();
                }
            });
            tIndicator.show();



            //var isOver = 0;
            //wProxy.createSessionByTaskCode(sContext, function (response) {
            //    window.parent.parent.isSessionCreated = true;
            //    window.parent.parent.sessionID = response;
            //    window.parent.parent.taskCode = taskCode;
            //    window.parent.parent.IndicatorAppDomain = appDomain;
            //    console.log('taskCode:' + taskCode);
            //    if (window.parent.parent.IsSilverlightInitialized) {
            //        window.parent.parent.PopupTaskProcessIndicatorTM();
            //        window.parent.parent.InitParams();
            //    }
            //    else {
            //        window.parent.parent.PopupTaskProcessIndicatorTM();
            //    }
            //    isOver = 1;
            //});


            //var tmpInterval = setInterval(function () {
            //    if (isOver == 1) {
            //        $(window.parent.document).find("#modal-mask").remove();
            //        $(window.parent.document).find("#modal-layout").remove();
            //        window.clearInterval(tmpInterval);
            //    }
            //}, 10);
        }

        return { CreateSessionShowTask: createSessionShowTask }
    })();










})