


define(function (require) {
    var $ = require('jquery');
    require('PagerList');
    var common = require('gs/uiFrame/js/common');
    var GlobalVariable = require('globalVariable');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var webStorage = require('gs/webStorage');
    var webProxy = require('webProxy');

    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var username = webStorage.getItem('gs_UserName');
    /****************/
    var trustId = common.getQueryString('tid');
    var spName = '[TrustManagement].[SubmitWordHistory]';
    var hspName = '[TrustManagement].[usp_UpdateRevewTrustRootPath]';
    //loading data
    PagerListModule.Init(listCategory.RuleList, 'usp_GetMappRuleWithPager', trustId, 1, 0,
        GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
        '#divDataList');
    PagerListModule.DataBind(function (haveData) {
        $(".RuleListA").click(function () {
            var id = $(this).attr("data-id");
            loadingDefaultData(id);
        });
        if (haveData > 0) {
            loadingDefaultData(haveData);
        }

    });

    $("#btnUpdate").click(function () { update(); });
    $("#OpenDraftCreation").click(function () { OpenDraftCreation() });

    function update() {
        var v = webProxy.Verif('RootPath', trustId);
        if (!v) {
            GSDialog.HintWindow('请联系管理员设置文档管理路径');
            return false;
        };

        //


        var htmlurl = GlobalVariable.TrustManagementServiceHostURL + '/productManage/TrustManagement/documentManagement/EditMappRule.html?TrustId=' + trustId + '&ruleType=1';
 
        GSDialog.topOpen('底稿匹配规则', htmlurl, null, function (res) {

        }, 800, 550, null, true, true, true, false);
    }

    //尽职调查报告
    function OpenDraftCreation() {
        //第二步rootpath值报错需要先在文档管理中保存文件路径


        var ReportName = '尽职调查报告_' + trustId + '_' + (new Date()).dateFormat('yyyyMMdd');
        var TemplateFile = 'E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\Document\\' + trustId + '_尽调报告模板.docx';

        sVariableBuilder.AddVariableItem('TrustId', trustId, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('ReportName', ReportName, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('TemplateFile', TemplateFile, 'String', 0, 0, 0);

        var sVariable = sVariableBuilder.BuildVariables();
        var _taskCode = 'TrustDraftCreation';
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'ConsumerLoan',
            taskCode: _taskCode,
            sContext: sVariable,
            callback: function () {
                var url = GlobalVariable.TrustManagementService + '/TrustFiles/' + trustId + '/TaskReportFiles/' + ReportName + '.docx';
                GSDialog.HintWindowTF("确认下载文档？", function () {
                    window.location.href = url;
                })
                //if (confirm('确认下载文档？')) {
                //    window.location.href = url;
                //}
            }
        });
        tIndicator.show();
    }

    function loadingDefaultData(vId) {
        PagerListModule.Init(listCategory.RuleDefault, 'usp_GetMappRuleDefaultWithPager', 0, 0, vId,
            GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
            '#divDefaultLists');
        PagerListModule.DefaultDataBind(function (haveData) { });
    }

    $("#SubmittDraftCreation").click(function () {
        var v = webProxy.Verif('RootPath', trustId);
        if (!v) {
            GSDialog.HintWindow('请先系管理员设置文档管理路径');
            return false;
        };

        //

        var serviceUrl = GlobalVariable.DocumentServiceUrl + "SumbitWordManagement/" + trustId + "/1/" + username + "/" + spName + "/1/" + hspName + "";
        $.ajax({
            type: "Get",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: {},
            success: function (data) {
                if (data != "" && data != undefined) {
                    if (data.Status == 0) {
                        ShowDiffWordHistory(trustId, 1);
                    }
                }
            },
            error: function (response) {
                GSDialog.HintWindow("保存失败");
            }
        });

    });

    $("#ReviewDraftCreation").click(function () {

        var v = webProxy.Verif('RootPath', trustId);
        if (!v) {
            GSDialog.HintWindow('请联系管理员设置文档管理路径');
            return false;
        };

        //


        var serviceUrl = GlobalVariable.DocumentServiceUrl + "SumbitWordManagement/" + trustId + "/2/" + username + "/" + spName + "/1/" + hspName + "";
        $.ajax({
            type: "Get",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: {},
            success: function (data) {
                if (data != "" && data != undefined) {
                    if (data.Status == 0) {
                        GSDialog.HintWindow("复核成功，可以通过【Word历史版本比较】查看各个复核版本");
                    }
                }
            },
            error: function (response) {
                GSDialog.HintWindow("复核失败");
            }
        });

    });

    $("#CompareWordHistory").click(function () {
        ShowDiffWordHistory(trustId, 1);
    });

    function ShowDiffWordHistory(trustId, isPlanWord) {
        var defaultPageUrl = GlobalVariable.TrustManagementServiceHostURL + '/productManage/TrustManagement/documentManagement/DiffWords.html?TrustId=' + trustId + '&isPlanWord=' + isPlanWord + '';
        GSDialog.topOpen('历史版本比较', defaultPageUrl, null, function (res) {

        }, 800, 500, null, true, true, true, false);
    }

})