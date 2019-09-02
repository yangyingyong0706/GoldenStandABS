var openSessionTask, deleteSessionTask;

define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var GlobalVariable = require('globalVariable');
    var common = require('app/productManage/TrustManagement/Common/Scripts/common');
    require('anyDialog');
    require('date_input');
    require("app/ProjectInformationParty/js/project_interface");
    var GSDialog = require("gsAdminPages")
    var webProxy = require('webProxy');//require('app/productManage/TrustManagement/wcfProxy');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var r_trustId = null;
    var r_taskCode = null;
    var ScenarioCode = null;
    //
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
        });
    };

    var TaskProcessWProxy = (function () {
        function createSessionShowTask(appDomain, sessionVariables, taskCode) {
            var wProxy = webProxy;
            var sContext = {
                appDomain: appDomain,
                sessionVariables: sessionVariables,
                taskCode: taskCode
            };
            var isOver = 0;
            wProxy.createSessionByTaskCode(sContext, function (response) {
                window.parent.parent.isSessionCreated = true;
                window.parent.parent.sessionID = response;
                window.parent.parent.taskCode = taskCode;
                window.parent.parent.IndicatorAppDomain = appDomain;

                //debugger;
                if (window.parent.parent.IsSilverlightInitialized) {
                    window.parent.parent.PopupTaskProcessIndicatorTM();
                    window.parent.parent.InitParams();
                }
                else {
                    window.parent.parent.PopupTaskProcessIndicatorTM();
                }
                isOver = 1;
            });

            var tmpInterval = setInterval(function () {
                if (isOver == 1) {
                    $(window.parent.document).find("#modal-mask").remove();
                    $(window.parent.document).find("#modal-layout").remove();
                    window.clearInterval(tmpInterval);
                }
            }, 10);
        }

        return { CreateSessionShowTask: createSessionShowTask }
    })();

    function PopupTaskProcessIndicatorTM() {
        $("#taskIndicatorArea").dialog({
            modal: true,
            dialogClass: "TaskProcessDialogClass",
            closeText: "",
            //closeOnEscape:false,
            height: 485,
            width: 470,
            close: function (event, ui) {
                window.location.reload();
            }, // refresh report repository while close the task process screen.
            //open: function (event, ui) { $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide(); },
            title: "任务处理"
        });
    }
    function RenderOption(data) {

        var optiontemp = "<option value='{0}'>{1}</option>"
        var selectobj = $('#dtNextPeriodDate')

        //
        $.each(data, function (i, n) {
            var html = ''
            if (n.periodtype == 0) {
                html = optiontemp.format(n.enddate, n.enddate);
                selectobj.append(html);
            }
            if (n.periodtype == 1) {
                html = optiontemp.format(n.startdate, n.startdate);
                selectobj.append(html);
            }



        })




    }

    function loadCyclDate(tempref,callback) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
        var objArgs = {
            SPName: 'usp_GetCyclDateInfo',
            SQLParams: [
                { Name: 'TrustId', Value: r_trustId, DBType: 'int' }
            ]
        };
        var executeParams = encodeURIComponent(JSON.stringify(objArgs));
        $.ajax({
            cache: false,
            type: "GET",
            url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                callback(tempref,response)

            },
            error: function (response) { GSDialog.HintWindow('Error occursed when fetch the remote source data!'); }
        });

    }







    function loadTrustPeriodTaskList(ScenarioCode,callback) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
        var sessionNamePrefix = '{0}|_{1}|_'.format(r_trustId, r_taskCode);
        var objArgs = {
            SPName: 'ReadCyclesManageTaskList',
            SQLParams: [
                { Name: 'TrustId', Value: r_trustId, DBType: 'int' },
                { Name: 'ScenarioCode', Value: ScenarioCode, DBType: 'string' }

            ]
        };
        var executeParams = encodeURIComponent(JSON.stringify(objArgs));
        $.ajax({
            cache: false,
            type: "GET",
            url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                callback(response);

            },
            error: function (response) { GSDialog.HintWindow('Error occursed when fetch the remote source data!'); }
        });
    }

    function mapperiodtype(typeid) {
        var typename;
        switch (typeid) {
            case 0:
                typename = "兑付期间";
                break;
            case 1:
                typename = "归集期间";
                break;
        }
        return typename;
    }

    function renderListItem(source) {
        var gridRowTemplate = "<tr><td class='center'>{0}</td><td class='center'>{1}</td><td class='center'>{2}</td><td class='center'>{3}</td></tr>";
        var operatorTemplate = '<a href="javascript:openSessionTask(\'{0}\',\'{1}\',\'{2}\')"><i title="详细" class="icon icon-cog-alt" style="cursor: pointer; margin-right: 20px;"></i></a>&nbsp;&nbsp;<a href="javascript:deleteSessionTask(\'{3}\')"><i title="删除" class="icon icon-trash-empty" style="color:#D00000"></i></a>';
        var html = '';
        $.each(source, function (i, v) {
            html += gridRowTemplate.format(mapperiodtype(v.Type), v.CycDate, v.CreateDate, operatorTemplate.format(v.CycDate, v.Type, v.sessionID, v.Id));
        });

        $('#dataList').empty().append(html);
        createPage();
        $("#divLoading").fadeOut();
    }
    openSessionTask = function openSessionTask(rDate,periodtype,sessionid) {
        var dimRDateId = rDate.replace(new RegExp('-', 'gm'), '');
        //var ScenarioCode = getQueryString("ScenarioCode");
        var ProjectId = getQueryString("ProjectId");
        var pageUrl = 'TaskList.html?appDomain=Task&Taskinfo={0}&ScenarioCode={1}&TaskType={2}&TrustId={3}&tid={4}&ProjectId={5}&ReportingDate={6}&DimReportingDateID={7}&PeriodType={8}';
        pageUrl = pageUrl.format(sessionid, ScenarioCode, r_taskCode, r_trustId, r_trustId, ProjectId, rDate, dimRDateId, periodtype);
        //showDialogPage(pageUrl, '任务列表', 1100, 580);
        //GSDialog.open('任务列表', pageUrl, 99, function () {
        //    //location.reload(true);
        //}, 1100, 580);
        $("#turngothis").prop("src", pageUrl);
        $(".main").hide();
        $("#turngothis").show();
    }
    deleteSessionTask = function deleteSessionTask(sId) {
        GSDialog.HintWindowTF("确定删除？", function () {
            var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
            var objArgs = {
                SPName: 'usp_DeleteCyclesTaskForProject',//'usp_DeleteSession',
                SQLParams: [{ Name: 'CycleId', Value: sId, DBType: 'string' }]
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
                    GSDialog.HintWindow('删除成功!', function () {
                        window.location.reload();
                    });

                },
                error: function (response) { GSDialog.HintWindow('删除失败!', function () { window.location.reload(); }); }
            });
        })
    }
    function createNewSession() {
        var $dtObj = $('#dtNextPeriodDate');
        var rDate = $dtObj.val();
        if (!rDate) {
            $dtObj.addClass('redborder');
            return;
        }
        var PeriodTypeSum = $('#dtNextPeriodType').val();
        $("#divLoading").show();

        var rDatelist = rDate.split('_');

        var dimRDateId = rDatelist[0].replace(new RegExp('-', 'gm'), '');
        var sContext = {
            appDomain: "Task",
            sessionVariables: "<SessionVariables>"
                + "<SessionVariable><Name>TrustId</Name><Value>" + r_trustId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>TaskCode</Name><Value>" + r_taskCode + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>ReportingDate</Name><Value>" + rDatelist[0] + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>DimReportingDateID</Name><Value>" + dimRDateId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "</SessionVariables>",
            taskCode: r_taskCode
        };
        
        var wProxy = webProxy;
        wProxy.createSessionByTaskCode(sContext, function (response) {
            //CreateCyclManage(r_trustId, rDatelist[1], rDatelist[0]);
            prepareTrustAssociatedDatesSessionContext(response, rDatelist[0], PeriodTypeSum);
        });
    }
    function prepareTrustAssociatedDatesSessionContext(targetSessionId, reportingDate, PeriodTypeSum) {

        var sContext = {
            appDomain: "Task",
            sessionVariables: "<SessionVariables>"
                + "<SessionVariable><Name>TrustId</Name><Value>" + r_trustId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>TargetSessionId</Name><Value>" + targetSessionId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>ReportingDate</Name><Value>" + reportingDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>PeriodTypeSum</Name><Value>" + PeriodTypeSum + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                + "<SessionVariable><Name>ScenarioCode</Name><Value>" + ScenarioCode + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
               + "</SessionVariables>",
            taskCode: 'TaskListForProject'
        };
        var wProxy = webProxy;
        wProxy.createSessionByTaskCode(sContext, function (response) {
            
            isSessionCreated = true;
            sessionID = response;
            taskCode = 'TaskListForProject';
            IndicatorAppDomain = 'Task';
            popupTaskProcessIndicator(sContext, function () {
                
                window.location.reload();
            });
        });
    }

    function CreateCyclManage(trustid, CyclNum, CyclDate, callback) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
        var objArgs = {
            SPName: 'usp_ChCyclesManage',
            SQLParams: [
                { Name: 'CyclNum', Value: CyclNum, DBType: 'int' },
                { Name: 'CyclDate', Value: CyclDate, DBType: 'string' },
                { Name: 'TrustId', Value: trustid, DBType: 'int' }
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
                //var sourceData;
                //if (typeof response === 'string') { sourceData = JSON.parse(response); }
                //else { sourceData = response; }
            
            },
            error: function (response) { GSDialog.HintWindow('Error occursed when fetch the remote source data!'); }
        });

    }
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
    function popupTaskProcessIndicator(sContext,fnCallBack) {

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
        $("#divLoading").fadeOut();
        tIndicator.show();






        //$("#taskIndicatorArea").dialog({
        //    modal: true,
        //    dialogClass: "TaskProcessDialogClass",
        //    closeText: "",
        //    //closeOnEscape:false,
        //    height: 485,
        //    width: 470,
        //    close: function (event, ui) {
        //        if (typeof fnCallBack === 'function') { fnCallBack(); }
        //    },
        //    title: "任务处理"
        //});
    };

    function createPage() {
        //每页显示的数目
        var show_per_page = 15;
        //获取content对象里面，数据的数量
        var number_of_items = $('#dataList').children().size();
        //计算页面显示的数量
        var number_of_pages = Math.ceil(number_of_items / show_per_page);

        //隐藏域默认值
        $('#current_page').val(0);
        $('#show_per_page').val(show_per_page);

        var navigation_html = '<a class="previous_link">上一页</a>';
        var current_link = 0;
        while (number_of_pages > current_link) {
            navigation_html += '<a class="page_link"  longdesc="' + current_link + '">' + (current_link + 1) + '</a>';
            current_link++;
        }
        navigation_html += '<a class="next_link" onclick="">下一页</a>';

        $('#page_navigation').html(navigation_html);
        //add active_page class to the first page link
        $('#page_navigation .page_link:first').addClass('active_page');

        //隐藏该对象下面的所有子元素
        $('#dataList').children().hide();
        //显示第n（show_per_page）元素
        $('#dataList').children().slice(0, show_per_page).show();
        $('.next_link').click(function () {
            next();
        })
        $('.previous_link').click(function () {
            previous();
        })
        $('.page_link').click(function () {
            go_to_page($(this).attr('longdesc'));
        })
    }

    //上一页
    function previous() {
        console.log('a')
        new_page = parseInt($('#current_page').val()) - 1;
        if ($('.active_page').prev('.page_link').length == true) {
            go_to_page(new_page);
        }
    }
    //下一页
    function next() {
        new_page = parseInt($('#current_page').val()) + 1;
        if ($('.active_page').next('.page_link').length == true) {
            go_to_page(new_page);
        }
    }
    //跳转某一页
    function go_to_page(page_num) {
        var show_per_page = parseInt($('#show_per_page').val());
        start_from = page_num * show_per_page;
        end_on = start_from + show_per_page;
        $('#dataList').children().hide().slice(start_from, end_on).show();
        $('.page_link[longdesc=' + page_num + ']').addClass('active_page').siblings('.active_page').removeClass('active_page');
        $('#current_page').val(page_num);
    }
    //    function LoadPeriodDate(Type, callback) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
        var objArgs = {
            SPName: 'usp_GetCyclPeriodDateInfo',
            SQLParams: [
                { Name: 'TrustId', Value: r_trustId, DBType: 'int' },
                { Name: 'PeriodType', Value: Type, DBType: 'int' }
            ]
        };
        var executeParams = encodeURIComponent(JSON.stringify(objArgs));
        $.ajax({
            cache: false,
            type: "GET",
            url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                callback(response)

            },
            error: function (response) { GSDialog.HintWindow('Error occursed when fetch the remote source data!'); }
        });


    }
    $(function () {
        r_trustId = getQueryString('trustId');
        r_taskCode = getQueryString('taskCode');
        ScenarioCode = getQueryString("ScenarioCode");

        if (!r_trustId || isNaN(r_trustId) || r_trustId == 0 || !r_taskCode) {
            return;
        }

        loadTrustPeriodTaskList(ScenarioCode,function (res) {
            var sourceData;
            if (typeof res === 'string') { sourceData = JSON.parse(res); }
            else {
                sourceData = res;
            }
            var PeriodType = $('#dtNextPeriodType').val();
            //////////////
            LoadPeriodDate(PeriodType, function (resc) {
                var sourceData;
                if (typeof resc === 'string') { sourceData = JSON.parse(resc); }
                else { sourceData = resc; }

                RenderOption(sourceData);

            });

            renderListItem(sourceData);


        });
        
        //$('.date-plugins').date_input();
        $('#btnGenerateNext').click(function () {
            $('#tfootNewSession').show();
        });
        $("#dtNextPeriodType").change(function () {
            $('#dtNextPeriodDate').find("option").remove();
            PeriodType = $('#dtNextPeriodType').val();
            LoadPeriodDate(PeriodType, function (resc) {
                var sourceData;
                if (typeof resc === 'string') { sourceData = JSON.parse(resc); }
                else { sourceData = resc; }
                RenderOption(sourceData);
            })

        });



        $('#generd').click(function () {

            createNewSession();
            
        })

        $("#cancel").click(function () {
            $('#tfootNewSession').hide();
        })

    });

})