var openSessionTask, deleteSessionTask, downLoadTemplate, viewHistory;

define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var GlobalVariable = require('globalVariable');
    require('app/productManage/TrustManagement/Common/Scripts/common');
    require('anyDialog');
    require('date_input');
    var GSDialog = require("gsAdminPages")
    var webProxy = require('webProxy');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');

    /*任务单列表
    1.TaskCode记录在[TaskProcess].[Task].[CodeDictionary]表里
    2.ScenarioCode记录在[TrustManagement].[dbo].[tblAutoTestScenario]表里
    */
    var TaskList = [
        {
            "TaskListName": "收益分配-受托报告",
            "TasklListType": "AssetReportCaculationImcome",
            "TaskCode": "TaskListAssetReportCaculationImcome", 
            "ScenarioCode": "FiduciaryReport",
            "HistoryPageUrl": "TaskListVerifyChild/TaskListHistory.html?TaskCodeType="
        },
        {
            "TaskListName": "现金流拆分校验",
            "TasklListType": "CashFlowSplit",
            "TaskCode": "TaskListCashFlowSplit",
            "ScenarioCode": "CashFlowSplitVerify",
            "HistoryPageUrl": "CashFlowSplit/TaskListHistory.html?TaskCodeType="
        },
        {
            "TaskListName": "报告向导二",
            "TasklListType": "AssetReportTwo",
            "TaskCode": "TaskListAssetReportTwo",
            "ScenarioCode": "AssetReportTwo",
            "HistoryPageUrl": "TaskListVerifyChild/TaskListHistory.html?TaskCodeType="
        },
        {
            "TaskListName": "报告向导三",
            "TasklListType": "AssetReportThre",
            "TaskCode": "TaskListAssetReportThre",
            "ScenarioCode": "AssetReportThre",
            "HistoryPageUrl": "TaskListVerifyChild/TaskListHistory.html?TaskCodeType="
        }
    ]
     
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
        });
    };


    function GetTaskListDetail(appDomain, sessionVariables, taskCode, call) {
        var wProxy = webProxy;
        var sContext = {
            appDomain: appDomain,
            sessionVariables: sessionVariables,
            taskCode: taskCode
        };
        var isOver = 0;
        wProxy.createSessionByTaskCode(sContext, function (response) {
            call(response)
        });

    }


    function downLoadFile(filePath, innerText, desName) {
        var oReq = new XMLHttpRequest();
        var url = GlobalVariable.DataProcessServiceUrl + "getStream?" + 'filePath=' + filePath;
        oReq.open("POST", url, true);
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var content = oReq.response;

            var elink = document.createElement('a');
            elink.innerHTML = innerText;
            elink.download = desName;

            var blob = new Blob([content]);
            elink.onload = function (e) {
                window.URL.revokeObjectURL(e.href); // 清除释放

            };
            elink.href = URL.createObjectURL(blob);
            document.body.appendChild(elink);
            elink.click();

            document.body.removeChild(elink);
        };
        oReq.send();
    }

    //历史记录查看
    viewHistory = function (HistoryPageUrl, TaskCode) {
        var pageUrl = HistoryPageUrl.concat(TaskCode);
        showDialogPage(pageUrl, '历史记录', 1000, 500);
    }

    function renderListItem(TaskList) {
        var gridRowTemplate = "<tr><td class='center'>{0}</td><td class='center'>{1}</td></tr>";
        var operatorTemplate = '<a class="btn btn-link" href="javascript:openSessionTask(\'{0}\',\'{1}\',\'{2}\')">开始校验</a><a class="btn btn-link" id="downLoad" href="javascript:downLoadTemplate(\'{3}\')">下载模板</a><a class="btn btn-link" id="history" href="javascript:viewHistory(\'{4}\',\'{5}\')">历史记录</a>';
        var html = '';
        $.each(TaskList, function (i, v) {
            html += gridRowTemplate.format(v.TaskListName, operatorTemplate.format(v.TaskCode, v.ScenarioCode, v.TaskCode, v.TaskCode, v.HistoryPageUrl, v.TaskCode));
        });

        $('#dataList').empty().append(html);
        createPage();
        $("#divLoading").fadeOut();
    }

    openSessionTask = function (TaskCode, ScenarioCode, TaskType) {
        sVariableBuilder.AddVariableItem('TaskCode', TaskCode, 'String', 0, 0, 0);
        var sVariable = sVariableBuilder.BuildVariables();
        GetTaskListDetail('Task', sVariable, TaskCode, function (sessionid) {
            var pageUrl = 'TaskList.html?appDomain=Task&Taskinfo={0}&ScenarioCode={1}&TaskType={2}';
            pageUrl = pageUrl.format(sessionid, ScenarioCode, TaskType);
            TaskListshowDialogPage(pageUrl, '任务列表', 1000, 500);
        })

    }

    downLoadTemplate = function (TaskCode) {
        if (TaskCode == "TaskListAssetReportCaculationImcome") {
            downLoadFile("/PoolCut/Files/TaskListFiles/TaskListAssetReport/import_shouldbe_CaculationImcome.xlsx", "下载", "import_shouldbe_CaculationImcome.xlsx");
            downLoadFile("/PoolCut/Files/TaskListFiles/TaskListAssetReport/import_shouldbe_FiduciaryReport.xlsx", "下载", "import_shouldbe_FiduciaryReport.xlsx");
            downLoadFile("/PoolCut/Files/TaskListFiles/TaskListAssetReport/TrustInfoImportAndExportModel_498.xml", "下载", "TrustInfoImportAndExportModel_498.xml");
            downLoadFile("/PoolCut/Files/TaskListFiles/TaskListAssetReport/贷款服务报告导入模板(非持续购买).xlsx", "下载", "贷款服务报告导入模板(非持续购买).xlsx");
        }
        else if (TaskCode == "TaskListCashFlowSplit") {
            downLoadFile("/PoolCut/Files/TaskListFiles/CashFlowSplit/AssetData _等额本息20161030.xlsx", "现金流拆分资产数据", "AssetData.xlsx");
            downLoadFile("/PoolCut/Files/TaskListFiles/CashFlowSplit/ShouldBe_等额本息20161030.xlsx", "现金流拆分ShouldBe数据", "ShouldBeData.xlsx");
        } else if (TaskCode == "TaskListAssetReportTwo") {
            downLoadFile("/PoolCut/Files/TaskListFiles/TaskListAssetReportTwo/POC应收报告向导二shouldbe数据.xlsx", "受托报告向导二模板", "AssetData.xlsx");
        } else if (TaskCode == "TaskListAssetReportThre") {
            downLoadFile("/PoolCut/Files/TaskListFiles/TaskListAssetReportThre/POC应收报告向导三shouldbe数据.xlsx", "受托报告向导三模板", "AssetData.xlsx");
        }

    }

    var sessionID, taskCode;
    var clientName = 'TaskProcess';
    var IndicatorAppDomain;

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
    $(function () {

        //渲染任务单列表
        renderListItem(TaskList);

        $('#btnGenerateNext').click(function () {
            $('#tfootNewSession').show();
        });

        $('#generd').click(function () {
            createNewSession();
        })

    });

})