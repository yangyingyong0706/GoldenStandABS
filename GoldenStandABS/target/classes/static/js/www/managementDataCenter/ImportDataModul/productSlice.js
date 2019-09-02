define(function (require) {
    var $ = require('jquery');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    require('gs/globalVariable');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    require('app/components/trustList/js/wcfProxy');
    require('app/managementDataCenter/js/manageData_interface');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var tm = require('gs/childTabModel');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');
    var appName = webStorage.getItem('showId');
    var common = require('common');
    var TrustId = common.getQueryString('TrustId');
    webProxy = require('gs/webProxy');
    require('jquery.localizationTool');
    require('bootstrap');
    var taskIndicator = require('goldenstand/taskProcessIndicator');
    var sVariableBuilder = require('goldenstand/sVariableBuilder');

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
            webStorage.setItem('userLanguage', languageCode);
            return true;
        },

        /* 
         * Translate the strings that appear in all the pages below
         */
        'strings': {
            'id:select1': {
                'en_GB': 'Continuing Report'
            },
            'id:select2': {
                'en_GB': 'office automation'
            },
            'id:select3': {
                'en_GB': 'Income distribution and results'
            },

            'id:select4': {
                'en_GB': 'Special plan management'
            }
        }
    });

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }

    var lang = {};
    var userLanguage = webStorage.getItem('userLanguage');
    var IsAdministrator = webStorage.getItem("IsAdministrator");//判断用户是否为管理员
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.dataSource = 'dataSource';
        lang.organization = 'organization';
        lang.date = 'date';
        lang.dataType = 'dataType';
        lang.AssetDataStatus = 'AssetDataStatus';
        lang.paymentDataStatus = 'paymentDataStatus';
        lang.lendingDataStatus = 'lendingDataStatus';
        lang.loanDataStatus = 'loanDataStatus';
        lang.handle = 'handle';
        lang.term = "Term";
    }
    else {
        lang.term = "期数";
        lang.dataSource = '数据源';
        lang.organization = '机构';
        lang.date = '日期';
        lang.dataType = '资产类型';
        lang.AssetDataStatus = '资产数据状态';
        lang.paymentDataStatus = '回款计划数据状态';
        lang.lendingDataStatus = '实际回款数据状态';
        lang.loanDataStatus = '放款数据状态';
        lang.handle = '操作';
    }


    var isAdmin = false;
    var filter = (IsAdministrator == '1') ? " " : lang.filter;
    var height = $(window).height() - 110;
    var kendouiGrid = new kendoGridModel(height);
    var projectStatus = 0;
    this.getOperate = function (projectId) {
        var viewPageUrl = GlobalVariable.TrustManagementServiceHostURL + 'components/trustList/TrustList.html?enter=ProjectApproval&ProjectId=' + projectId;
        var html = '<a href="javascript: openNewIframe(\'' + viewPageUrl + '\', \'getOperate' + projectId + '\', \'关联产品_' + projectId + '\');">关联产品</a>';
        return html;
    };
    this.changeSlice = function (SliceState, DataSourceId, OrganisationId, AssetTypeId, ReportDate, DataSourceCode, OrganisationCode, AssetTypeCode, Suffix) {
        if (SliceState == false) {
            return '<span style="color: #CCCCCC;">未获取</span>';
        } else if (SliceState == true) {
            return '<span style="color: #46AE30;cursor: pointer;" onclick=getSlice(' + DataSourceId + ',' + OrganisationId + ',' + AssetTypeId + ',"' + ReportDate + '"' + ',"' + DataSourceCode + '","' + OrganisationCode + '","' + AssetTypeCode + '","' + Suffix + '")>已获取</span>';
        }
    }
    this.getSlice = function (DataSourceId, OrganisationId, AssetTypeId, ReportDate, DataSourceCode, OrganisationCode, AssetTypeCode, Suffix) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var dbName = 'SFM_DAL_ADC_' + AssetTypeCode;//测试用
        var executeParam = {
            SPName: 'Asset.usp_GetSliceDataCount', SQLParams: [
                { Name: 'DBName', value: dbName, DBType: 'string' },
                { Name: 'DataSourceId', value: DataSourceId, DBType: 'int' },
                { Name: 'OrganisationId', value: OrganisationId, DBType: 'int' },
                { Name: 'AssetTypeId', value: AssetTypeId, DBType: 'int' },
                { Name: 'ReportDate', value: ReportDate, DBType: 'string' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'AssetDataCenterManagement', executeParam, function (data) {
            var sliceData = $('#sliceData');
            var append = $('#sliceData #appendMain');
            if (append) {
                append.remove()
            }
            var html = '<div id="appendMain">'
            html += '<div class="headerDiv"><span id="reportData">切片日期</span><span>' + ReportDate + '</span>'
            html += '<button class="btn btn-danger" onclick=assetDeleteTask(' + DataSourceId + ',' + OrganisationId + ',"' + ReportDate + '",' + AssetTypeId + ',"' + AssetTypeCode + '")><i class="icon iconfont icon-shanchu"></i> 删除</button>'
            html += '<button class="btn btn-default" onclick=runDataTask(' + DataSourceId + ',"' + ReportDate + '","' + DataSourceCode + '","' + OrganisationCode + '","' + AssetTypeCode + '","' + Suffix + '")>重新获取</button></div>'
            html += '<div><table><tr>'
            html += '<th>表名</th>'
            html += '<th>数据条数</th>'
            html += '<th>剩余本金</th>'
            html += '</tr>';
            $.each(data, function (i, v) {
                html += '<tr>';
                html += '<td style="text-align: left;">' + v.TableName + '</td>';
                html += '<td>' + v.TotalCount + '</td>';
                html += '<td>' + v.CurrentPrincipalBalance + '</td>';
                html += '</tr>'
            })
            html += '</table>';
            $(html).appendTo(sliceData);
            $.anyDialog({
                title: '资产数据状态',
                html: $("#sliceData").show(),
                width: 700,
                height: 'auto',
                changeallow: true
            })
        });
    }

    this.PaymentDueId = function (PaymentDueId, DueSessionId, SliceDate, DueAssetCount, DuePaymentCount, AssetTypeCode, IsMatchPayement) {
        if (PaymentDueId) {
            return '<span style="color: #46AE30;cursor: pointer;" onclick=showData(' + PaymentDueId + ',"Due"' + ',"' + SliceDate + '",' + DueAssetCount + ',' + DuePaymentCount + ',"' + DueSessionId + '","' + AssetTypeCode + '")>已获取</span>';
        } else {
            return '<span style="color: #CCCCCC;">未获取</span>';
        }
    }
    this.PaymentPaidId = function (PaymentPaidId, PaidSessionId, SliceDate, PaidAssetCount, PaidPaymentCount, AssetTypeCode, IsMatchPayement) {
        if (PaymentPaidId) {
            return '<span style="color: #46AE30;cursor: pointer;" onclick=showData(' + PaymentPaidId + ',"Paid"' + ',"' + SliceDate + '",' + PaidAssetCount + ',' + PaidPaymentCount + ',"' + PaidSessionId + '","' + AssetTypeCode + '",' + IsMatchPayement + ')>已获取</span>';
        } else {
            return '<span style="color: #CCCCCC;">未获取</span>';
        }
    }
    this.loanGroupId = function (loanGroupId, loanSessionId, SliceDate, loanGroupAssetsCount, loanGroupAssetsCount) {
        if (loanGroupId) {
            return '<span style="color: #46AE30;cursor: pointer;" onclick=showData(' + loanGroupId + ',"loan"' + ',"' + SliceDate + '",' + loanGroupAssetsCount + ',' + loanGroupAssetsCount + ',"' + loanSessionId + '")>已获取</span>';
        } else {
            return '<span style="color: #CCCCCC;">未获取</span>';
        }
    }
    this.showData = function (GroupId, enter, SliceDate, DueAssetCount, DuePaymentCount, SessionId, AssetTypeCode, IsMatchPayement) {
        var payment = $('#payment');
        var append = $('#payment #appendMain');
        var th1, th2, title;
        if (append) {
            append.remove()
        }
        if (enter == 'Paid') {
            th1 = '导入实际回款条数';
            th2 = '导入实际回款资产数量';
            title = lang.lendingDataStatus;
        } else if (enter == 'Due') {
            th1 = '导入回款计划条数';
            th2 = '导入回款计划资产数量';
            title = lang.paymentDataStatus;
        } else if (enter == 'loan') {
            th1 = '导入实际放款条数';
            th2 = '导入实际放款数量';
            title = lang.loanDataStatus;
        }
        var html = '<div id="appendMain">'
        html += '<div class="headerDiv"><span id="reportData">切片日期</span><span>' + SliceDate + '</span>'
        html += '<button class="btn btn-danger" onclick=deleteTask("' + enter + '","' + GroupId + '","' + SliceDate + '","' + AssetTypeCode + '",' + IsMatchPayement + ')><i class="icon iconfont icon-shanchu"></i> 删除</button>'
        html += '<button class="btn btn-default" onclick=getAgainTask("' + enter + '","' + SessionId + '")>重新获取</button></div>'
        html += '<div><table><tr>'
        html += '<th>' + th2 + '</th>'
        html += '<th>' + th1 + '</th>'
        html += '</tr>';
        html += '<tr>';
        html += '<td>' + DueAssetCount + '</td>';
        html += '<td>' + DuePaymentCount + '</td>';
        html += '</tr></table></div>'
        $(html).appendTo(payment);
        $.anyDialog({
            title: title,
            html: $("#payment").show(),
            width: 700,
            height: 'auto',
            changeallow: true
        })
    }
    this.getAgainTask = function (enter, value) {
        //重新获取
        //AppDomain 都是AssetDataCenter
        //参数都只有一个 LoadSessionConfig 类型 string不同数据值不同
        //回款计划：TaskCode ：ImportCashFlowOAAccountsDue_pool  值 DueSessionId  Due
        //实际回款 ： TaskCode : ImportCashFlowOAAccountsPaid_Pool 值 PaidSessionId  Paid
        //放款记录： TaskCode : ImportLoanAsset 值 loanGroupSessionId  loan
        var LoadSessionConfig = value;
        var taskCode;
        if (enter == 'Due') {
            taskCode = 'ImportCashFlowOAAccountsDue_pool';
        } else if (enter == 'Paid') {
            taskCode = 'ImportCashFlowOAAccountsPaid_Pool';
        } else {
            taskCode = 'ImportLoanAsset';
        }
        sVariableBuilder.AddVariableItem('LoadSessionConfig', LoadSessionConfig, 'String', 1, 0, 0);
        var sVariable = sVariableBuilder.BuildVariables();
        var tIndicator = new taskIndicator({
            width: 600,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'AssetDataCenter',
            taskCode: taskCode,
            sContext: sVariable,
            callback: function () {
                window.location.reload();
            }
        });
        tIndicator.show();
    }
    //删除
    //AppDomain 都是AssetDataCenter
    //回款计划：
    //TaskCode : DeleteCashlowOAGroup
    //参数：
    //GroupId  String Id

    //实际回款： 
    //TaskCode : DeleteCashFlowPaidByPayDate
    //参数: 
    //GroupId  String Id
    //PayDate String  切片日期

    //放款记录
    //TaskCode : DeleteAssetGroup
    //GroupId  String Id
    this.deleteTask = function (enter, Id, SliceDate, AssetTypeCode, IsMatchPayement) {
        var GroupId = Id;
        var taskCode;
        if (enter == 'Due') {
            taskCode = 'DeleteCashlowOAGroup';
            sVariableBuilder.AddVariableItem('GroupId', GroupId, 'String', 1, 0, 0);
            sVariableBuilder.AddVariableItem('ConnectionString', common.GetAssetTypeConfig(AssetTypeCode)[0].DBConnString, 'String', 1, 0, 0);
        } else if (enter == 'Paid') {
            taskCode = 'DeleteCashFlowPaidByPayDate';
            sVariableBuilder.AddVariableItem('PaymentPaidId', GroupId, 'String', 1, 0, 0);
            sVariableBuilder.AddVariableItem('ConnectionString', common.GetAssetTypeConfig(AssetTypeCode)[0].DBConnString, 'String', 1, 0, 0);
            sVariableBuilder.AddVariableItem('GroupId', IsMatchPayement, 'String', 1, 0, 0);
        } else {
            taskCode = 'DeleteAssetGroup';
            sVariableBuilder.AddVariableItem('GroupId', GroupId, 'String', 1, 0, 0);
        }

        var sVariable = sVariableBuilder.BuildVariables();
        var tIndicator = new taskIndicator({
            width: 600,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'AssetDataCenter',
            taskCode: taskCode,
            sContext: sVariable,
            callback: function () {
                window.location.reload();
            }
        });
        tIndicator.show();
    }
    this.handle = function (PaymentDueId, PaymentPaidId, loanGroupId, IsMatchPayement, DataSourceId, OrganisationId, SliceDate, AssetTypeId, OrganisationCode, AssetTypeCode, DataSourceCode, Suffix) {
        //'<span style="color: #45569C;cursor: pointer;" onclick=runDataTask('+DataSourceId+',"' + SliceDate + '","' + DataSourceCode + '","' + OrganisationCode + '","' + AssetTypeCode + '","' + Suffix + '")>获取数据</span>' +
        //var html = '<span style="color: #D40000;cursor: pointer;" onclick=runDeleteTask(' + PaymentDueId + ',' + PaymentPaidId + ',' + loanGroupId + ',' + IsMatchPayement + ',' + DataSourceId + ',' + OrganisationId + ',"' + SliceDate + '",' + AssetTypeId + ',"' + AssetTypeCode + '")>删除</span>';
        var html = '<span style="color: #D40000;cursor: pointer;" onclick=runDeleteTask(' + PaymentDueId + ',' + PaymentPaidId + '")>删除</span>';
        return html;
    }
    //删除task
    this.runDeleteTask = function (PaymentDueId, PaymentPaidId, loanGroupId, IsMatchPayement, DataSourceId, OrganisationId, SliceDate, AssetTypeId, AssetTypeCode) {
        var dbName = 'SFM_DAL_ADC_' + AssetTypeCode;
        var ConnectionString = common.GetAssetTypeConfig(AssetTypeCode)[0].DBConnString;
        sVariableBuilder.AddVariableItem('ReportDate', SliceDate, 'String', 1, 0, 0);
        sVariableBuilder.AddVariableItem('DBName', dbName, 'String', 1, 0, 0);
        sVariableBuilder.AddVariableItem('OrganisationId', OrganisationId, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('AssetTypeId', AssetTypeId, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('DataSourceId', DataSourceId, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('PaymentDueId', PaymentDueId ? PaymentDueId : 0, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('PaymentPaidId', PaymentPaidId ? PaymentPaidId : 0, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('loanGroupId', loanGroupId ? loanGroupId : 0, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('IsMatchPayement', IsMatchPayement ? IsMatchPayement : 0, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('ConnectionString', ConnectionString, 'String', 0, 0, 0);
        var sVariable = sVariableBuilder.BuildVariables();
        var tIndicator = new taskIndicator({
            width: 600,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'AssetDataCenter',
            taskCode: 'AssetDataCenterTruncate',
            sContext: sVariable,
            callback: function () {
                window.location.reload();
            }
        });
        tIndicator.show();
    }
    //资产删除task
    this.assetDeleteTask = function (DataSourceId, OrganisationId, SliceDate, AssetTypeId, AssetTypeCode) {
        var dbName = 'SFM_DAL_ADC_' + AssetTypeCode;//测试用
        //"DBName""DataSourceId""OrganisationId""AssetTypeId""ReportDate"
        sVariableBuilder.AddVariableItem('ReportDate', SliceDate, 'String', 1, 0, 0);
        sVariableBuilder.AddVariableItem('DBName', dbName, 'String', 1, 0, 0);
        sVariableBuilder.AddVariableItem('OrganisationId', OrganisationId, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('AssetTypeId', AssetTypeId, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('DataSourceId', DataSourceId, 'String', 0, 0, 0);//需要传入DataSourceid
        var sVariable = sVariableBuilder.BuildVariables();
        var tIndicator = new taskIndicator({
            width: 600,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'AssetDataCenter',
            taskCode: 'AssetDataCenterTruncate',
            sContext: sVariable,
            callback: function () {
                window.location.reload();
            }
        });
        tIndicator.show();
    }
    //获取数据task   , OrganisationCode, AssetTypeCode
    this.runDataTask = function (DataSourceId, SliceDate, DataSourceCode, OrganisationCode, AssetTypeCode, Suffix) {
        var reportdateid = SliceDate.replace(/-/g, '');
        var fileName = 'AI_' + DataSourceCode + '_' + OrganisationCode + '_' + AssetTypeCode + '_' + reportdateid + Suffix;
        var suffix = fileName.substr(fileName.lastIndexOf("."))
        var sourceFilePath = 'E:\\TSSWCFServices\\Resource_AssetDataCenter\\Files\\PoolImportData\\' + fileName;
        var taskCodes = { 'AUTO': 'ConsumerLoanDataLoad_AUTO', 'RMBS': 'ConsumerLoanDataLoad_RMBS', 'CLO': 'ConsumerLoanDataLoad_CLO', 'ConsumerLoan': 'ConsumerLoanDataLoad_ConsumerLoan_Product', 'ABN': 'ConsumerLoanDataLoad_ABN', 'CreditCard': 'ConsumerLoanDataLoad_CreditCard', 'Receivables': 'ConsumerLoanDataLoad_Receivables', 'MarginTrading': 'ConsumerLoanDataLoad_MarginTrading' };
        var taskCode = taskCodes[AssetTypeCode];
        //taskCode = "ConsumerLoanDataLoad_ConsumerLoan_Product";
        if ((AssetTypeCode == "ConsumerLoan" && suffix == ".csv") || (AssetTypeCode == "ConsumerLoan" && suffix == ".CSV")) {
            taskCode = "ConsumerLoanDataLoad_ConsumerLoan_Product_CSV";
        }
        sVariableBuilder.AddVariableItem('Reporting_Date', SliceDate, 'String', 1, 0, 0);
        sVariableBuilder.AddVariableItem('SourceFileName', sourceFilePath, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('Organisation', OrganisationCode, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('AssetType', AssetTypeCode, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('TrustCode', '', 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('DataSourceId', DataSourceId, 'String', 0, 0, 0);//需要传入DataSourceid
        sVariableBuilder.AddVariableItem('IsTopUp', 0, 'Int', 0, 0, 0);
        sVariableBuilder.AddVariableItem('Suffix', suffix, 'String', 0, 0, 0);

        var sVariable = sVariableBuilder.BuildVariables();

        var tIndicator = new taskIndicator({
            width: 900,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'AssetDataCenter',
            taskCode: taskCode,
            sContext: sVariable,
            callback: function () {
                window.location.reload();
            }
        });
        tIndicator.show();
    }
    function openNewIframe(page, trustId, tabName, cb) {
        var pass = true;
        parent.viewModel.tabs().forEach(function (v, i) {
            if (v.id == trustId) {
                pass = false;
                parent.viewModel.changeShowId(v);
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
            parent.viewModel.tabs.push(newTab);
            parent.viewModel.changeShowId(newTab);
            $('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
            $('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
        };
    }
    var productManageFunction = '/GoldenstandABS/www/managementDataCenter/manageDataFunction.json';
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        productManageFunction = '/GoldenstandABS/www/managementDataCenter/manageDataFunction_en.json';
    }
    GSAdmin.init(productManageFunction, function () {
        viewModel = new tm();
        $('.home-tab').click(function () {
            viewModel.goList();
        });
        viewModel.init();
    });
    var AssetAggregationStatsForTrust = new kendoGridModel(height);

    var CashFlowPoolListOptions = {
        renderOptions: {
            columns: [
                //{ field: "DataSource", title: lang.dataSource, width: "100px" },
                //{ field: "Organisation", title: lang.organization, width: "100px" },
                { field: "Term", title: lang.term, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "SliceDate", title: lang.date, width: "150px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                //{ field: "SliceState", title: lang.AssetDataStatus, width: 150, template: "#=this.changeSlice(SliceState,DataSourceId,OrganisationId,AssetTypeId,SliceDate,DataSourceCode,OrganisationCode,AssetTypeCode,Suffix)#", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { title: lang.AssetDataStatus, width: 150, template: "#=this.changeSlice('',1,1,1,SliceDate,'','','','')#", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "PaymentDueId", title: lang.paymentDataStatus, width: 150, template: "#=this.PaymentDueId(PaymentDueId,DueSessionId,SliceDate,DueAssetCount ,DuePaymentCount)#", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "PaymentPaidId", title: lang.lendingDataStatus, width: 150, template: "#=this.PaymentPaidId(PaymentPaidId,PaidSessionId,SliceDate,PaidAssetCount,PaidPaymentCount,IsMatchPayement)#", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                //{ field: "IsDeleted", title: lang.handle, width: 150, template: "#=this.handle(PaymentDueId,PaymentPaidId,loanGroupId,IsMatchPayement,DataSourceId,OrganisationId,SliceDate,AssetTypeId,OrganisationCode,AssetTypeCode,DataSourceCode,Suffix)#", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
                { field: "IsDeleted", title: lang.handle, width: 150, template: "#=this.handle(PaymentDueId,PaymentPaidId)#", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
            ]
        },
        dataSourceOptions: {
            pageSize: 20,
            otherOptions: {
                orderby: "Term",
                direction: "asc",
                DBName: 'TrustManagement',
                appDomain: 'dbo',
                executeParamType: 'extend',
                defaultfilter: filter,
                executeParam: function () {
                    var result = {
                        SPName: 'usp_GetListWithPager',
                        SQLParams: [
                                { Name: 'DBName', Value: 'TrustManagement', DBType: 'string' },
                                { Name: 'tableName', Value: 'Asset.view_DataSlice', DBType: 'string' },
                                { Name: 'KeyName', Value: 'Term', DBType: 'string' },
                                { Name: 'defaultWhere', Value: 'AND TrustId =' + TrustId, DBType: 'string' }
                        ],
                    };
                    return result;
                }
            }
        },
    }
    $(function () {
        kendo.culture("zh-CN");
        //初始化相关资产池
        AssetAggregationStatsForTrust.Init(CashFlowPoolListOptions);
        AssetAggregationStatsForTrust.RunderGrid();
        $('#loading').hide()
    });
    function changeWidth(obj) {
        var w = $(".main").width();
        obj.css("width", w + "px");
    }
    //阻止grid滚动条的默认行为
    function preventDef(e) {
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        e.cancelBubble = true;
        e.returnValue = false;
    }
    $(".k-grid-content").scroll(function (e) {
        preventDef(e)
    })
    changeWidth($(".chrome-tabs-shell"));
    $(window).resize(function () {
        var a = $(window).height() - 105;
        if ($("#modal-win", window.parent.document).hasClass("icon icon-window-restore")) {
            a -= 40;
        }
        $("#grid").height(a);
        $("#grid").children(".k-grid-content").height(a - 73)
        $("#grid").children(".k-grid-content-locked").height(a - 73)
    })
    $(window).resize()
});