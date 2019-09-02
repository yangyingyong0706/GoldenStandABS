define(function (require) {
    var $ = require('jquery');
    require('highcharts');
    require('highchartsexporting');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    require('jquery.datagrid');
    require('jquery.datagrid.options');
    var FormatNumber=require('gs/format.number');
    var webProxy = require('gs/webProxy');
    var accountNo = common.getQueryString('accountNo');
    var ScheduleDate = common.getQueryString('ScheduleDateId');//归集日
    var poolId = common.getQueryString('poolId') ? common.getQueryString('poolId') : -1;
    var trustId = common.getQueryString('trustId');
    var enter = common.getQueryString('enter');
    var DimLoanId = common.getQueryString('DimLoanId');
    var GSDialog = require("gsAdminPages");
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var self = this;
    var AssetPaymentData = [];
    var poolCutId = common.getQueryString('poolCutId')  
    var PoolDBName = common.getQueryString('PoolDBName')
    if (!('map' in Array.prototype)) {
        Array.prototype.map = function (mapper, that /*opt*/) {
            var other = new Array(this.length);
            for (var i = 0, n = this.length; i < n; i++)
                if (i in this)
                    other[i] = mapper.call(that, this[i], i, this);
            return other;
        };
    }
    Highcharts.theme = {
        colors: ["#7cb5ec", "#f7a35c", "#aaeeee", "#7798BF", "#ff0066", "#90ee7e", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        chart: { backgroundColor: null, style: { fontFamily: "Microsoft Yahei, sans-serif" } },
        credits: { enabled: false },
        title: { style: { fontSize: '16px', fontWeight: 'normal', textTransform: 'uppercase', color: '#777777' } },
        tooltip: { borderWidth: 0, backgroundColor: 'rgba(219,219,216,0.8)', shadow: false },
        legend: { itemStyle: { fontWeight: 'normal', fontSize: '14px' } },
        xAxis: { gridLineWidth: 1, labels: { style: { fontSize: '12px' } } },
        yAxis: { minorTickInterval: 'auto', title: { style: { textTransform: 'uppercase' } }, labels: { style: { fontSize: '12px' } } },
        plotOptions: { candlestick: { lineColor: '#404048' } },
        background2: '#F0F0EA'
    };
    Highcharts.setOptions(Highcharts.theme);

    function getAssetPaymentScheduleData(trustId, spName, accountNo, purpose, ReportingDate,poolId) {
        var executeParam = { SPName: spName, SQLParams: [] };
        executeParam.SQLParams.push( { Name: 'trustId', value: trustId, DBType: 'int' });
        if (accountNo) {
            executeParam.SQLParams.push({ Name: 'accountNo', value: accountNo, DBType: 'string' });
        }
        if (purpose) {
            executeParam.SQLParams.push({ Name: 'purpose', value: purpose, DBType: 'int' });
        }
        if (ReportingDate) {
            executeParam.SQLParams.push({ Name: 'ReportingDate', value: ReportingDate, DBType: 'date' });
        }
        if (poolId) {
            executeParam.SQLParams.push({ Name: 'poolId', value: poolId, DBType: 'int' });
        }

        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var sourceData = [];
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl + 'appDomain='+ poolCutId + '&executeParams=' + executeParams + '&resultType=commom',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }
            },
            error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); }
        });
        return sourceData;
    }

    function getReportingDateByTrustId(trustId) {
        var executeParam = { SPName: 'usp_getReportingDateByTrustId', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'trustId', value: trustId, DBType: 'int' });
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var sourceData = [];
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl + 'appDomain=Asset&executeParams=' + executeParams + '&resultType=commom',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }
            },
            error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); }
        });
        return sourceData;
    }
   
    $(function () {

        if (enter) {
            bindAssetPaymentStatisticsCreateAssets(poolId, DimLoanId)
            bindListViewCreateAssets(AssetPaymentData);
            bindChartView(AssetPaymentData)
        } else {
            if (!trustId || trustId == 0 || isNaN(trustId)) {
                return;
            }
            var ReportingDateList = getReportingDateByTrustId(trustId);
            var ReportingDateOptions = '';
            ReportingDateOptions += '<option value="' + ScheduleDate + '">' + ScheduleDate + '</option>';
            $('#reportingDate').html(ReportingDateOptions);
            if (accountNo) {
                bindAssetPaymentStatistics(trustId, 'Asset.usp_GetAssetPaymentStatistics_ByAccountNo', accountNo);
                $('.tab-switch').show();
                $("[data-view='#downloadLinksContainer']").hide(); //点击现金流显示页面时，隐藏下载界面
            }
            ShowtypeClick();
            btnSearchClick();

            bindAssetPaymentScheduleData();
        }
        $('.tab-switch').click(function () {
            $(this).addClass('titlecur').siblings().removeClass('titlecur');
            var view = $(this).attr('data-view');
            var $mainBar = $('#main-bar');
            if (view) {
                $('.viewcontainer').hide();
                $(view).show();
            }
            if (!accountNo) {
                switch (view) {                                           //现金流下载页面隐藏检索栏
                    case '#downloadLinksContainer': $mainBar.hide(); break;
                    default: $mainBar.show();
                }
            }
        });
        $('#loading').hide()
        
    });

    //对从后端取回的日期进行格式化
    function formatTime(date) {                      
        var dateTime = new Date(parseInt(date.replace(/[^\d+]/ig, '')));
        var month = (dateTime.getMonth() + 1).toString().length == 1 ? '0' + (dateTime.getMonth() + 1).toString() : (dateTime.getMonth() + 1).toString();
        var day = dateTime.getDate().toString().length == 1 ? '0' + dateTime.getDate().toString() : dateTime.getDate().toString();
        var timeFormat = dateTime.getFullYear() + '-' + month + '-' + day;
        return timeFormat;
    }

    //同步生成字节流文件
    function downLoadExcelForAsyn(filePath, desName,callback) {
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
                console.log(blob);
                elink.href = URL.createObjectURL(blob);
                if (callback) {
                    callback(elink);
                }
                //return elink;
                //img.src = window.URL.createObjectURL(blob);
            }
        }
        xmlRequest.send();
    }

    function bindAssetPaymentScheduleData() {
        var data = [];
        var spName = 'usp_GetAssetScheduleImutation';

        var accountNo = common.getQueryStringSpecial('accountNo');
		    // accountNo = escape(accountNo);
        var unitOption = $('#displayUnit>option:selected');

        if (accountNo) {
			 // accountNo = encodeURI(accountNo);
            spName = 'Asset.usp_GetAssetPaymentSchedule';
            data = getAssetPaymentScheduleData(trustId,spName, accountNo, null,null,poolId);       
        }
        else {
            var purpose = null;
            var purDom = $('.list-filters .form-control[name="Purpose"]');
            if (purDom.length > 0) {
                purpose = purDom.val();
                var ReportingDate = $('#reportingDate').val();

                $('.list-filters').show();

                if (purpose.length > 0)
                    data = getAssetPaymentScheduleData(trustId, spName, null, purpose, ReportingDate,null);
                //console.log(data)
            }
        }
        if (unitOption.val() == "1" && data instanceof Array) {
            for (var i = 0; i < data.length; i++) {
                data[i].InitialAmt = Number(div(data[i].InitialAmt, "10000.0")).toFixed(2);
                data[i].CloseAmt = Number(div(data[i].CloseAmt, "10000.0")).toFixed(2);
                data[i].InterestAmt = parseFloat(Number(div(data[i].InterestAmt, "10000.0")).toFixed(2));
                data[i].PrincipalAmt = parseFloat((div(data[i].PrincipalAmt, "10000.0")).toFixed(2));
            }
        }
        bindChartView(data);
        var mf = FormatNumber.NumberFormatUtils();
        for (var i = 0; i < data.length; i++) {
            data[i].InitialAmt = mf.formatMoney(data[i].InitialAmt, "auto");
            data[i].CloseAmt = mf.formatMoney(data[i].CloseAmt, "auto");
            data[i].InterestAmt = mf.formatMoney(data[i].InterestAmt, "auto");
            data[i].PrincipalAmt = mf.formatMoney(data[i].PrincipalAmt, "auto");
        }
        bindListView(data);
    }

    function mul(a, b) {                      //用于解决浮点数计算精度问题的乘法函数
        var c = 0,
            d = a.toString(),
            e = b.toString();
        try {
            c += d.split(".")[1].length;
        } catch (f) { }
        try {
            c += e.split(".")[1].length;
        } catch (f) { }
        return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
    }
    function div(a, b) {                  //用于解决浮点数计算精度问题的除法函数
        var c, d, e = 0,
            f = 0;
        try {
            e = a.toString().split(".")[1].length;
        } catch (g) { }
        try {
            f = b.toString().split(".")[1].length;
        } catch (g) { }
        return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), mul(c / d, Math.pow(10, f - e));
    }
    function btnSearchClick() {
        $('#btnSearch').click(function () {
            bindAssetPaymentScheduleData();
        })
    }
    function ShowtypeClick() {
        $("#AssetPaymentStatistics_view").find("input[type='radio'][name='Showtype']").click(function () {
            console.log('ShowtypeClick');
            bindAssetPaymentStatisticsView();
        });
    }
    function bindListView(data) {
        if ($('#listViewContainer').datagrid("datagrid"))
            $('#listViewContainer').datagrid("destroy");
        console.log(data);
        data.map(function (row) {
            console.log(row);
            if (row.StartDate&&/\/Date/g.test(row.StartDate.toString()))
                row.StartDate = common.getStringDate(row.StartDate).dateFormat('yyyy-MM-dd');
            if (/\/Date/g.test(row.EndDate.toString()))
                row.EndDate = common.getStringDate(row.EndDate).dateFormat('yyyy-MM-dd');
        });
        $('#listViewContainer').datagrid({
            data: data,
            col: [{ field: "StartDate", title: "开始时间", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd }
                , { field: "EndDate", title: "结束时间", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd }
                //, { field: "InitialAmt", title: "期初剩余本金总额", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
                , { field: "PrincipalAmt", title: "本金", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
               , { field: "InterestAmt", title: "利息", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
               //, { field: "CloseAmt", title: "期末剩余本金总额", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
            ],
            attr: 'mytable',
            paramsDefault: { paging: 30 },
            noData: "<p class='noData'>当前视图没有可显示记录。</p>",
            pagerPosition: "bottom",
            pager: "mypager",
            sorter: "mysorter",
            onComplete: function () {
                //$(".mytable").on("click", ".table-td", function () {
                //    $(".mytable .table-td").removeClass("active");
                //    $(this).addClass("active");
                //})
            }
        });
    }
    function bindListViewCreateAssets(data) {
        if ($('#listViewContainer').datagrid("datagrid"))
            $('#listViewContainer').datagrid("destroy");
        console.log(data);
        data.map(function (row) {
            console.log(row);
            if (row.StartDate && /\/Date/g.test(row.StartDate.toString()))
                row.StartDate = common.getStringDate(row.StartDate).dateFormat('yyyy-MM-dd');
            if (/\/Date/g.test(row.EndDate.toString()))
                row.EndDate = common.getStringDate(row.EndDate).dateFormat('yyyy-MM-dd');
        });
        $('#listViewContainer').datagrid({
            data: data,
            col: [{ field: "StartDate", title: "开始时间", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd }
                , { field: "EndDate", title: "结束时间", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd }
                //, { field: "InitialAmt", title: "期初剩余本金总额", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
                , { field: "PrincipalAmount", title: "本金", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
               , { field: "InterestAmount", title: "利息", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
               //, { field: "CloseAmt", title: "期末剩余本金总额", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
            ],
            attr: 'mytable',
            paramsDefault: { paging: 30 },
            noData: "<p class='noData'>当前视图没有可显示记录。</p>",
            pagerPosition: "bottom",
            pager: "mypager",
            sorter: "mysorter",
            onComplete: function () {
                //$(".mytable").on("click", ".table-td", function () {
                //    $(".mytable .table-td").removeClass("active");
                //    $(this).addClass("active");
                //})
            }
        });
    }
    function bindChartView(data) {
        var categories = data.map(function (v) { return /\//g.test(v.EndDate) ? common.getStringDate(v.EndDate).dateFormat('yyyy-MM-dd') : v.EndDate; });
        if (enter) {
            var series = [{ name: '利息', data: data.map(function (v) { return v.InterestAmount; }) },
                        { name: '本金', data: data.map(function (v) { return v.PrincipalAmount; }) }];
        } else {
            var series = [{ name: '利息', data: data.map(function (v) { return v.InterestAmt; }) },
            { name: '本金', data: data.map(function (v) { return v.PrincipalAmt; }) }];
        }
        
        var titleText = "现金流图";
        var yAxisTitle = "本金及利息";

        $('#chartViewContainer').highcharts({
            chart: { type: 'column' },
            title: { text: titleText },
            xAxis: { categories: categories },
            yAxis: {
                min: 0, title: { text: yAxisTitle },
                stackLabels: {
                    enabled: false,
                    style: { fontWeight: 'normal', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
                },
                align: 'left', x: -25, y: -3
            },
            legend: {
                align: 'right', x: -25, y: -3, verticalAlign: 'top',
                floating: true, borderWidth: 1, borderColor: '#ffffff', shadow: false,
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white'
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: '{series.name}: {point.y:,.0f}<br/>共计: {point.stackTotal:,.0f}'
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: false, style: { textShadow: '0 0 3px black' },
                        color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                    }
                }
            },
            series: series
        });
    }

    function bindAssetPaymentStatistics(trustId, spName, accountNo) {
        var executeParam = { SPName: spName, SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'trustId', value: trustId, DBType: 'int' });
        if (accountNo) {
            executeParam.SQLParams.push({ Name: 'accountNo', value: accountNo, DBType: 'string' });
        }

        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var sourceData = [];
        $.ajax({
            cache: true,
            type: "GET",
            async: false,
            url: svcUrl + 'appDomain='+ poolCutId + '&executeParams=' + executeParams + '&resultType=commom',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }
                $.each(sourceData, function (i, n) {
                    sourceData[i].PayDate = sourceData[i].PayDate ? common.getStringDate(sourceData[i].PayDate).dateFormat('yyyy-MM-dd') : '';
                });
                AssetPaymentData = sourceData;
                bindAssetPaymentStatisticsList();
                console.log('bindAssetPaymentStatistics');
                bindAssetPaymentStatisticsView();
 
            },
            error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); }
        });
        return sourceData;
    }
    function bindAssetPaymentStatisticsCreateAssets(poolId, DimLoanId) {
        var executeParam = { SPName: 'TrustManagement.usp_GetVirtualSchedule', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'poolId', value: poolId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'DimLoanId', value: DimLoanId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'start', value: 1, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'end', value: 10000, DBType: 'int' });
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var sourceData = [];
        $.ajax({
            cache: true,
            type: "GET",
            async: false,
            url: svcUrl + 'appDomain=' + PoolDBName + '&executeParams=' + executeParams + '&resultType=commom',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }
                $.each(sourceData, function (i, n) {
                    sourceData[i].PayDate = sourceData[i].PayDate ? common.getStringDate(sourceData[i].PayDate).dateFormat('yyyy-MM-dd') : '';
                });
                AssetPaymentData = sourceData;
                bindAssetPaymentStatisticsList();
                console.log('bindAssetPaymentStatisticsCreateAssets');
                bindAssetPaymentStatisticsView();

            },
            error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); }
        });
        return sourceData;
    }
    function bindAssetPaymentStatisticsList() {
        var data = AssetPaymentData;
        $('#AssetPaymentStatistics_list').datagrid({
            data: data,
            col: [{ field: "AccountNo", title: "合同编号", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd }
                , {
                    field: "PayDate", title: "日期", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                    //, render: function (data) { return data.value ? getStringDate(data.value).dateFormat('yyyy-MM-dd') : ''; }
                }
                , {
                    field: "ScheduledPrincipalAmount", title: "应收（本）", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                    render: function (data) {
                        return common.numFormt(data.value)
                    }
                }
                , {
                    field: "ActualPrincipalAmount", title: "实收（本）", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                    , render: function (data) {
                        return '<input type="text" value="{0}" name="PrincipalPayAmount" rowIndex="{1}" data-valid="required decimal" onchange="CommonValidation.ValidControlValue($(this))" style="width:130px;height:80%;padding: 0 8px;" />'.StringFormat(data.value ? data.value : '', data.rowindex);
                    }
                }
                , { field: "AdjustedPrincipalAmount", title: "调整后（本）", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
                , {
                    field: "ScheduledInterestAmount", title: "应收（利息）", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                    render: function (data) {
                        return common.numFormt(data.value)
                    }
                }
                , {
                    field: "ActualInterestAmount", title: "实收（利息）", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                    , render: function (data) {
                        return '<input type="text" value="{0}" name="InterestPayAmount" rowIndex="{1}" data-valid="required decimal" onchange="CommonValidation.ValidControlValue($(this))" style="width:130px;height:80%;padding: 0 8px;" />'.StringFormat(data.value ? data.value : '', data.rowindex);
                    }
                }
                , { field: "AdjustedInterestAmount", title: "调整后（利息）", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd }
                , {
                    field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                    , render: function (data) {
                        var html = '<a class="btn btn-primary" style="cursor:pointer" rowIndex="' + data.rowindex + '" onclick="self.SaveAssetPayment(\'' + data.row.AccountNo + '\',\'' + data.row.PayDate + '\',' + data.rowindex + ');">保存</a>';
                        return html;
                    }
                }
            ],
            attr: 'mytable',
            paramsDefault: { paging: 30 },
            noData: "<p class='noData'>当前视图没有可显示记录。</p>",
            pagerPosition: "bottom",
            pager: "mypager",
            sorter: "mysorter",
            onComplete: function () {
                $(".mytable").on("click", ".table-td", function () {
                    $(".mytable .table-td").removeClass("active");
                    $(this).addClass("active");
                })
            }
        });
    }
    this.SaveAssetPayment=function(AccountNo, PayDate, index) {
        var rows = $("#AssetPaymentStatistics_list input[rowIndex='" + index + "']");
        if (rows.length > 0) {
            var haveError = false;
            $(rows).each(function () {
                var $this = $(this);
                if (!CommonValidation.ValidControlValue($this)) { haveError = true; }
            });
            if (haveError) return;

            var item = '';
            item += '<item>';
            item += '<{0}>{1}</{0}>'.StringFormat('TrustId', trustId);
            item += '<{0}>{1}</{0}>'.StringFormat('AccountNo', AccountNo);
            item += '<{0}>{1}</{0}>'.StringFormat('PayDate', PayDate);

            $.each(rows, function (i, n) {
                item += '<{0}>{1}</{0}>'.StringFormat($(n).attr("name"), $(n).val().replace(/,/g,""));
            });
            item += '</item>';

            var executeParam = {
                SPName: 'Asset.usp_UpdateAssetPayment', SQLParams: [
                    { Name: 'items', value: item, DBType: 'xml' }
                ]
            };

            common.ExecuteGetData(true, svcUrl, 'Asset', executeParam, function (data) {
                if (data[0].Result == 1) GSDialog.HintWindow('保存成功');
                else if (data[0].Result == 1) GSDialog.HintWindow('保存失败');
                else if (data[0].Result == 2) GSDialog.HintWindow('未找到该条数据');
            });
        }
    }
    
    function bindAssetPaymentStatisticsView() {
        var data = AssetPaymentData;
        var columnTemplate = function (params) {
            return {
                chart: {
                    //type: 'column',
                    zoomType: 'x'
                },
                title: { text: params.titleText },
                xAxis: { type: 'category', categories: params.categories },//categories: params.categories
                yAxis: {
                    min: 0, title: { text: params.yAxisTitle },
                    stackLabels: {
                        enabled: false,
                        style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '{series.name}: {point.y:,.0f}<br/>共计: {point.stackTotal:,.0f}'
                },
                legend: {
                    enabled: true,
                    layout: "horizontal"
                },
                plotOptions: {
                    column: {
                        stacking: 'normal'
                    }
                },
                series: params.series
            }
        };

        var categories1 = data.map(function (v) { return v.PayDate; });
        var series1 = [];
        var stype = $("#AssetPaymentStatistics_view").find("input[name='Showtype']:checked").val();
        if (stype == "1") {
            series1 = [
                    {
                        name: '计划本金', type: 'spline',
                        data: data.map(function (v) { return v.ScheduledPrincipalAmount; }),
                        stack: '计划',
                    },
                    {
                        name: '实际本金', type: 'column',
                        data: data.map(function (v) { return v.ActualPrincipalAmount; }),
                        stack: '实际',
                    },
                    {
                        name: '调整本金', type: 'column',
                        data: data.map(function (v) { return v.AdjustedPrincipalAmount; }),
                        stack: '调整',
                    }
            ];
        } else if (stype == '2') {
            series1 = [
                    {
                        name: '计划利息', type: 'spline',
                        data: data.map(function (v) { return v.ScheduledInterestAmount; }),
                        stack: '计划',
                    },
                    {
                        name: '实际利息', type: 'column',
                        data: data.map(function (v) { return v.ActualInterestAmount; }),
                        stack: '实际',
                    },
                    {
                        name: '调整利息', type: 'column',
                        data: data.map(function (v) { return v.AdjustedInterestAmount; }),
                        stack: '调整',
                    }
            ];
        }
        else {
            series1 = [
                    {
                        name: '计划',
                        type: 'spline',
                        data: data.map(function (v) { return v.ScheduledPrincipalAmount + v.ScheduledInterestAmount; }),
                        stack: '计划',
                    },
                    {
                        name: '实际', type: 'column',
                        data: data.map(function (v) { return v.ActualPrincipalAmount + v.ActualInterestAmount; }),
                        stack: '实际',
                    },
                    {
                        name: '调整', type: 'column',
                        data: data.map(function (v) { return v.AdjustedPrincipalAmount + v.AdjustedInterestAmount; }),
                        stack: '调整',
                    }
            ];
        }

        var tmp1 = { titleText: "计划还款", yAxisTitle: "", categories: categories1, series: series1 };
        $('#AssetPaymentStatistics_view_chart').highcharts(columnTemplate(tmp1));

    }

});