
define(function (require) {
    var $ = require('jquery');
    //var anydialog = require('anyDialog');
    var kendoGridModel = require('app/productManage/TrustManagement/TrustFollowUp/js/kendoGridModel');
    //var roleOperate = require('app/productManage/TrustManagement/Common/Scripts/roleOperate');
    var common = require('common');
    var GlobalVariable = require('globalVariable');

    var self = this;

    var trustId = common.getQueryString('tid');

    var height = $(window).height() - 120;
    var h = $(window).height() - 145;
    console.log(screen.height, $(window).height());
    var filter = "where DimSourceTrustID = " + trustId + " and ParentPoolId=0";
    //资产明细列表
    var kdGridAssetDetail = new kendoGridModel(height);
    var assetDetailOptions = {
        renderOptions: {
            height:h,
            scrollable: true,
            resizable:true
            , columns: [
                        { template: '#=ReportingDate?self.getStringDate(ReportingDate).dateFormat("yyyy-MM-dd"):""#', filterable: false, sortable: false, title: '报告日', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "AccountNo", title: '合同编号', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        //, { field: "CustomerName", title: '债务人名称', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "StartDate", title: '开始日', template: '#=StartDate?self.getStringDate(StartDate).dateFormat("yyyy-MM-dd"):""#', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "EndDate", title: '到期日', template: '#=EndDate?self.getStringDate(EndDate).dateFormat("yyyy-MM-dd"):""#', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "InterestRate", title: '利率（%）', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "CurrentPrincipalBalance", title: '本金余额（元）', template: '#=self.numFormt(CurrentPrincipalBalance)#', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "status", title: '状态', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "IsInTrust", title: '是否入池', template: '#=IsInTrust?"是":"否"#', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "PrincipalPaymentType", title: '还本付息方式', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { title: '操作', template: '#=self.getOperate(TrustId,AccountNo,DimReportingDateId,PayDate)#', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "", title: "", width:"auto" }
            ]
        }
        , dataSourceOptions: {
            pageSize: 20
            , otherOptions: {
                orderby: "AccountNo"
                , direction: ""
                , DBName: 'TrustManagement'
                , appDomain: 'TrustManagement'
                , executeParamType: 'extend'
                , executeParam: function () {
                    var result = {
                        SPName: 'usp_GetAssetDetailsWithPager', SQLParams: [
                            { Name: 'trustId', Value: trustId, DBType: 'int' }
                        ]
                    };
                    if (typeof getPayDate() != "undefined")
                        result.SQLParams.push({ Name: 'payDate', Value: (getPayDate()) ? getPayDate() : null, DBType: 'string' });
                    return result;
                }
            }
        }
    };
    //初始化资产明细的kendougrid
    kdGridAssetDetail.Init(assetDetailOptions, 'gridAssetDetail');
    //kdGridAssetDetail.RunderGrid();

    //相关资产池列表
    var kdGridAssetPoolList = new kendoGridModel(height);
    var assetPoolListOptions = {
        renderOptions: {
            height: h,
            columns: [
                         { field: "PoolId", title: '标识', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { title: '名称', field: 'PoolName', width: "20%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "PoolDescription", title: '工作组描述', width: "25%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "OrganisationCode", title: '所属企业', width: "10%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "CreatedDate", title: '创建日期', template: '#=CreatedDate?getStringDate(CreatedDate).dateFormat("yyyy-MM-dd"):""#', width: "15%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "PoolStatusId", title: '状态', template: '#=PoolStatusId?TransStatus(PoolStatusId):""#', width: "10%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "", title: "", width: "auto" }
            ]
        }
            , dataSourceOptions: {
                pageSize: 20
                , otherOptions: {
                    orderby: "PoolId"
                    , direction: ""
                    , DBName: 'DAL_SEC_PoolConfig'
                    , appDomain: 'config'
                    , executeParamType: 'extend'
                    , defaultfilter: filter
                    , executeParam: function () {
                        var result = {
                            SPName: 'usp_GetListWithPager'
                            , SQLParams: [
                                { Name: 'tableName', Value: 'config.PoolHeader', DBType: 'string' }
                            ]
                        };
                        return result;
                    }
                }
            }
    };
    //初始化相关资产池的kendougrid
    kdGridAssetPoolList.Init(assetPoolListOptions, 'gridAssetPoolList');
    //kdGridAssetPoolList.RunderGrid();


    


    this.numFormt = function (p) {
        if (parseFloat(p) == p) {
            var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                    return $1 + ",";
                });
            })
            return res;
        }
        else
            return p;
    }

    this.TransStatus=function(PoolStatusId) {
        var status;
        switch (PoolStatusId) {
            case 148:
                status = 'OPEN';
                break;
            case 149:
                status = 'INVALID';
                break;
            default:
                status = '';
                break;
        }
        return status;
    }
    this.getOperate=function(tid, accountno, dimreportingdateid, payDate) {
        var temp = escape(accountno);
        var viewPageUrl = './AssetPayMentSchedule/AssetPaymentSchedule.html?trustId=' + tid + '&accountNo=' + temp;
        var html = '<a href="javascript: self.showDialogPage(\'' + viewPageUrl + '\',\'资产现金流\',1000,600,\'\',\'\',false);">现金流</a>';

        //html += '&nbsp;&nbsp;&nbsp;';
        //var editPageUrl = './TrustFollowUp/AssetDetail.html?tid=' + tid + '&ano=' + accountno + '&dimreportingdateid=' + dimreportingdateid + '&payDate=' + payDate;
        //html += '<a href="javascript: showDialogPage(\'' + editPageUrl + '\',\'基础资产编辑\',1000,600);">编辑</a>';

        return html;
    }

    function getPayDate() {
        return $("#selPayDateFilter").length > 0 ? ($("#selPayDateFilter").val() ? $("#selPayDateFilter").val() : '') : undefined;
    }
     this.getStringDate=function(strDate) {
        //var str = '/Date(1408464000000)/';
         
        if (!strDate) {
            return '';
        }

        var str = strDate.replace(new RegExp('\/', 'gm'), '');
        return eval('new ' + str);
     }
     this.showDialogPage = function (url, title, width, height, fnCallBack, data, scrolling) {
         common.showDialogPage(url, title, width, height, fnCallBack,data,scrolling);
     }
     return {
         kgAssetPoolList:kdGridAssetPoolList,
         kgAssetDetail:kdGridAssetDetail
     };

});

