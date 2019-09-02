requirejs(['../../asset/lib/config'], function (config) {
    require(['jquery', 'globalVariable', 'common', 'knockout', 'knockout.mapping', 'gs/sVariableBuilder', 'gs/taskProcessIndicator','gs/uiFrame/js/gs-admin-2.pages','webProxy'],
        function ( $, gv , common, ko, komapping, sVariableBuilder, taskIndicator,GSDialog,webProxy) {
            var viewModel;
            var myModel = {
                ReportGroups: [],
            }
            ko.mapping = komapping
            var userName = sessionStorage.getItem('gs_UserName');
            userName = encodeURIComponent(userName);
            //function showRunDialog() {
            //    sVariableBuilder.AddVariableItem('TrustId', '0', 'String', 0, 0, 0);

            //    var sVariable = sVariableBuilder.BuildVariables();
            //    var tIndicator = new taskIndicator({
            //        width: 500,
            //        height: 550,
            //        clientName: 'TaskProcess',
            //        appDomain: 'Task',
            //        taskCode: 'RiskManagementReportDataReady',
            //        sContext: sVariable,
            //        callback: function (response) {
            //        }
            //    });
            //    tIndicator.show();
            //}
            function getReport() {
                var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
                var getAllReportParam = {
                    'SPName': "usp_GetReportMaps",
                    'SQLParams': [
                    ]
                };
                var executeParam = {
                    'SPName': "usp_GetReportDetialByUserName",
                    'SQLParams': [
                        { 'Name': 'userName', 'Value': userName, 'DBType': 'string' }
                    ]
                };
                //common.ExecuteGetData(true, serviceUrl, 'QuickFrame', getAllReportParam, function (items) {
                    //common.ExecuteGetData(true, serviceUrl, 'QuickFrame', executeParam, function (data) {
                        var items = "[{\"ReportId\":1,\"ReportName\":\"产品月度检测表\",\"ReportUrl\":\"TrustDetialDetectionReport.html\",\"ReportGroupId\":1,\"ReportGroupName\":\"专项计划报表\"}," +
                                    "{\"ReportId\":2,\"ReportName\":\"产品结构表\",\"ReportUrl\":\"TrustBondDetialReport.html\",\"ReportGroupId\":1,\"ReportGroupName\":\"专项计划报表\"}," +
                                    "{\"ReportId\":3,\"ReportName\":\"延付本息表\",\"ReportUrl\":\"TrustDelayPaymentDetail.html\",\"ReportGroupId\":2,\"ReportGroupName\":\"风险管理报表\"}," +
                                    "{\"ReportId\":4,\"ReportName\":\"认购人信息表\",\"ReportUrl\":\"TrustSubscriberDetailReport.html\",\"ReportGroupId\":1,\"ReportGroupName\":\"专项计划报表\"}," +
                                    "{\"ReportId\":5,\"ReportName\":\"信用风险管理报告\",\"ReportUrl\":\"TrustDurationRiskReport.html\",\"ReportGroupId\":2,\"ReportGroupName\":\"风险管理报表\"}," +
                                    "{\"ReportId\":6,\"ReportName\":\"产品年度报告\",\"ReportUrl\":\"TrustAnnualReport.html\",\"ReportGroupId\":3,\"ReportGroupName\":\"产品年度报告\"}" +
                                    "]";
                        items = eval('(' + items + ')');
                        var data = "[{\"ReportId\":1,\"Type\":\"Group\"}," +
                                "{\"ReportId\":2,\"Type\":\"Group\"}," +
                                "{\"ReportId\":3,\"Type\":\"Group\"}," +
                                "{\"ReportId\":1,\"Type\":\"Node\"}," +
                                "{\"ReportId\":2,\"Type\":\"Node\"}," +
                                "{\"ReportId\":3,\"Type\":\"Node\"}," +
                                "{\"ReportId\":4,\"Type\":\"Node\"}," +
                                "{\"ReportId\":5,\"Type\":\"Node\"}," +
                                "{\"ReportId\":6,\"Type\":\"Node\"}," +
                                "]"
                        data = eval('(' + data + ')');
                        var groupId = [];
                        var nodeId = [];
                        $.each(data, function (index, dom) {
                            if (dom.Type == 'Group')
                                groupId.push(dom);
                            if (dom.Type == 'Node')
                                nodeId.push(dom);
                        })
                        $.each(items, function (i, d) {
                            var groupObj = JSLINQ(myModel.ReportGroups).First(function (g) { return g.ReportGroupId == d.ReportGroupId });
                            if (groupObj == null) {
                                var report = { "ReportId": d.ReportId, "ReportName": d.ReportName, "ReportUrl": d.ReportUrl, "ReportGroupId": d.ReportGroupId };
                                //if (d.ReportGroupId == 1)
                                $.each(groupId, function (index, dom) {
                                    if (dom.ReportId == d.ReportGroupId)
                                        myModel.ReportGroups.push({ "ReportGroupId": d.ReportGroupId, "ReportGroupName": d.ReportGroupName, "Reports": [] });
                                })
                            }
                        });
                        $.each(items, function (i, d) {
                            var groupObj = JSLINQ(myModel.ReportGroups).First(function (g) { return g.ReportGroupId == d.ReportGroupId });
                            //查找itemObj 是否存在ItemChild
                            if (!!groupObj) {
                                var isExistReport = JSLINQ(groupObj.Reports).Any(function (c) { return c.ReportId == d.ReportId && c.ReportGroupId == d.ReportGroupId });
                                if (!isExistReport && groupObj.ReportGroupId == d.ReportGroupId) {
                                    var report = { "ReportId": d.ReportId, "ReportName": d.ReportName, "ReportUrl": d.ReportUrl, "ReportGroupId": d.ReportGroupId };
                                    //if (d.ReportId == 1)
                                    $.each(nodeId, function (index, dom) {
                                        if (dom.ReportId == d.ReportId)
                                            groupObj.Reports.push(report);
                                    })
                                }
                            }
                        });
                        var reportMapDiv = document.getElementById("reportMapDiv");
                        viewModel = ko.mapping.fromJS(myModel);
                        ko.applyBindings(viewModel, reportMapDiv);
                        registerEvent();
                    //});
                //});
            }

            function registerEvent() {
                $('.report-list>dt').click(function () {
                    var $this = $(this);
                    $this.next().slideToggle(150);
                    //$this.parent().siblings().find('dd').slideUp(150);
                });
                //$('#dataReady').click(function () {
                //    showRunDialog();
                //})
                $('#dataReady').click(function () {
                    GSDialog.open('选择产品', gv.TrustManagementServiceHostURL + 'report/DataReady.html', '', function (res) {
                        location.reload()
                    }, 900, 500);
                })
                $(".ReportContentRoom").bind("click", function () {
                    var self = this;
                    var pass = true;
                    parent.viewModel.tabs().forEach(function (v, i) {
                        if (v.id == 'Report_' + $(self).attr("showid")) {
                            pass = false;
                            parent.viewModel.changeShowId(v);
                            return false;
                        }
                    })
                    if (pass) {
                        var newTab = {
                            id: 'Report_' + $(self).attr("showid"),
                            url: '../report/' + $(self).attr("url"),
                            name: $(self).find("span").text(),
                            disabledClose: false
                        };
                        parent.viewModel.tabs.push(newTab);
                        parent.viewModel.changeShowId(newTab);
                    };
                })
                $(".report-list").css("display", "block");
                $("#loading").css("display", "none");
            }
            function getDateList() {
                var serviceUrl = gv.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = {
                    'SPName': "usp_GetTrustReportDate",
                    'SQLParams': [
                        { 'Name': 'UserName', 'Value': userName, 'DBType': 'string' }
                    ]
                };
                common.ExecuteGetData(true, serviceUrl, 'RiskManagement', executeParam, function (data) {
                    $("#dateSelect").empty();
                    $.each(data, function (index, dom) {
                        $("#dateSelect").append("<option value='" + common.getStringDate(dom.importDate).dateFormat("yyyy-MM-dd") + "'>" + common.getStringDate(dom.importDate).dateFormat("yyyy-MM-dd") + "</option>");
                    })
                    //getTrustBondDetial($("#dateSelect option:selected").val());
                });
            }
            function downLoadExecl() {
                var ImportDate = $("#dateSelect option:selected").val() ? $("#dateSelect option:selected").val() : '1900-01-01';
                sVariableBuilder.AddVariableItem('ImportDate', ImportDate, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('UserName', userName, 'String', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 500,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: 'GenerateReportForRiskManagement',
                    sContext: sVariable,
                    callback: function (response) {
                        var tempsessionId = sessionStorage.getItem("sessionId");
                        sessionStorage.removeItem("sessionId")
                        webProxy.getSessionProcessStatusList(tempsessionId, "Task", function (response) {
                            for (let i = 0; i < response.GetSessionProcessStatusListResult.List.length; i++) {
                                if (response.GetSessionProcessStatusListResult.List[i].ActionStatus != "Success") {
                                    return;
                                }
                            }
                            var reg = /([.]\w+)$/;
                            var filepath = webProxy.baseUrl + "/TrustManagementService/TrustFiles/Reports/投后管理/月度监测报表_" + ImportDate + "_" + userName + '.xlsx';
                            var a = document.createElement('a'); // 创建a标签
                            a.setAttribute('download', '');// download属性  
                            a.setAttribute('href', filepath);// href链接
                            a.click();
                        })
                    }
                });
                tIndicator.show();
            }
            $(function () {
                getReport();
                getDateList()
                $("#exportData").bind("click", function () {
                    downLoadExecl();
                })
            })
        });
})
