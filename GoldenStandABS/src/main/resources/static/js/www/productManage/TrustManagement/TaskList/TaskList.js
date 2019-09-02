/// <reference path="../Common/Scripts/jquery-1.7.2.min.js" />
/// <reference path="../Common/Scripts/common.js" />


define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var wcfProxy = require('webProxy');
    var GlobalVariable = require('globalVariable');
    //require('app/productManage/TrustManagement/Common/Scripts/showModalDialog');
    require('gsAdminPages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');

    var TaskListManagementModule = function (request) {
        var wProxy = null;
        CashFlowStudioServiceBase = GlobalVariable.CashFlowStudioServiceUrl;
        var gridRowTemplate = "<tr><td class='center'>{0}</td><td class='center'>{1}</td><td><div class='taskdesc'>{2}</div></td><td class='center'>{3}</td><td class='center'>{4}</td><td class='center'>{5}</td></tr>";
        var gridRowFileUpLoadTemplate = "<tr class='hiddenTR'><td colspan='100' class='right'>{0}</td></tr>";
        var sessionVariableTemplate = "<SessionVariable><Name>{0}</Name><Value>{1}</Value><DataType>{2}</DataType><IsConstant>0</IsConstant><IsKey>{3}</IsKey><KeyIndex>0</KeyIndex></SessionVariable>";

        var PersistenceStatus = [];
        var mainTaskActions = [];
        var mainSessionID = null;
        var actionTaskVariables = [];
        var mainTaskSessionContext = [];
        var dateLinkUrlTemplate = 'https://poolcutsp/_layouts/15/goldenstand.calendar/trustcalendar.aspx?trustId={0}&defaultDate={1}';

        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
            });
        };

        //var getSessionProcessStatusList = function (appDomain, sessionId) {
        //    var serviceUrl = CashFlowStudioServiceBase + "GetSessionProcessStatusList/" + appDomain + "/" + sessionId + "?r=" + Math.random() * 150;
        //    debugger;
        //    $.ajax({
        //        type: "GET",
        //        url: serviceUrl,
        //        dataType: "json",
        //        contentType: "application/json;charset=utf-8",
        //        success: function (response) {
        //            mainTaskActions = response;
        //            renderTaskTitleAndDescription();
        //            renderSessionProcessStatusList();
        //            renderTrustAssociatedDates();
        //            $('.taskdesc').click(function () {
        //                $(this).parent('td').parent('tr').find('.taskdesc').toggleClass('autoHeight');
        //            });
        //        },
        //        error: function (response) { alert("load Session Process Status error."); }
        //    });
        //}
        var renderTaskTitleAndDescription = function () {
            if (mainTaskActions.length < 1) { return; }

            var firstActionXML = mainTaskActions[0].XMLProcessAction;
            var $action = $('<xml>' + firstActionXML + '</xml>');
            var mainTaskTitle = $action.find('Parameter[Name="TaskListTitle"]').attr('value');

            $('#taskTitle').html(mainTaskTitle);
        };
        var renderSessionProcessStatusList = function () {
            var content = "";
            var actionstatus = "Pending";
            var endtime = "";
            $.each(mainTaskActions, function (i, v) {
                var $action = $('<xml>' + v.XMLProcessAction + '</xml>');
                
                

                for (var g = 0; g < PersistenceStatus.length; g++) {
                    if ($action.find('Parameter[Name="TaskCode"]').attr('Value') == PersistenceStatus[g].CyclCode && v.SequenceNo == PersistenceStatus[g].SequenceNo) {

                        actionstatus = "Success";
                        endtime = PersistenceStatus[g].EndTime;
                        break;
                    } else {
                        actionstatus = "Pending";
                        endtime = " ";
                    }
                }
                content += buildSessionStatusListItem(i, v.ActionDisplayName, actionstatus, endtime, $action);
                //var endTime = (v.EndTime) ? common.getStringDate(v.EndTime).dateFormat('yyyy-MM-dd hh:mm:ss') : '&nbsp;&nbsp;';
                
                 //v.ActionStatus
            });

            if (content.length > 0) {
                $("#divProcessStatusList").empty().append(content);
                $('#divProcessStatusList button.btn-execute').click(function () {
                    taskListUIButtonClick($(this));
                });
            }
            $("#divLoading").fadeOut();
        }
        function inputFileClick(id) {
            id.change(function () {
                var value = $(this)[0].value;
                if (value != "") {
                    var tempfileinfo = value.split('\\')[value.split('\\').length - 1];
                    $(this).next()[0].innerHTML = "浏览";
                    $(this).parent().parent().children('.file_name').html(tempfileinfo).css("");
                } else {
                    $(this).next()[0].innerHTML = '选择文件';
                    $(this).parent().parent().children('.file_name').html('');
                }
            })
        }
        var buildSessionStatusListItem = function (i, name, status, endtime, $action) {
            var rtn = '';

            var taskStatus = getTaskStatusName(status);
            var taskDesc = $action.find('Parameter[Name="TaskDescription"]').attr('Value');
            //var exeDateCode = $action.find('Parameter[Name="ExecutionDate"]').attr('Value');

            var oprtationHtml = getAbleInfo(i, status);
            //if (status.toLowerCase() === 'pending') {
            //oprtationHtml += '<button class="btn normal_small_button btn-execute" action-index="' + i + '" type="button">执行</button>';
            //} else {
            //    oprtationHtml += '<button class="btn btn-primary" disabled="disabled" action-index="' + i + '" type="button">执行</button>';
            //}

            //var exeDateSpan = '<div data-datecode="{0}" class="spanExeDate taskdesc"></div>'.format(exeDateCode);
            rtn += gridRowTemplate.format(i + 1, name, taskDesc, taskStatus, endtime, oprtationHtml);
            



            var uiType = $action.find('Parameter[Name="UI"]').attr('value');
            var uiHtml = '';
            switch (uiType) {
                case 'fileUpload':
                    uiHtml += '<span id="warnMsg_' + i + '">请上传文件</span>';
                    uiHtml += '<div class="kllayer">'
                    uiHtml += '<label for="file_' + i + '" class="btn btn-default" style="position: absolute;right: 25px;"><input type="file" id="file_' + i + '" class="file" /><span>选择文件</span></label>'
                    uiHtml += '<span class="file_name" style="margin-top: 5px;color: #45569c;"></span>'
                    uiHtml += '</div>'
                    uiHtml += '<button class="btn btn-default" type="button" id="btnFileUpload_' + i + '" style="margin-right:10px;margin-top: 5px;">上传</button>';
                    uiHtml += '<button class="btn btn-danger" type="button" id="btnCancelFileUpload_' + i + '" style="font-size:12px;margin-right:6px;margin-top: 5px;">取消</button>';
                    rtn += gridRowFileUpLoadTemplate.format(uiHtml);
                    break;
                default:
                    break;
            }
            return rtn;
        };
        var getAbleInfo = function (i,status) {
            var res = '';
            switch (status) {
                case 'Success':
                    res = '<button class="btn btn-primary" disabled="disabled" action-index="' + i + '" type="button">执行</button>';
                    break;
                case 'Pending':
                    res = '<button class="btn btn-primary btn-execute" action-index="' + i + '" type="button">执行</button>';
                    break;
                default:
                    res = '<button class="btn btn-primary btn-execute" action-index="' + i + '" type="button">执行</button>';
                    break;
            }
            return res;
        };


        //
        var getTaskStatusName = function (status) {
            var rtn = '';
            switch (status) {
                case 'Success':
                    rtn = '<span class="successStatus">已完成</span>';
                    break;
                case 'Pending':
                    rtn = '待执行';
                    break;
                default:
                    rtn = status;
                    break;
            }
            return rtn;
        };

        var renderTrustAssociatedDates = function () {
            var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
            var objArgs = {
                SPName: 'usp_GetSessionContext',
                SQLParams: [{ Name: 'SessionId', Value: mainSessionID, DBType: 'string' }]
            };
            var executeParams = encodeURIComponent(JSON.stringify(objArgs));
            $.ajax({
                cache: false,
                type: "GET",
                url: svcUrl + 'connConfig=TaskProcess&appDomain=Task&executeParams=' + executeParams + '&resultType=Common',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    if (typeof response === 'string') { mainTaskSessionContext = JSON.parse(response); }
                    else { mainTaskSessionContext = response; }
                    bindingSessionStatusExecutionDate();
                },
                error: function (response) { alert('Error occursed when fetch the execution data!'); }
            });
        }
        var bindingSessionStatusExecutionDate = function () {
            var variableListTemplate = '<tr><td class="center">{0}</td><td class="center">{1}</td><td>{2}</td></tr>';
            var variableListContent = '';
            $.each(mainTaskSessionContext, function (i, v) {
                var vName = v.VariableName;
                var vValue = v.VariableValue;
                variableListContent += variableListTemplate.format(i + 1, vName, vValue);

                var trustId = request.TrustId ? request.TrustId.split(';')[0] : 0;
                var selector = '.spanExeDate[data-datecode="' + vName + '"]';
                var $span = $(selector);
                if ($span && $span.length > 0) {
                    var linkUrl = dateLinkUrlTemplate.format(trustId, vValue);
                    var display = vValue + '<br/>';
                    display += '<a href="{0}" target="_blank">{1}</a>'.format(linkUrl, vName);
                    $span.html(display);
                }
            });
            if (variableListContent.length > 0) {
                $('#tbodyVariablesList').empty().html(variableListContent);
            }
        };

        var taskListUIButtonClick = function (obj) {
            var $obj = $(obj);
            var i = $obj.attr('action-index');
            actionTaskVariables = [];

            var $actionXML = $('<xml>' + mainTaskActions[i].XMLProcessAction + '</xml>');
            var uiType = $actionXML.find('Parameter[Name="UI"]').attr('Value');
            switch (uiType) {
                case 'fileUpload':
                    $obj.parent('td').parent('tr').next('tr').removeClass('hiddenTR');
                    inputFileClick($('#file_' + i));
                    $('#btnFileUpload_' + i).click(function () {
                        var $file = $('#file_' + i);
                        var $msg = $('#warnMsg_' + i);
                        var filePath = $file.val();
                        if (!filePath) {
                            $msg.addClass('redfont');
                            return;
                        }

                        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                        var args = 'trustId=' + mainSessionID + '&fileFolder=&fileName=' + encodeURIComponent(fileName);

                        $("#divLoading").show();
                        $msg.html('正在上传...').removeClass('redfont');
                        uploadSourceFile($file, args, $msg, function (filePath) {
                            var sourceFilePath = filePath.substring(0, filePath.lastIndexOf('\\') + 1);
                            var sourceFileName = filePath.substring(filePath.lastIndexOf('\\') + 1);

                            actionTaskVariables.push({ VariableName: 'SourceFilePath', VariableValue: sourceFilePath });
                            actionTaskVariables.push({ VariableName: 'SourceFileName', VariableValue: sourceFileName });
                            startInvokeActionTask($actionXML);
                        });
                    });
                    $('#btnCancelFileUpload_' + i).click(function () {
                        $(this).parent('td').parent('tr').addClass('hiddenTR');
                    });
                    break;
                case 'quickWizard':
                    $obj.parent('td').parent('tr').next('tr').removeClass('hiddenTR');
                    $('#btnFileUpload_' + i).click(function () {
                        var $file = $('#file_' + i);
                        var $msg = $('#warnMsg_' + i);

                        var filePath = $file.val();
                        if (!filePath) {
                            $msg.addClass('redfont');
                            return;
                        }

                        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                        var args = 'trustId=' + mainSessionID + '&fileFolder=&fileName=' + encodeURIComponent(fileName);

                        $("#divLoading").show();
                        $msg.html('正在上传...').removeClass('redfont');
                        uploadSourceFile($file, args, $msg, function (filePath) {
                            var sourceFilePath = filePath.substring(0, filePath.lastIndexOf('\\') + 1);
                            var sourceFileName = filePath.substring(filePath.lastIndexOf('\\') + 1);

                            actionTaskVariables.push({ VariableName: 'SourceFilePath', VariableValue: sourceFilePath });
                            actionTaskVariables.push({ VariableName: 'SourceFileName', VariableValue: sourceFileName });
                            startInvokeActionTask($actionXML);
                        });
                    });
                    $('#btnCancelFileUpload_' + i).click(function () {
                        $(this).parent('td').parent('tr').addClass('hiddenTR');
                    });
                    break;


                default:
                    startInvokeActionTask($actionXML);
                    break;
            }
        };
        var uploadSourceFile = function ($file, args, $msg, fnCallback) {
            var fileData = $file.get(0).files[0];
            $.ajax({
                url: GlobalVariable.DataProcessServiceUrl + 'CommonFileUpload' + '?' + args,
                type: 'POST',
                data: fileData,
                cache: false,
                dataType: 'json',
                processData: false, // Don't process the files
                //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
                success: function (data) {
                    $msg.html('文件上传成功。');
                    fnCallback(data.CommonTrustFileUploadResult);
                },
                error: function (data) {
                    $msg.html('文件上传出现错误。');
                    $("#divLoading").fadeOut();
                }
            });
        };
        var startInvokeActionTask = function ($actionXML) {
            var targetTaskCode = $actionXML.find('Parameter[Name="TaskCode"]').attr('Value');//taskCode;
            var sContext = {
                appDomain: 'Task',
                sessionVariables: buildActionTaskSessionVariables($actionXML),
                taskCode: targetTaskCode
            };
            wProxy.createSessionByTaskCode(sContext, function (actionTaskSessionID) {
                isSessionCreated = true;
                sessionID = actionTaskSessionID;
                taskCode = targetTaskCode;
                IndicatorAppDomain = request.appDomain;
                popupTaskProcessIndicator(sContext, function () {
                    //window.location.reload();
                    //存储完成时间
                    $("#divLoading").fadeOut();
                    wProxy.getSessionProcessStatusList(mainSessionID, request.appDomain, function (res) {
                        var confirmstatus = res.GetSessionProcessStatusListResult.List;
                        $.each(confirmstatus, function (i, n) {
                            var $signXML = $('<xml>' + n.XMLProcessAction + '</xml>');
                            var signcode = $signXML.find('Parameter[Name="TaskCode"]').attr('Value')
                            if (signcode == sContext.taskCode && n.ActionStatus == "Success") {
                                PersistenceTaskStatus(common.getStringDate(n.EndTime).dateFormat('yyyy-MM-dd hh:mm:ss'), sContext.taskCode, request.ReportingDate.split(';')[0], request.TrustId.split(';')[0], n.SequenceNo)
                            }

                        })

                    })

                });
            });
        };
        var PersistenceTaskStatus = function (enddate, cyclcode, cycldate, trustid, SequenceNo) {
            var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
            var objArgs = {
                SPName: 'usp_CyclesLog',
                SQLParams: [
                    { Name: 'EndTime', Value: enddate, DBType: 'string' },
                    { Name: 'CyclCode', Value: cyclcode, DBType: 'string' },
                    { Name: 'CyclDate', Value: cycldate, DBType: 'string' },
                    { Name: 'TrustId', Value: trustid, DBType: 'int' },
                    { Name: 'SequenceNo', Value: SequenceNo, DBType: 'int' }
                ]
            };
            var executeParams = encodeURIComponent(JSON.stringify(objArgs));
            $.ajax({
                cache: false,
                type: "GET",
                url: svcUrl + 'connConfig=TaskProcess&appDomain=Task&executeParams=' + executeParams + '&resultType=Common',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    var sourceData;
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    window.location.reload();

                },
                error: function (response) { alert('Error occursed when fetch the remote source data!'); }
            });


        }
        var GetTaskStatus = function (trustid, cycldate, callback) {
            var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
            var objArgs = {
                SPName: 'usp_GetCyclStatus',
                SQLParams: [
                    { Name: 'CyclDate', Value: cycldate, DBType: 'string' },
                    { Name: 'TrustId', Value: trustid, DBType: 'string' }
                ]
            };
            var executeParams = encodeURIComponent(JSON.stringify(objArgs));
            $.ajax({
                cache: false,
                type: "GET",
                url: svcUrl + 'connConfig=TaskProcess&appDomain=Task&executeParams=' + executeParams + '&resultType=Common',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    var sourceData;
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    callback(sourceData);

                },
                error: function (response) { alert('Error occursed when fetch the remote source data!'); }
            });

        }

        var buildActionTaskSessionVariables = function ($actionXML) {
            var variables = '';
            //$actionXML.find('Parameter[Usage="TargetTask"]').each(function (key, value) {
            //    var $this = $(this);
            //    var name = $this.attr('Name');
            //    var value = $this.attr('Value');
            //    var dataType = $this.attr('DataType');
            //    var isKey = 0;

            //    variables += sessionVariableTemplate.format(name, value, dataType, isKey);
            //});
            var actionSequenceNo = $actionXML.find('Action').attr('SequenceNo');
            sVariableBuilder.AddVariableItem('FromSessionID', mainSessionID, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ActionSequenceNo', actionSequenceNo, 'String', 0, 0, 0);
            //variables += sessionVariableTemplate.format('FromSessionID', mainSessionID, 'String', 0, 0, 0);
            //variables += sessionVariableTemplate.format('ActionSequenceNo', actionSequenceNo, 'String', 0, 0, 0);
            $.each(actionTaskVariables, function (i, v) {
                sVariableBuilder.AddVariableItem(v.VariableName, v.VariableValue, 'String', 0, 0, 0);
                //variables += sessionVariableTemplate.format(v.VariableName, v.VariableValue, 'String', 0, 0, 0);
            });
            return sVariableBuilder.BuildVariables();//"<SessionVariables>{0}</SessionVariables>".format(variables);
        }

        ///////// Public Methods
        this.CreateSession = function () {
            var strRequestVars = '';
            for (var key in request) {
                if (key !== 'appDomain') {
                    var value = request[key];
                    var isKey = 0;
                    if (value && value.indexOf(';') > 0) {
                        var argValueSplit = value.split(';');
                        value = argValueSplit[0];
                        isKey = argValueSplit[1];
                    }

                    strRequestVars += sessionVariableTemplate.format(key, value, 'String', isKey);
                }
            }
            var requestVars = '<SessionVariables>{0}</SessionVariables>'.format(strRequestVars);
            var taskCode = request.TaskCode.split(';')[0];
            wProxy = wcfProxy;
            var sContext = { appDomain: request.appDomain, sessionVariables: requestVars, taskCode: taskCode };
            wProxy.createSessionByTaskCode(sContext, function (response) {
                mainSessionID = response;
                
                wProxy.getSessionProcessStatusList(response, request.appDomain, function (res) {
                    mainTaskActions = res.GetSessionProcessStatusListResult.List;
                    GetTaskStatus(request.TrustId.split(';')[0], request.ReportingDate.split(';')[0], function (sou) {
                        PersistenceStatus = sou;
                        renderTaskTitleAndDescription();
                        renderSessionProcessStatusList();
                        renderTrustAssociatedDates();
                        $('.taskdesc').click(function () {
                            $(this).parent('td').parent('tr').find('.taskdesc').toggleClass('autoHeight');
                        });

                    });

                })


                //getSessionProcessStatusList(request.appDomain, response);
            });
        }
    };

    $(function () {
        var request = common.getRequest();
        if (!request.appDomain || !request.TaskCode) {
            $("#divLoading").fadeOut();
            return;
        }
        var tListModel = new TaskListManagementModule(request);
        tListModel.CreateSession();

        $('#btnViewVariables').anyDialog({
            width: 450,
            height: 500,
            title: '任务变量列表',
            html: $('#divVariablesList'),	// 弹出框内容 支持HTML或对象 $(dom)
            status: null
        });
    });

    ////////////////////////////Global Variables and Functions for Silverlight
    var sessionID, taskCode;
    var clientName = 'TaskProcess';
    var IndicatorAppDomain;
    var IsSilverlightInitialized = false;
    function InitParams() {
        if (!IsSilverlightInitialized) {
            IsSilverlightInitialized = true;
        }
        document.getElementById("TaskProcessCtl").Content.SL_Agent.InitParams(sessionID, IndicatorAppDomain, taskCode, clientName);
    }
    function popupTaskProcessIndicator(sContext, fnCallBack) {
        //
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: sContext.appDomain,
            taskCode: sContext.taskCode,
            sContext: sContext.sessionVariables,
            callback: function () {
                if (typeof fnCallBack === 'function') { fnCallBack(); }
            }
        });
        tIndicator.show();

    };

})

