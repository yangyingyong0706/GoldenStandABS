/// <reference path="../Common/Scripts/jquery-1.7.2.min.js" />
/// <reference path="../Common/Scripts/common.js" />
var ViewHistory;

define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var wcfProxy = require('webProxy');
    var GlobalVariable = require('globalVariable');
    require('anyDialog');
    var actionstatus;
    //require('app/productManage/TrustManagement/Common/Scripts/showModalDialog');
    var GSDialog=require('gsAdminPages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var status = [];
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
    //获取action对象信息
    function GetActionobj(TaskCode, call) {

        var executeParams = {
            SPName: 'TrustManagement.usp_GetTaskListHistoryInfo', SQLParams: [
                { Name: 'ViewHistoryCode', value: TaskCode, DBType: 'string' }

            ]
        };
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
            call(res,TaskCode);
        });

        $("#divLoading").fadeOut();

    }






    ViewHistory = function ViewHistory(sessionnamecode, ImportUser, ImportTimes, ViewType) {
        var url = "TaskListVerifyChild/EntrustedKendoGridPage.html?"
        url = url + "ScenarioCode=" + ViewType + "&sessionnamecode=" + sessionnamecode + "&ImportUser=" + ImportUser + "&ImportTimes=" + ImportTimes;
        switch(ViewType)
        {

            case "CaculationImcome":

                GSDialog.topOpen("收益分配对比结果", url, "", "", "", "", "bigwindow", false, false, false, false)

                break;
            case "FiduciaryReport":

                GSDialog.topOpen("受托报告对比结果", url, "", "", "", "", "bigwindow", false, false, false, false)

                break;
            case "AssetReportTwo":

                GSDialog.topOpen("受托报告二对比结果", url, "", "", "", "", "bigwindow", false, false, false, false)

                break;
            case "AssetReportThre":

                GSDialog.topOpen("受托报告三对比结果", url, "", "", "", "", "bigwindow", false, false, false, false)

                break;
            default:
                GSDialog.HintWindow('未匹配到对应查询类型');
        }

    }



    $("#divProcessStatusList").on("click", "tr td a", function () {


        $($(this).parent().parent().next()).toggle(600)


    })


    function AssembleActionItem(index,dataitem,TaskCodeType) {
        //第一步运行运行onclick = "RunAction(\'{0}\',\'{1}\',\'{2}\')"
        var html = '';
        var actiontemplate = "<tr class='Item'><td class='center'>{0}</td><td class='center'>{1}</td><td class='center'>{2}</td><td class='center'>{3}</td><td class='center'>{4}</td><td class='center'>{5}</td></tr>";
        var operatorTemplate = '<a >查看</a>'; 
        html += actiontemplate.format(index + 1, dataitem.sessionnamecode, dataitem.ImportUser, dataitem.ImportTimes, dataitem.CreateTime, operatorTemplate);

        if (TaskCodeType == "TaskListAssetReportCaculationImcome") {
            var temp2 = '<tr style="display:none;"><td colspan="6"><div class="content_row"><span class="content_row_span">收益分配对比结果</span><span class="content_row_span_color" onclick="ViewHistory(\'{0}\',\'{1}\',\'{2}\',\'{3}\')">查看</span></div>'
            var temp3 = '<div class="content_row"><span class="content_row_span">受托报告对比结果</span><span class="content_row_span_color" onclick="ViewHistory(\'{0}\',\'{1}\',\'{2}\',\'{3}\')">查看</span></div></div></td></tr>'

            temp2 = temp2.format(dataitem.sessionnamecode, dataitem.ImportUser, dataitem.ImportTimes, "CaculationImcome");
            temp3 = temp3.format(dataitem.sessionnamecode, dataitem.ImportUser, dataitem.ImportTimes, "FiduciaryReport");

            finalTemplate = temp2 + temp3;

            html += finalTemplate;

        }
        if (TaskCodeType == "TaskListAssetReportTwo") {
            var temp2 = '<tr style="display:none;"><td colspan="6"><div class="content_row"><span class="content_row_span">报告向导二对比结果</span><span class="content_row_span_color" onclick="ViewHistory(\'{0}\',\'{1}\',\'{2}\',\'{3}\')">查看</span></div></td></tr>'

            temp2 = temp2.format(dataitem.sessionnamecode, dataitem.ImportUser, dataitem.ImportTimes, "AssetReportTwo");

            finalTemplate = temp2;

            html += finalTemplate;
        }
        if (TaskCodeType == "TaskListAssetReportThre") {
            var temp2 = '<tr style="display:none;"><td colspan="6"><div class="content_row"><span class="content_row_span">报告向导三对比结果</span><span class="content_row_span_color" onclick="ViewHistory(\'{0}\',\'{1}\',\'{2}\',\'{3}\')">查看</span></div></td></tr>'

            temp2 = temp2.format(dataitem.sessionnamecode, dataitem.ImportUser, dataitem.ImportTimes, "AssetReportThre");

            finalTemplate = temp2;

            html += finalTemplate;
        }






        $('#divProcessStatusList').append(html);
        createPage();
        $("#divLoading").fadeOut();
    }

    ///////
    function createPage() {
        //每页显示的数目
        var show_per_page = 10;
        //获取content对象里面，数据的数量
        var number_of_items = $('#divProcessStatusList').children(".Item").size();
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
        $('#divProcessStatusList').children(".Item").hide();
        //显示第n（show_per_page）元素
        $('#divProcessStatusList').children(".Item").slice(0, show_per_page).show();
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
        $('#divProcessStatusList').children(".Item").hide().slice(start_from, end_on).show();
        $('.page_link[longdesc=' + page_num + ']').addClass('active_page').siblings('.active_page').removeClass('active_page');
        $('#current_page').val(page_num);
    }



    ///////


    $(function () {
        var request = getRequest();
        GetActionobj(request.TaskCodeType, function (data,TaskCodeType) {
            for (var i = 0; i < data.length; i++) {
                AssembleActionItem(i,data[i],TaskCodeType)//装配action
            }

        })




    });



})

