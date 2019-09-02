define(function (require) {
    var $ = require('jquery');
    //var anydialog = require('anyDialog');
    var kendoGridModel = require('app/productManage/TrustManagement/TrustFollowUp/statistics/kendoGridModel');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var self = this;
    var trustId = common.getQueryString('tid');
    var Type = getQueryStringZN('Type');
    var myDate = new Date();
    var year = myDate.getFullYear();
    var mouth = myDate.getMonth() + 1;
    var day = myDate.getDate();
    mouth = mouth < 10 ? "0" + mouth : mouth;
    day = day < 10 ? "0" + day : day;
    var endday = year + "-" + mouth + "-" + day;
    function getQueryStringZN(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        //var r = decodeURI(window.location.search.substr(1)).match(reg);
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURIComponent(r[2]);
        return null;
    }
    var endDate = common.getQueryString('endDate');
    var mode = common.getQueryString('mode');
    var startDate = common.getQueryString('startDate');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var h = $("body").height();
    var Grid = new kendoGridModel(h);
    var OptionsOne = {
        renderOptions: {
            scrollable: true,
            resizable: true
            , columns: [
                          { field: "AccountNo",locked:true, title: '合同编号', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "PayDate_Paid", title: '回款日期', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "Principal_Due", title: '计划回款本金', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "Principal_Paid", title: '实际收(本金)', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "Interest_Due", title: '计划回款利息', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "InterestPaid", title: '实际收(利息)', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "Status", title: '状态', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
            ]
        }
        , dataSourceOptions: {
            pageSize: 100
            , otherOptions: {
                orderby: "AccountNo"
                , direction: ""
                , DBName: 'TrustManagement'
                , appDomain: 'TrustManagement'
                , executeParamType: 'extend'
                , executeParam: function () {
                    var result = {
                        SPName: 'Asset.usp_GetAssetByStatusNew', SQLParams: [
                            { Name: 'TrustId', Value: trustId, DBType: 'int' },
                            { Name: 'Type', Value: Type, DBType: 'string' },
                            { Name: 'endDate', Value: endDate, DBType: 'date' },
                            { Name: 'startDate', Value: startDate, DBType: 'string' },
                        ]
                    };

                    return result;
                }
            }
        }
    };
    var OptionsTwo = {
        renderOptions: {
            scrollable: true,
            resizable: true
            , columns: [
                          { field: "AccountNo", locked: true, title: '合同编号', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "PayDate_Paid", title: '报告日期', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "Principal_Due", title: '计划回款本金', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "Principal_Paid", title: '实际收(本金)', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "Interest_Due", title: '计划回款利息', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "InterestPaid", title: '实际收(利息)', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "Status", title: '状态', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
            ]
        }
    , dataSourceOptions: {
        pageSize: 100
        , otherOptions: {
            orderby: "AccountNo"
            , direction: ""
            , DBName: 'TrustManagement'
            , appDomain: 'TrustManagement'
            , executeParamType: 'extend'
            , executeParam: function () {
                var result = {
                    SPName: 'Asset.usp_GetAssetByStatusNew', SQLParams: [
                        { Name: 'TrustId', Value: trustId, DBType: 'int' },
                        { Name: 'Type', Value: Type, DBType: 'string' },
                        { Name: 'endDate', Value: endday, DBType: 'date' },
                        { Name: 'startDate', Value: '1990-01-01', DBType: 'string' },
                    ]
                };

                return result;
            }
        }
    }
    };
    if (mode == "1") {
        Grid.Init(OptionsOne, 'grid');
        Grid.RunderGrid()
    } else {
        Grid.Init(OptionsTwo, 'grid');
        Grid.RunderGrid()
    }


})