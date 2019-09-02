define(function (require) {
    var $ = require('jquery');
    var toast = require('toast');
    var common = require('common');
    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');
    var webProxy = require("webProxy");
    var Vue = require("Vue2");
    var trustId = common.getUrlParam('tid');
    var enter = common.getUrlParam('enter');
    var PoolDBName = common.getUrlParam('PoolDBName');
    var adminDiaLog = require('gs/uiFrame/js/gs-admin-2.pages');
    var GSDialog = require("gsAdminPages");
    var echarts = require('echarts');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var kendoGrid = require('kendo.all.min');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    require("kendomessagescn");
    require("kendoculturezhCN");
    require("date_input");
    require('bootstrap');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');
    var IsAdministrator = webStorage.getItem("IsAdministrator")
    var lang = "and (userName = '" + userName + "' or IsCheck=0)";
    var filter = (IsAdministrator == '1') ? " " : lang;
    var xhrOnProgress = function (fun) {
        xhrOnProgress.onprogress = fun;
        return function () {
            var xhr = $.ajaxSettings.xhr();
            if (typeof xhrOnProgress.onprogress !== 'function')
                return xhr
            if (xhrOnProgress.onprogress && xhr.upload) {
                xhr.upload.onprogress = xhrOnProgress.onprogress;
            }
            return xhr
        }
    }
    if (enter) {
        PoolDBName = PoolDBName
    } else {
        PoolDBName = 'TrustManagement'
    }
    var vm = new Vue({
        el: '#app',
        data: {
            nowUseCreateTime: '',
            CreateTimes: [],
            enterShow: true,
            PoolIdList: []
        },
        created: function () {
            this.GetCreateTime();
            this.GetPoolIdList();
        },
        mounted: function () {
            this.showOff()
        },
        methods: {
            showOff: function () {
                if (enter) {
                    this.enterShow = false
                }
            },
            GetCreateTime: function () {
                var self = this;
                var TrustId = parseInt(trustId);
                var executeParam = {
                    'SPName': "usp_GetCashFlowOADueVersion", 'SQLParams': [
                        { 'Name': 'TrustId', 'Value': TrustId, 'DBType': 'int' }
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                    self.CreateTimes = data;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].IsUsing === 1) {
                            self.nowUseCreateTime = data[i].CreateTime;
                        }
                    }
                });
            },
            GetPoolIdList: function () {
                var self = this;
                var TrustId = parseInt(trustId);
                var AppDomain = PoolDBName ? PoolDBName : "TrustManagement";
                var executeParam = {
                    'SPName': "TrustManagement.usp_GetPoolIdsByTrustId", 'SQLParams': [
                        { 'Name': 'TrustId', 'Value': TrustId, 'DBType': 'int' }
                    ]
                };
                common.ExecuteGetData(true, svcUrl, AppDomain, executeParam, function (data) {
                    self.PoolIdList = data;
                });

            },
            //获取最新现金流拆分信息
            GetNewCashflowResult: function(PoolId){
                sVariableBuilder.AddVariableItem('TrustId', trustId, 'int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('PoolId', PoolId, 'int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('ConnectionString', "Data Source=MSSQL;Initial Catalog=" + (PoolDBName ? PoolDBName : "TrustManagement") + ";Integrated Security=SSPI;", 'String', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();
                console.log(sVariable)
                var tIndicator = new taskIndicator({
                    width: 500,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'ConsumerLoan',
                    taskCode: 'GetLatestCashFlowInfo',
                    sContext: sVariable,
                    callback: function () {
                        sVariableBuilder.ClearVariableItem();
                        location.reload(true);
                    }
                });
                tIndicator.show();
            },
            ChangeCreateTime: function (nowUseCreateTime) {
                var self = this;
                GSDialog.HintWindowTF('将会清空实际回款，确定切换回款计划吗？', function () {
                    var TrustId = parseInt(trustId);
                    sVariableBuilder.AddVariableItem('TrustId', trustId, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('ConnectionString', "Data Source=MSSQL;Initial Catalog=" + PoolDBName + ";Integrated Security=SSPI;", 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('CreateTime', nowUseCreateTime, 'String', 0, 0, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: 'ChangeCashFlowOADueVersion', //'DateInfoWizard',
                        sContext: sVariable,
                        callback: function () {
                            //window.location.href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                            sVariableBuilder.ClearVariableItem();
                            //保存完的跳转
                            window.location.reload(true);
                        }
                    });
                    tIndicator.show();
                });
            },
            ClearPlan: function () {
                var TrustId = parseInt(trustId);
                GSDialog.HintWindowTF('确定清除所有数据吗？', function () {
                    var TrustId = parseInt(trustId);
                    sVariableBuilder.AddVariableItem('TrustId', trustId, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('ConnectionString', "Data Source=MSSQL;Initial Catalog=" + PoolDBName + ";Integrated Security=SSPI;", 'String', 0, 0, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: 'DeleteCashFlowOAAccountsDue', //'DateInfoWizard',
                        sContext: sVariable,
                        callback: function () {
                            //window.location.href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                            window.location.href = window.location.href;
                            sVariableBuilder.ClearVariableItem();
                            //保存完的跳转
                            if (parent.location.href.indexOf('ModelRefreshIndex') > 0) {
                                if (parent.qwFrame) {   
                                    parent.qwFrame.GotoStep(stepCode);
                                }
                            }
                        }
                    });
                    tIndicator.show();
                });
            },
            GeneratePaid: function () {
                var TrustId = parseInt(trustId);
                if (enter) {
                    GSDialog.open('生成实际回款', './ImportLastDate.html?tid=' + trustId + '&enter=assets' + '&PoolDBName=' + PoolDBName, '', '', 500, 350, "", true, false, true, false)
                } else {
                    GSDialog.open('生成实际回款', './ImportLastDate.html?tid=' + trustId, '', '', 500, 350, "", true, false, true, false)
                }
            },
            //刷新回款数据
            refreshData: function () {
                sVariableBuilder.AddVariableItem('TrustId', trustId, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('ConnectionString', "Data Source=MSSQL;Initial Catalog=" + PoolDBName + ";Integrated Security=SSPI;", 'String', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 500,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: 'UpdateCashFlowAccountAjust', //'DateInfoWizard',
                    sContext: sVariable,
                    callback: function () {
                        //window.location.href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                        window.location.href = window.location.href;
                        sVariableBuilder.ClearVariableItem();
                        //保存完的跳转
                        if (parent.location.href.indexOf('ModelRefreshIndex') > 0) {
                            if (parent.qwFrame) {
                                parent.qwFrame.GotoStep(stepCode);
                            }
                        }
                    }
                });
                tIndicator.show();
            },
            viewdata: function () {
                var pass = true;
                parent.parent.viewModel.tabs().forEach(function (v, i) {
                    if (v.id == trustId) {
                        pass = false;
                        parent.parent.viewModel.changeShowId(v);
                        return false;
                    }
                })
                if (pass) {
                    var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/TrustFollowUp/CashflowManagement/CashflowViewData.html?tid=" + trustId;
                    var tabName = '查看数据' + trustId;
                    var newTab = {
                        id: trustId,
                        url: page,
                        name: tabName,
                        disabledClose: false
                    };
                    parent.parent.viewModel.tabs.push(newTab);
                    parent.parent.viewModel.changeShowId(newTab);
                    $('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
                    $('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
                };
            },
            //导入回款计划
            ImportRepaymentPlan: function () {
                if (enter) {
                    GSDialog.open('导入回款计划', './ImportFileWithTemplate.html?trustId=' + trustId + '&uploadType=RepaymentPlan' + '&enter=' + enter + '&PoolDBName=' + PoolDBName, '', '', 600, 250, "", true, false, true, false)
                } else {
                    GSDialog.open('导入回款计划', './ImportFileWithTemplate.html?trustId=' + trustId + '&uploadType=RepaymentPlan', '', '', 600, 250, "", true, false, true, false)
                }
            },
            //导入回款数据
            ImportPaymentData: function () {
                if (enter) {
                    GSDialog.open('导入回款数据', './ImportFileWithTemplate.html?trustId=' + trustId + '&uploadType=PaymentData' + '&enter=' + enter + '&PoolDBName=' + PoolDBName, '', '', 600, 250, "", true, false, true, false)
                } else {
                    GSDialog.open('导入回款数据', './ImportFileWithTemplate.html?trustId=' + trustId + '&uploadType=PaymentData', '', '', 600, 250, "", true, false, true, false)
                }
            }

        }
    })
    $(function () {
        $("#loading").hide()
        //上传数据
        $("#UpCashflowDetails").click(function () {
            var filePath = $('#ImportCashFlowOAAccounts').val();
            var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
            var args = 'trustId=' + trustId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);
            if (fileType !== 'xls' && fileType !== 'xlsx') {
                GSDialog.HintWindow('文件不是XLS或XLSX文件');
                return;
            }
            var fileData = document.getElementById('ImportCashFlowOAAccounts').files[0]
            $.ajax({
                url: GlobalVariable.DataProcessServiceUrl + 'CommonFileUpload?' + args,
                type: 'POST',
                data: fileData,
                cache: false,
                dataType: 'json',
                processData: false, // Don't process the files
                //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
                xhr: xhrOnProgress(function (e) {
                    var percent = Math.floor(e.loaded / e.total * 100);
                    if (percent > 0) {
                        $(".progress").eq(0).css("display", "block");
                        $(".progress").eq(0).find(".progress-bar").css("width", percent + "%");
                        $(".progress").eq(0).find(".progress-bar>span").html("" + percent + "%");
                    }
                    if (percent == 100) {
                        $(".progress").eq(0).css("display", "none");
                    }
                }),
                success: function (data) {
                    var path = data.CommonTrustFileUploadResult;
                    UpCashflowDetailsTaskProcess(path)

                },
                error: function (data) {
                    GSDialog.HintWindow('上传文件错误');;
                }
            })
        })
        //调用导入现金流详细信息task
        function UpCashflowDetailsTaskProcess(filePath) {
            var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\' + fileName;
            sVariableBuilder.AddVariableItem('FilePath', fileDirectory, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('TrustId', trustId, 'String', 0, 0, 0);
            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'ConsumerLoan',
                taskCode: 'ImportCashFlowOAAccounts',
                sContext: sVariable,
                callback: function () {
                    sVariableBuilder.ClearVariableItem();
                    location.reload(true);
                }
            });
            tIndicator.show();

        }
        //选择文件函数
        function inputFileClick() {
            $(".input_file_style").find("input").change(function () {
                var value = $(this)[0].value;
                if (value != "") {
                    $(this).next()[0].innerHTML = "浏览";
                    value = value.substring(value.lastIndexOf('\\') + 1);
                    $(this).parent().prev().html(value);
                    $(this).parent().next().show();
                } else {
                    $(this).next()[0].innerHTML = "选择文件";
                    $(this).parent().prev().html("");
                    $(this).parent().next().hide();
                }
            })
        }
        inputFileClick();
    })
    //渲染表格
    function RenderGrid() {
        var h = $("body").height() - 110;
        var kendouiGrid = new kendoGridModel(h);
        var AssetAggregationStatsForTrust = new kendoGridModel(h);

        this.RenderAccountNo = function (AccountNo) {
            return "<span class='AccountNo'>" + AccountNo + "</span>"
        }
        this.RenturnPayDate = function (PayDate_Paid) {
            return "<input class='PayDate_Paid input_style date-plugins' value='" + PayDate_Paid + "' style='width:100%' autocomplete='off' disabled>"
        }
        this.RenturnPrincipalAmt = function (PrincipalAmt_Paid) {
            PrincipalAmt_Paid = PrincipalAmt_Paid ? PrincipalAmt_Paid : 0
            PrincipalAmt_Paid = common.numFormt(PrincipalAmt_Paid)
            return "<input class='PrincipalAmt_Paid input_style' value='" + PrincipalAmt_Paid + "' style='width:100%' autocomplete='off' disabled>"
        }
        this.RenturnInterestAmt = function (InterestAmt_Paid) {
            InterestAmt_Paid = InterestAmt_Paid ? InterestAmt_Paid : 0
            InterestAmt_Paid = common.numFormt(InterestAmt_Paid)
            return "<input class='InterestAmt_Paid input_style' value='" + InterestAmt_Paid + "' style='width:100%' autocomplete='off' disabled>"
        }
        this.RenturnAnnotate = function (Annotate) {
            Annotate = Annotate ? Annotate : ''
            return "<textarea class='Annotate' value='" + Annotate + "' style='width:100%' disabled>" + Annotate + "</textarea>"
        }
        this.RenturnPayTerm = function (PayTerm) {
            return "<span class='PayTerm'>" + PayTerm + "</span>"
        }
        //编辑行
        this.EditItem = function (event) {
            var target = event;
            var index = $(target).parent().parent().index();
            var PayDate_Paid = $(target).parents(".k-grid-content-locked").next().find(".PayDate_Paid").eq(index);
            var PrincipalAmt_Paid = $(target).parents(".k-grid-content-locked").next().find(".PrincipalAmt_Paid").eq(index);
            var InterestAmt_Paid = $(target).parents(".k-grid-content-locked").next().find(".InterestAmt_Paid").eq(index);
            var Annotate = $(target).parents(".k-grid-content-locked").next().find(".Annotate").eq(index);
            var dataUid = target.parentElement.parentElement.getAttribute('data-uid');
            if ($(target)[0].className.indexOf('icon-edit') > -1) {
                $(target).removeClass('icon-edit').addClass('icon-cinema');
                $(target).attr('title', '只读');
                PayDate_Paid.removeAttr("disabled");
                PrincipalAmt_Paid.removeAttr("disabled");
                InterestAmt_Paid.removeAttr("disabled");
                Annotate.removeAttr("disabled");
                //自动补全
                var row = $('[data-uid = "' + dataUid + '"]');
                var duedate = row[1].childNodes[0].textContent;  //计划日期
                var duePrincipal = row[1].childNodes[3].textContent;//计划本金
                var dueInterest = row[1].childNodes[6].textContent//计划利息
                //补全
                if (row[1].childNodes[2].firstChild.value == '')
                    row[1].childNodes[2].firstChild.value = duedate;
                if (row[1].childNodes[5].firstChild.value == '0')
                    row[1].childNodes[5].firstChild.value = duePrincipal;
                if (row[1].childNodes[8].firstChild.value == '0')
                    row[1].childNodes[8].firstChild.value = dueInterest;
            } else {
                $(target).attr('title', '编辑');
                $(target).removeClass('icon-cinema').addClass('icon-edit');
                PayDate_Paid.attr("disabled", "disabled");
                PrincipalAmt_Paid.attr("disabled", "disabled");
                InterestAmt_Paid.attr("disabled", "disabled");
                Annotate.attr("disabled", "disabled");
            }
        }
        this.RenturnEdit = function () {
            return "<button class='btn btn-link editBtn icon icon-edit' onclick='EditItem(this)' title='编辑'></button>"
        }
        var pageIndex = 0;
        var selectedRowIndex = -1;
        if (enter) {
            var CashFlowPoolListOptions = {
                renderOptions: {
                    detailInit: detailInit,
                    dataBound: function () {
                        if (this.pager.page() == 1 && !sessionStorage.getItem("pageone")) {
                            sessionStorage.setItem("pageone", 1);
                        } else {
                            sessionStorage.setItem("pageone", this.pager.page());
                        }
                        //锚链接定位展开
                        $(".k-icon.k-i-expand").click(function () {
                            var pagetwo = $(this).parent().next().find(".AccountNo").html()
                            sessionStorage.setItem("pagetwo", pagetwo);
                            var distop = $(this).parent().offset().top - 98 + $("#grid>.k-grid-content").scrollTop();
                            $("#grid>.k-grid-content").animate({ "scrollTop": distop }, 50)
                        })
                    },
                    columns: [
                        { field: "AccountNo", title: "资产编号", width: "150px", template: '#=AccountNo?this.RenderAccountNo(AccountNo):""#' },
                        { field: "TotalPayTerm", title: "合同期限", width: "120px" },
                        { field: "ApprovalAmount", title: "合同金额", width: "180px", format: "{0:n}" },
                        { field: "PrincIpalRemaing", title: "剩余本金", width: "180px", format: "{0:n}" },
                        { field: "ReamainingTerm", title: "剩余期数", width: "120px" },
                        { field: "PaymentType", title: "还本付息方式", width: "150px" },
                        { field: "ImportedTerm", title: "已导入期数", width: "100px" },
                        { field: "Rate", title: "利率", width: "120px" },
                        { field: "Account_Status", title: "状态", width: "120px" },
                        { field: "", title: "", width: "auto" }
                    ]
                },
                dataSourceOptions: {
                    pageSize: 20,
                    otherOptions: {
                        orderby: "AccountNo",
                        direction: "desc",
                        DBName: 'TrustManagement',
                        appDomain: PoolDBName,
                        executeParamType: 'extend',
                        executeParam: function () {
                            var result = {
                                SPName: 'TrustManagement.usp_GetCashFlowAccountsByTrustId',
                                SQLParams: [
                                       {
                                           Name: 'TrustId', Value: trustId, DBType: 'string',
                                       }
                                ],
                                //把TrustCode传到kendoGridModel里
                            };
                            return result;
                        }
                    }
                },
            }
            AssetAggregationStatsForTrust.Init(CashFlowPoolListOptions);
            AssetAggregationStatsForTrust.RunderGrid();
        } else {
            RenderGridModel()
            function RenderGridModel() {
                var CashFlowPoolListOptions = {
                    detailInit: detailInit,
                    dataBound: function () {
                        if (this.pager.page() == 1 && !sessionStorage.getItem("pageone")) {
                            sessionStorage.setItem("pageone", 1);
                        } else {
                            sessionStorage.setItem("pageone", this.pager.page());
                        }
                        //锚链接定位展开
                        $(".k-icon.k-i-expand").click(function () {
                            var pagetwo = $(this).parent().next().find(".AccountNo").html()
                            sessionStorage.setItem("pagetwo", pagetwo);
                            var distop = $(this).parent().offset().top - 98 + $("#grid>.k-grid-content").scrollTop();
                            $("#grid>.k-grid-content").animate({ "scrollTop": distop }, 50)
                        })
                    },
                    renderOptions: {
                        detailInit: detailInit,
                        dataBound: function () {
                            if (this.pager.page() == 1 && !sessionStorage.getItem("pageone")) {
                                sessionStorage.setItem("pageone", 1);
                            } else {
                                sessionStorage.setItem("pageone", this.pager.page());
                            }
                            //锚链接定位展开
                            $(".k-icon.k-i-expand").click(function () {
                                var pagetwo = $(this).parent().next().find(".AccountNo").html()
                                sessionStorage.setItem("pagetwo", pagetwo);
                                var distop = $(this).parent().offset().top - 98 + $("#grid>.k-grid-content").scrollTop();
                                $("#grid>.k-grid-content").animate({ "scrollTop": distop }, 50)
                            })
                        },
                        columns: [
                            { field: "AccountNo", title: "资产编号", width: "120px", template: '#=AccountNo?this.RenderAccountNo(AccountNo):""#' },
                            { field: "TotalPayTerm", title: "合同期限", width: "100px" },
                            { field: "ApprovalAmount", title: "合同金额", width: "150px", format: "{0:n}" },
                            { field: "PrincIpalRemaing", title: "剩余本金", width: "150px", format: "{0:n}" },
                            { field: "ReamainingTerm", title: "剩余期数", width: "100px" },
                            { field: "PaymentType", title: "还本付息方式", width: "150px" },
                            { field: "ImportedTerm", title: "已导入期数", width: "100px" },
                            { field: "Rate", title: "利率", width: "80px" },
                            { field: "Account_Status", title: "状态", width: "80px" },
                            { field: "", title: "", width: "auto" }
                        ]
                    },
                    dataSourceOptions: {
                        pageSize: 20,
                        otherOptions: {
                            orderby: "AccountNo",
                            direction: "desc",
                            DBName: 'TrustManagement',
                            appDomain: 'TrustManagement',
                            executeParamType: 'extend',
                            executeParam: function () {
                                var result = {
                                    SPName: 'usp_GetCashFlowAccountsByTrustId',
                                    SQLParams: [
                                           {
                                               Name: 'TrustId', Value: trustId, DBType: 'string',
                                           }
                                    ],
                                    //把TrustCode传到kendoGridModel里
                                };
                                return result;
                            }
                        }
                    },
                }
                AssetAggregationStatsForTrust.Init(CashFlowPoolListOptions);
                AssetAggregationStatsForTrust.RunderGrid();
            }
        }
    }

    RenderGrid()
    function detailInit(e) {
        var pageIndex = 0;
        var selectedRowIndex = -1;
        var AccountNo = e.data.AccountNo;//获取当前点击的资产编号
        var cashflowListTwo = []//第二层数据（期数等信息）
        var h = $("body").height() - 110;
        var dish = h - 130;
        var pages = Math.floor((dish - 40 - 46) / 35) < 0 ? 1 : Math.floor((dish - 40 - 46) / 35);
        var pageslist = [pages, 20, 30, 40]
        var po;
        var executeParams = {
            SPName: 'TrustManagement.usp_GetCashFlowOAAccountsByAccount', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                { Name: 'AccountNo', value: AccountNo, DBType: 'string' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, PoolDBName, executeParams, function (eventData) {
            if (eventData.length > 0) {
                cashflowListTwo = eventData;
            }

        });

        var option = {
            dataSource: cashflowListTwo,
            scrollable: true,
            sortable: true,
            pageable: true,
            filterable: true,
            height: dish,
            reorderable: true,//列的排序,选择一列可以拖动改变她的顺序
            resizable: true,//动态改变列的宽度,在scrollable为true的时候有效,scrollable默认为true
            pageable: {
                pageSizes: true,
                buttonCount: 5,
                page: 1,
                pageSize: pages,
                pageSizes: pageslist,
            },
            dataBound: function () {
                if (this.pager.page() == 1 && !sessionStorage.getItem("pagethree")) {
                    sessionStorage.setItem("pagethree", 1);
                } else {
                    sessionStorage.setItem("pagethree", this.pager.page());
                }
                $(".date-plugins").date_input()
            },
            //计划回款日，新计划回款日，实际回款日，计划回款本金，新计划回款本金，实际回款本金，计划回款利息，新计划回款利息，实际回款利息，状态，逾期\早偿金额
            columns: [
                { field: '', width: '70px', 'title': '编辑', template: '#=this.RenturnEdit()#', locked: true },
                { field: 'PayTerm', width: '100px', title: '期数', template: '#=this.RenturnPayTerm(PayTerm)#', locked: true },
                { field: "PayDate_Due", width: "135px", title: '计划回款日' },
                { field: "PayDate_Adjustment", title: "新计划回款日", width: "150px" },
                { field: "PayDate_Paid", title: "实际回款日", width: "135px", template: '#=this.RenturnPayDate(PayDate_Paid)#' },//可修改
                { field: "PrincipalAmt_Due", title: "计划回款本金", width: "150px", format: "{0:n}" },
                { field: "PrincipalAmt_Adjustment", title: "新计划回款本金", width: "150px", format: "{0:n}" },
                { field: "PrincipalAmt_Paid", title: "实际回款本金", width: "150px", format: "{0:n}", template: '#=this.RenturnPrincipalAmt(PrincipalAmt_Paid)#' },//可修改
                { field: "InterestAmt_Due", title: "计划回款利息", width: "150px", format: "{0:n}", format: "{0:n}" },
                { field: "InterestAmt_Adjustment", title: "新计划应还利息", width: "150px", format: "{0:n}" },
                { field: "InterestAmt_Paid", title: "实际回款利息", width: "150px", format: "{0:n}", template: '#=this.RenturnInterestAmt(InterestAmt_Paid)#' },//可修改
                { field: "Account_Status", title: "状态", width: "120px" },
                { field: "AmountDiff", title: "逾期\\早偿金额", width: "150px", format: "{0:n}" },
                { field: "Annotate", title: "注释", width: "200px", template: '#=this.RenturnAnnotate(Annotate)#' },//可修改
            ]
        }
        $("<div/>").appendTo(e.detailCell).kendoGrid(option);
        $("<button class='btn btn-default saveGrid'>保存</button>").appendTo(e.detailCell)
        SaveItem(AccountNo, cashflowListTwo)
    }

    //点击保存按钮保存数据
    function SaveItem(AccountNo, cashflowListTwo) {
        var AccountNo = AccountNo;
        var cashflowListTwo = cashflowListTwo;
        $(".saveGrid").click(function () {
            var PayTermList = $(this).prev().find(".PayTerm")
            var PayDatePaidList = $(this).prev().find(".PayDate_Paid");//实际回款日
            var PrincipalAmtPaidList = $(this).prev().find(".PrincipalAmt_Paid");//实际回款本金
            var InterestAmtPaidList = $(this).prev().find(".InterestAmt_Paid")//实际回款利息
            var AnnotateList = $(this).prev().find(".Annotate")//注释
            var xml = "<table>"
            $.each(cashflowListTwo, function (i, v) {
                for (k = 0; k < PayTermList.length; k++) {
                    if (v.PayTerm == PayTermList.eq(k).html()) {
                        if (PrincipalAmtPaidList.eq(k).val() == "") {
                            PrincipalAmtPaidList.eq(k).val(0)
                        }
                        if (InterestAmtPaidList.eq(k).val() == "") {
                            InterestAmtPaidList.eq(k).val(0)
                        }
                        if (v.InterestAmt_Paid != InterestAmtPaidList.eq(k).val().replace(/,/g, "") || v.PrincipalAmt_Paid != PrincipalAmtPaidList.eq(k).val().replace(/,/g, "") || v.PayDate_Paid != PayDatePaidList.eq(k).val() || v.Annotate != AnnotateList.eq(k).val()) {
                            var date = PayDatePaidList.eq(k).val() == '' ? '1900-01-01' : PayDatePaidList.eq(k).val()
                            xml += "<row>" + "<TrustId>" + trustId + "</TrustId>" + "<DueDate>" + v.PayDate_Due + "</DueDate>" + "<AccountNo>" + AccountNo + "</AccountNo>" + "<PayTerm>" + PayTermList.eq(k).html() + "</PayTerm>" + "<PayDate>" + date + "</PayDate>" + "<PrincipalAmt_Paid>" + PrincipalAmtPaidList.eq(k).val().replace(/,/g, "") + "</PrincipalAmt_Paid>" + "<InterestAmt_Paid>" + InterestAmtPaidList.eq(k).val().replace(/,/g, "") + "</InterestAmt_Paid>" + "<Annotate>" + AnnotateList.eq(k).val() + "</Annotate>" + "</row>"
                        }
                    }
                }
            })
            xml += "</table>"
            var executeParams = {
                SPName: 'TrustManagement.usp_UpdateCashFlowOAAccountsByAccount', SQLParams: [
                    { Name: 'Xml', value: xml, DBType: 'xml' },
                    { Name: 'TrustId', value: trustId, DBType: 'int' },
                    { Name: 'AccountNo', value: AccountNo, DBType: 'string' }]
            };
            $("#mask").show()
            common.ExecuteGetData(true, svcUrl, PoolDBName, executeParams, function (eventData) {
                var pageone = sessionStorage.getItem("pageone")
                var pagetwo = sessionStorage.getItem("pagetwo");
                var pagethree = sessionStorage.getItem("pagethree");
                $(".chart-box").hide();
                $("#grid").data('kendoExtGrid').dataSource.read();
                $("#grid").data('kendoExtGrid').refresh();
                $("#mask").hide();
                $.toast({type: "success", message: '保存成功', afterHidden: function () {
                    var indexlist = $(".AccountNo")
                    $.each(indexlist, function (i, v) {
                        if (v.innerHTML == pagetwo) {
                            $(".k-icon.k-i-expand").eq(i).parent().parent().trigger("click");
                            var item = $("#grid").data("kendoExtGrid").select()
                            var data = $("#grid").data("kendoExtGrid").dataItem(item);
                            //$.each(cashflowListOne, function (j, k) {
                            //    if (k.AccountNo == v.innerHTML) {
                            //        data.set("ApprovalAmount", k.ApprovalAmount)
                            //        data.set("PrincIpalRemaing", k.PrincIpalRemaing)
                            //        data.set("Rate", k.Rate)
                            //        data.set("Status", k.Status)
                            //        data.set("ImportedTerm", k.ImportedTerm)
                            //        data.set("PaymentType", k.PaymentType)
                            //        data.set("ReamainingTerm", k.ReamainingTerm)
                            //        return false
                            //    }
                            //})
                            $(".k-icon.k-i-expand").eq(i).trigger("click")
                            return false;
                        }
                    })
                    $("#grid .k-grid.k-widget.k-display-block").data("kendoGrid").dataSource.page(pagethree)
                }})
            });
        })
    }
    function RenderFoldline() {//渲染折线图
        $("#grid").on("click", ".AccountNo", function () {
            var AccountNo = this.innerText;
            var TrustId = trustId;
            $.anyDialog({
                title: '资产回款折线图',
                html: $(".chart-box").show(),
                width: 900,
                height: 500,
                changeallow: false

            })
            var appDomain;
            var executeParams = {
                SPName: 'TrustManagement.usp_GetCashFlowOAAccountsByAccount', SQLParams: [
                    { Name: 'TrustId', value: trustId, DBType: 'int' },
                    { Name: 'AccountNo', value: AccountNo, DBType: 'string' },
                ]
            };
            appDomain = PoolDBName
            //var executeParams = {
            //    SPName: 'usp_GetCashFlowOAAccountsByAccount', SQLParams: [
            //        { Name: 'TrustId', value: trustId, DBType: 'int' },
            //        { Name: 'AccountNo', value: AccountNo, DBType: 'string' },
            //    ]
            //};
            common.ExecuteGetData(true, svcUrl, appDomain, executeParams, function (eventData) {
                var data = eventData;
                //PrincipalAmt_Due 计划回款本金
                var PrincipalAmtDue = [];
                //PrincipalAmt_Paid 实际回款本金
                var PrincipalAmtPaid = [];
                //PrincipalAmt_Adjustment 调整后应还本金
                var PrincipalAmtAdjustment = [];
                var xzb = [];//x轴坐标
                $.each(data, function (i, v) {
                    PrincipalAmtDue.push(v.PrincipalAmt_Due);
                    PrincipalAmtPaid.push(v.PrincipalAmt_Paid);
                    PrincipalAmtAdjustment.push(v.PrincipalAmt_Adjustment);
                    xzb.push('第' + v.PayTerm + '期')
                })
                var linechart = echarts.init(document.getElementById('linechart'));
                var linechartOption = {
                    title: {
                        text: '',
                        x: "center",
                        textStyle: {
                            fontFamily: 'Microsoft Yahei',
                            fontSize: 14,
                            fontWeight: '700',
                        },
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    animation: false,
                    dataZoom: [{
                        xAxisIndex: [0],
                        type: 'inside',
                        show: true,
                        start: 0,
                        end: 100,
                        type: 'slider',
                        height: 18,
                        bottom: 0,
                        fillerColor: 'rgba(144,197,237,0.2)',   // 填充颜色
                        handleColor: 'rgba(0,0,0,0.3)',    // 手柄颜色
                        borderColor: "#ddd",                     //边框颜色。  
                        filterMode: 'filter',
                        throttle: 0,
                        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                        handleSize: '80%',
                        handleStyle: {
                            color: '#fff',
                            shadowBlur: 3,
                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                            shadowOffsetX: 2,
                            shadowOffsetY: 2
                        },
                        backgroundColor: "#f7f7f7", /*背景 */
                        dataBackground: { /*数据背景*/
                            lineStyle: {
                                color: "#dfdfdf"
                            },
                            areaStyle: {
                                color: "#dfdfdf"
                            }
                        },
                        fillerColor: "rgba(220,210,230,0.6)", /*被start和end遮住的背景*/
                        labelFormatter: function (value, params) { /*拖动时两端的文字提示*/
                            var str = "";
                            if (params.length > 15) {
                                str = params.substring(0, 15) + "…";
                            } else {
                                str = params;
                            }
                            return str;
                        },

                    }],
                    legend: {
                        data: ['计划回款本金', '实际回款本金', '新计划应还本金'],
                        x: 'left'
                    },
                    xAxis: [
                        {
                            type: 'category',
                            boundaryGap: false,
                            data: []
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            axisLabel: {
                                formatter: '{value}'
                            }
                        }
                    ],
                    series: [
                        {
                            name: '计划回款本金',
                            type: 'line',
                            data: [],

                        },
                        {
                            name: '实际回款本金',
                            type: 'line',
                            data: [],
                        },
                         {
                             name: '新计划应还本金',
                             type: 'line',
                             data: [],
                         }
                    ]
                };
                linechartOption.xAxis[0].data = xzb
                linechartOption.series[0].data = PrincipalAmtDue;
                linechartOption.series[1].data = PrincipalAmtPaid;
                linechartOption.series[2].data = PrincipalAmtAdjustment;
                linechartOption.title.text = AccountNo;
                linechart.setOption(linechartOption)
                $("html, body").animate({ scrollTop: $(document).height() }, 30);

            });
        })
    }
    RenderFoldline();
    //刷新页面
    $(".k-pager-refresh.k-link").click(function () {
        location.reload(true)
    })
    $('.btn-group').each(function () {
        $(this).find('.dropdown-menu').css('min-width', $(this).width());
        $(this).find('#CreateTime').css('left', $(this).width() - 1)
    })

    //日期校验
    $("#grid").on("change", ".PayDate_Paid", function () {
        console.log(this);
        common.checkDateNew(this, true)
    })
    //千分位添加
    $("#grid").on("keyup", ".PrincipalAmt_Paid", function () {
        common.MoveNumFormt(this)
    })
    $("#grid").on("keyup", ".InterestAmt_Paid", function () {
        common.MoveNumFormt(this)
    })
    
    //增值税率设置
    $("#VATSetup").click(function () {
        GSDialog.open('增值税率设置', './VATSetup.html?tid=' + trustId, '', '', 600, 560)
    })
    $('.select').hover(function () {
        $(this).find('.ribbonGroup_wrap').stop().slideDown()
    }, function () {
        $(this).find('.ribbonGroup_wrap').stop().slideUp()
    })
    
})