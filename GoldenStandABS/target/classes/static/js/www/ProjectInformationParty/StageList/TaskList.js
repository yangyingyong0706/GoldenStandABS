/// <reference path="../Common/Scripts/jquery-1.7.2.min.js" />
/// <reference path="../Common/Scripts/common.js" />


define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var webProxy = require('webProxyTask');
    var GlobalVariable = require('globalVariable');
    require('anyDialog');
    var actionstatus;
    var GSDialog=require('gsAdminPages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var status = [];
    var taskinfo = common.getUrlParam("Taskinfo");
    var TrustId = common.getUrlParam("TrustId");
    var TrustId = common.getUrlParam("tid");
    var ProjectId = common.getQueryString("ProjectId");
    var ReportingDate = common.getQueryString("ReportingDate");
    var DimReportingDateID = common.getQueryString("DimReportingDateID");
    var PeriodType = common.getQueryString("PeriodType");

    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
        });
    };

    //获取参数对象
    function getRequest() {
        var url = location.search; //获取url中"?"符后的字串   
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    };

    //获取action执行状态
    function GetActionstatus(trustcode, tasktype,call) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            SPName: 'usp_CheckTaskListVerifyStatus', SQLParams: [
                { Name: 'TrustCode', value: trustcode, DBType: 'string' },
                { Name: 'TaskType', value: tasktype, DBType: 'string' }
            ]
        };
        common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (actionstatus) {
            call(actionstatus);
        });
    }

    //获取action对象信息
    function GetActionobj(SessionId, ScenarioCode, TaskType,call) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'LoadVerifyTaskXML?';
        $.ajax({
            cache: false,
            type: "GET",
            url: svcUrl + 'SessionId=' + SessionId,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                call(response, SessionId, ScenarioCode, TaskType);

            },
            error: function (response) {alert('Error occursed when fetch the remote source data!'); }
        });
    }

    function mapstatus(statuscode) {
        if (statuscode != 110) {
            return "<span style='color:#13b712'>已完成<span>";
        } else {
            return "未完成";
        }
    }

    function mapdate(date) {
        if (date != null) {
            var str;
            var Ryear = date.substring(0, 4);
            var RMonth = date.substring(5, 7);
            var RDay = date.substring(8, 10);
            var len = date.length;
            var timer = date.substring(11,len);
            str = Ryear + "-" + RMonth + "-" + RDay;
            return str + " " + timer
        } else {
            return "";
        }
    }

    function saveData(businessCode, businessIdentifier, pageId, array, callback) {
        var itemsTmpl = '<is>{0}</is>';
        var itemTmpl = '<i><id>{0}</id><v>{1}</v><g1>{2}</g1><g2>{3}</g2><si>{4}</si></i>';

        var items = '';
        $.each(array, function (i, v) {
            var grouId01 = (typeof v.GroupId01 == 'undefined') ? '' : v.GroupId01;//存在GroupId01==0 情况
            items += itemTmpl.format(v.ItemId, v.ItemValue || '', grouId01, v.GroupId02 || '', v.SectionIndex || 0);
        });
        items = itemsTmpl.format(items);
        items = encodeURIComponent(items);

        var json = "{'DBName':'QuickWizard','Schema':'QuickWizard','SPName':'usp_SavePageItems',"
        + "'Params':{'BusinessCode':'" + businessCode + "','BusinessIdentifier':'" + businessIdentifier + "',"
        + "'PageId':'" + pageId + "','PageItemXML':'" + items + "','OutSessionId':''}}";

        json = "<SessionContext>{0}</SessionContext>".format(json);

        var serviceUrl = GlobalVariable.QuickWizardServiceUrl + 'DataCUD';
        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: json,
            success: function (data) {
                callback(data);
            },
            error: function (data) {
                alert("error is :" + data);
            }
        });
    }


    function UpdateItemState(action, SessionId, ScenarioCode, TaskType) {
        var action = JSON.parse(decodeURIComponent(action));
        var ActionDisplayNamepar = action.Action['@ActionDisplayName'];
        //处理项目管理任务单状态

        if (ActionDisplayNamepar && SessionId) {
            var executeParams = {
                SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                    { Name: 'SessionId', value: SessionId, DBType: 'string' },
                    { Name: 'ProcessActionName', value: ActionDisplayNamepar, DBType: 'string' }

                ]
            };
            var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                location.reload();
            });

        } else {
            location.reload();
        }


    }


    function TaskAction(action, SessionId, ScenarioCode, TaskType) {
        var taskaction = JSON.parse(decodeURIComponent(action));
        var sVariable;
        var taskcodeinfo;

        $.each(taskaction.Action["Parameter"], function (c, v) {
       
            if (v["@Name"] == "TaskCode") {
                taskcodeinfo = v["@Value"]
            } else {
                sVariableBuilder.AddVariableItem(v["@Name"], v["@Value"], 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("SessionStatusId", SessionId, 'String', 0, 0, 0);
                if (v["@Name"] == "ActionDisplayName") {
                    sVariableBuilder.AddVariableItem("ProcessActionName", v["@Value"], 'String', 0, 0, 0);
                }
            }          
        })
        
        var ReportTypeId = 5;
        
        var StartPeriod = sessionStorage.getItem("StartPeriod" + SessionId);
        var trustChoice = sessionStorage.getItem("trustIds" + SessionId) ? sessionStorage.getItem("trustIds" + SessionId) : common.getQueryString("TrustId");
        var dimreportdate = sessionStorage.getItem("ComparisonPeriod" + SessionId) ? sessionStorage.getItem("ComparisonPeriod" + SessionId) : ReportingDate;
        var dimreportdateid = dimreportdate.replace(/-/g, '');
        var MonitorSessionName = trustChoice + '_' + dimreportdateid + '_WFTPM006';
        var ControlSessionName = trustChoice + '_' + dimreportdateid + '_WFTPM006';
        var trustCodeChoice = sessionStorage.getItem("trustCodes" + SessionId);
        var calincomedate = sessionStorage.getItem("endDate" + SessionId);
        var gs_UserName = sessionStorage.getItem("gs_UserName");
        var MaxImportTimes = sessionStorage.getItem("MaxImportTimes" + SessionId);
        var sessionnamecode = sessionStorage.getItem("sessionnamecode" + SessionId);

        if (taskcodeinfo == 'TrustReportModelFileGeneration') {
            $("#loading").hide();
            sVariableBuilder.AddVariableItem("TrustId", trustChoice, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem("MonitorSessionName", MonitorSessionName, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem("ControlSessionName", ControlSessionName, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem("ReportTypeId", ReportTypeId, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem("DimReportingDate", dimreportdate, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem("DimReportingDateId", dimreportdateid, 'String', 0, 0, 0);

            sVariable = sVariableBuilder.BuildVariables();
            var sContext = {
                appDomain: 'Task',
                sessionVariables: sVariable,
                taskCode: taskcodeinfo
            };

            webProxy.createSessionByTaskCode(sContext, function (taskSession) {
                webProxy.runTask('Task', taskSession, function (res) {
                    if (res) {

                        var ActionDisplayNamepar = taskaction.Action['@ActionDisplayName'];
                        //处理项目管理任务单状态

                        if (ActionDisplayNamepar && SessionId) {
                            var executeParams = {
                                SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                                    { Name: 'SessionId', value: SessionId, DBType: 'string' },
                                    { Name: 'ProcessActionName', value: ActionDisplayNamepar, DBType: 'string' }

                                ]
                            };
                            var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                                //location.reload();
                            });

                        }

                        var downLoadLink = "/TrustManagementService/TrustFiles/" + trustChoice + "/TaskReportFiles//CMS_资产服务报告" + '_' + trustChoice + '_' + dimreportdateid + '.docx';
                        location.href = downLoadLink;


                    } else {
                        GSdialog.HintWindow('运行失败，请检测配置!');
                    }

                });
            })

        } else {
            

            saveData("trust", trustChoice, 23, [], function (r) {
                sVariableBuilder.AddVariableItem("StartPeriodId", dimreportdate, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("ScenarioCode", ScenarioCode, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("TaskListTypeCode", TaskType, 'String', 0, 0, 0);

                sVariableBuilder.AddVariableItem("TrustId", trustChoice, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("MonitorSessionName", MonitorSessionName, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("ControlSessionName", ControlSessionName, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("ReportTypeId", ReportTypeId, 'String', 0, 0, 0);

                sVariableBuilder.AddVariableItem("TrustIdInfo", trustChoice, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("TrustIdInfo1", trustChoice, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("TrustIdInfo2", trustChoice, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("TrustIdInfo3", trustChoice, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("DimReportingDate", dimreportdate, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("DimReportingDateId", dimreportdateid, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("TaskCode", trustCodeChoice, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("ReportingDate", calincomedate, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("TrustCode", trustCodeChoice, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("StartPeriod", dimreportdate, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("ImportUser", gs_UserName, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("ImportTimes", MaxImportTimes, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("sessionnamecode", sessionnamecode, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem("ReportDate", dimreportdate, 'String', 0, 0, 0);

                sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 900,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: taskcodeinfo,
                    sContext: sVariable,
                    callback: function () {
                        window.location.reload();

                    }
                });
                tIndicator.show();
            })
        }
        
    }

    function DialogAction(action, SessionId, ScenarioCode, TaskType) {
        var dialogaction = JSON.parse(decodeURIComponent(action))
        var pageUrl = "";
        var arg = [];
        var istop = false;
        $.each(dialogaction.Action["Parameter"], function (c, v) {
            if (v["@Name"] == "URL") {
                pageUrl = v["@Value"] + "?";
                if (v["@Istop"] == "True") {
                    istop = true;
                }
            } else {
                arg.push(v);
            }

        });

        for (var a = 0; a < arg.length; a++) {
            var Argvalue;
            var ArgName = arg[a]["@Name"];
            var ArgSessionName = arg[a]["@SessionParameterName"];
            arg[a]["@Value"] ? Argvalue = arg[a]["@Value"] : Argvalue = common.getQueryString(ArgSessionName);//JSON.parse(sessionStorage.getItem("ReportValue"))[ArgSessionName];
            if (a == 0) {
                
                pageUrl += ArgName + "=" + Argvalue;
            } else {
                pageUrl += "&" + ArgName + "=" + Argvalue;
            }
        }

        if (istop) {
            GSDialog.topOpen('任务详情', pageUrl + "&ProjectId=" + ProjectId + "&SessionId=" + SessionId + "&ScenarioCode=" + ScenarioCode, "", "", "", "", "bigwindow", false, false, false, false);
        } else {
            common.showDialogPage(pageUrl + "&SessionId=" + SessionId + "&ScenarioCode=" + ScenarioCode, '任务数据准备', 1000, 540, function () {
                var currentsession = sessionStorage.getItem("currentsession") ? sessionStorage.getItem("currentsession") : taskinfo;
                var pageUrl = 'TaskList.html?appDomain=Task&Taskinfo={0}&ScenarioCode={1}&TaskType={2}&TrustId={3}&tid={4}&ProjectId={5}&ReportingDate={6}&DimReportingDateID={7}&PeriodType={8}';
                pageUrl = pageUrl.format(currentsession, ScenarioCode, TaskType, TrustId, TrustId, ProjectId, ReportingDate, DimReportingDateID, PeriodType);
                location.href = pageUrl;
            },'',true,'',true,true,false);
        }        
    }

    RunAction = function (action, SessionId, ScenarioCode, TaskType) {
        var jsonaction = JSON.parse(decodeURIComponent(action))
        switch (jsonaction.Action["@FunctionName"]) {
            case "RunDialog":
                DialogAction(action, SessionId, ScenarioCode, TaskType);
                break;
            case "RunTask":
                TaskAction(action, SessionId, ScenarioCode, TaskType);
                break;
            default:
                UpdateItemState(action, SessionId, ScenarioCode, TaskType);
                break;
        }
    }

    function AssembleActionItem(action, index, SessionId, ScenarioCode, TaskType) {
        //第一步运行运行
        var html = '';
        if (index == 0) {
            var actiontemplate = "<tr><td class='center'>{0}</td><td class='center'>{1}</td><td><div class='taskdesc'>{2}</div></td><td class='center'>{3}</td><td class='center'>{4}</td><td class='center'>{5}</td></tr>";
            var operatorTemplate = '<a href="javascript:RunAction(\'{0}\',\'{1}\',\'{2}\',\'{3}\')" style="color:#45569c">执行</a>';
            html += actiontemplate.format(index + 1, action.ProcessActionName, '', mapstatus(action.ProcessActionStatusCodeId), mapdate(action.EndTime), operatorTemplate.format(encodeURIComponent(action.XMLProcessAction), SessionId, ScenarioCode, TaskType));
        } else {
            var prevstatus = status[0].ProcessActionStatusCodeId;//第一步的状态值
            if (prevstatus != 110) {
                var actiontemplate = "<tr><td class='center'>{0}</td><td class='center'>{1}</td><td><div class='taskdesc'>{2}</div></td><td class='center'>{3}</td><td class='center'>{4}</td><td class='center'>{5}</td></tr>";
                var operatorTemplate = '<a href="javascript:RunAction(\'{0}\',\'{1}\',\'{2}\',\'{3}\')" style="color:#45569c">执行</a>';
                html += actiontemplate.format(index + 1, action.ProcessActionName, '', mapstatus(action.ProcessActionStatusCodeId), mapdate(action.EndTime), operatorTemplate.format(encodeURIComponent(action.XMLProcessAction), SessionId, ScenarioCode, TaskType));
            } else {
                var actiontemplate = "<tr><td class='center'>{0}</td><td class='center'>{1}</td><td><div class='taskdesc'>{2}</div></td><td class='center'>{3}</td><td class='center'>{4}</td><td class='center'>{5}</td></tr>";
                var operatorTemplate = '<a">不可执行</a>';
                html += actiontemplate.format(index + 1, action.ProcessActionName, '', mapstatus(action.ProcessActionStatusCodeId), mapdate(action.EndTime), operatorTemplate.format(encodeURIComponent(action.XMLProcessAction), SessionId, ScenarioCode));
            }
        }

        $('#divProcessStatusList').append(html);
        $("#divLoading").fadeOut();
    }

    $(function () {
        $("#loading").hide();
        var request = getRequest();
        GetActionobj(request.Taskinfo, request.ScenarioCode, request.TaskType, function (data, SessionId, ScenarioCode, TaskType) {
            var actions = JSON.parse(data);
            for (var i = 0; i < actions.Table.length; i++) {
                status.push(actions.Table[i]);
                AssembleActionItem(actions.Table[i], i, SessionId, ScenarioCode, TaskType)//装配action
            }
        })

        $("#goback").click(function () {
            $("#turngothis", parent.document).hide();
            $("#turngothis", parent.document).prop("src", "");
            $("#turngothis", parent.document).prev().show();
        })
    });

})

