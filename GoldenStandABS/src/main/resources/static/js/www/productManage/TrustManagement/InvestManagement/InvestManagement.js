define(function (require) {
    var $ = require('jquery');
    //require('jquery.datagrid');
    //require('jquery.datagrid.options');
    //var page = require('./js/PagerList');
    var GlobalVariable = require('globalVariable');
    require('date_input');
    var kendoGridModel = require('./kendoGridModel');
    var common = require('common');
    var webProxy = require('../wcfProxy');
    var Vue = require('Vue2');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');

    var trustId = common.getQueryString('tid');

    var height = $(window).height() - 120;
    var h = $(window).height() - 145;
    console.log(screen.height, $(window).height());
    var filter = '';// "where DimSourceTrustID = " + trustId + " and ParentPoolId=0";
    //资产明细列表
    function initGrid() {
        var kdGridAssetDetail = new kendoGridModel(height);
        var assetDetailOptions = {
            renderOptions: {
                height: h,
                scrollable: true,
                resizable: true,
                columns: [
                            { field: "Id", title: '标识', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "InvestName", title: '投资人名称', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "InvestCode", title: '投资人代码', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "InvestAccount", title: '投资人账号', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "AccountName", title: '账户名称', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "BankName", title: '开户银行', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "Account", title: '账号', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "TrustId", title: '产品号', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "TrustBondCode", title: '投资债券代码', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "TrustBondName", title: '投资债券名称', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "InvestAmount", title: '投资金额', template: '#=InvestAmount?self.numFormt(InvestAmount):""#', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "InvestNumber", template: '#=InvestNumber?self.numFormt(InvestNumber):""#', title: '投资份数', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "IssueDate", title: '购买时间', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "LegalMaturityDate", title: '到期时间', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "CouponBasis", title: '利率', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { title: '操作', template: '#=self.getOperate(TrustBondCode,InvestCode)#', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "", title: "", width: "auto" }
                ]
            },
            dataSourceOptions: {
                pageSize: 20,
                otherOptions: {
                    orderby: "Id",
                    direction: "asc",
                    DBName: 'TrustManagement',
                    appDomain: 'TrustManagement',
                    executeParamType: 'extend',
                    defaultfilter: filter,
                    executeParam: function () {
                        var result = {
                            SPName: 'usp_TrustGetBoundInvest',
                            SQLParams: [
                                { Name: 'TrustId', Value: trustId, DBType: 'int' }
                            ],
                            //把TrustCode传到kendoGridModel里
                        };
                        return result;
                    }
                }
            }
        };
        //初始化资产明细的kendougrid
        kdGridAssetDetail.Init(assetDetailOptions, 'gridAssetDetail');
        kdGridAssetDetail.RunderGrid();

   

    }

    //打开新页面
    this.getOperate = function (trustBondCode, InvestCode) {
        var viewPageUrl = $('#gridAssetPoolList').document;
        //var viewPageUrl = 'http://abs-dit.goldenstand.cn/GoldenStandABS/www/productManage/TrustManagement/TrustFollowUp/AssetDetailList.html?tid=87';//'./AssetPayMentSchedule/AssetPaymentSchedule.html?trustId=' + tid + '&accountNo=' + temp;
        var html = '<a href="javascript: self.showDialogPage(\'' + viewPageUrl + '\',\'资产现金流\',300,400,function () { },\'' + trustBondCode + '\',\'' + InvestCode + '\');">查看详情</a>';
        return html;
    }
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
    this.returndate = function (date) {
        var year = date.substring(0, 4);
        var mounth = date.substring(4, 6);
        var day = date.substring(6, 8);
        return year + "-" + mounth + "-" + day;
    }
    this.showDialogPage = function (url, title, width, height, fnCallBack, trustBondCode, InvestCode) {
        var scrolling = true, size = '', draggable = true, changeallow = true, mask = true;
        var investDetailOptions = {
            renderOptions: {
                height: 430,
                scrollable: true,
                resizable: true,
                columns: [
                            { field: " SNO", title: '期数', width: "10%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                            , { field: " ReportingDateId", title: '兑付日期', width: "20%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, template: "#=ReportingDateId?self.returndate(ReportingDateId):''#" }
                            , { field: "Principal_Paid", title: '偿付本金', width: "20%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, template: "#=Principal_Paid?self.numFormt(Principal_Paid):'0'#" }
                            , { field: "Interest_Paid", title: '支付利息', width: "20%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, template: "#=Interest_Paid?self.numFormt(Interest_Paid):'0'#" }
                            , {
                                field: "RemainPrinciple", title: '剩余本金', width: "20%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, template: "#=RemainPrinciple?self.numFormt(RemainPrinciple):''#"
                            }
                            , { field: "", title: "", width: "auto" }
                ]
            }
           , dataSourceOptions: {
               pageSize: 20
               , otherOptions: {
                   orderby: "ReportingDateId"
                   , direction: "asc"
                     , DBName: 'TrustManagement'
                    , appDomain: 'TrustManagement'
                   , executeParamType: 'extend'
                    , defaultfilter: filter
                   , executeParam: function () {
                       var result = {
                           SPName: 'usp_TrustGetInvestDetailsByTrustBondCode',
                           SQLParams: [
                               { Name: 'TrustBondCode', Value: trustBondCode, DBType: 'string' },
                                { Name: 'InvestCode', Value: InvestCode, DBType: 'string' },
                                { Name: 'TrustId', Value: trustId, DBType: 'int' }
                           ],
                           //把TrustCode传到kendoGridModel里
                       };
                       return result;
                   }
               }
           }
        };
        var kdGridAssetDetail = new kendoGridModel(height);
        kdGridAssetDetail.Init(investDetailOptions, 'gridAssetPoolList');
        kdGridAssetDetail.RunderGrid();
        self.dialog = $.anyDialog({
            width: 900,
            height: 500,
            title: "投资详情",
            html: $('#gridAssetPoolList').show(),
            onClose: function () {
            }
        });
        //common.showDialogPage(url, title, width, height, function () { }, data, scrolling, size, draggable, changeallow, mask);
    }
    function registerEvent() {
        //$('#btnAddInvest').click(function () {
        //    self.dialog = $.anyDialog({
        //        width: 600,
        //        height: 400,
        //        title: "投资详情",
        //        html: $('#investBound').show(),
        //        onClose: function () {
        //        }
        //    });
        //})
    }
    $(function () {
        $('body').on('click', '#modal-win', function () {
            var maxOr = $(this).hasClass('icon-window-maximize');
            if (maxOr) {
                $('#gridAssetPoolList').height(425);
                $('#gridAssetPoolList .k-grid-content').height(353);
                $('#investBound .form-group').addClass('col-md-12').removeClass('col-md-6');
            } else {
                $('#gridAssetPoolList').height(h);
                $('#gridAssetPoolList .k-grid-content').height(h - 73);
                $('#investBound .form-group').addClass('col-md-6').removeClass('col-md-12');
            }
        })
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        initGrid();
        registerEvent();
        app = new Vue({
            el: '#investMain',
            data: {
                TrustId: trustId,
                BoundId: 0,
                InvestName: '',//投资人名称
                InvestAccount: '', //投资人账户
                AccountName: '', //账户名称
                BankName: '',    //开户银行
                Account:'', //账号
                InvestCode: '',//投资人代码
                InvestAmount: 0,//投资金额
                InvestNumber: 0,//投资份额
                RemainCount: '',
                InvestCount: '',
                InvestDate: '',
                TrustBondCodeList: [],//根据专项计划代码返回的债券信息
                selectedTrustBondCode: '',//选择的投资债券代码
                isAdd: 0, //判断是否是新增投资信息还是编辑投资信息
                IssueDate: '',//购买时间
                LegalMaturityDate: '',//到期时间
                CouponBasis:'',//利率
                check: true
            },
            mounted: function () {
                var self = this

            },
            methods: {
                caculate: function () {

                    var grid = $("#gridAssetDetail").data("kendoExtGrid");
                    if (grid.select().length != 1) {
                        GSDialog.HintWindow('请选择需要更的投资选项');
                    } else {
                        var data = grid.dataItem(grid.select());
                        sVariableBuilder.AddVariableItem('Trustid', trustId, 'String', 1, 1, 1);
                        sVariableBuilder.AddVariableItem('InvestCode', data.InvestCode, 'String', 1, 1, 1);
                        sVariableBuilder.AddVariableItem('TrustBondCode', data.TrustBondCode, 'String', 1, 1, 1);
                        sVariableBuilder.AddVariableItem('TrustBondId', data.TrustBondId, 'String', 1, 1, 1);
                        sVariableBuilder.AddVariableItem('RemainPrinciple', data.InvestAmount, 'String', 1, 1, 1);
                        sVariableBuilder.AddVariableItem('InvestNumber', data.InvestNumber, 'String', 1, 1, 1);


                        var sVariable = sVariableBuilder.BuildVariables();
                        var tIndicator = new taskIndicator({
                            width: 500,
                            height: 550,
                            clientName: 'TaskProcess',
                            appDomain: 'Task',
                            taskCode: 'CaculatInvestDetails',
                            sContext: sVariable,
                            callback: function () {
                                window.location.reload();//href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                                $('#modal-close', parent.document)[0].click()
                                sVariableBuilder.ClearVariableItem();
                            }
                        });

                        tIndicator.show();
                    }

                },
                //项目代码校验
                checkTurst: function ($event) {
                    var self = this;
                    var obj = $event.target;
                    var $this = $(obj);
                    var objValue = $this.val();
                    self.check = false;
                    if ($this.hasClass("theInputBorderRed")) {
                        $this.removeClass("theInputBorderRed")
                    }
                    //var pattern = new RegExp("[`%~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
                    var pattern = new RegExp("[^0-9a-zA-Z-_]");
                    var testfirst = new RegExp("[_-]");
                    if (testfirst.test(objValue.substring(0, 1))) {
                        GSDialog.HintWindow("输入不合法,首字母只能是数据或者字母", function () {
                            $this.addClass("theInputBorderRed");
                            $this.val("");
                            $this.focus();
                            self.check = false;
                        }, "", false);
                        return false
                    }
                    else if (pattern.test(objValue)) {
                        GSDialog.HintWindow("输入不合法,只能输入数字,字母,下划线,破折号的组合", function () {
                            $this.addClass("theInputBorderRed");
                            $this.val('')
                            $this.focus();
                            self.check = false;
                        }, "", false);

                        return false
                    } else {
                        self.check = true;
                    }
                },
                //千分位添加
                Tbadd: function (p, $event) {
                    var $event = $event
                    p = p.replace(/,/g, "");
                    var self = this;
                    var res = '';
                    if (parseFloat(p) == p) {
                        res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                            return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                                return $1 + ",";
                            });
                        })
                        if ($event == "1") {
                            self.InvestAmount = res;
                        } else {
                            self.InvestNumber = res;
                        }
                        return false
                    } else {
                        if ($event == "1") {
                            self.InvestAmount = "";
                        } else {
                            self.InvestNumber = "";
                        }
                    }
                    return false
                },
                addInvest: function () {
                    var self = this;
                    this.BoundId = 0;
                    $('#investBound .form-group').addClass('col-md-12').removeClass('col-md-6');
                    self.isAdd = 0;
                    var executeParaminfo = {
                        SPName: 'usp_GetTrustBondByTrustId', SQLParams: [
                        //{ Name: 'trustId', value: trustId, DBType: 'int' }
                        { Name: 'trustId', value: trustId, DBType: 'int' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                        if (data.length == 0) {
                            GSDialog.HintWindow('请录入该产品的债券信息');  
                            return
                        }
                        self.TrustBondCodeList = data;
                        self.InvestName = '';//投资人名称
                        self.InvestAccount = ''; //投资人账户
                        self.InvestCode = '';
                        self.InvestAmount = '';
                        self.InvestNumber = '';
                        self.AccountName = '';
                        self.BankName = '';
                        self.Account = '';
                        self.IssueDate ='';
                        self.LegalMaturityDate = '';
                        $("#IssueDate").val('');
                        $("#LegalMaturityDate").val('');
                        self.CouponBasis = '';
                        $('#investBound .form-control').each(function () {
                            if (!common.CommonValidation.ValidControlValue($(this))) {
                                var $this = $($(this));
                                $this.removeClass('red-border');
                            }
                        });
                        self.selectedTrustBondCode = self.TrustBondCodeList[0].TrustBondCode;
                        self.dialog = $.anyDialog({
                            width: 600,
                            height: 440,
                            title: "新增投资详情",
                            html: $('#investBound').show(),
                            onClose: function () {
                            }
                        });

                    })

                },
                editInvest: function () {
                    this.isAdd = 1
                    var self = this
                    $('#investBound .form-group').addClass('col-md-12').removeClass('col-md-6');
                    var grid = $("#gridAssetDetail").data("kendoExtGrid");
                    if (grid.select().length != 1) {
                        GSDialog.HintWindow('请选择需要更的投资选项');
                    } else {
                        var executeParam = {
                            SPName: 'usp_GetTrustBondByTrustId', SQLParams: [
                                //{ Name: 'trustId', value: trustId, DBType: 'int' }
                                { Name: 'trustId', value: trustId, DBType: 'int' }
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (res) {
                            self.TrustBondCodeList = res
                            var data = grid.dataItem(grid.select());
                            self.TrustId = data.TrustId;
                            //this.TrustBondId = data.TrustBondId;
                            self.InvestName = data.InvestName;
                            self.selectedTrustBondCode = data.TrustBondCode;
                            self.RemainCount = data.RemainCount;
                            self.InvestAccount = data.InvestAccount;
                            self.AccountName = data.AccountName;
                            self.BankName = data.BankName;
                            self.Account = data.Account;
                            self.InvestAmount = data.InvestAmount != "" ? common.numFormt(data.InvestAmount) : data.InvestAmount;//这个
                            self.InvestNumber = data.InvestNumber != "" ? common.numFormt(data.InvestNumber) : data.InvestNumber;//这个
                            self.IssueDate = data.IssueDate;
                            self.LegalMaturityDate = data.LegalMaturityDate;
                            $("#IssueDate").val(data.IssueDate);
                            $("#LegalMaturityDate").val(data.LegalMaturityDate);
                            self.CouponBasis = data.CouponBasis;
                            //this.TrustBondName = data.TrustBondName;
                            self.InvestCode = data.InvestCode;
                            self.dialog = $.anyDialog({
                                width: 600,
                                height: 440,
                                title: "编辑投资详情",
                                html: $('#investBound').show(),
                                onClose: function () {
                                }
                            });
                        });

                    }
                },
                saveInvest: function () {
                    var self = this;
                    var flag = true;
                    var pattern = new RegExp("[^0-9a-zA-Z-_]");
                    var testfirst = new RegExp("[_-]");
                    //同一投资人代码不能对应同一债券代码
                    var gridData = $("#gridAssetDetail").data("kendoExtGrid").dataSource.data()
                    if (!self.check) {
                        flag = false;
                        return
                    }
                    var isFormFieldsAllValid = true;
                    $('#investBound .form-control').each(function () {

                        if (!common.CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
                    });

                    if (!isFormFieldsAllValid) {
                        $('#loading').hide();
                        return;
                    }
                    //比较日期大小
                    if ($("#IssueDate").val() != "" && $("#LegalMaturityDate").val() != "") {
                        var oneyear = parseInt($("#IssueDate").val().replace(/-/g,""));
                        var twoyear = parseInt($("#LegalMaturityDate").val().replace(/-/g, ""));
                        if (twoyear - oneyear < 0) {
                            GSDialog.HintWindow("输入日期不合理",'',false);
                            return false;
                        }
                    }

                    if (self.isAdd == 0) {
                        $.each(gridData, function (i, v) {
                            if (v.TrustBondCode == self.selectedTrustBondCode && v.InvestCode == self.InvestCode) {
                                flag = false;
                                GSDialog.HintWindow("输入不合法,同一投资人不能投资同一债券代码", function () {
                                    self.InvestCode = '';
                                    //self.check = false;   
                                }, "", false);
                                //$('#modal-close').trigger('click');
                                //GSDialog.HintWindow('同一投资人不能投资同一债券代码');
                                //$('#loading').hide();
                                //return;
                            }
                        })
                    }
                    if (testfirst.test(this.InvestCode.substring(0, 1))) {
                        return false;
                    }
                    if (pattern.test(this.InvestCode)) {
                        return false;
                    }
                    if (flag) {
                        var items = '<Items><TrustBondId>{0}</TrustBondId><TrustId>{1}</TrustId><InvestName>{2}</InvestName><InvestCode>{3}</InvestCode><InvestAccount>{4}</InvestAccount><AccountName>{5}</AccountName><BankName>{6}</BankName><Account>{7}</Account><InvestAmount>{8}</InvestAmount><TrustBondCode>{9}</TrustBondCode><TrustBondName>{10}</TrustBondName><InvestNumber>{11}</InvestNumber><Id>{12}</Id><IssueDate>{13}</IssueDate><LegalMaturityDate>{14}</LegalMaturityDate><CouponBasis>{15}</CouponBasis></Items>';

                        var iflag = 0;
                        self.isAdd == 0 ? iflag = 0 : iflag = 1
                        this.LegalMaturityDate = $("#LegalMaturityDate").val();
                        this.IssueDate = $("#IssueDate").val();
                        //这里下面的数据
                        items = items.format(this.TrustBondId, this.TrustId, this.InvestName, this.InvestCode, this.InvestAccount, this.AccountName, this.BankName, this.Account, this.InvestAmount ? this.InvestAmount.replace(/,/g, "") : this.InvestAmount, this.selectedTrustBondCode, this.TrustBondName, this.InvestNumber ? this.InvestNumber.replace(/,/g, "") : this.InvestNumber, iflag, this.IssueDate, this.LegalMaturityDate, this.CouponBasis)
                        executeParam = {
                            SPName: 'usp_TrustSaveInvestByBoundId', SQLParams: [
                                { Name: 'Items', value: items, DBType: 'string' }
                            ]
                        };
                        console.log(items);
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                            if (data[0].result == 1) {
                                $('#modal-close').trigger('click');
                                common.alertMsg('保存成功!', 1);
                                kendoGridModel().RefreshGrid();
                                self.InvestName = '';//投资人名称
                                self.InvestAccount = ''; //投资人账户
                                self.InvestCode = '';
                                self.InvestAmount = '';
                                self.InvestNumber = '';
                                self.AccountName = '';
                                self.BankName = '';
                                self.Account = '';
                                self.LegalMaturityDate = '';
                                self.IssueDate = '';
                                self.CouponBasis = '';
                                $("#LegalMaturityDate").val("");
                                $("#IssueDate").val("");
                            }
                        });
                    }

                    return
                },
                deleteInvest: function () {
                    var boundId = 0;
                    var investCode = '';
                    var grid = $("#gridAssetDetail").data("kendoExtGrid");
                    if (grid.select().length != 1) {
                        GSDialog.HintWindow('请选择需要更的投资选项');
                    } else {
                        var data = grid.dataItem(grid.select());
                        boundId = data.TrustBondId;
                        investCode = data.InvestCode;
                        if (confirm('确认删除该投资选项吗？')) {
                            var executeParam = {
                                SPName: 'usp_DeleteInvestByBoundId', SQLParams: [
                                    { Name: 'TrustBondId', value: boundId, DBType: 'int' },
                                    { Name: 'TrustId', value: trustId, DBType: 'int' },
                                    { Name: 'InvestCode', value: investCode, DBType: 'string' }
                                ]
                            };
                            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                                common.alertMsg('删除成功!', 1);
                                kendoGridModel().RefreshGrid()

                            });
                        }
                    }


                }
            },
            computed: {
                TrustBondName: function () {//投资债券名称
                    var self = this
                    var arr = $.grep(self.TrustBondCodeList, function (item, index) {
                        return item.TrustBondCode == self.selectedTrustBondCode
                    })
                    var trustBondName = arr[0] && arr[0].TrustBondName || ''
                    $(".date-plugins").date_input();
                    return trustBondName
                },
                TrustBondId: function () {//投资债券ID
                    var self = this;

                    var arr = $.grep(self.TrustBondCodeList, function (item, index) {
                        return item.TrustBondCode == self.selectedTrustBondCode
                    })
                    var TrustBondId = arr[0] && arr[0].TrustBondId
                    return TrustBondId
                }
            }
        });
    });

});
