define(function (require) {
    var $ = require('jquery');
    var kendoGridModel = require('app/productManage/TrustManagement/TrustFollowUp/js/kendoGridModelS');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var request = getRequest();

    if (request.SessionId != undefined) {

        var trustCodes = sessionStorage.getItem("trustCodes" + request.SessionId);
        var ImportUser = sessionStorage.getItem("gs_UserName");
        var ImportTimes = sessionStorage.getItem("MaxImportTimes" + request.SessionId);
        var sessionnamecode = sessionStorage.getItem("sessionnamecode" + request.SessionId);
        var filter = " and objCode=" + "'" + trustCodes + "'" + " and ScenanoCodeinfo=" + request.ScenarioCode + " and ImportUser=" +"'"+ ImportUser+"'" + " and ImportTimes=" + "'"+ ImportTimes+"'" + " and sessionnamecode=" + "'" + sessionnamecode + "'";

    } else if (request.sessionnamecode != undefined) {

        var arglist = request.sessionnamecode.split('$')
        var filter = " and objCode=" + "'" + arglist[0] + "'" + " and ScenanoCodeinfo=" + "'" + request.ScenarioCode + "'" + " and ImportUser=" + "'" + request.ImportUser + "'" + " and ImportTimes=" + "'" + request.ImportTimes + "'" + " and sessionnamecode=" + "'" + request.sessionnamecode + "'";

    }

    if (request.IsAutoTest == "1") {



        //var filter = " and ImportUser=" + "'" + "AutoTest" + "'" + " and convert(date,CreateDate)=" + "'" + output + "'";

        var filter = " and ImportUser=" + "'" + "AutoTaskList" + "'";
    }

    var h = $("body").height() - 65;
    var Grid = new kendoGridModel(h);
    var self = this;
    

    var Options = {
        renderOptions: {
            scrollable: true,
            resizable: true
            , columns: [
                           { field: "Result", title: '结果', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, template: '#=Result?self.goDie(Result):""#' }
                         , { field: "Reason", title: '原因', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                         , { field: "ItemVerifyResult", title: '详细', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }

                        , { field: "objCode", title: '专项计划Code', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "ItemCode", title: 'ItemCode', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "DimReportDateId", title: '期数日期', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "DataSourceCode", title: '数据项描述', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }

                        , { field: "Value_sys1", title: '系统值1', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "Value_shouldbe1", title: 'shouldbe1', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }

                        , { field: "Value_sys2", title: '系统值2', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "Value_shouldbe2", title: 'shouldbe2', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }


                        , { field: "Value_sys3", title: '系统值3', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "Value_shouldbe3", title: 'shouldbe3', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }


                        , { field: "Value_sys4", title: '系统值4', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "Value_shouldbe4", title: 'shouldbe4', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "ScenanoCode", title: '验证情景', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "CreateDate", title: '产生日期', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        
            ]
        }
      , dataSourceOptions: {
          pageSize: 20
          , otherOptions: {
              orderby: "DimReportDateId desc"
              , direction: ""
              , defaultfilter: filter
              , DBName: 'TrustManagement'
              , appDomain: 'TrustManagement'
              , executeParamType: 'extend'
              , executeParam: function () {
                  var result = {
                      SPName: 'usp_viewComparasionResult', SQLParams: [
                          { Name: 'tableOrView', value: 'dbo.view_ComparasionResult', DBType: 'string' },
                      ]
                  };

                  return result;
              }
          }
      }
    };
    this.goDie = function (Result) {
        if (Result == "0") {
            return "<span style='color:RGBA(255, 0, 0, 1)'>不通过</span>"
        } else if (Result == "1") {
            return "<span style='color:RGBA(65, 175, 65, 1)'>通过</span>"
        }
    }
   

    Grid.Init(Options, 'grid');
    Grid.RunderGrid();
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
    //
    
    var SessionId = request.SessionId;
    var ActionDisplayName = request.ActionDisplayName;
    if (SessionId && ActionDisplayName) {
        var executeParams = {
            SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                { Name: 'SessionId', value: SessionId, DBType: 'string' },
                { Name: 'ProcessActionName', value: ActionDisplayName, DBType: 'string' }

            ]
        };
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
            console.log(res);
        });

    }

    $("#loading").hide();
})