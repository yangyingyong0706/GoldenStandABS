define(function (require) {

    var $ = require('jquery');
    var kendoAll = require('kendo.all.min');
    require('kendoculturecn');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var RoleOperate = require('roleOperate');
    var webStorage = require('gs/webStorage');
    var userName = RoleOperate.cookieName();
    var self = this;
    var schemaName = '';
    var height = $(window).height() - 70;
    function changeA() {
        $(".div-nav").on("click", "a", function () {
            $(this).addClass("current_a").siblings().removeClass("current_a");
        })
    }
    changeA();
    self.TaskResultCodeTrans = function (result, SessionId) {
        switch (result) {
            case "Failed":
                return addUrl("错误信息");
            case "Completed":
                return addUrl("完成");
            case "ToBeContinued":
                return addUrl("未完成");
            default:
                return result;
        }
        function addUrl(desc) {
            var viewPageUrl = 'detail.html?sessionId=' + SessionId + "&schemaName=" + schemaName;
            var html = '<a class="btn btn-link" href="' + viewPageUrl + '">' + desc + '</a>'
            return html;
        }
    }
    self.getStringDate = common.getStringDate;
    $(function () {
        //webStorage.setItem('gs_UserName', 'goldenstand');
        //var                                             //声明变量
        //    userName = webStorage.getItem('gs_UserName');
        isAdmin = false;
        filter = '';
        schemaName = common.getQueryString("schemaName") ? common.getQueryString("schemaName") : 'task';
        kendoGrid = new kendoGridModel(height);
        

        $(".schemaLink").click(function () {
            schemaName = $(this).attr("value");
            $("#grid").html("")
            prepare();
            kendoGrid.RunderGrid();
        })
        $(".ActLogs").click(function () {
            //initLoginLogs();
            //schemaName = $(this).attr("value");
            $("#grid").html("")
            RendGridThree()
        })
        var prepare = function () {
            kendoGrid.Init({
                renderOptions: {
                    columns: [
                          { template: '#=SNO#', title: '编号', width: '7%', headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "UserId", title: '操作用户', width: "15%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "TaskCode", title: '任务代码', width: "24%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "TaskDesc", title: '任务描述', width: "24%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "StartTime", title: '开始时间', template: '#=StartTime?self.getStringDate(StartTime).dateFormat("yyyy-MM-dd  hh:mm:ss"):""#', width: "15%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "SessionStatusDesc", title: '执行结果', template: '#=self.TaskResultCodeTrans(SessionStatusDesc,SessionId)#', width: "15%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                    ]
                }
                , dataSourceOptions: {
                    otherOptions: {
                        orderby: "StartTime"
                    , DBName: 'TaskProcess'
                    , appDomain: schemaName
                    , connConfig: "TaskProcess"
                    , executeParamType: 'extend'
                    , defaultfilter: filter
                    , executeParam: function () {
                        var result = {
                            SPName: 'usp_GetSessionListWithPager', SQLParams: [
                            ]
                        };
                        return result;
                    }
                    }
                }
            })
        }
        function RendGridThree() {
            var cashflowListOne;
            var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?';
            var executeParams = {
                SPName: 'QuickFrame.usp_GetSystemActLogs', SQLParams: [
                    { Name: 'UserName', value: userName, DBType: 'string' }]
            }
            common.ExecuteGetData(false, svcUrl, 'QuickFrame', executeParams, function (datas) {
                cashflowListOne = datas
            })
            var prepareLogs = {
                dataSource: cashflowListOne,
                scrollable: true,
                sortable: true,
                selectable: "multiple",
                filterable: true,
                reorderable: true,//列的排序,选择一列可以拖动改变她的顺序
                resizable: true,//动态改变列的宽度,在scrollable为true的时候有效,scrollable默认为true
                height: height,
                orderBy: 'CreateTime',
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5,
                    page: 1,
                    pageSize: 15,
                    pageSizes: [15, 30, 45, 60, 80, 100],
                },
                columns: [
                             { field: 'UserName', title: '用户名', width: '10%', headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                           , { field: "Act", title: '动作', width: "12%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                           , { field: "Category", title: '操作目录', width: "10%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                           , { field: "Description", title: '任务情况详细描述', width: "38%", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                           , { field: "IPAddress", title: 'IP地址', width: "15%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                           , { field: "CreateTime", title: '操作时间', template: '#=CreateTime?self.getStringDate(CreateTime).dateFormat("yyyy-MM-dd  hh:mm:ss"):""#', width: "15%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                ],
                filterable: true
            }
            $("#grid").kendoGrid(prepareLogs)
        }
            //kendoGrid.Init({
            //    renderOptions: {
                //   columns: [
                //             { field: 'UserName', title: '操作用户', width: '10%', headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                //           , { field: "Act", title: '动作', width: "12%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                //           , { field: "Category", title: '分类信息', width: "10%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                //           , { field: "Description", title: '任务描述', width: "38%", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                //           , { field: "IPAddress", title: 'IP地址', width: "15%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                //           , { field: "CreateTime", title: '操作时间', template: '#=CreateTime?self.getStringDate(CreateTime).dateFormat("yyyy-MM-dd  hh:mm:ss"):""#', width: "15%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                //],
            //    }
            //    , dataSourceOptions: {
            //        otherOptions: {
            //            orderby: "CreateTime"
            //        , DBName: 'QuickFrame'
            //        , appDomain: 'QuickFrame'
            //        , connConfig: "QuickFrame"
            //        , executeParamType: 'extend'
            //        , defaultfilter: filter
            //        , executeParam: function () {
            //            var result = {
            //                SPName: 'usp_GetSystemActLogsByName', SQLParams: [
            //                    { Name: 'username', value: userName, DBType: 'string' }
            //                ]
            //            };
            //            return result;
            //        }
            //        }
            //    }
            //})
       

        RoleOperate.getRolesByUserName(userName, function (data) {  //检查用户是否是管理员
            $.each(data, function (i, item) {
                if (item.IsRoot) {
                    isAdmin = true;
                }
            })
            filter = isAdmin ? null : 'and userid =' + "'" + userName + "'";
            prepare();
            kendoGrid.RunderGrid();
        })
    })
})