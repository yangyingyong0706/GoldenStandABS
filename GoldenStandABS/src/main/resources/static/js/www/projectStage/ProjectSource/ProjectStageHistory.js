

define(function (require) {
    var common = require('common');
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var GSDialog = require('gsAdminPages');
    var webStore = require('gs/webStorage');
    var ProjectId = common.getQueryString('ProjectId');

    function RenderGrid() {

        $("#grid").html("")
        var h = window.innerHeight - 20;
        var Grid = new kendoGridModel(h);
        var self = this;
        var filter = " and projectid =" + ProjectId;

        var Options = {
            renderOptions: {
                scrollable: true,
                resizable: true
                , columns: [
                               { field: "ProjectName", title: '项目名称', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                             , { field: "oldstatus", title: '变更前状态', width: "200px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                            , { field: "newstatus", title: '变更后状态', width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                            , { field: "UserName", title: '操作者', width: "300px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                            , { field: "createdate", title: '操作日期', width: "300px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                ]
            }
          , dataSourceOptions: {
              pageSize: 20
              , otherOptions: {
                  orderby: "createdate asc"
                  , direction: ""
                  , defaultfilter: filter
                  , DBName: 'TrustManagement'
                  , appDomain: 'dbo'
                  , executeParamType: 'extend'
                  , executeParam: function () {
                      var result = {
                          SPName: 'usp_GetProjectStageHistoryKendo', SQLParams: [
                              { Name: 'tableOrView', value: 'dbo.usp_GetProjectStageHistory', DBType: 'string' },
                          ]
                      };

                      return result;
                  }
              }
          }
        };
        Grid.Init(Options, 'grid');
        Grid.RunderGrid();

    }


    $(function () {

        RenderGrid();
    })
})