define(function (require) {
    var $ = require('jquery');
    var kendoGridModel = require('app/productManage/TrustManagement/TrustFollowUp/js/kendoGridModelS');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var request = getRequest();

    if (request.IsAutoTest == "1") {



        //var filter = " and ImportUser=" + "'" + "AutoTest" + "'" + " and convert(date,CreateDate)=" + "'" + output + "'";

        //var filter = " and ImportUser=" + "'" + "AutoTest" + "'" + " and objCode=" + "'" + request.objCode + "'";
        //filter += " and CONVERT(varchar(10), CreateDate, 23)=" + "'" + request.date + "'";

        var filter = " and trustcode=" + "'" + request.objCode + "'" + " and CONVERT(varchar(100), date, 23)=CONVERT(varchar(100), GETDATE(), 23)";
    }

    var h = $("body").height() - 65;
    var Grid = new kendoGridModel(h);
    var self = this;

    var Options = {
        renderOptions: {
            scrollable: true,
            resizable: true
            , columns: [
                           { field: "date", title: '日期', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, template: '#=date?self.ReturnDate(date).dateFormat("yyyy-MM-dd"):""#' }
                         , { field: "trustcode", title: '产品名称', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                         , { field: "description", title: '描述', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                         , { field: "errorinfo", title: '错误信息', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }                  

            ]
        }
      , dataSourceOptions: {
          pageSize: 20
          , otherOptions: {
              orderby: "date desc"
              , direction: ""
              , defaultfilter: filter
              , DBName: 'TrustManagement'
              , appDomain: 'TrustManagement'
              , executeParamType: 'extend'
              , executeParam: function () {
                  var result = {
                      SPName: 'usp_viewComparasionResult', SQLParams: [
                          { Name: 'tableOrView', value: 'dbo.tblAutoTestErrorLog', DBType: 'string' },
                      ]
                  };

                  return result;
              }
          }
      }
    };
    this.ReturnDate = function (strDate) {
        if (!strDate) {
            return '';
        }
        var str = strDate.replace(new RegExp('\/', 'gm'), '');
        return eval('new ' + str);
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