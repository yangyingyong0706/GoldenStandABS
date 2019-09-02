/// <reference path="../../../components/CashflowSplit/CashflowSplit.html" />
var viewModel = {};
define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    //var kendoGridModel = require('gs/kendoGridModel');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    //var kendoGridModel = require('app/productDesign/js/kendoGridModel');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var common = require('common');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var Vue = require('Vue');
    require('jquery.localizationTool');
    webProxy = require('gs/webProxy');
    require('bootstrap');
    var GSDialog = require('gsAdminPages');
    var CallApi = require("callApi");
    var webStore = require('gs/webStorage');
    var tm = require('gs/parentTabModel');
    var TrustId = common.getQueryString('tid');
    var schedulePurpose = common.getQueryString('schedulePurpose') ? common.getQueryString('schedulePurpose') : 0;//0-表示拆分工具
    var scheduleDateId = common.getQueryString('scheduleDate') ? common.getQueryString('scheduleDate') : getCurrentDate();
    var ScenarioId = common.getQueryString('ScenarioId') ? common.getQueryString('ScenarioId') : 1;
    var TrustCode = '';
    var svcUrlTrustManagement = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&";
    var assetTree = null;
    var kendouGrid;
    var self = this;
    var step = common.getQueryString('step');
    var params = [];
    
    $('#selectLanguageDropdown_qcl').localizationTool({
        'defaultLanguage': 'zh_CN', // this is the language that the server is sending anyway
        'ignoreUnmatchedSelectors': true,
        'showFlag': true,
        'showCountry': false,
        'showLanguage': true,
        'onLanguageSelected': function (languageCode) {
            /*
             * When the user translates we set the cookie
             */
            webStore.setItem('userLanguage', languageCode);
            return true;
        },

        /* 
         * Translate the strings that appear in all the pages below
         */
        'strings': {


            'id:poolDate': {
                'en_GB': 'Asset pool snapshot date'
            },
            'id:poolAbout': {
                'en_GB': 'Related asset pool'
            },
            'id:btnSplit': {
                'en_GB': 'Split and collect'
            },
            'id:btnViewResult': {
                'en_GB': 'View Results'
            },
            'id:selectPool': {
                'en_GB': 'Check the asset pool area'
            },
            'id:basePool': {
                'en_GB': 'Base pool:'
            },
            'id:pool': {
                'en_GB': 'Asset pool:'
            }

        }
    });

    var userLanguage = webStore.getItem('userLanguage');
    var langx = {};
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langx.tab1 = "split and collection";
        langx.tab2 = "Please select asset pool first";
        langx.tab3 = "New cash split: ";
        langx.tab4 = "Cash split: ";
        langx.tab5 = "View Results";
        langx.tab6 = "Contract No.";
        langx.tab7 = "Start date";
        langx.tab8 = "expiry date";
        langx.tab9 = "interest rate(%)";
        langx.tab10 = "Principal balance (yuan)";
        langx.tab11 = "Whether to enter the pool";
        langx.tab12 = "Repayment method";
        langx.tab13 = "operating";
        langx.tab14 = "Please split and collect first";
    } else {
        langx.tab1 = "拆分与归集";
        langx.tab2 = "请先选择资产池";
        langx.tab3 = "新现金拆分: ";
        langx.tab4 = "现金拆分: ";
        langx.tab5 = "查看结果";
        langx.tab6 = "合同编号";
        langx.tab7 = "开始日";
        langx.tab8 = "到期日";
        langx.tab9 = "利率（%）";
        langx.tab10 = "本金余额（元）";
        langx.tab11 = "是否入池";
        langx.tab12 = "还本付息方式";
        langx.tab13 = "操作";
        langx.tab14 = "请先进行拆分与归集";
    }
    var window = this;
    window.getStringDate = function (strDate) {
        //var str = '/Date(1408464000000)/';
        if (!strDate) {
            return '';
        }
        var str = strDate.replace(new RegExp('\/', 'gm'), '');
        return eval('new ' + str);
    }
    window.numFormt = function (p) {
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
    window.getOperate = function (tid, accountno) {
        var viewPageUrl = GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/TrustFollowUp/AssetPayMentSchedule/AssetPaymentSchedule.html?trustId=' + tid + '&accountNo=' + accountno + '&poolId=' + vm.selPoolId;
        var html = '<a href="javascript: window.showDialogPage(\'' + viewPageUrl + '\',\'资产现金流\',1100,500,function(){},true,false);">现金流</a>';
        return html;
    };
    window.showDialogPage = function (url, title, width, height, fnCallBack,data,scrolling) {
        common.showDialogPage(url, title, width, height, fnCallBack,data, scrolling);
    }
    var vm = new Vue({
        el: '#app',
        data: {
            source: [                  //基础资产日期选项数据源
                { ReportingDate: '' }
            ] ,
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
        created: function() {
            this.InitReportDate();
            this.InitAsset();
            this.getAssetData();
            this.getTrustCodeByTrustId();
        },
        methods: {
            //获取所有日期
            InitReportDate: function () {
                var self = this;
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = { SPName: 'usp_GetFactLoanDate', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustId', Value: TrustId, DBType: 'int' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                $.ajax({
                    cache: false,
                    type: "GET",
                    async: false,
                    url: svcUrl + 'appDomain=dbo&executeParams=' + executeParams,
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

            //获取已选池 
            InitAsset: function () {
                var self = this;
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = { SPName: 'usp_GetCashflowSplitResultListInfo', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustId', Value: TrustId, DBType: 'int' });
                executeParam.SQLParams.push({ Name: 'schedulePurpose', Value: schedulePurpose, DBType: 'int' });
                executeParam.SQLParams.push({ Name: 'ScheduleDateId', Value: scheduleDateId, DBType: 'int' });

                executeParams = encodeURIComponent(JSON.stringify(executeParam));
                $.ajax({
                    cache: false,
                    type: "GET",
                    async: false,
                    url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams,
                    dataType: "json",
                    contentType: "application/xml;charset=utf-8",
                    data: {},
                    success: function (response) {
                        if (typeof response === 'string') { sourceData = JSON.parse(response); }
                        else { sourceData = response; }
                        self.haveAsset = sourceData;
                        $.each(self.haveAsset, function (i, v) {
                            if (v.id === -1) {
                                self.selected = v.DimReportingDateID.toString().substr(0, 4) + '-' + v.DimReportingDateID.toString().substr(4, 2) + '-' + v.DimReportingDateID.toString().substr(6, 2);
                            } else {
                                self.asset.push(v.id);
                                //self.asset.push(v);
                            }
                        })
                        self.isShow = false;
                    },
                    error: function (response) {
                        alert('Error occursed while requiring the remote source data!');
                    }
                });
            },

            //选择资产 日期组合
            saveDateAsset: function () {
                $('#modal-close').trigger('click');
                $('.assetArea').find('li:first-child').addClass('active').siblings().removeClass('active');
                var SelectLi = $('.wrap_selected ul li');
                var UlWidth = 0;
                $.each(SelectLi,function(i,v){
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
            //已选资产池选中事件
            selectAsset: function (poolid) {
                var self = this;
                var dimreportingdateid = '';
                if (event.target.tagName.toLowerCase() == 'li') {
                    $(event.target).addClass('active').siblings().removeClass('active');
                    $(event.target).parent().siblings().children().removeClass('active');
                }
                if (poolid) {
                    $.each(self.AllAsset, function (i,v) {
                        if (v.poolid == poolid) {
                            dimreportingdateid = v.DimReportingDateID;
                        }
                    })
                }
                self.poolid = poolid ? poolid : -1;//资产池传入对应poolid,不传表示基础池为-1（对接存储过程）
                dimreportingdateid = dimreportingdateid ? dimreportingdateid : parseInt(self.selected.replace(/-/g, ''));
                if (self.isSplit) {
                    self.initKendouGridByPoolId(dimreportingdateid, self.poolid);
                } else {
                    GSDialog.HintWindow(langx.tab14);
                }
            },
            //下载勾选资产
            downloadList: function () {
                if (!window.checkall && params.length == 0) {
                    GSDialog.HintWindow("请勾选资产");
                    return false;
                }
                var str = "";
                var self = this;
                $.each(params, function (i, v) {
                    str += v + ","
                })

                var len = str.length - 1;
                str = str.substring(0, len)
                var callApi = new CallApi('TrustManagement', 'Asset.usp_GetAssetPaymentSchedule_ByAccountNo', true);
                callApi.AddParam({ Name: 'trustId', Value: TrustId, DBType: 'int' });
                callApi.AddParam({ Name: 'accountNoItem', Value: str, DBType: 'string' });
                callApi.AddParam({ Name: 'poolId', Value: self.poolid, DBType: 'int' });
                callApi.ExportDataToExcel("现金流拆分结果");
            },
            //获取所有资产池
            getAssetData: function () {
                var executeParam = {
                    SPName: 'usp_GetRelatedPools', SQLParams: [
                        { Name: 'TrustId', value: TrustId, DBType: 'int' }
                    ]
                };
                var result = common.ExecuteGetData(false, svcUrlTrustManagement, 'TrustManagement', executeParam);
                this.AllAsset = result;
            },
            //初始化资产明细kendougrid
            initKendouGridByPoolId: function (dimreportingdateid, poolid) {
                var self = this;
                this.selPoolId = poolid;
                var height = $('body', window.top.frames[0].document).height() - 275;
                var filter = "where DimSourceTrustID = " + TrustId + " and ParentPoolId=0";
                //资产明细列表
                kendouGrid = new kendoGridModel(height);
                kendouGrid.Init({
                    renderOptions: {
                        reorderable: false,
                        columns: [
                            {
                                title: "",
                                width: '50px',
                                headerTemplate: function () {
                                    var t = '<input type="checkbox" id="checkAll" onclick="self.selectAll(this)"/>';
                                    return t
                                },
                                template: function () {
                                    var t = '<input type="checkbox" class="selectbox" onclick="self.selectCurrent(this)"/>';
                                    return t
                                }
                            },
                            { field: "AccountNo", title: langx.tab6, width: "150px", },
                            { field: "StartDate", title: langx.tab7, template: '#=StartDate?window.getStringDate(StartDate).dateFormat("yyyy-MM-dd"):""#', width: "180px" },
                            { field: "EndDate", title: langx.tab8, template: '#=EndDate?window.getStringDate(EndDate).dateFormat("yyyy-MM-dd"):""#', width: "180px" },
                            { field: "InterestRate", title: langx.tab9, width: "150px" },
                            { field: "CurrentPrincipalBalance", title: langx.tab10, template: '#=CurrentPrincipalBalance?window.numFormt(CurrentPrincipalBalance):"0"#', width: "150px" },
                            { field: "IsInTrust", title: langx.tab11, template: '#=IsInTrust==1?"是":"否"#', width: "120px" },
                            //{ field: "IsInTrust", title: langx.tab11, template: '#=IsInTrust?"是":"否"#', width: "120px" },
                            { field: "PrincipalPaymentType", title: langx.tab12, width: "150px" },
                            { title: langx.tab13, template: '#=window.getOperate(TrustId,AccountNo)#', width: "100px" },
                            { field: "", title: "", width: "auto" }
                        ]
                    },
                    dataSourceOptions: {
                        pageSize: 20,
                        params: params,
                        otherOptions: {
                            orderby: "AccountNo",
                            direction: "",
                            DBName: 'TrustManagement',
                            appDomain: 'TrustManagement',
                            executeParamType: 'extend',
                            executeParam: function () {
                                var result = {
                                    SPName: 'usp_GetAssetsForPool', SQLParams: [
                                        { Name: 'TrustId', Value: TrustId, DBType: 'int' },
                                        { Name: 'PoolId', Value: poolid, DBType: 'int' },
                                        { Name: 'DimReportingDateId', Value: dimreportingdateid, DBType: 'int' }
                                    ]
                                };
                                return result;
                            }
                        }
                    }
                });
                kendouGrid.RunderGrid();
            },
            //拆分与归集
            newBtnSplit: function () {
                var self = this;
                var page = '';
                var arr = [];
                $.each(self.newAsset, function (i, v) {
                    arr.push(v.id);
                })
                self.assetPoolId = arr.join(',');
                if (this.selected || this.asset.length ) {
                    if (this.selected && this.asset.length) {
                        
                        operationType = 3;
                        page = webProxy.baseUrl + '/GoldenStandABS/www/components/NewCashflowSplit/NewCashflowSplit.html?TrustId={0}&TrustCode={1}&ScheduleDateId={2}&DimReportingDateId={3}&PoolIds={4}&OperationType={5}&schedulePurpose={6}&ScenarioId={7}';
                        page = page.format(TrustId, TrustCode, scheduleDateId, this.selected.replace(/-/g, ''), this.assetPoolId, operationType, schedulePurpose, ScenarioId)
                    } else if (this.selected && this.asset.length == 0) {
                        operationType = 1;
                        page = webProxy.baseUrl + '/GoldenStandABS/www/components/NewCashflowSplit/NewCashflowSplit.html?TrustId={0}&TrustCode={1}&ScheduleDateId={2}&DimReportingDateId={3}&OperationType={4}&schedulePurpose={5}&ScenarioId={6}';
                        page = page.format(TrustId, TrustCode, scheduleDateId, this.selected.replace(/-/g, ''), operationType, schedulePurpose, ScenarioId)
                    } else if (this.asset.length && !this.selected) {
                        operationType = 2;
                        page = webProxy.baseUrl + '/GoldenStandABS/www/components/NewCashflowSplit/NewCashflowSplit.html?TrustId={0}&TrustCode={1}&ScheduleDateId={2}&PoolIds={3}&OperationType={4}&schedulePurpose={5}&ScenarioId={6}';
                        page = page.format(TrustId, TrustCode, scheduleDateId, this.assetPoolId, operationType, schedulePurpose, ScenarioId)
                    } else {
                        GSDialog.HintWindow(langx.tab2);
                        return;
                    }
                } else {
                    GSDialog.HintWindow(langx.tab2);
                    return;
                }
                var schedulePurposeKey = TrustId + '_SchedulePurpose';
                var scheduleDateIdKey = TrustId + '_ScheduleDateId';
                webStore.removeItem(schedulePurposeKey);
                webStore.removeItem(scheduleDateIdKey);
                webStore.setItem(schedulePurposeKey, schedulePurpose);
                webStore.setItem(scheduleDateIdKey, scheduleDateId);

                if (TrustId) {
                    if (schedulePurpose && schedulePurpose == 1) {
                        openNewIframe(page, TrustId + '_cashflowsplit', langx.tab1 + '_' + TrustId, parent.parent.viewModel);
                    }
                    else {
                        openNewIframe(page, TrustId + '_cashflowsplit', langx.tab1 + '_' + TrustId, parent.parent.parent.viewModel);
                    }

                }
            },
            //查看结果
            btnViewResult: function () {
                var self = this;
                var url = GlobalVariable.TrustManagementServiceHostURL + 'productDesign/stresstest/CashflowSplit/ViewResult.html?tid=' + TrustId;
                url += '&schedulePurpose=' + schedulePurpose;
                if (self.selected) url += '&reportingDateId=' + self.selected.replace(/-/g, '');
                url += '&scheduleDateId=' + scheduleDateId;
                if (self.asset && self.asset.length > 0) {
                    var res = '';
                    self.newAsset.forEach(function (v) { res += v.id + ',' + v.DimReportingDateID + '|'; });
                    url += '&poolIds=' + res.substring(0, res.length - 1);
                }
                //典型压测情景
                url += '&ScenarioId=' + ScenarioId;
                GSDialog.open(langx.tab5, url, null, function () { }, 1000, 540);
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
            //根据trustid获取trustcode
            getTrustCodeByTrustId: function () {
                var executeParam = {
                    SPName: 'usp_GetTrustInfo', SQLParams: [
                        { Name: 'trustId', value: TrustId, DBType: 'int' }
                    ]
                };

                var result = common.ExecuteGetData(false, svcUrlTrustManagement, 'TrustManagement', executeParam);

                var res = ''
                if (result.length > 0) {
                    result.forEach(function (v, i) {
                        if (v.ItemCode == 'TrustCode') {
                            res = v.ItemValue;
                            return;
                        }
                    });
                }
                TrustCode = res
            },
    
        }
    })
    //全选框
    self.selectAll = function (that) {
        var that = that;
        window.checkall ? window.checkall = !window.checkall : "";
        if ($("#checkAll").is(':checked')) {
            var arry = $(".selectbox");
            $.each(arry, function (i, v) {
                $(v).prop("checked", true);
                var aco = $(v).parent().next().html();
                if (params.indexOf(aco) == -1) {
                    params.push(aco);
                }
            })
            $("#infomation").html("已经勾选当前" + params.length + "条数据,")
            $("#opration").html("勾选全部" + window.total + "条数据");
            $(".tips").show()
        } else {
            var arry = $(".selectbox");
            $(".tips").hide()
            $.each(arry, function (i, v) {
                $(v).prop("checked", false);
                params.remove($(v).parent().next().html());
            })
            $("#infomation").html("已经勾选" + params.length + "条数据,")
            $("#opration").html("勾选全部" + window.total + "条数据");
        }
    }
    self.selectCurrent = function (that) {
        var that = that;
        var arry = $(".selectbox");
        var off = true;
        $.each(arry, function (i, v) {
            if (!v.checked) {
                off = false;
            }
        })
        if (window.checkall && $(".tips").css("display") == "block") {
            window.checkall = false;
            $.each(arry, function (i, v) {
                var aco = $(v).parent().next().html();
                if (v.checked && params.indexOf(aco) == -1) {
                    params.push(aco);
                }
            })
        }
        
        if ($(that).is(':checked')) {
            params.push($(that).parent().next().html());
        } else {
            params.remove($(that).parent().next().html());
        }
        $("#infomation").html("已经勾选" + params.length + "条数据,");
        $("#opration").html("勾选全部" + window.total + "条数据");
        if (off) {
            $("#checkAll").prop("checked", true);
            window.checkall ? window.checkall = !window.checkall : "";
            $(".tips").show()
        } else {
            $("#checkAll").prop("checked", false);
            $(".tips").hide()
        }

    }
    //勾选全部数据
    $("#opration").click(function () {
        if (!window.checkall) {
            $(this).html("取消勾选")
            $(this).prev().html("已勾选全部数据,")
            var arry = $(".selectbox");
            $("#checkAll").prop("checked", true);
            $.each(arry, function (i, v) {
                $(v).prop("checked", true);
            })
            params.splice(0, params.length);
            window.checkall = true;
        } else {
            window.checkall = false;
            var arry = $(".selectbox");
            $("#checkAll").prop("checked", false);
            $.each(arry, function (i, v) {
                $(v).prop("checked", false);
            })
            $(".tips").hide();
            $(this).prev().html("已经勾选" + params.length + "条数据,")
            $(this).html("勾选全部" + window.total + "条数据");
        }
    })
    //给表格内容div一个默认的高度 否则加载的时候高度为0不显示加载loading
    $(".k-grid-content").height($('#grid').height());
    //获取当前时间
    function getCurrentDate() {
        var currentDate = '';
        var now = new Date();
        var y = now.getFullYear();
        var m = (now.getMonth() + 1 < 10) ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1);
        var d = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
        currentDate = y + '' + m + '' + d;
        return currentDate;
    }
    function openNewIframe(page, trustId, tabName, viewModel) {
        var pass = true;
        viewModel.tabs().forEach(function (v, i) {
            if (v.id == trustId) {
                pass = false;
                viewModel.changeShowId(v);
                return false;
            }
        })
        if (pass) {
            //parent.viewModel.showId(trustId);
            var newTab = {
                id: trustId,
                url: page,
                name: tabName,
                disabledClose: false
            };
            viewModel.tabs.push(newTab);
            viewModel.changeShowId(newTab);
            if (tabName.indexOf("拆分与归集") > -1) {
                //产品设计
                var btn = $('.chrome-tabs-shell', parent.parent.parent.document).find(".chrome-tab-current").find(".chrome-tab-close");
                //循环购买
                var btn1 = $('.chrome-tabs-shell', parent.parent.document).find(".chrome-tab-current").find(".chrome-tab-close");
                if (btn) {
                    btn.click(function () {
                        $('iframe[src*=CashflowSplit]', parent.document)[0].contentWindow.location.reload(true);
                    })
                }
                if (btn1) {
                    btn1.click(function () {
                        $('iframe[src*=CashflowSplit]', parent.document)[0].contentWindow.location.reload(true);
                    })
                }
            }
            //$('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
            //$('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
        };
    }
    // 缓存拆分规则
    //function storageUnfoldRule() {
    //    if (window.localStorage) {
    //        var splitOptions = localStorage.getItem('splitOptions');
    //        if (splitOptions) {
    //            splitOptions = JSON.parse(splitOptions);
    //            $.each(splitOptions, function (k, v) {
    //                var obj = $('#' + k);
    //                if (obj[0]) {
    //                    if (obj[0].tagName.toLowerCase() == 'input') {
    //                        var type = obj.attr('type');
    //                        if (type == 'radio') {
    //                            $("input[name='" + k + "'][value='" + v + "']").prop('checked', true);
    //                        } else {
    //                            obj.prop('checked', (v === '1') ? true : false);
    //                            if (k === 'CalculateRTBySystem') {
    //                                if (v == '1') {
    //                                    obj.trigger('change');
    //                                }
    //                            }
    //                        }
    //                    } else {
    //                        obj.val(v);
    //                        if (k === 'PeriodsCalRule') {
    //                            if (v == '1') {
    //                                obj.trigger('change');
    //                            }
    //                        }
    //                    }
    //                }
    //            });
    //        }
    //    }
    ////}
    
});