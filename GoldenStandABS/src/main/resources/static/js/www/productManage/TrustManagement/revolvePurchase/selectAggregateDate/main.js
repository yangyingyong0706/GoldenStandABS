define(function (require) {
    var self = this;
    var $ = require('jquery');
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel'); require('gs/Kendo/kendoGridModel');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var common = require('gs/uiFrame/js/common')
    var GlobalVariable = require('globalVariable');
    var GSdialog = require('gsAdminPages');
    var qwFrame = require('app/productDesign/js/QuickWizard.FrameEnhanceCus');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var taskIndicator = require('gs/taskProcessIndicator');
    var webStorage = require('gs/webStorage');
    var height = $(window).height() - 60;
    require("kendomessagescn");
    require("kendoculturezhCN");
    var trustId = common.getQueryString('tid');
    var dataProcessUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&";
    var HostUrl = location.protocol + "//" + location.host + "/";
    if (!trustId || isNaN(trustId)) {
        alert("请从产品列表选择专项计划");
    }

    $('#clearStorge').click(function () {
        sessionStorage.clear();
    });
    function downLoadExcelForAsyn(filePath, desName, callback) {
        var xmlRequest = new XMLHttpRequest();
        var uriHostInfo = location.protocol + "//" + location.host;
        var url = uriHostInfo + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/" + "getStream?" + 'filePath=' + filePath;

        xmlRequest.open("post", url, false);
        xmlRequest.overrideMimeType('application/vnd.ms-excel;charset=x-user-defined');//这里是关键，不然 this.responseText;的长度不等于文件的长度  charset=blob
        xmlRequest.onreadystatechange = function (e) {
            if (this.readyState == 4 && this.status == 200) {
                var text = this.responseText;
                var length = text.length;
                var array = new Uint8Array(length);
                var elink = document.createElement('a');
                //elink.innerHTML = innerText;
                elink.download = desName;

                for (var i = 0; i < length; ++i) {
                    array[i] = text.charCodeAt(i);
                }
                var blob = new Blob([array], { "type": "application/octet-stream" });
                elink.href = URL.createObjectURL(blob);
                if (callback) {
                    callback(elink);
                }
                //document.getElementById(id).appendChild(elink);
                //img.src = window.URL.createObjectURL(blob);
            }
        }
        xmlRequest.send();
    }

    //设置缓存
    //sessionStorage.PoolId = BasePoolId
    //sessionStorage.PoolName = PoolName;
    //
    this.gotoCashflowsplit = function (dimreportdateId, status) {
        var tid = common.getQueryString('tid');
        var scheduleDate = dimreportdateId;
        if (dimreportdateId) {
            $('.nowDimReportDate', window.parent.document).text('当前归集日：' + dimreportdateId)
            $('.nowDimReportDate', window.parent.document).show()
        }
        var schedulePurpose = status;
        if (schedulePurpose == 0) {
            schedulePurpose = 1
        }
        //window.parent.location.href = window.location.href;
        var splitPage = $('.step>a[pageCode="split"]', window.parent.document)[0];
        var splitUrl = '../../../productDesign/stresstest/CashflowSplit/CashflowSplit.html?tid={0}&&scheduleDate={1}&schedulePurpose={2}'
        splitUrl = splitUrl.format(tid, scheduleDate, schedulePurpose);
        $('#mainContentDisplayer_0', window.parent.document)[0].src = splitUrl;
        qwFrame.ChangeSetp(splitPage);
        var scheduleDateItems = '[{ "scheduleDate":' + scheduleDate + ', "schedulePurpose":' + schedulePurpose + ' }]';
        webStorage.removeItem('scheduleDateItems');
        webStorage.setItem('scheduleDateItems', scheduleDateItems);

    }
    this.RevolvePurchasePreSale = function (dimreportDateId) {

        var trustId = common.getQueryString('tid');

        var taskCode = 'RevolvePreSale';
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            'SPName': "usp_getPoolIdFromAggregationRecords", 'SQLParams': [
                      { 'Name': 'trustId', 'Value': trustId, 'DBType': 'int' }
                    , { 'Name': 'ScheduleDateId ', 'Value': dimreportDateId, 'DBType': 'int' }
                    , { 'Name': 'SchedulePurpose', 'Value': 1, 'DBType': 'int' }
            ]
        };
        common.ExecuteGetData(true, svcUrl, 'dbo', executeParam, function (data) {
                if (data.length !=0) {
                    sVariableBuilder.AddVariableItem('ScheduleDateId', dimreportDateId, 'Int', 1, 0, 0);
                    sVariableBuilder.AddVariableItem('TrustId', trustId, 'Int', 1, 0);
                    //sVariableBuilder.AddVariableItem('TrustName', $('#selAssociatedTrust option:selected').text(), 'String', 1, 0);
                    //sVariableBuilder.AddVariableItem('PoolID', poolId, 'Int', 1, 0);
                    sVariableBuilder.AddVariableItem('TemplateFolder', 'E:\\TSSWCFServices\\PoolCut\\ConsumerLoan\\Document\\' + trustId, 'Int', 1, 0);
                    sVariableBuilder.AddVariableItem('HostUrl', HostUrl, 'String', 1, 0);
                    sVariableBuilder.AddVariableItem('SchedulePurpose', 1, 'Int', 1, 0);
                    sVariableBuilder.AddVariableItem('fileName', '{0}_{1}_PurchaseList.xlsx'.format(trustId, dimreportDateId), 'String', 1, 0);
                    sVariableBuilder.AddVariableItem('filePath', 'E:\\TSSWCFServices\\PoolCut\\Files\\Reports\\RevolvePurchase\\', 'String', 1, 0);
                    sVariableBuilder.AddVariableItem('sqlName', '[dbo].[usp_GetCyclePurchaseDownload]', 'String', 1, 0);
                    sVariableBuilder.AddVariableItem('conStr', 'Server=mssql;Database=TrustManagement;Trusted_Connection=True;MultipleActiveResultSets=True;', 'String', 1, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'ConsumerLoan',
                        taskCode: taskCode,
                        sContext: sVariable,
                        callback: function () {
                            //$('iframe[src*=basePoolContent]', parent.document)[0].contentWindow.location.reload(true);
                            //$('.ab_close', parent.document)[0].click()
                            webStorage.removeItem('scheduleDateItems');
                            var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                            var executeParam = {
                                'SPName': "[TrustManagement].[usp_GetRevolvingPurchaseListStatus]", 'SQLParams': [
                                          { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
                                        , { 'Name': 'DimreportingdateId', 'Value': dimreportDateId, 'DBType': 'int' }
                                ]
                            };
                            common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                                if (data[0].RESULT == 0) {
                                    GSdialog.HintWindow('目前没有数据，执行任务后无法生成文件！')
                                } else {
                                    window.location.reload(true);
                                    sVariableBuilder.ClearVariableItem();
                                }
                            })
                        }
                    });
                    tIndicator.show();
                }
                else {
                    GSdialog.HintWindow('请选择基础池和资产池进行组合拆分！')
                }
            })
    }
    this.ResetRevolvingPurchaseStatus = function (dimReportingDateId) {
        var trustId = common.getQueryString('tid');
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

        var executeParam = {
            'SPName': "usp_ResetRevolvingPurchaseStatus", 'SQLParams': [
                      { 'Name': 'trustId', 'Value': trustId, 'DBType': 'int' }
                    , { 'Name': 'dimreportingdateid', 'Value': dimReportingDateId, 'DBType': 'string' }
            ]
        };

        GSdialog.HintWindowTF("确认重置状态吗？", function () {
            common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                window.location.reload(true);
            })
        }, function () {
            return 0;
        })
    }
    kendo.culture("zh-CN");
    var position = common.getQueryString('position');
    var kendouiGrid = new kendoGridModel(height);
    kendouiGrid.Init({
        renderOptions: {
            //height: 400,
            rowNumber: true,
            columns: [
                         { field: "dimreportingdateid", title: '归集日期', width: "120px" },
                         {
                             field: "purchasestatus", title: '购买状态', width: "100px", template: function (purchasestatus) {
                                 var status = purchasestatus.purchasestatus;
                                 //var dimreportingdateid = purchasestatus.dimreportingdateid;
                                 var type = { '0': '未购买', '1': '已购买' };
                                 if (position == 'presale') {
                                     html = '<span>{0}</span>'.format(type[status]);
                                 }
                                 else {
                                     if (status == 1) {
                                         html = '<span>{0}</span>'.format(type[status]);
                                     } else {
                                         html = '<span>{0}</span>'.format(type[status]);
                                     }
                                 }
                                 return html;
                             }
                         },
                         {
                             field: "purchasestatus", title: '操作', width: '120px;', template: function (purchasestatus) {
                                 var status = purchasestatus.purchasestatus;
                                 var dimreportingdateid = purchasestatus.dimreportingdateid;
                                 var type = { '0': '进入循环购买', '1': '已终结' };
                                 if (position == 'presale') {
                                     if (status === 1) {
                                         html = '<a href="javascript:self.ResetRevolvingPurchaseStatus({0})" class="btn btn-default signle-btn" title="重置状态后您可以重新进行拆分">重置状态</a>'.format(dimreportingdateid);
                                     } else {
                                         html = '';
                                     }
                                 }
                                 else {
                                     html = '<a href="javascript:self.gotoCashflowsplit({1},{2})" style="color:#45569c">{0}</a>'.format(type[status], dimreportingdateid, status);
                                     //if (status == 1) {
                                     //    html = '<a href="javascript:self.gotoCashflowsplit({1},{2})" >{0}</a>'.format(type[status], dimreportingdateid, status);
                                     //} else {
                                     //    html = '<a href="javascript:self.gotoCashflowsplit({1},{2})" >{0}</a>'.format(type[status], dimreportingdateid, status);
                                     //}
                                 }
                                 return html;
                             }
                         },
                         {
                             field: "purchasestatus", title: '生成循环购买清单', width: "100px", template: function (purchasestatus) {
                                 var status = purchasestatus.purchasestatus;
                                 var dimreportingdateid = purchasestatus.dimreportingdateid;
                                 var type = { '0': '生成', '1': '' };
                                 if (position == 'aggregate') {
                                     html = '';
                                 }
                                 else {
                                     if (status === 1) {
                                         html = '';
                                     } else {
                                         html = '<a href="javascript:self.RevolvePurchasePreSale({1})" class="btn btn-default signle-btn">{0}</a>'.format(type[status], dimreportingdateid);
                                     }
                                 }

                                 return html;
                             }
                         },
                         {
                             field: "purchasestatus",
                             title: '下载循环购买清单',
                             width: "100px",
                             template: function (purchasestatus) {
                                 var status = purchasestatus.purchasestatus;
                                 var dimreportingdateid = purchasestatus.dimreportingdateid;
                                 var type = { '0': '', '1': '下载' };
                                 var position = common.getQueryString('position');

                                 if (status === 0) {
                                     html = ''
                                 } else {
                                     //var desName = trustId + "_" + dimreportingdateid + "_PurchaseList.xlsx";
                                     //var filePath = 'PoolCut/Files/Reports/RevolvePurchase/{0}_{1}_PurchaseList.xlsx'.format(trustId, dimreportingdateid);
                                     //downLoadExcelForAsyn(filePath, desName, function (datas) {
                                     //    html = '<a download={2} href={1} class="btn btn-default" >{0}</a>'.format(type[status], datas.href, datas.download);
                                     //});
                                     var reportFolder = HostUrl + 'PoolCut/Files/Reports/RevolvePurchase/{0}_{1}_PurchaseList.xlsx'.format(trustId, dimreportingdateid);
                                     html = '<a href={1} class="btn btn-default" style="padding: 0 10px; height: 25px; line-height: 25px;" >{0}</a>'.format(type[status], reportFolder);
                                 }
                                 return html;
                             }
                         }
            ]
        },
        dataSourceOptions: {
            pageSize: 20,
            otherOptions: {
                orderby: "enddate",
                direction: "",
                DBName: 'TrustManagement',
                appDomain: 'TrustManagement',
                executeParamType: 'extend',
                executeParam: function () {
                    var result = {
                        SPName: 'usp_GetRevolvingPurchaseStatus',
                        SQLParams: [
                            {
                                Name: 'TrustId', Value: trustId, DBType: 'int',
                            }
                        ],
                        //把TrustCode传到kendoGridModel里
                        //TrustCode: TrustCode
                    };
                    return result;
                }
            }
        }
    });
    $(function () {
        var tableCell = $(".table-cell");
        if (tableCell[3] != "") //当页面加载状态 
        {
            $("#loading").fadeOut();
        }
        //$('#clearStorge').click(function () {
        //    sessionStorage.clear();
        //});
        kendouiGrid.RunderGrid();
        refreshKendouGrid = function () { kendouiGrid.RefreshGrid(); }

    });
})




