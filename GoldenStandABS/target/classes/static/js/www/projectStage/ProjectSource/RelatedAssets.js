define(function (require) {
    var $ = require('jquery');

    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var GlobalVariable = require('gs/globalVariable');
    var cookie = require('jquery.cookie');
    require("kendomessagescn");
    require("kendoculturezhCN");
    require("app/projectStage/js/project_interface");
    var height = $(window).height();
    var userName = $.cookie('gs_UserName');
    var filter = '';
    var isAdmin = false;
    var timer;
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    var tm = require('gs/childTabModel');
    var webStorage = require('gs/webStorage');
    var common = require('common');
    var ProjectId = common.getQueryString('ProjectId');
    var IsCyclicTask = common.getQueryString('CyclicTask');
    var lang = {};
    var userLanguage = webStorage.getItem('userLanguage')
    var IsAdministrator = webStorage.getItem("IsAdministrator");//判断用户是否为管理员
    var SQLParams = [];
    if (ProjectId) {
        //获取筛选条件TrustManagement.usp_getFilterFromProject
        //@projectId bigint
        //ProjectId
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getFilterFromProject",
                SQLParams: [
                               { 'Name': 'projectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data) {
                SQLParams = [
                    { Name: 'tableName', Value: 'config.view_Pools', DBType: 'string' },
                    { Name: 'fiter', Value: data[0].PoolCutFilter, DBType: 'string' },
                    { Name: 'showAll', Value: 1, DBType: 'int' }
                ]
            }
        });
    }
    var kendouiGrid;
    $('.main').css('height', '100%')
    kendouiGrid = new kendoGridModel("100%");
    this.GetPoolCount = function (PoolCount) {
        return PoolCount ? PoolCount : 0;
    }
    this.Collection = function (Collection) {
        var html;
       // html = '<span class="btn btn-link" style ="height:15px;color:#777;padding: 0px;"><i class="icon icon-cinema" style="color:#777;" onclick="Introduction(\'' + Collection + '\',\'' + Introduction + '\')">查看</i></span>';
        if (Collection >= 0) {
            html = Collection;
        }
        else {
            html = '<span >未拆分</span>'
        }
        return html;
    }
    
    this.addAssetPoolItem = function(PoolId,BasePoolId, PoolName) {
        var pass = true;
        webStorage.setItem('showId', 'assetFilter');
        parent.parent.viewModel.tabs().forEach(function (v, i) {
            if (BasePoolId == v.id) {
                pass = false;
                parent.parent.viewModel.changeShowId(v);
                return false;
            }
        })
        if (pass) {
            var url = "../../www/assetFilter/basePoolContentKendo/basePoolContent.html?PoolId=" + BasePoolId + "&PoolName=" + PoolName;
            var newTab = {
                name: "资产池_" + PoolId,
                id: BasePoolId,
                url: url,
                disabledClose: false
            };
            parent.parent.viewModel.tabs.push(newTab)
            parent.parent.viewModel.changeShowId(newTab);
        }

        $('.chrome-tabs-shell', parent.parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
        $('.chrome-tabs-shell', parent.parent.document).find('.active').addClass('chrome-tab-current');
    }
    this.TranToPoolPage = function(PoolId,PoolDBName, PoolName) {
        var BasePoolId = PoolDBName.split('_')[3];
        var html = '<a style="cursor: pointer" onclick="addAssetPoolItem({0},{1},\'{2}\');">{2}</a>'.format(PoolId,BasePoolId, PoolName);
        return html;
    }
    function InitKendoGrid(data) {  //检查用户是否是管理员
        filter = IsAdministrator == '1' ? "where ParentPoolId=0 and userName!=''" : "where ParentPoolId=0 and (userName = '" + userName + "' or AuditorUserName = '" + userName + "'" + " or IsCheck = 0)";
        kendo.culture("zh-CN");
        kendouiGrid.Init({
            renderOptions: {
                columns: [
                            { field: "PoolId", title: lang.biaoshi, locked: true, width: 70, attributes: { style: 'text-align:left' }, headerAttributes: { 'class': 'table_layer_style', style: 'text-align:left' } }
                            , { field: "PoolName", title: lang.name, template: '#=PoolId?this.TranToPoolPage(PoolId,PoolDBName,PoolName):""#', width: 200, attributes: { style: 'text-align:left' } }
                            //, { field: "PoolDescription", title: lang.name, width: 220, attributes: { style: 'text-align:left' } }
                            , { field: "PoolType", title: '资产池关系', width: 150, attributes: { style: 'text-align:left' } }
                            , { field: "OrganisationDesc", title: lang.src, width: 100, attributes: { style: 'text-align:left' } }
                            , { field: "CreatedDate", title: lang.createDate, width: 120, attributes: { style: 'text-align:left' } }
                            , { field: "PoolStatus", template: '#=PoolStatus?(PoolStatus=="OPEN"?PoolStatus:(PoolStatus+"<i style=\'padding-left:3px\' class=\'fa fa-lock\'><i>")):""#', title: lang.status, width: 100, attributes: { style: 'text-align:left' } }
                            , { field: "TrustCode", title: lang.plan, width: 120, attributes: { style: 'text-align:left' } }
                            , { template: "#=this.Collection(PrincipalCollection)#", title: "本金归集", width: "100px" }
                            , { template: "#=this.Collection(InterestCollection)#", title: "利息归集", width: "150px" }
                            
                            , { field: "", title: "", width: "auto" }
                ]
            }
            , dataSourceOptions: {
                otherOptions: {
                    orderby: "PoolId"
                     , direction: ""
                     , DBName: 'DAL_SEC_PoolConfig'
                     , appDomain: 'config'
                     , executeParamType: 'extend'
                     , defaultfilter: filter
                     , executeParam: function () {
                         var result = {
                             SPName: 'usp_GetListWithPager'
                             , SQLParams: SQLParams
                         };
                         return result;
                     }
                }
                , pageable: {
                    pageSizes: true,
                    buttonCount: 5,
                    messages: {
                        display: "显示{0}-{1}条，共{2}条",
                        empty: "没有数据",
                        page: "页",
                        of: "/ {0}",
                        itemsPerPage: "条/页",
                        first: "第一页",
                        previous: "前一页",
                        next: "下一页",
                        last: "最后一页",
                        refresh: "刷新"
                    }
                },
            }
        });
        kendouiGrid.RunderGrid();
    }
    function openNewIframe(page, pollId, tabName) {
        var pass = true;
        parent.parent.viewModel.tabs().forEach(function (v, i) {
            if (v.id == pollId) {
                pass = false;
                parent.parent.viewModel.changeShowId(v);
                return false;
            }
        })
        if (pass) {
            var newTab = {
                id: pollId,
                url: page,
                name: tabName,
                disabledClose: false
            };
            parent.parent.viewModel.tabs.push(newTab);
            parent.parent.viewModel.changeShowId(newTab);
            $('.chrome-tabs-shell', parent.parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
            $('.chrome-tabs-shell', parent.parent.document).find('.active').addClass('chrome-tab-current');
        }
    }
    function GetCheckedPool() {
        var Pool = getPoolHeader();
        return Pool;
    }
    function getPoolHeader() {
        var grid = $("#grid").data("kendoExtGrid") ? $("#grid").data("kendoExtGrid") : $("#grid", parent.document).data("kendoExtGrid");
        if (grid.select().length != 2) {
            GSDialog.HintWindow('请选择要操作的资产池');
        } else {
            var data = grid.dataItem(grid.select());
            return data;
        }
    }
    function TransStatus(PoolStatusId) {
        var status;
        switch (PoolStatusId) {
            case 148:
                status = 'OPEN';
                break;
            case 149:
                status = 'INVALID';
                break;
            case 150:
                status = 'RESERVE';
                break;
            case 151:
                status = 'PUBLISH';
                break;
            default:
                status = '';
                break;
        }
        return status;
    }
    $(function () {
        if (IsCyclicTask == 1) {
            $("#DistributionConfigView").hide();
            $("#DistributionConfig").hide();
        } else {
            $("#Confirm").hide();

        }

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            lang.biaoshi = 'Identification';
            lang.workdec = 'Working group description';
            lang.name = 'Name';
            lang.src = 'Source of assets';
            lang.createDate = 'Creation date';
            lang.status = 'Status';
            lang.plan = 'Subordination product';
            lang.count = 'PoolCount';
        } else {
            lang.biaoshi = '标识';
            lang.workdec = '工作组描述';
            lang.name = '名称';
            lang.src = '资产来源';
            lang.createDate = '创建日期';
            lang.status = '状态';
            lang.plan = '隶属产品';
            lang.count = '资产池数量';
        }

        InitKendoGrid();
        $("#DistributionConfig").click(function () {
            var ckdPool = GetCheckedPool();
            if (!ckdPool) return;

            var page = '/GoldenStandABS/www/assetFilter/creditfactory/Reports/DistributionConfig.html?PoolId=' + ckdPool.PoolId;
            
            var poolId = ckdPool.PoolId;
            openNewIframe(page, 'Distribution' + poolId, "分布调整_" + poolId);
        })

        $("#DistributionConfigView").click(function () {
            var ckdPool = GetCheckedPool();
            if (!ckdPool) return;
            var poolId = ckdPool.PoolId;
            var page = '/GoldenStandABS/www/assetFilter/poolDistributionReport/poolDistributionReport.html?PoolId=' + poolId;
            openNewIframe(page, 'Report' + poolId, '维度报告_'+ poolId);
        })

        $("#Confirm").click(function () {
            if (decodeURIComponent(escape(common.getQueryString('ActionDisplayName'))) && common.getQueryString('SessionId')) {
                var executeParams = {
                    SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                        { Name: 'SessionId', value: common.getQueryString('SessionId'), DBType: 'string' },
                        { Name: 'ProcessActionName', value: decodeURIComponent(escape(common.getQueryString('ActionDisplayName'))), DBType: 'string' }

                    ]
                };
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                    var ckdPool = GetCheckedPool();
                    if (!ckdPool) return;
                    var poolId = ckdPool.PoolId;
                    sessionStorage.setItem("TaskSetCKPoolId", poolId);
                    GSDialog.HintWindow('保存成功');

                });

            }
        })
    });

});