
define(['jquery', 'kendo.all.min', 'gs/uiFrame/js/common', 'app/transactionManage/script/dataOperate', 'jquery-ui', 'Vue', 'jquery.localizationTool', 'gs/webStorage', 'gs/uiFrame/js/gs-admin-2.pages', 'gs/globalVariable'], function ($, kendo, common, dataOperate, JqUi, vue, jl, webStorage, GSDialog, gs) {
    //上面这个方法执行下面的方法，并且将其暴露出去


    var lang = {};
    $('#selectLanguageDropdown_viewBuyBack').localizationTool({
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

            'id:viewBuyBack_transactionManage': {
                'en_GB': 'Transaction Manage'
            },
            'class:viewBuyBack_BuyBack': {
                'en_GB': 'Buy Back'
            },
            'class:viewBuyBack_ViewDetails': {
                'en_GB': 'Details'
            },
            'class:viewBuyBack_Add': {
                'en_GB': 'Buy Back'
            },
            'class:viewBuyBack_Delete': {
                'en_GB': 'Delete'
            },
            'class:viewBuyBack_MaturityDate': {
                'en_GB': 'DeadLine:'
            },
            'class:viewBuyBack_MaturityDate_1': {
                'en_GB': 'DeadLine'
            },
            'class:viewBuyBack_PoolDBNameBtn': {
                'en_GB': 'Search'
            },
            'class:viewBuyBack_assetNo': {
                'en_GB': 'AssetNo:'
            },
            'class:viewBuyBack_assetNo_1': {
                'en_GB': 'AssetNo'
            },
            'title::class:viewBuyBack_AddDetails': {
                'en_GB': 'Search Result'
            },
            'title::class:viewBuyBack_dialogDetails': {
                'en_GB': 'Details'
            },
            'class:viewBuyBack_DivisionName': {
                'en_GB': 'Organization'
            },
            'class:viewBuyBack_PoolDBName': {
                'en_GB': 'Pool DB Name'
            },
            'class:viewBuyBack_RecycleDate': {
                'en_GB': 'Recycle Date'
            },
            'class:viewBuyBack_PayDate': {
                'en_GB': 'Pay Date'
            },
            'class:viewBuyBack_StartDate': {
                'en_GB': 'Start Date'
            },
            'class:viewBuyBack_TrustCode': {
                'en_GB': 'Trust Code'
            },
            'class:viewBuyBack_TrustName': {
                'en_GB': 'Trust Name'
            },
            'value::class:viewBuyBack_save': {
                'en_GB': 'Save'
            }




    


        }
    });

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_viewBuyBack').localizationTool('translate', userLanguage);
    }
    $('body').show();



    lang.display = '显示{0}-{1}条，共{2}条';
    lang.empty = '没有数据';
    lang.page = '页';
    lang.itemsPerPage = '条';
    lang.first = '第一页';
    lang.previous = '前一页';
    lang.next = '下一页';
    lang.last = '最后一页';
    lang.refresh = '刷新';

    lang.AccountNo = '资产编号';
    lang.DivisionName = '经办机构（分行）';
    lang.StartDate = '开始日期';
    lang.MaturityDate = '截止日';
    lang.RecycleDate = '回收上划日';
    lang.PoolDBName = '资产池';
    lang.ShouldPaySum = '借据本金余额（元）';
    lang.ShouldPaySum_1 = '应付本金';
    lang.TrustName = '产品名称';
    lang.TrustCode = '产品编号';
    lang.select = '请选择想要查看的条目';
    lang.isrec = '是否确定回收数据！';
    lang.isdel = '是否确定删除数据！';
    



    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.display = 'Display {0}-{1}，Totle {2}';
        lang.empty = 'Empty';
        lang.page = 'Page';
        lang.itemsPerPage = ' ';
        lang.first = 'First';
        lang.previous = 'Previous';
        lang.next = 'Next';
        lang.last = 'Last';
        lang.refresh = 'Refresh';

       


        lang.AccountNo = 'AccountNo';
        lang.DivisionName = 'Organization';
        lang.StartDate = 'Start Date';
        lang.MaturityDate = 'Maturity Date';
        lang.RecycleDate = 'Recycle Date';
        lang.PoolDBName = 'Pool DB Name';
        lang.ShouldPaySum = 'Principal Balance';
        lang.ShouldPaySum_1 = 'Pay Principal';
        lang.TrustName = 'Product Name';
        lang.TrustCode = 'Product Code';
        lang.select = 'Please select an item';
        lang.isrec = 'Are sure to recycle data?';
        lang.isdel = 'Are you sure to delete data?';



    }






    ViewBuyBackData = function () { };
    ViewBuyBackData.prototype = {
        demo: function () {
            dataOperate.GetTransferAssetsforRecycleCross(GetTransferAssetsforRecycleCrossCB);
            function GetTransferAssetsforRecycleCrossCB(json) {
                console.log(json);
                //时间日期转换
                for (i = 0; i < json.length; i++) {
                    var JsonMaturityDate = json[i].MaturityDate;
                    var JsonRecycleDate = json[i].RecycleDate;
                    //yyyy-MM-dd HH:mm:SS
                    function getDateTime(date) {
                        var year = date.getFullYear();
                        var month = date.getMonth() + 1;
                        var day = date.getDate();
                        var hh = date.getHours();
                        var mm = date.getMinutes();
                        var ss = date.getSeconds();
                        //return year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss;
                        return year + "-" + month + "-" + day;
                    };
                    //调用的是这个方法
                    function ConvertJSONDateToJSDate(jsondate) {
                        var date = new Date(parseInt(jsondate.replace("/Date(", "").replace(")/", ""), 10));
                        return date;
                    }
                    var JsonMaturityDateTime = getDateTime(ConvertJSONDateToJSDate(JsonMaturityDate));
                    var JsonRecycleDateTime = getDateTime(ConvertJSONDateToJSDate(JsonRecycleDate));
                };
                $("#grid").kendoGrid({
                    dataSource: {
                        data: json,
                        pageSize: 10
                    },
                    sortable: true,
                    reorderable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        page: 1,
                        pageSize: 20,
                        pageSizes: [5, 20, 50, 100, 500],
                        messages: {
                            display: lang.display,
                            empty: lang.empty,
                            page: lang.page,
                            of: "/ {0}",
                            itemsPerPage: lang.itemsPerPage,
                            first: lang.first,
                            previous: lang.previous,
                            next: lang.next,
                            last: lang.last,
                            refresh: lang.refresh
                        }
                    },
                    selectable: "row",
                    page: 15,
                    columns: [
                        {
                            field: "AccountNo",
                            title: lang.AccountNo,
                            attributes: {
                                "class": "table-BussinessNo"
                            },
                            width: 300
                        },
                        {
                            field: "DivisionName",
                            title: lang.DivisionName,
                            width: 300
                        },
                        {
                            field: "MaturityDate",
                            format: "{0:MM/dd/yyyy}",
                            title: lang.StartDate,
                            width: 300
                        },
                        {
                            field: "RecycleDate",
                            title: lang.MaturityDate,
                            format: "{0:MM/dd/yyyy}",
                            width: 300
                        },
                        {
                            field: "ShouldPaySum",
                            title: lang.ShouldPaySum,
                            width: 300
                        },

                        {
                            field: "TrustName",
                            title: lang.TrustName,
                            width: 300
                        },
                        {
                            field: "TrustCode",
                            title: lang.TrustCode,
                            width: 300
                        },
                        {
                            field: "",
                            title: "",
                            width: "auto"
                        },
                    ]
                });
                function getDate() {
                    var trustId = common.getQueryString('tid');
                    var svcUrl = gs.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
                    executeParam = {
                        SPName: "dbo.usp_GetFactLoanDateProjectStage",
                        SQLParams: [
                            { 'Name': 'ProjectId', 'Value': trustId, 'DBType': 'int' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {

                        $.each(data, function (i, v) {
                            $("#PoolDBNameDate").append("<option value=" + v.ReportingDate + ">" + v.ReportingDate + "</option>");
                        })


                    })

                }
                getDate();



                function gridHeight() {
                    var h = $("body").height()
                    $("#grid").find(".k-grid-content").css("height", h - 142 + "px");
                }
                gridHeight();
                //查看数据
                var grid = $("#grid").data("kendoGrid");
                var dataRows = grid.items();
                var data;
                var AccountNo;
                var delectData;
                for (i = 0; i < dataRows.length; i++) {
                    dataRows[i].onclick = function () {
                        data = $(this).find(".table-BussinessNo")[0].innerHTML;
                        // delectData = $(this).find(".table-TransferDate")[0].innerHTML + "," + $(this).find(".table-PoolDBName")[0].innerHTML + "," + $(this).find(".table-BussinessNo")[0].innerHTML + "," + $(this).find(".table-AccountNo")[0].innerHTML;
                    }
                }
                $("#ViewDetails").click(function () {
                    if ((typeof data) == "string") {
                        $("#StandDiv").fadeIn();
                        //$("#dialogDetails").dialog();
                        $.anyDialog({
                            title:"回收上划管理",
                            width: 800,
                            height: 350,
                            html: $("#dialogDetails")
                        })
                        dataOperate.ViewRecycleCrossProperty(data, ViewRecycleCrossPropertyCB);
                    } else {
                        alert(lang.select);
                    };
                });
                function ViewRecycleCrossPropertyCB(json) {
                    console.log(json)
                    function getDateTime(dateS) {
                        var year = dateS.getFullYear();
                        var month = dateS.getMonth() + 1;
                        var day = dateS.getDate();
                        var hh = dateS.getHours();
                        var mm = dateS.getMinutes();
                        var ss = dateS.getSeconds();
                        return year + "-" + month + "-" + day;
                    }
                    //调用的是这个方法
                    function ConvertJSONDateToJSDate(jsondate) {
                        var dateS = new Date(parseInt(jsondate.replace("/Date(", "").replace(")/", ""), 10));
                        return dateS;
                    }
                    var MaturityDate = json[0].MaturityDate;
                    var StartDate = json[0].StartDate;
                    $("#AccountNo").val(json[0].AccountNo);
                    $("#DivisionName").val(json[0].DivisionName);
                    $("#MaturityDate").val(getDateTime(ConvertJSONDateToJSDate(MaturityDate)));
                    $("#PoolDBName").val(json[0].PoolDBName);
                    $("#RecycleDate").val(getDateTime(ConvertJSONDateToJSDate(json[0].RecycleDate)));
                    $("#ShouldPayDate").val(getDateTime(ConvertJSONDateToJSDate(json[0].ShouldPayDate)));
                    $("#StartDate").val(getDateTime(ConvertJSONDateToJSDate(StartDate)));
                    $("#TrustCode").val(json[0].TrustCode);
                    $("#TrustName").val(json[0].TrustName);
                }
                //交易管理（回收确认）检索查询
                $("#Add").click(function () {
                    if ((typeof data) == "string") {
                        GSDialog.HintWindowTF(lang.isrec, function () {
                            dataOperate.SaveRecycleCrossProperty(data, SaveRecycleCrossPropertyCB);
                        })
                    };
                });
                function SaveRecycleCrossPropertyCB(json) {
                    $(".k-state-selected").fadeOut();
                }

                //删除数据
                $("#Delete").click(function () {
                    if ((typeof data) === "string") {
                        GSDialog.HintWindowTF(lang.isdel, function () {
                            dataOperate.DeleteRecycleCrossProperty(JSON.parse(data), DeleteRecycleCrossPropertyCB);
                        })
                    }

                });
                function DeleteRecycleCrossPropertyCB(json) {
                    $(".k-state-selected").fadeOut();
                }

                //交易管理（回收管理）检索查询
                $("#PoolDBNameBtn").click(function () {
                    var PoolDBNameDate = $("#PoolDBNameDate").val();
                    var PoolDBNameDate1 = $("#PoolDBNameDate1").val();
                    var tabelPoolData = $(".table-PoolDBName");
                    if (PoolDBNameDate1 == "") {
                        var PoolDBNameDate1 = "";
                        dataOperate.viewQueryTransferPropertyFroRecycleCross(PoolDBNameDate1, PoolDBNameDate, viewQueryTransferPropertyFroRecycleCrossCB);
                    } else if (PoolDBNameDate == "") {
                        var PoolDBNameDate = "";
                        dataOperate.viewQueryTransferPropertyFroRecycleCross(PoolDBNameDate1, PoolDBNameDate, viewQueryTransferPropertyFroRecycleCrossCB);
                    } else {
                        dataOperate.viewQueryTransferPropertyFroRecycleCross(PoolDBNameDate1, PoolDBNameDate, viewQueryTransferPropertyFroRecycleCrossCB);
                    }
                })
                function viewQueryTransferPropertyFroRecycleCrossCB(jsondata) {
                    $("#btnItemCRUD").fadeIn();
                    $("#AddDetailsDiv").fadeIn();
                    $.anyDialog({
                        title: '检索查询',
                        html: $("#AddDetails"),
                        width: 800,
                        height:500

                    })
                    for (i = 0; i < jsondata.length; i++) {
                        var date = new Date(parseInt(jsondata[i].RecycleDate.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();

                        if (parseInt(Month) + 1 < 10)
                            Month = "0" + String(parseInt(Month) + 1);
                        else
                            Month = String(parseInt(Month) + 1);
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        jsondata[i].RecycleDate = date.getFullYear() + '-' + Month + '-' + D;
                    }
                    for (i = 0; i < jsondata.length; i++) {
                        var date = new Date(parseInt(jsondata[i].MaturityDate.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();

                        if (parseInt(Month) + 1 < 10)
                            Month = "0" + String(parseInt(Month) + 1);
                        else
                            Month = String(parseInt(Month) + 1);
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        jsondata[i].MaturityDate = date.getFullYear() + '-' + Month + '-' + D;
                    }

                    $("#queryGrid").kendoGrid({
                        dataSource: jsondata,
                        height: 390,
                        selectable: "row",
                        sortable: true,
                        reorderable: true,
                        resizable: true,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            buttonCount: 5,
                            page: 1,
                            pageSize: 20,
                            pageSizes: [5, 20, 50, 100, 500],
                            messages: {
                                display: lang.display,
                                empty: lang.empty,
                                page: lang.page,
                                of: "/ {0}",
                                itemsPerPage: lang.itemsPerPage,
                                first: lang.first,
                                previous: lang.previous,
                                next: lang.next,
                                last: lang.last,
                                refresh: lang.refresh
                            }
                        },
                        columns: [
                            {
                                field: "AccountNo",
                                title: lang.AccountNo,
                                attributes: {
                                    "class": "table-AccountNo",
                                    "id": "table-AccountNo"
                                },
                                width: 80
                            },
                            {
                                field: "DivisionName",
                                title: lang.DivisionName,
                                attributes: {
                                    "class": "table-DevisionName",
                                    "id": "table-DevisionName"
                                },
                                width: 80
                            },

                            {
                                field: "MaturityDate",
                                title: lang.MaturityDate,
                                attributes: {
                                    "class": "table-MaturityDate",
                                    "id": "table-MaturityDate"
                                },
                                width: 80
                            },
                            {
                                field: "PoolDBName",
                                title: lang.PoolDBName,
                                attributes: {
                                    "class": "table-PoolDBName",
                                    "id": "table-PoolDBName"
                                },
                                width: 80
                            },
                            {
                                field: "RecycleDate",
                                title: lang.RecycleDate,
                                attributes: {
                                    "class": "table-RecycleDate",
                                    "id": "table-RecycleDate"
                                },
                                width: 80
                            },
                            {
                                field: "ShouldPaySum",
                                title: lang.ShouldPaySum_1,
                                attributes: {
                                    "class": "tabel-TrustCode",
                                    "id": "table-TrustCode"
                                },
                                width: 80
                            },
                            {
                                field: "TrustCode",
                                title: lang.TrustCode,
                                attributes: {
                                    "class": "tabel-TrustCode",
                                    "id": "table-TrustCode"
                                },
                                width: 80
                            },
                            {
                                field: "TrustName",
                                title: lang.TrustName,
                                attributes: {
                                    "class": "tabel-TrustName",
                                    "id": "table-TrustName"
                                },
                                width: 80
                            },
                        ]
                    })
                }
            };
        }
    }
    return new ViewBuyBackData();
});







