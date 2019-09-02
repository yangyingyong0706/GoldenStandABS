define(function (require) {
    var $ = require('jquery');
    require('jquery.datagrid');
    require('jquery.datagrid.options');
    var page = require('./js/PagerList');
    var GlobalVariable = require('globalVariable');
    require('date_input');
    var kendouGrid = require('./AssetDetailListKendoGrid');
    var common = require('common');
    var webProxy = require('../wcfProxy');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    ko.mapping = mapping;
    require("kendomessagescn");
    require("kendoculturezhCN");
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');

    var trustId = common.getQueryString('tid');
    var assetType = '';
    var planAsset = false;
    var accountAsset = false;
    var trustPoolCloseDate = '';
    var trustCode = '';
    var ReportingDate = '';
    specialType = "RMBS";
    var FileVaraible = {
        count: 0,
        filePath: ""
    }

    $(function () {
        //loading
        //if (document.readyState == "complete") //当页面加载状态 
        //{
        //    $("#loading").fadeOut();
        //}
        initReportDate(); //初始化报告日期
        date_input_func();
        Init();
        $("#uploadSelect>input").mouseup(uploadMethodSelect);
        page.PagerListModule.Init(page.listCategory.AssetDetails, 'usp_GetAssetDetailsWithPager', trustId,
            GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
            '#divDataList');

        page.PagerListModule.FetchMetaData({
            SPName: 'usp_GetTrustPeriod', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                { Name: 'TrustPeriodType', value: 'CollectionDate_NW', DBType: 'string' }
            ]
        }, function (data) {
            var html = '';//'<option value="">所有</option>';
            sortData(data, 'OptionValue');
            $.each(data, function (i, item) {
                var t = item.EndDate ? common.getStringDate(item.EndDate).dateFormat('yyyy-MM-dd') : '';
                html += '<option value="' + t + '">' + t + '</option>';
            });
            $('#selPayDateFilter').html(html);
            //PagerListModule.DataBind(function (haveData) { });
            kendo.culture("zh-CN");
            kendouGrid.kgAssetDetail.RunderGrid();  //加载资产信息列表
            kendouGrid.kgAssetPoolList.RunderGrid();   //加载相关资产池列表
            $('#gridAssetPoolList').css('display', 'none');

        });
        $("#btnStatistics").anyDialog({
            width: "",	// 弹出框内容宽度
            height: "", // 弹出框内容高度
            title: '统计视图',	// 弹出框标题
            url: './statistics/statisticsReport.html?trustId=' + trustId,
            size: "bigwindow",
            changeallow: false,
            scrolling:false,
            draggable: false
        });
        $("#interest_adjustments_div").find("input[data-attr='interest_adjustments_PoolCloseDate']").val(trustPoolCloseDate ? trustPoolCloseDate : '');

        registerEvent();


    });
    function registerEvent() {
        $('#btnReset').click(function () {
            $('.list-filters .filter').val('');
            PagerListModule.Filter({});
        });
        $('#btnSearch').click(function () {
            if ($('#gridAssetDetail').css('display') == 'block') {
                kendouGrid.kgAssetDetail.RefreshGrid();
            } else {
                return;
            }
        });

        $('#btnImportAccount').click(function () {
            common.showDialogPage('./ImportAccountAssets/ImportAccountAssets.html?trustId=' + trustId + '&TrustCode=' + trustCode, '导入账户资产', 500, 230, function () { }, trustId);
        })


        $('#btnImport').click(function () {
            //var svcUrlConsumerLoan = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&";
            //var executeParam = {
            //    SPName: 'usp_getAssetTypeByTrustId', SQLParams: [
            //        { Name: 'trustId', value: trustId, DBType: 'int' }
            //    ]
            //};
            //var data = common.ExecuteGetData(false, svcUrlConsumerLoan, "TrustManagement", executeParam);
            //$.each(data, function (i, item) {
            //    if (item["AssetType"] != undefined && item["AssetType"] != null && item["AssetType"] != '')
            //        assetType = item["AssetType"];
            //})
            //importAsset = true;
            //$('#btnUploadAssetSourceFile').attr('disabled', false);
            //$('#BasicAssetSourceFileUpload, #BasicAssetReportingDate').val('');
            //$('.upload-sourcefile').toggle(300);
            common.showDialogPage('./ImportRepayment/ImportRepayment.html?trustId=' + trustId + '&TrustCode=' + trustCode + '&Transform=Transform', '导入还款文件', 500, 322, function () { }, trustId);

        });

        $('#btnImportRealData').click(function () {
            importAsset = false;
            $('#btnUploadAssetSourceFile').attr('disabled', false);
            $('#BasicAssetSourceFileUpload, #BasicAssetReportingDate').val('');
            $('.upload-sourcefile').show();

        });

        $('#btnImportPlanData').click(function () {
            //planAsset = true;
            //$('#btnUploadAssetPlanFile').attr('disabled', false);
            //$('#BasicAssetPlanFileUpload').val('');
            //$('.upload-planfile').toggle(300);
            common.showDialogPage('./ImportReimbursementPlan/ImportReimbursementPlan.html?trustId=' + trustId + '&TrustCode=' + trustCode, '导入还款计划', 500, 230, function () { }, trustId);
        });

        $('#btnSyncTrustAsset').click(function () {
            //var sessionVariables = "<SessionVariables>"
            // + "<SessionVariable><Name>TrustId</Name><Value>" + trustId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
            // + "</SessionVariables>";
            //TaskProcessWProxy.CreateSessionShowTask("Task", sessionVariables, "ImportTrustAssetByFactLoan");
            var url = './ImportTrustAsset/ImportTrustAsset.html?TrustId=' + trustId + '&TrustCode=' + trustCode + '&ReportingDate=' + ReportingDate;
            var title = '导入专项计划资产',
            width = 900,	// 弹出框内容宽度
            height = 500;// 弹出框内容高度
            common.showDialogPage(url, title, width, height, function () {
            })

        });
        //现金流拆分归集和现金流一览
        $('#CashFlowDisassemblyAndCashFlowList').click(function () {
            //var sessionVariables = "<SessionVariables>"
            // + "<SessionVariable><Name>TrustId</Name><Value>" + trustId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
            // + "</SessionVariables>";
            //TaskProcessWProxy.CreateSessionShowTask("Task", sessionVariables, "ImportTrustAssetByFactLoan");
            var url = './CashFlowDisassemblyAndCashFlowList/index.html?TrustId=' + trustId + '&TrustCode=' + trustCode;
            var title = '现金流拆分、归集与现金流一览',
            width = 900,	// 弹出框内容宽度
            height = 500;// 弹出框内容高度
            common.showDialogPage(url, title, width, height, function () {
            }, "", false, "", true, false)

        });
        $("#btnRefresh").click(function () {
            location.reload(true);
        })
        //$("#btnSyncTrustAsset").anyDialog({
        //    width: 600,	// 弹出框内容宽度
        //    height: 500, // 弹出框内容高度
        //    title: '导入专项计划资产',	// 弹出框标题
        //    url: './ImportTrustAsset/ImportTrustAsset.html?TrustId=' + trustId
        //});
        $('#btnUploadAccountAssetSourceFile').click(function () {
            var rDate = $('#AccountAssetReportingDate').val();
            if (!rDate) { alert('please set the reporting date value.'); return; }
            var filePath = $('#AccountAssetSourceFileUpload').val();
            var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
            if (fileType !== 'xls' && fileType !== 'xlsx' && assetType != specialType) {
                alert('文件不是XLS或XLSX文件');
                return;
            }
            accountAsset = true;
            var args = 'trustId=' + trustId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);

            $('#AccountspanUploadProgressMsg').html('正在上传...').show();
            var fileData = document.getElementById('AccountAssetSourceFileUpload').files[0];
            uploadAssetFile(args, fileData);
        })

        $('#btnUploadAssetSourceFile').click(function () {
            var rDate = $('#BasicAssetReportingDate').val();
            var fileNumber = ($("#uploadSelect>input:checked").val() == "1") ? 1 : 2;                     //新增用于判断要上传的文件个数
            if (!rDate) { alert('please set the reporting date value.'); return; }
            var filePath = $('#BasicAssetSourceFileUpload').val();
            var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);

            var filePathEx = $('#BasicAssetSourceFileUploadEx').val();
            var fileNameEx = filePathEx.substring(filePathEx.lastIndexOf('\\') + 1);
            var fileTypeEx = fileNameEx.substring(fileNameEx.lastIndexOf('.') + 1);

            if (fileType !== 'xls' && fileType !== 'xlsx' && fileNumber == 2) {
                alert('还款分类不是XLS或XLSX文件');
                return;
            }
            if (fileTypeEx !== 'xls' && fileTypeEx !== 'xlsx') {
                alert('还款明细不是XLS或XLSX文件');
                return;
            }

            var args = 'trustId=' + trustId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName) + '&fileType=1';
            var fileData = document.getElementById('BasicAssetSourceFileUpload').files[0];
            var argsEx = 'trustId=' + trustId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileNameEx) + '&fileType=2';
            var fileDataEx = document.getElementById('BasicAssetSourceFileUploadEx').files[0];
            $('#spanUploadProgressMsg').html('正在上传...').show();
            $(this).attr('disabled', true);
            if (fileNumber == 2) {
                uploadAssetFile(args, fileData);
            }
            console.log("argsEx:" + argsEx + " " + "fileDataEx:" + fileDataEx);
            uploadAssetFile(argsEx, fileDataEx);
        });

        $('#btnUploadAssetPlanFile').click(function () {
            var dimLoanDate = $('#DimLoanDate').val();
            if (!dimLoanDate) { alert('please set the dimloandate date value.'); return; }
            var filePath = $('#BasicAssetPlanFileUpload').val();
            var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);


            if (fileType !== 'xls' && fileType !== 'xlsx' && assetType != specialType) {
                alert('计划现金流文件不是XLS或XLSX文件');
                return;
            }

            var args = 'trustId=' + trustId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);
            var fileData = document.getElementById('BasicAssetPlanFileUpload').files[0];
            console.log(args);
            uploadAssetFile(args, fileData);
        });
        $('#btnUploadAssetSourceFileCancel').click(function () { $('.upload-sourcefile').toggle(300); });
        $('#btnUploadAssetPlanFileCancel').click(function () { $('.upload-planfile').toggle(300); });
        $('#btnUploadAccountAssetSourceFileCancel').click(function () { $('.upload-accountsourcefile').toggle(300); })
        $("#btnInterestAdjustments").click(function () {
            $.anyDialog({
                modal: true,
                dialogClass: "TaskProcessDialogClass",
                closeText: "",
                html: $("#interest_adjustments_div").show(),
                height: 315,
                width: 600,
                close: function (event, ui) {
                },
                title: "调息"
            });
        });
        $("#btnInterestAdjustmentsOK").click(function () {
            callInterestAdjustmentsTaskProcess();
        });

        $('#interest_adjustments_div .form-control').change(function () {
            validControlValue($(this));
        });

        $('#btnViewAssetCashFlow').click(function () {
            common.showDialogPage('./AssetPayMentSchedule/AssetPaymentSchedule.html?trustId=' + trustId, '信托基础资产现金流', 900, 500, function () { });
        });

        $('#btnImportAssetInfo').click(function () {
            common.showDialogPage('./ImportAssetInfo/ImportAssetInfo.html?trustId=' + trustId, '导入资产池统计数据', 600, 360, function () { });
        });

        //查询功能
        $('#btnFilterAssetList').click(function () {

            if ($('#gridAssetDetail').css('display') != 'block') {
                //如果底部资产明细隐藏，切换回底部资产明细列表
                $('#btnViewAssetList').removeClass('btn-active').addClass('btn-default');
                $('#gridAssetDetail').show();
                $('#gridAssetPoolList').hide();
            }

            sVariableBuilder.AddVariableItem('TrustId', trustId, 'Int', 1, 0, 0);
            sVariableBuilder.AddVariableItem('ReportingDate', $('#ReportingDate').val(), 'String', 1, 0, 0);
            sVariableBuilder.AddVariableItem('DimReportingDateId', $('#ReportingDate').val().replace(/-/g, ''), 'String', 1, 0, 0);
            sVariableBuilder.AddVariableItem('OperationType', 1, 'Int', 1);
            sVariableBuilder.AddVariableItem('SchedulePurpose', 1, 'Int', 1);
            sVariableBuilder.AddVariableItem('OperationType', '1', 'Int', 1);
            sVariableBuilder.AddVariableItem('ScheduleDateId', $('#ReportingDate').val().replace(/-/g, ''), 'String', 1);
            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'Task',
                taskCode: 'ImportTrustAssetDetails',
                sContext: sVariable,
                callback: function () {
                    ReportingDate = $('#ReportingDate').val();
                    kendouGrid.kgAssetDetail.RefreshGrid();
                    sVariableBuilder.ClearVariableItem();
                    location.reload(true);

                }
            });
            tIndicator.show();
        });

        //相关资产池
        $('#btnViewAssetList').click(function () {
            var self = $('#btnViewAssetList');
            if ($('#gridAssetPoolList').css('display') != 'block') {
                self.removeClass('btn-default').addClass('btn-active');
                $('#gridAssetPoolList').show();
                $('#gridAssetDetail').hide();
            } else {
                self.removeClass('btn-active').addClass('btn-default');
                $('#gridAssetPoolList').hide();
                $('#gridAssetDetail').show();
            }
        });

        //测算资产状态
        $('#btnTestAssetStatus').click(function () {
            //var url = './ImportTrustAsset/ImportTrustAsset.html?TrustId=' + trustId + '&TrustCode=' + trustCode;
            //?TrustId=' + trustId + '&TrustCode=' + trustCode;
            common.showDialogPage('./TestAssetStatus/TestAssetStatus.html?trustId=' + trustId, '测算资产状态', 600, 360, function () {
            }, true, 'small', false, false)

        });

    };

    function Init() {
        var executeParam = {
            SPName: 'usp_GetTrustInfo', SQLParams: [
                { Name: 'trustId', value: trustId, DBType: 'int' }
            ]
        };

        var listData = page.WcfProxy.GetSourceData(executeParam);
        var trustInfoData = {};
        $.each(listData, function (i, n) {
            if (!trustInfoData[n.ItemCode])
                trustInfoData[n.ItemCode] = n.ItemValue;
        });
        trustPoolCloseDate = trustInfoData.PoolCloseDate;
        trustCode = trustInfoData.TrustCode;
    }

    function uploadMethodSelect(event) {
        var $fileSelect = $("#radioButton");
        if (event.target.value == "1")
            $fileSelect.hide(300);
        else
            $fileSelect.show(300);
    }
    function date_input_func() {
        $('.date-plugins').date_input();//.attr('readonly', true);
    }
    function sortData(datalist, column) {
        datalist = datalist.sort(function (b, a) {
            return a[column] - b[column];
        });
    }

    function searchWhere() {
        var filterWhere = getWhere();
        PagerListModule.Filter({ 'where': filterWhere, 'payDate': getPayDate() });
    }
    function getWhere() {
        var filterWhere = '';
        $('.list-filters .filter').each(function () {
            var $this = $(this);
            var value = $this.val();
            if (!value || value.length < 1) { return true; }

            var param = $this.attr('name');
            if ($this.hasClass('like')) {
                filterWhere += ' and ' + param + ' like N\'%' + value + '%\'';
            } else {
                filterWhere += ' and ' + param + ' = N\'' + value + '\'';
            }
        });
        return filterWhere;
    }
    function getPayDate() {
        return $("#selPayDateFilter").length > 0 ? ($("#selPayDateFilter").val() ? $("#selPayDateFilter").val() : '') : undefined;
    }
    function uploadAssetFile(args, fileData) {
        var fileNumber = ($("#uploadSelect>input:checked").val() == "1") ? 1 : 2;
        //var fileData = document.getElementById('BasicAssetSourceFileUpload').files[0];
        $.ajax({
            url: GlobalVariable.DataProcessServiceUrl + 'CommonFileUpload' + '?' + args,
            type: 'POST',
            data: fileData,
            cache: false,
            dataType: 'json',
            processData: false, // Don't process the files
            //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
            success: function (data) {
                $('#spanUploadProgressMsg').html("上传成功");
                if (planAsset) {
                    callImportPlanPaymentDataTaskProcess(data.CommonTrustFileUploadResult);
                }
                else if (accountAsset) {
                    //console.log("data.CommonTrustFileUploadResult:" + data.CommonTrustFileUploadResult);
                    callImportAccountPaymentDataTaskProcess(data.CommonTrustFileUploadResult);
                }
                else {
                    if (importAsset) {
                        if (fileNumber == 1) {
                            callImportAssetDataTaskProcess(FileVaraible.filePath, data.CommonTrustFileUploadResult);
                        }

                        if (args.indexOf('fileType=2') != -1) {
                            FileVaraible.filePath = data.CommonTrustFileUploadResult;
                        }
                        else {
                            FileVaraible.filePathEx = data.CommonTrustFileUploadResult;
                        }

                        if (FileVaraible.count > 0) {
                            //当两个文件都上传成功时开始TASK
                            FileVaraible.count = 0;
                            callImportAssetDataTaskProcess(FileVaraible.filePath, FileVaraible.filePathEx);
                        }

                        FileVaraible.count++;
                    }
                    else {
                        callImportActualPaymentDataTaskProcess(data.CommonTrustFileUploadResult);
                    }
                }
            },
            error: function (data) {
                $('#spanUploadProgressMsg').html('文件上传出现错误。');
            }
        });
    }
    function callImportAssetDataTaskProcess(filePath, filePathEx) {
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
        var fileNameEx = filePathEx.substring(filePath.lastIndexOf('\\') + 1);
        var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\';
        var rDate = $('#BasicAssetReportingDate').val();
        var rDateId = rDate.replace(/-/g, '');
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = { SPName: 'usp_GetTrustTaskConfig', SQLParams: [] };
        var fileNumber = ($("#uploadSelect>input:checked").val() == "1") ? 1 : 2;
        if (fileNumber == 1)
            assetType = "RMBS";
        else
            assetType = "AUTO";                                                //修改上传方式的选择，从资产类型决定上传方式改为上传数量决定上传方式。
        executeParam.SQLParams.push({ Name: 'AssetType', value: assetType, DBType: 'string' });
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var sourceData = {};
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=commom',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }
                if (sourceData && sourceData.length > 0) {
                    wcfProxyInvokeTask(fileName, fileNameEx, fileDirectory, rDate, rDateId, sourceData[0].TaskCode);
                } else {
                    alert('Get Import TaskCode Error!\n Can not find TaskCode for Current Trust.');
                }
            },
            error: function (response) { alert('Error occursed while requiring the TaskCode!1'); }
        });
    }

    function callImportActualPaymentDataTaskProcess(filePath) {
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
        var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\'));
        var rDate = $('#BasicAssetReportingDate').val();
        var rDateId = rDate.replace(/-/g, '');

        wcfProxyInvokeTask(fileName, fileDirectory, rDate, rDateId, "ImportPaymentDataBySSIS");
    }
    function callImportAccountPaymentDataTaskProcess(filePath) {
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
        var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\';
        var reportingDate = $('#AccountAssetReportingDate').val();
        sVariableBuilder.AddVariableItem('ExcelPath', fileDirectory, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('TrustId', trustId, 'Int', 0, 0, 0);
        sVariableBuilder.AddVariableItem('DimReportingDateId', reportingDate, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('ExcelFileName', fileName, 'String', 0, 0, 0);

        var sVariable = sVariableBuilder.BuildVariables();
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'Task',
            taskCode: 'AssetAccountImport',
            sContext: sVariable,
            callback: function () {
                //window.location.href = window.location.href;
                sVariableBuilder.ClearVariableItem();
            }
        });
        tIndicator.show();
    }

    function callImportPlanPaymentDataTaskProcess(filePath) {
        console.log(filePath);
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
        var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\';
        var rDate = $('#DimLoanDate').val();
        var scheduleDateId = rDate.replace(/-/g, '');
        sVariableBuilder.AddVariableItem('ExcelPath', fileDirectory, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('TrustId', trustId, 'Int', 0, 0, 0);
        sVariableBuilder.AddVariableItem('ExcelFileName', fileName, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('BusinessDate', rDate, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('ScheduleDateId', scheduleDateId, 'String', 0, 0, 0);
        var sVariable = sVariableBuilder.BuildVariables();
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'Task',
            taskCode: 'ImportAssetPaymentPlanData',//'ImportDataBySSIS',
            sContext: sVariable,
            callback: function () {
                //window.location.href = window.location.href;
                sVariableBuilder.ClearVariableItem();
            }
        });
        tIndicator.show();

    }

    function wcfProxyInvokeTask(fileName, fileNameEx, fileDirectory, rDate, rDateId, taskCode) {
        sVariableBuilder.AddVariableItem('ExcelFileName', fileNameEx, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('ExcelPath', fileDirectory, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('TrustId', trustId, 'Int', 0, 0, 0);
        sVariableBuilder.AddVariableItem('TrustCode', trustCode, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('BusinessDate', rDate, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('DimReportingDateId', rDateId, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('PoolCloseDate', trustPoolCloseDate, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('ExcelFileNameEx', fileName, 'String', 0, 0, 0);

        var sVariable = sVariableBuilder.BuildVariables();
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'Task',
            taskCode: taskCode,
            sContext: sVariable,
            callback: function () {
                //window.location.href = window.location.href;
                sVariableBuilder.ClearVariableItem();
            }
        });
        tIndicator.show();
    }
    function PopupTaskProcessIndicatorForBasicAsset(fnCallBack) {
        $("#taskIndicatorArea").dialog({
            modal: true,
            dialogClass: "TaskProcessDialogClass",
            closeText: "",
            //closeOnEscape:false,
            height: 485,
            width: 470,
            close: function (event, ui) {
                window.location.reload();
            }, // refresh report repository while close the task process screen.
            //open: function (event, ui) { $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide(); },
            title: "任务处理"
        });
    }
    //$("#btnInterestAdjustments").click(function () {
    //    SetInterestAdjustmentsRD();
    //    $(".interest-adjustments").show();
    //});
    //$(function () {
    //    $("#interest_adjustments_div").find("input[data-attr='interest_adjustments_PoolCloseDate']").val(trustPoolCloseDate ? trustPoolCloseDate : '');
    //});


    function SetInterestAdjustmentsRD() {
        $("#interest_adjustments_template select[name='InterestAdjustments_RDate']").html($("#selPayDateFilter").html());
        $("#interest_adjustments_template select[name='InterestAdjustments_RDate'] option:contains('所有')").remove();
    }
    function RQcheck(RQ) {
        var date = RQ;
        var result = date.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);

        if (result == null)
            return false;
        var d = new Date(result[1], result[3] - 1, result[4]);
        return (d.getFullYear() == result[1] && (d.getMonth() + 1) == result[3] && d.getDate() == result[4]);
    }

    function callInterestAdjustmentsTaskProcess() {
        var haveError = false;
        $('#interest_adjustments_div .form-control').each(function () {
            var $this = $(this);
            if (!validControlValue($this)) { haveError = true; }
        });
        if (haveError) return;

        var AdjustDate = $('#interest_adjustments_div input[data-attr="interest_adjustments_Date"]').val();
        var AdjustEffectType = $('#interest_adjustments_div select[data-attr="interest_adjustments_AdjustEffectType"]').val();
        var InterestAdjustType = $('#interest_adjustments_div select[data-attr="interest_adjustments_InterestAdjustType"]').val();
        var InterestRateChange = $('#interest_adjustments_div input[data-attr="interest_adjustments_Fee"]').val();
        var PeriodType = "M";
        var PeriodNumber = "1";
        var PoolCloseDate = $('#interest_adjustments_div input[data-attr="interest_adjustments_PoolCloseDate"]').val();
        var IsMonthEndRule = "0";

        var sessionVariables = "<SessionVariables>"
              + "<SessionVariable><Name>TrustId</Name><Value>" + trustId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
              + "<SessionVariable><Name>InterestRateChange</Name><Value>" + InterestRateChange + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
              + "<SessionVariable><Name>AdjustDate</Name><Value>" + AdjustDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
              + "<SessionVariable><Name>AdjustEffectType</Name><Value>" + AdjustEffectType + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
              + "<SessionVariable><Name>InterestAdjustType</Name><Value>" + InterestAdjustType + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
              + "<SessionVariable><Name>PoolCloseDate</Name><Value>" + PoolCloseDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
              + "<SessionVariable><Name>PeriodType</Name><Value>" + PeriodType + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
              + "<SessionVariable><Name>PeriodNumber</Name><Value>" + PeriodNumber + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
              + "<SessionVariable><Name>FirstImutationDate</Name><Value>" + PoolCloseDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
              + "<SessionVariable><Name>IsMonthEndRule</Name><Value>" + IsMonthEndRule + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
              + "</SessionVariables>";

        TaskProcessWProxy.CreateSessionShowTask("Task", sessionVariables, "AdjustAssetPoolInterest");
    }

    //初始化报告日期
    function initReportDate() {

        var selectedDate; //默认选中日期
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = { SPName: 'usp_GetSelectedFactLoanDate', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TrustId', Value: trustId, DBType: 'int' });

        executeParams = encodeURIComponent(JSON.stringify(executeParam));
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

                selectedDate = sourceData[0] != undefined && sourceData[0].SelectedDate != undefined ? sourceData[0].SelectedDate : "";
            },
            error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        });

        executeParam = { SPName: 'usp_GetFactLoanDate', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TrustId', Value: trustId, DBType: 'int' });
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
                var options = "";
                $.each(sourceData, function (i, item) {
                    if (!selectedDate || item.ReportingDate != selectedDate)
                        options += '<option value="' + item.ReportingDate + '">' + item.ReportingDate + '</option>';
                    else
                        options += '<option value="' + item.ReportingDate + '" selected>' + item.ReportingDate + '</option>';
                });
                $('#ReportingDate').append(options);
            },
            error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        });
    }


    var TrustMngmtRegxCollection = {
        int: /^([-]?[1-9]+\d*$|^0)?$/,
        decimal: /^([-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?)?$/,
        date: /^((\d{4})-(\d{2})-(\d{2}))?$/,
        datetime: /^((\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}))?$/
    };
    function validControlValue(obj) {
        var $this = $(obj);
        var objValue = $this.val();
        var valids = $this.attr('data-valid');

        //无data-valid属性，不需要验证
        if (!valids || valids.length < 1) { return true; }

        //如果有必填要求，必填验证
        if (valids.indexOf('required') >= 0) {
            if (!objValue || objValue.length < 1) {
                $this.addClass('red-border');
                return false;
            } else {
                $this.removeClass('red-border');
            }
        }
        //暂时只考虑data-valid只包含两个值： 必填和类型
        var dataType = valids.replace('required', '').toLocaleLowerCase().trim();

        //通过必填验证，做数据类型验证
        var regx = TrustMngmtRegxCollection[dataType];
        if (!regx) { return true; }

        if (!regx.test(objValue)) {
            $this.addClass('red-border');
            return false;
        } else {
            $this.removeClass('red-border');
        }
        return true;
    }
    var TaskProcessWProxy = (function () {
        function createSessionShowTask(appDomain, sessionVariables, taskCode) {
            var sContext = {
                appDomain: appDomain,
                sessionVariables: sessionVariables,
                taskCode: taskCode
            };

            var wProxy = new webProxy();
            wProxy.createSessionByTaskCode(sContext, function (response) {
                isSessionCreated = true;
                sessionID = response;
                taskCode = taskCode;

                IndicatorAppDomain = appDomain;

                //$(window.parent.document).find("#modal-mask").remove();
                //$(window.parent.document).find("#modal-layout").remove();
                $(window.parent.document).find('#modal-close').trigger('click');

                PopupTaskProcessIndicatorForBasicAsset(function () {
                    $('#divDataList').datagrid('reset');
                    $('#divDataList').datagrid("fetch", {});
                    $('.interest-adjustments').hide();
                });
            });
        }

        function PopupTaskProcessIndicatorForBasicAsset(fnCallBack) {
            $("#taskIndicatorArea").dialog({
                modal: true,
                dialogClass: "TaskProcessDialogClass",
                closeText: "",
                height: 485,
                width: 470,
                close: function (event, ui) {
                    window.location.reload();
                    //以后把silverlight的局部刷新做好，就用callback，现在只能全部刷新了
                    //fnCallBack();
                },
                title: "任务处理"
            });
        }

        return { CreateSessionShowTask: createSessionShowTask }
    })();
    var AssetUnfoldKO = (function () {
        var isloaded = false;
        $(function () {
            loadData();

            $('#AssetPoolUnfold_div .date-plugins').date_input();
            $('#AssetPoolUnfold_div .form-control').change(function () {
                validControlValue($(this));
            });
            $("#btnAssetPoolUnfold").click(function () {
                $.anyDialog({
                    modal: true,
                    dialogClass: "TaskProcessDialogClass",
                    closeText: "",
                    html: $("#AssetPoolUnfold_div").show(),
                    height: 315,
                    width: 600,
                    close: function (event, ui) {
                    },
                    title: "资产池现金流拆分"
                });
            });
            $("#btnAssetPoolUnfoldOK").click(function () {
                var haveError = false;
                $('#AssetPoolUnfold_div .form-control').each(function () {
                    var $this = $(this);
                    if (!validControlValue($this)) { haveError = true; }
                });
                if (haveError) return;

                //保存
                var PoolCloseDate = $.trim($("#AssetPoolUnfold_div input[name='PoolCloseDate']").val());
                PoolCloseDate = (PoolCloseDate == '' ? '1900-01-01' : PoolCloseDate);
                var EndDate = $("#AssetPoolUnfold_div input[name='EndDate']").val();
                var RemainTerm = $("#AssetPoolUnfold_div input[name='RemainTerm']").val();
                var PayDate = $("#AssetPoolUnfold_div input[name='PayDate']").val();
                var SpecifiedAmt = $.trim($("#AssetPoolUnfold_div input[name='SpecifiedAmt']").val());
                SpecifiedAmt = (SpecifiedAmt == '' ? '0' : SpecifiedAmt);
                console.log('PoolCloseDate:' + PoolCloseDate + ',SpecifiedAmt:' + SpecifiedAmt);
                var PeriodType = "M";
                var PeriodNumber = "1";
                var IsMonthEndRule = "0";

                var sessionVariables = "<SessionVariables>"
                    + "<SessionVariable><Name>TrustId</Name><Value>" + trustId + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                    + "<SessionVariable><Name>EndDate</Name><Value>" + EndDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                    + "<SessionVariable><Name>RemainTerm</Name><Value>" + RemainTerm + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                    + "<SessionVariable><Name>PayDate</Name><Value>" + PayDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                    + "<SessionVariable><Name>PeriodType</Name><Value>" + PeriodType + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                    + "<SessionVariable><Name>PeriodNumber</Name><Value>" + PeriodNumber + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                    + "<SessionVariable><Name>PoolCloseDate</Name><Value>" + PoolCloseDate + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                    + "<SessionVariable><Name>IsMonthEndRule</Name><Value>" + IsMonthEndRule + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                    + "<SessionVariable><Name>SpecifiedAmt</Name><Value>" + SpecifiedAmt + "</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                    + "</SessionVariables>";

                TaskProcessWProxy.CreateSessionShowTask("Task", sessionVariables, "AssetPoolUnfold");
            });
        });

        function loadData() {
            $("#AssetPoolUnfold_div").find("input[name='PoolCloseDate']").val(trustPoolCloseDate ? trustPoolCloseDate : '');
            //$("#AssetUnfoldDiv input[name='StartDate']").val();
            //$("#AssetUnfoldDiv input[name='LoanIssueDate']").val();
            //$("#AssetUnfoldDiv input[name='EndDate']").val();
            //$("#AssetUnfoldDiv input[name='RemainTerm']").val();
        }

        var TrustMngmtRegxCollection = {
            int: /^([-]?[1-9]+\d*$|^0)?$/,
            decimal: /^([-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?)?$/,
            date: /^((\d{4})-(\d{2})-(\d{2}))?$/,
            datetime: /^((\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}))?$/
        };
        function validControlValue(obj) {
            var $this = $(obj);
            var objValue = $this.val();
            var valids = $this.attr('data-valid');
            $this.removeAttr("title");

            //无data-valid属性，不需要验证
            if (!valids || valids.length < 1) { return true; }

            //如果有必填要求，必填验证
            if (valids.indexOf('required') >= 0) {
                if (!objValue || objValue.length < 1) {
                    $this.addClass('red-border');
                    return false;
                } else {
                    $this.removeClass('red-border');
                }
            }
            //暂时只考虑data-valid只包含两个值： 必填和类型
            var dataType = valids.replace('required', '').toLocaleLowerCase().trim();

            //通过必填验证，做数据类型验证
            var regx = TrustMngmtRegxCollection[dataType];
            if (!regx) { return true; }

            if (!regx.test(objValue)) {
                $this.addClass('red-border');
                return false;
            } else {
                $this.removeClass('red-border');
            }

            if (dataType == 'int') {
                var title = '';
                if ($this.attr('data-min') && parseInt($this.attr('data-min')) == $this.attr('data-min')
                    && parseInt($this.val()) < parseInt($this.attr('data-min'))) {
                    title += (title.length > 0 ? ',且' : '') + '不小于' + $this.attr('data-min');
                }
                if ($this.attr('data-max') && parseInt($this.attr('data-max')) == $this.attr('data-max')
                    && parseInt($this.val()) > parseInt($this.attr('data-max'))) {
                    title += (title.length > 0 ? ',且' : '') + '不大于' + $this.attr('data-max');
                }
                if (title.length > 0) {
                    $this.addClass('red-border');
                    $this.attr("title", '输入值需' + title);
                    return false;
                }
                else {
                    $this.removeClass('red-border');
                    $this.removeAttr("title");
                }
            }

            return true;
        }

        return { LoadData: loadData }
    })();
    function inputFileClick() {
        $(".input_file_style").find("input").change(function () {
            var value = $(this)[0].value;
            if (value != "") {
                $(this).next()[0].innerHTML = "已选中文件"
            } else {
                $(this).next()[0].innerHTML = '选择文件';
            }
        })
    }
    inputFileClick()
});
