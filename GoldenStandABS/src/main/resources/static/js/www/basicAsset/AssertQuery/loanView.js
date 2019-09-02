var loanViewModel;

requirejs(['../../../asset/lib/config'], function (config) {
    require(['Vue', 'globalVariable', 'jquery', 'kendo.all.min', 'kendomessagescn', 'common', 'app/basicAsset/AssertQuery/js/kendoHelper', 'callApi', 'app/basicAsset/AssertQuery/js/core', 'app/productManage/TrustManagement/Common/Scripts/linq.min', 'app/basicAsset/AssertQuery/js/taskIndicatorScript', 'app/basicAsset/AssertQuery/js/layer', 'app/basicAsset/AssertQuery/js/loading', 'date_input', 'gsAdminPages', 'App.Global', 'gs/webStorage', 'gs/taskProcessIndicator', 'gs/sVariableBuilder', 'gs/webProxy','app/managementDataCenter/js/manageData_interface'],
        function (Vue, gv, $, kendo, kendozhCN, common, kendoH, CallApi, core, linq, TaskProcessIndicatorHelper, layer, loading, date_input, GSDialog, appGlobal, webStorage, taskIndicator, sVariableBuilder, webProxy) {
            var self = this;
            var CallWCFSvc = appGlobal.CallWCFSvc;
            var params = [];
            var allTrusts = [];//所有的产品列表
            var filterTrusts = [];//过滤后的产品列表

            var allOrganisations = [];//所有的机构名称列表
            var allAssetTypes = [];//所有的资产类型列表
            var userName = sessionStorage.getItem('gs_UserName');

            //页面传参
            var ReportingDateId = common.getQueryString('ReportingDateId') ? common.getQueryString('ReportingDateId') : common.currentDateId();
            var OrganisationCode = common.getQueryString('OrganisationCode') ? common.getQueryString('OrganisationCode') : "all";
            var TrustCode = common.getQueryString('TrustCode') ? common.getQueryString('TrustCode') : "all";
            var AssetType = common.getQueryString('AssetType') ? common.getQueryString('AssetType') : "SFM_DAL_AUTO";

            

            loanViewModel = new Vue({
                el: '#loanView',
                data: {
                    lifeCycleStatusLevel2List: [{ ItemCode: 'all', ItemAliasValue: "所有" }],
                    filterModel: {
                        ReportingDateId: ReportingDateId,//common.currentDateId(),
                        OrganisationCode: OrganisationCode,//"all", //资产方
                        TrustCode: TrustCode,//"all",//项目
                        AssetType: AssetType//"SFM_DAL_AUTO"
                    },
                    statistics: { Total: "0", ApprovalAmount_Total: "0", CurrentPrincipalBalance_Total: "0", reportingDateID: '' },
                    AdvanceFilterCondition: null
                },
                watch: {
                    'filterModel.OrganisationCode': {
                        handler: function () {
                            this.trustFilters();
                        }
                    },
                    'filterModel.AssetType': {
                        handler: function () {
                            this.trustFilters();
                        }
                    }
                },
                methods: {
                    //根据勾选资产更新统计数据
                    GetAmount: function (accountNoItem) {
                        var whereString = kendoH.listWhereString;
                        var self = this;
                        var callApi = new CallApi(self.filterModel.AssetType, 'dbo.usp_GetLoanAmount', true);
                        callApi.AddParam({ Name: 'userName', Value: webStorage.getItem('gs_UserName'), DBType: 'string' });
                        callApi.AddParam({ Name: 'accountNoItem', Value: accountNoItem ? accountNoItem : '', DBType: 'string' });
                        callApi.AddParam({ Name: 'dimReportingDateId', Value: self.filterModel.ReportingDateId.replace(/-/g, ""), DBType: 'string' });
                        //callApi.AddParam({ Name: 'dimTrustId', Value: self.filterModel.TrustCode, DBType: 'string' });
                        callApi.AddParam({ Name: 'where', Value: whereString, DBType: 'string' });
                        callApi.ExecuteDataTable(function (response) {
                            if (!response || response.length < 1) { return; }
                            var json = response[0]
                            self.statistics = {
                                Total: (json.Total ? json.Total.toLocaleString() : 0),
                                ApprovalAmount_Total: (json.ApprovalAmount_Total ? json.ApprovalAmount_Total.toLocaleString() : 0),
                                CurrentPrincipalBalance_Total: (json.CurrentPrincipalBalance_Total ? json.CurrentPrincipalBalance_Total.toLocaleString() : 0),
                                reportingDateID: (json.reportingDateId ? self.intToDate(json.reportingDateId) : '')
                            }
                        });
                    },

                    trustFilters: function () {
                        //Organisation filter
                        this.getLoanFilters();
                        var OrganisationCode = this.filterModel.OrganisationCode || '';
                        if (OrganisationCode && OrganisationCode != 'all') {
                            filterTrusts = $.grep(allTrusts, function (n, i) {
                                if (n && n.ItemCode == 'all') return false;
                                var thisDimOrganisationID = n.DimOrganisationID;
                                return thisDimOrganisationID == OrganisationCode;
                            });
                        } else {
                            filterTrusts = allTrusts;//reset trust list
                        }
                       
                        //AssetType filter
                        var that = this;
                        if (allAssetTypes.find(function (vl) { return vl.ItemCode === that.filterModel.AssetType }) == undefined) {
                            this.filterModel.AssetType = 'SFM_DAL_AUTO';
                            kendoH.kendoComboBox({ DomId: '#AssetType', Data: allAssetTypes, Value: this.filterModel.AssetType, NoAll: true });

                        }
                        var AssetType = this.filterModel.AssetType;
                        if (AssetType) {
                            filterTrusts = $.grep(filterTrusts, function (n, i) {
                                if (n && n.ItemCode == 'all') return false;
                                n.AssetType = (n.AssetType == 'ABN') ? 'Main' : n.AssetType;
                                var thisTrustType = 'SFM_DAL_' + n.AssetType;
                                return thisTrustType == AssetType;
                            });
                        }

                        //产品下拉数据
                        kendoH.kendoComboBox({ DomId: '#TrustSelect', Data: filterTrusts, Value: this.filterModel.TrustCode, NoAll: true });
                    },
                    getLoanFilters: function () {
                        var that = this;
                        //Get Asset Types
                        var executeParam = { SPName: 'dbo.usp_GetDimAssetID', SQLParams: [] };
                        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                        var serviceUrl = gv.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;
                        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                            if (data) {
                                if (allAssetTypes.length == 0) {
                                    $.each(data, function (key, value) {
                                        allAssetTypes.push({ ItemCode: value.DBName, ItemAliasValue: value.AssetTypeDesc });
                                    });
                                }
                            }

                            //资产类型下拉数据
                            kendoH.kendoComboBox({ DomId: '#AssetType', Data: allAssetTypes, Value: that.filterModel.AssetType, NoAll: true });

                        });

                        var callApi = new CallApi('TrustManagement', 'dbo.usp_GetLoanFilters', true);
                        callApi.AddParam({ Name: 'ItemAliasSetName', Value: 'zh-CN', DBType: 'string' });
                        callApi.AddParam({ Name: 'AssetType', Value: this.getAssetTypeCode(this.filterModel.AssetType), DBType: 'string' });
                        callApi.AddParam({ Name: 'OrganisationId', Value: this.filterModel.OrganisationCode, DBType: 'string' });
                        callApi.AddParam({ Name: 'UserName', Value: userName, DBType: 'string' });
                        callApi.ExecuteDataSet(function (response) {
                            $('#ReportingDateId').date_input();
                            $('#ReportingDateId').val(that.filterModel.ReportingDateId)

                            if (response && response[0]) {
                                allOrganisations = response[0];
                            }

                            if (response && response[1]) {
                                allTrusts = response[1];
                            }

                            //机构名称下拉数据
                            kendoH.kendoComboBox({ DomId: '#OrganisationSelect', Data: allOrganisations, Value: that.filterModel.OrganisationCode });

                            //产品下拉数据
                            kendoH.kendoComboBox({ DomId: '#TrustSelect', Data: allTrusts, Value: that.filterModel.TrustCode });

                        });
                    },
                    getAssetTypeCode: function (AssetTypeDec) {
                        var AssetType = "";
                        $.each(allAssetTypes, function (key, value) {
                            if (value.ItemCode == AssetTypeDec) {
                                if (AssetTypeDec == "SFM_DAL_Main") {
                                    AssetType = "ABN";
                                }
                                else {
                                    AssetType = value.ItemCode.split('_')[2];
                                }
                            }
                        })
                        return AssetType;
                    },
                    insideSelector: function (event) {
                        var offset = $(".date_selector").position();
                        var offsetParent = $(".date_selector").offsetParent(),
                        // Get correct offsets 
                        parentOffset = /^body|html$/i.test(offsetParent[0].tagName) ? { top: 0, left: 0 } : offsetParent.offset();
                        var t = offset.top + parentOffset.top, l = offset.left + parentOffset.left;
                        var b = t + $(".date_selector").outerHeight(), r = l + $(".date_selector").outerWidth();
                        return event.pageY < b && event.pageY > t && event.pageX < r && event.pageX > l
                    },
                    dataClick: function () {
                        var that = this;
                        $(".filter_box.filterBox_hider").click(function (e) {
                            var target = $(e.target)[0];
                            var off = !that.insideSelector(event);
                            if (target != $("#ReportingDateId")[0] && off) {
                                $(".date_selector").hide()
                            } else {
                                var open = $(".date_selector").is(":hidden");
                                if (open && target == $("#ReportingDateId")[0]) {
                                    $(".date_selector").show()
                                }
                            }
                        })
                    },
                    renderGrid: function () {
                        var that = this;
                        var height = $(window).height() - 150;
                        //that.filterModel.ReportingDateId = $("#ReportingDateId").val();
                        kendoH.KendoGrid({
                            domId: "#grid",
                            dataSource: {
                                connectionName: that.filterModel.AssetType,
                                spName: 'dbo.usp_GetAssetDetailsQuery',
                                reportingDateId: that.filterModel.ReportingDateId.replace(/-/g, ""),
                                userName: webStorage.getItem('gs_UserName')
                            },
                            height: height,
                            orderBy: 'TrustCode, AccountNo',
                            reorderable: false,
                            columns: [
                                 {
                                     title: "",
                                     width: '50px',
                                     headerTemplate: function () {
                                         var t = '<input type="checkbox" id="checkAll" onclick="selectAll(this)""/>';
                                         return t
                                     },
                                     template: function () {
                                         var t = '<input type="checkbox" class="selectbox" onclick="selectCurrent(this)"/>';
                                         return t
                                     }, locked: true
                                 },
                                 { field: "AccountNo", title: '资产编号', width: "150px", locked: true, template: that.getOperate("#=DimReportingDateID#", "#=DimTrustID#", "#=AccountNo#", that.filterModel.AssetType, that.filterModel.TrustCode, that.filterModel.OrganisationCode, that.filterModel.ReportingDateId) },
                                 { field: "CustomerCode", title: '客户编号', width: "250px" },
                                 { field: "TrustCode", title: '产品标识', width: "250px" },
                                 { field: "LoanStartDate", title: '起始日', width: "150px", format: "{0: yyyy-MM-dd}" },
                                 { field: "LoanMaturityDate", title: '到期日', width: "150px", format: "{0: yyyy-MM-dd}" },
                                 { field: "ApprovalAmount", title: '合同金额(元)', width: "150px", format: "{0:n}" },
                                 { field: "CurrentPrincipalBalance", title: '贷款本金余额（元）', width: "150px", format: "{0:n}" },
                                 { field: "PaymentType", title: '还款方式', width: "240px" },
                                 { field: "CurrentRate", title: '当前执行利率（%）', width: "150px" },
                                 { field: "PayDay", title: '每期还款日', width: "150px" },
                                 { field: "LoanTerm", title: '合同期数（月）', width: "150px" },
                                 { field: "Seasoning", title: '账龄（月）', width: "120px" },
                                 { field: "RemainingTerm", title: '剩余期数（月）', width: "150px" },
                                 { field: "InterestBasis", title: '计息基础', width: "150px" },
                                 { field: "InterestPaymentType", title: '计息周期', width: "150px" },
                            ],
                            fieldsSchema: {
                                AccountNo: { type: "string" },
                                DimReportingDateID: { type: "string" },
                                DimTrustID: { type: "string" },
                                TrustCode: { type: "string" },
                                CustomerCode: { type: "string" },
                                LoanStartDate: { type: "date" },
                                LoanMaturityDate: { type: "date" },
                                ApprovalAmount: { type: 'number' },
                                CurrentRate: { type: 'number' },
                                LoanTerm: { type: 'number' },
                                PaymentType: { type: 'string' },
                                PaymentDay: { type: 'number' },
                                PMT: { type: 'number' },
                                PrincipalPayment: { type: 'number' },
                                InterestPayment: { type: 'number' },
                                CurrentPrincipalBalance: { type: 'number' },
                                Seasoning: { type: 'number' },
                                RemainingTerm: { type: 'number' },
                            },
                            selection: params,
                            custEvents: {
                                filter: that.statisticsDataBind,
                            },
                            fnCustomizeFilter: function () {
                                var filter = '';//' and DimReportingDateID = (select max(DimReportingDateID) from dbo.AssetDetails where DimReportingDateID <= ' + that.filterModel.ReportingDateId.replace(/-/g, "") + ')';

                                if (that.filterModel.OrganisationCode != 'all') {
                                    if (!isNaN(that.filterModel.OrganisationCode))
                                        filter += " and DimOrganisationID='" + that.filterModel.OrganisationCode + "' ";
                                    else
                                        filter += " and DimOrganisationID='-1' ";
                                }
                                if (that.filterModel.TrustCode != 'all') {
                                    if (!isNaN(that.filterModel.TrustCode))
                                        filter += " and DimTrustID='" + that.filterModel.TrustCode + "' ";
                                    else
                                        filter += " and DimTrustID='-1' ";
                                }
                                return filter;

                            }

                        });

                    },
                    //获取资产详情信息
                    getOperate: function (reportingDateId, trustId, accountNo, assetType, TrustCode, OrganisationCode, ReportingDateId) {

                        var html = "";
                        var LoanUrL = 'loanDetails.html?AccountNo=' + accountNo + '&ReportingDateId=' + reportingDateId + '&TrustId=' + trustId + '&AssetType=' + assetType + '&TrustCode=' + TrustCode + '&OrganisationCode=' + OrganisationCode + '&ReportingDateIdinfo=' + ReportingDateId;
                        html += '<a href="' + LoanUrL + '">' + accountNo + '</a>';
                        return html;
                    },
                    openLoanDetail: function (LoanUrL) {
                        parent.frameModel.setFrameSrc("loanDetails", "资产详情", LoanUrL);
                    },

                    //获取机构详情信息
                    getOrganisationDetail: function (OrganisationName, OrganisationID) {
                        // var OrganisationId = 1;
                        var html = "";
                        var AssetUrl = './project/organizationConfig.html?organizationId=' + OrganisationID;
                        html += '<a href="javascript:void(0);" onclick="loanViewModel.openAssetDetail(\'' + AssetUrl + '\');">' + OrganisationName + '</a>';
                        return html;
                    },
                    openAssetDetail: function (AssetUrl) {

                        parent.frameModel.setFrameSrc("OrganisationId", "机构详情", AssetUrl);
                    },
                    //获取用户详情信息
                    getCustomerDetails: function (customerName, certificateType, certificateNo) {
                        var html = '';
                        var CustomerUrl = './basic/customer.html?CertificateType=' + certificateType + '&CertificateNo=' + certificateNo;
                        html += '<a href="javascript:void(0);" onclick="loanViewModel.openCustomerDetail(\'' + CustomerUrl + '\');">' + customerName + '</a>';
                        return html;
                    },
                    openCustomerDetail: function (CustomerUrl) {
                        parent.frameModel.setFrameSrc("CustomerDetails", "用户详情", CustomerUrl);
                    },
                    clearFilter: function () {
                        this.filterModel.ReportingDateId = common.currentDateId();
                        this.filterModel.OrganisationCode = "all"; //资产方
                        this.filterModel.TrustCode = "all";//项目
                        params = [];
                        $(".tips").hide()
                        $("#OrganisationSelect").data("kendoComboBox").value(this.filterModel.OrganisationCode);
                        $("#TrustSelect").data("kendoComboBox").value(this.filterModel.TrustCode);
                    },

                    dataFilter: function () {
                        if (!common.checkdate($("#ReportingDateId")[0])) {
                            $(".filter_box.filterBox_hider").hide()
                            return false;
                        }
                        params = [];
                        $(".tips").hide()
                        this.renderGrid();
                        $(".filter_box.filterBox_hider").hide()
                        //刷新数据
                        $("#grid").data('kendoGrid').dataSource.read();
                        $("#grid").data('kendoGrid').refresh();
                    },

                    statisticsDataBind: function () {
                        var whereString = kendoH.listWhereString;
                        var self = this;
                        var callApi = new CallApi(self.filterModel.AssetType, 'dbo.usp_GetLoanStatistics', true);
                        callApi.AddParam({ Name: 'userName', Value: webStorage.getItem('gs_UserName'), DBType: 'string' });
                        callApi.AddParam({ Name: 'reportingDateID', Value: self.filterModel.ReportingDateId.replace(/-/g, ""), DBType: 'string' });
                        callApi.AddParam({ Name: 'where', Value: whereString, DBType: 'string' });
                        callApi.ExecuteDataTable(function (response) {
                            if (!response || response.length < 1) { return; }
                            var json = response[0]
                            self.statistics = {
                                Total: (json.Total ? json.Total.toLocaleString() : 0),
                                ApprovalAmount_Total: (json.ApprovalAmount_Total ? json.ApprovalAmount_Total.toLocaleString() : 0),
                                CurrentPrincipalBalance_Total: (json.CurrentPrincipalBalance_Total ? json.CurrentPrincipalBalance_Total.toLocaleString() : 0),
                                reportingDateID: (json.reportingDateId ? self.intToDate(json.reportingDateId) : '')
                            }
                        });
                    },
                    intToDate: function (iDate) {
                        iDate = iDate ? iDate.toString() : iDate;
                        return iDate ? (iDate.length == 8 ? (iDate.substr(0, 4) + '-' + iDate.substr(4, 2) + '-' + iDate.substr(6, 2)) : iDate) : iDate;
                    },
                    downloadExcel: function () {
                        if (!window.checkall && params.length == 0) {
                            GSDialog.HintWindow("请勾选资产");
                            return false;
                        }
                        var str = "";
                        $.each(params, function (i, v) {
                            str += v + ","
                        })
                        var len = str.length - 1;
                        str = str.substring(0, len)

                        var whereString = kendoH.listWhereString;
                        var assetType = this.filterModel.AssetType.substring(8);
                        assetType = assetType == 'Main' ? 'ABN' : assetType;

                        //invoke task engine
                        var dimReportingDateID = this.filterModel.ReportingDateId.replace(/-/g, "");
                        var sPName = 'dbo.usp_GetAssetDetailsExportData';
                        var randomNum = (new Date()).getTime();

                        sVariableBuilder.AddVariableItem('dbName', this.filterModel.AssetType, 'String', 0, 0, 0);
                        sVariableBuilder.AddVariableItem('sPName', sPName, 'String', 0, 0, 0);
                        sVariableBuilder.AddVariableItem('dimReportingDateID', dimReportingDateID, 'String', 0, 0, 0);
                        sVariableBuilder.AddVariableItem('assetType', assetType, 'String', 0, 0, 0);
                        sVariableBuilder.AddVariableItem('accountNoItem', str, 'String', 0, 0, 0);
                        sVariableBuilder.AddVariableItem('randomNum', randomNum, 'String', 0, 0, 0);
                        sVariableBuilder.AddVariableItem('where', whereString, 'String', 0, 0, 0);

                        var sVariable = sVariableBuilder.BuildVariables();

                        var tIndicator = new taskIndicator({
                            width: 500,
                            height: 550,
                            clientName: 'TaskProcess',
                            appDomain: 'Task',
                            taskCode: 'ExportBasicAssetData',
                            sContext: sVariable,
                            callback: function () {
                                var sessionId = sessionStorage.getItem('sessionId');
                                webProxy.getSessionProcessStatusList(sessionId, "Task", function (response) {
                                    for (let i = 0; i < response.GetSessionProcessStatusListResult.List.length; i++) {
                                        if (response.GetSessionProcessStatusListResult.List[i].ActionStatus != "Success") {
                                            return false;
                                        }
                                    }
                                    //download
                                    var t = $("<a><span id='ac'></span></a>");
                                    var url = "/TrustManagementService/TrustFiles/DownLoadFiles/AssetInfo_" + randomNum + ".xlsx";
                                    t.attr("href", url);
                                    t.appendTo($("body"));
                                    $('#ac').trigger("click");
                                    t.remove();
                                });

                                sessionStorage.removeItem('sessionId');

                            }
                        });
                        tIndicator.show();

                    },
                    fnDoResearch: function (wherestring) {
                        this.AdvanceFilterCondition = wherestring;

                        $("#grid").data('kendoGrid').dataSource.read();
                        $("#grid").data('kendoGrid').refresh();
                    },
                    VoucherTool: function () {
                        $(".filter_box").stop().hide(0);
                        $(".seachShow").removeClass("seachStyle2")
                        $(".gsc-advfilter").stop().slideToggle(300);
                        $(".VoucherBox").toggleClass("seachStyle2")
                        $(".filterMask").toggleClass("filterBox_hider")
                    },
                    //手动跑批更新数据
                    updateData: function () {

                        var tpi = new TaskProcessIndicatorHelper(false);
                        tpi.ShowIndicator('CreditFactory', 'updateDateInPage', function () { layer.alert('导入成功！'); });
                    }
                },
                created: function () {
                    this.getLoanFilters();
                },

                ready: function () {
                    var self = this;
                    //获取筛选参数
                    var TrustCode = common.getQueryString("TrustCode");
                    var ReportingDateId = common.getQueryString("ReportingDateId");
                    var OrganisationCode = common.getQueryString("OrganisationCode");
                    var AssetType = common.getQueryString("AssetType");
                    if (TrustCode || ReportingDateId || OrganisationCode || AssetType) {
                        //console.log(ReportingDateId)
                        self.filterModel.ReportingDateId = ReportingDateId;
                        self.filterModel.OrganisationCode = OrganisationCode;
                        self.filterModel.TrustCode = TrustCode;
                        self.filterModel.AssetType = AssetType;
                    };
                    this.dataClick();
                    //this.getLoanFilters();
                    this.renderGrid();
                    Search.registerSearchEvent();
                    $(window).resize(function () {
                        var a = $(window).height() - 150
                        $("#grid").height(a);
                        $("#grid").children(".k-grid-content").height(a - 80)
                        $("#grid").children(".k-grid-content-locked").height(a - 100)
                    })
                    $(window).resize()
                }
            });

            //全选框
            selectAll = function (that) {
                var that = that;
                var str = "";
                window.checkall ? window.checkall = !window.checkall : "";
                if ($("#checkAll").is(':checked')) {
                    var arry = $(".selectbox");
                    $.each(arry, function (i, v) {
                        $(v).prop("checked", true);
                        var aco = $($(v).parent().next().html()).text();
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
                        params.remove($($(v).parent().next().html()).text());
                    })
                    $("#infomation").html("已经勾选" + params.length + "条数据,")
                    $("#opration").html("勾选全部" + window.total + "条数据");
                }
                $.each(params, function (i, v) {
                    str += v + ","
                })
                var len = str.length - 1;
                str = str.substring(0, len);
                loanViewModel.GetAmount(str);
            }
            selectCurrent = function (that) {
                var that = that;
                var arry = $(".selectbox");
                var off = true;
                var str = "";
                $.each(arry, function (i, v) {
                    if (!v.checked) {
                        off = false;
                    }
                })
                if (window.checkall && $(".tips").css("display") == "block") {
                    window.checkall = false;
                    $.each(arry, function (i, v) {
                        var aco = $($(v).parent().next().html()).text();
                        if (v.checked && params.indexOf(aco) == -1) {
                            params.push(aco);
                        }
                    })
                }

                if ($(that).is(':checked')) {
                    params.push($($(that).parent().next().html()).text());
                } else {
                    params.remove($($(that).parent().next().html()).text());
                }
                $("#infomation").html("已经勾选" + params.length + "条数据,");
                $("#opration").html("勾选全部" + window.total + "条数据");
                if (params.length > 0) {
                    $(".tips").show()
                } else {
                    $(".tips").hide()
                }
                if (off) {
                    $("#checkAll").prop("checked", true);
                    window.checkall ? window.checkall = !window.checkall : "";
                    //$(".tips").show()
                } else {
                    $("#checkAll").prop("checked", false);
                    //$(".tips").hide()
                }
                $.each(params, function (i, v) {
                    str += v + ","
                })
                var len = str.length - 1;
                str = str.substring(0, len);
                loanViewModel.GetAmount(str);

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
                    loanViewModel.GetAmount();
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

        });

});