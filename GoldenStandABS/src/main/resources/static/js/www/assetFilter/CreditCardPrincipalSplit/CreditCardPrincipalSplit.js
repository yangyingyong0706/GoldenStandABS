define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    require("kendomessagescn");
    var common = require('common');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var Vue = require('Vue');
    var GSDialog = require('gsAdminPages');
    var webProxy = require('gs/webProxy');
    var poolId = common.getQueryString('PoolId');
    var poolName = common.getQueryString('PoolName');
    var trustId = common.getQueryString('trustId');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var svcUrlTrustManagement = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&";
    var kendoGridModel = require("gs/Kendo/kendoGridModel");
    var kendouGrid;
    window.ReturnContent = function (AccountNo) {
        var url = webProxy.baseUrl + '/GoldenStandABS/www/assetFilter/CreditCardPrincipalSplit/AssetPayMentSchedule/AssetPaymentSchedule.html?trustId={0}&accountNo={1}&poolId={2}&poolCutId={3}'
        url = url.format(trustId, AccountNo, vm.poolid, poolName);
        var html = '<a href="javascript: window.showDialogPage(\'' + url + '\',\'资产现金流\',1100,500,function(){},true);">现金流</a>';
        return html;
    }
    window.showDialogPage = function (url, title, width, height, fnCallBack, scrolling) {
        common.showDialogPage(url, title, width, height, fnCallBack, scrolling);
    }
    var vm = new Vue({
        el: '#app',
        data: {
            poolId: poolId,
            poolName: poolName,
            trustId: trustId,
            source: [                  //基础资产日期选项数据源
                { ReportingDate: '' }
            ],
            selected: '',              //选中的基础资产日期
            asset: [],                 //资产池已选数据源
            newAsset: [],
            assetPoolId: '',
            haveAsset: [],             //已经拆分过的资产池
            assetAndSelected: [],
            isSplit: true,             //是否已经拆分
            poolid: "",                //当前选中的资产池
            selPoolId: -1,             //当前选中的PoolId
            AllAsset: {},               //所有可供选的资产池
            isShow: true
        },
        created: function () {
            var self = this;
            this.InitAsset();
            this.getAssetData();
            self.GetParmas();
            $("#loading").hide()
        },
        computed: {
            assetAndSelected: function () {
                var arr = this.selected + this.asset;
                if (arr === '' || arr === []) {
                    $('.assetArea').hide()
                } else {
                    $('.assetArea').show()
                }
                return arr;
            }
        },
        mounted: function () {
            var self = this
            self.GetParmas();
        },
        watch: {
            assetAndSelected: function (now) {
                if (now === '' || now === []) {
                    $('.assetArea').hide()
                }
            },
            haveAsset: function () {
                $('.assetArea .wrap_selected').find('li:first-child').trigger('click');
            },
            asset: function () {
                var self = this;
                self.newAsset = [];
                if (self.asset && self.asset.length > 0) {
                    $.each(self.asset, function (i, v) {
                        $.each(self.AllAsset, function (j, n) {
                            if (v == n.poolid) {
                                self.newAsset.push({ id: v, DimReportingDateID: n.DimReportingDateID })
                            }
                        })
                    })
                }
            }
        },
        methods: {
            //渲染Grid
            RenderGrid: function (poolid) {
                var self = this;
                 var height = $('body').height() - 280;
                 kendouGrid = new kendoGridModel(height);
                 kendouGrid.Init({
                     renderOptions: {
                         reorderable: false,
                         columns: [
                            { field: "CustomerCode", title: '账户号', width: "150px", },
                            { field: "MaxRemainingTerm", title: '最大剩余期数', width: "180px" },
                            { field: "PayDay", title: '回款日', width: "120px" },
                            { field: "CurrentPrincipalBalance", title: '未偿本金总额', width: "200px" },
                            { field: "FeeOutstanding", title: '未偿手续费总额', width: "200px" },
                            {
                                field: "", title: '操作', width: "120px", template: '#=window.ReturnContent(CustomerCode)#'
                            },
                         ]
                     },
                     dataSourceOptions: {
                         pageSize: 20,
                         otherOptions: {
                             orderby: null,
                             direction: null,
                             DBName: 'TrustManagement',
                             appDomain: self.poolName,
                             executeParamType: 'extend',
                             executeParam: function () {
                                 var result = {
                                     SPName: 'Asset.usp_GetCreditCardCustomer', SQLParams: [
                                        { Name: 'PoolId', Value: poolid, DBType: 'int' },
                                     ]
                                 };
                                 return result;
                             }
                         }
                     }
                 });
                 kendouGrid.RunderGrid();
            },
            //获取初始参数值
            GetParmas:function(){
                var self = this;
                var executeParam = {
                    SPName: 'Asset.usp_GetCreditCardAjustCoefficient', SQLParams: [
                        { Name: 'PoolId', value: self.poolId, DBType: 'int' },
                   
                    ]
                };
                common.ExecuteGetData(false, svcUrl, self.poolName, executeParam, function (data) {
                    if (data.length > 0) {
                        $("#MRate").val(data[0].PrincipalCoefficient)
                        $("#HRate").val(data[0].InterestCoefficient)
                    }

                })
            },
            //RunTask
            RunTask: function () {
                var self = this;
                var PrincipalCoefficient = $("#MRate").val() == "" ? 1 : $("#MRate").val();
                var InterestCoefficient = $("#HRate").val() == "" ? 1 : $("#HRate").val();

                if (PrincipalCoefficient < 0 || PrincipalCoefficient > 1) {
                    GSDialog.HintWindow("本金调整系数在0~1之间")
                    return false;
                }
                if (InterestCoefficient < 0) {
                    GSDialog.HintWindow("手续费调整系数必须大于或者等于0")
                    return false;
                }
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                //执行存储过程
                var executeParam = {
                    SPName: 'Asset.usp_SaveCreditCardAjustCoefficient', SQLParams: [
                        { Name: 'PoolId', value: self.poolId, DBType: 'int' },
                        { Name: 'PrincipalCoefficient', value: PrincipalCoefficient, DBType: 'string' },
                        { Name: 'InterestCoefficient', value: InterestCoefficient, DBType: 'string' },
                    ]
                };
                common.ExecuteGetData(false, svcUrl, self.poolName, executeParam, function (data) {
                    //成功运行task
                    var params = "Data Source=MSSQL;Initial Catalog=" + self.poolName + ";Integrated Security=SSPI"
                    sVariableBuilder.AddVariableItem('ConnectionString', params, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('PoolIds', self.asset.join(','), 'String', 0, 0, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: 'CreditCardPrincipalSplit',
                        sContext: sVariable,
                        callback: function () {
                            location.reload();
                            sVariableBuilder.ClearVariableItem();
                        }
                    });

                    tIndicator.show();
                });
              
            },
            //查看归集结果
            showdialog: function () {
                var self = this;
                var url = webProxy.baseUrl + '/GoldenStandABS/www/assetFilter/cashFlowSplit/AssetPayMentSchedule/AssetPaymentSchedule.html?DimloanId=-11&enter=creatAssets&poolId={0}&PoolDBName={1}'
                url = url.format(self.poolId, self.poolName);
                GSDialog.open("现金流归集结果", url, '', function () { }, '1100', '500', '', true, true, true, false)
            },
            //选择资产
            selectAdd: function () {
                var selectAeest = $('#selectAeest');
                $.anyDialog({
                    width: 600,	// 弹出框内容宽度
                    height: 450, // 弹出框内容高度
                    title: '选取资产池',	// 弹出框标题
                    html: selectAeest.show(),
                    onClose: function () {
                    }
                })
            },
            //获取所有资产池
            getAssetData: function () {
                var executeParam = {
                    SPName: 'TrustManagement.usp_GetRelatedPools', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                        { Name: 'PoolCutDBName', value: poolName, DBType: 'string' }

                    ]
                };
                var result = common.ExecuteGetData(false, svcUrlTrustManagement, poolName, executeParam);
                this.AllAsset = result;
            },
            //已选资产池选中事件
            selectAsset: function (poolid) {
                var self = this;
                if (event.target.tagName.toLowerCase() == 'li') {
                    $(event.target).addClass('active').siblings().removeClass('active');
                    $(event.target).parent().siblings().children().removeClass('active');
                }
                self.poolid = poolid;
                if (self.isSplit) {
                    self.RenderGrid(self.poolid);
                } else {
                    GSDialog.HintWindow(langx.tab14);
                }
            },
            //选择资产 日期组合
            saveDateAsset: function () {
                $('#modal-close').trigger('click');
                $('.assetArea').find('li:first-child').addClass('active').siblings().removeClass('active');
                var SelectLi = $('.wrap_selected ul li');
                var UlWidth = 0;
                $.each(SelectLi, function (i, v) {
                    UlWidth += ($(v).width() + 30)
                })
                $('.wrap_selected ul').css('width', UlWidth)
                if (this.selected && this.selected != '无') {
                    this.selectAsset()
                } else if (!this.selected && this.asset.length != 0) {
                    this.selectAsset(this.asset[0]);
                } else {
                    $('.assetArea').hide()
                }
            },
            //获取已选池 
            InitAsset: function () {
                var self = this;
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = { SPName: 'Asset.usp_GetCreditCardSplitRecords', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'ResultMode', Value: 2, DBType: 'int' });

                executeParams = encodeURIComponent(JSON.stringify(executeParam));
                $.ajax({
                    cache: false,
                    type: "GET",
                    async: false,
                    url: svcUrl + 'appDomain=' + poolName + '&executeParams=' + executeParams,
                    dataType: "json",
                    contentType: "application/xml;charset=utf-8",
                    data: {},
                    success: function (response) {
                        if (typeof response === 'string') { sourceData = JSON.parse(response); }
                        else { sourceData = response; }
                        self.haveAsset = sourceData;
                        $.each(self.haveAsset, function (i, v) {
                             self.asset.push(v.PoolId);
                        })
                        self.isShow = false;
                    },
                    error: function (response) {
                        alert('Error occursed while requiring the remote source data!');
                    }
                });
            },
            //获取所有日期
            InitReportDate: function () {
                var self = this;
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = { SPName: 'dbo.usp_GetFactLoanDate', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'PoolId', Value: poolId, DBType: 'int' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                $.ajax({
                    cache: false,
                    type: "GET",
                    async: false,
                    url: svcUrl + 'appDomain=' + poolName + '&executeParams=' + executeParams,
                    dataType: "json",
                    contentType: "application/xml;charset=utf-8",
                    data: {},
                    success: function (response) {
                        var sourceData;
                        if (typeof response === 'string') { sourceData = JSON.parse(response); }
                        else { sourceData = response; }
                        self.source = sourceData;
                    },
                    error: function (response) { alert('Error occursed while requiring the remote source data!'); }
                });
            },
        }  
    })
    $("body").on("keyup", "#MRate", function () {
        common.NumberTest(this)
    })
    $("body").on("keyup", "#HRate", function () {
        common.NumberTest(this)
    })
});