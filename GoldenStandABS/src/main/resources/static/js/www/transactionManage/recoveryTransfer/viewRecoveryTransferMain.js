
define(['jquery', 'kendo.all.min', 'gs/uiFrame/js/common', 'app/transactionManage/script/dataOperate', 'jquery-ui', 'Vue', 'jquery.localizationTool', 'gs/webStorage', 'gs/uiFrame/js/gs-admin-2.pages', 'gs/globalVariable'], function ($, kendo, common, dataOperate, JqUi, Vue, jl, webStorage, GSDialog, gs) {




    var lang = {};
    $('#selectLanguageDropdown_viewRecoveryTransfer').localizationTool({
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

            'id:viewRecoveryTransfer_transactionManage': {
                'en_GB': 'Transaction Manage'
            },
            'class:viewRecoveryTransfer_RecoveryTransfer': {
                'en_GB': 'Recovery Transfer'
            },
            'class:viewRecoveryTransfer_ViewDetails': {
                'en_GB': 'Details'
            },
            'class:viewRecoveryTransfer_Add': {
                'en_GB': 'Recovery Transfer'
            },
            'class:viewRecoveryTransfer_Delete': {
                'en_GB': 'Delete'
            },
            'class:viewRecoveryTransfer_MaturityDate': {
                'en_GB': 'DeadLine:'
            },
            'class:viewRecoveryTransfer_MaturityDate_1': {
                'en_GB': 'DeadLine'
            },
            'class:viewRecoveryTransfer_PoolDBNameBtn': {
                'en_GB': 'Search'
            },
            'class:viewRecoveryTransfer_assetNo': {
                'en_GB': 'AssetNo:'
            },
            'class:viewRecoveryTransfer_assetNo_1': {
                'en_GB': 'AssetNo'
            },
            'title::class:viewRecoveryTransfer_AddDetails': {
                'en_GB': 'Search Result'
            },
            'title::class:viewrecoverytransfer_dialogDetails': {
                'en_GB': 'Details'
            },
            'class:viewRecoveryTransfer_DivisionName': {
                'en_GB': 'Organization'
            },
            'class:viewBuyBack_PoolDBName': {
                'en_GB': 'Pool DB Name'
            },
            'class:viewRecoveryTransfer_RecycleCrossDate': {
                'en_GB': 'Recycle Cross Date'
            },
            'class:viewRecoveryTransfer_ShouldPaySum': {
                'en_GB': 'Pay Sum'
            },
            'class:viewRecoveryTransfer_StartDate': {
                'en_GB': 'Start Date'
            },
            'class:viewRecoveryTransfer_TrustCode': {
                'en_GB': 'Product Code'
            },
            'class:viewRecoveryTransfer_TrustName': {
                'en_GB': 'Product Name'
            }







        }
    });

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_viewRecoveryTransfer').localizationTool('translate', userLanguage);
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
    lang.status = '交易状态';
    lang.DealSum = '交易份额';
    lang.MaturityDate = '到期日';
    lang.StartDate = '起始日';
    lang.PoolDBName = '资产池名称';
    lang.ShouldPaySum = '应付金额';
    lang.select = '请选择想要查看的条目';
    lang.isrec = '是否确定回收数据！';
    lang.null = '检索数据不能为空';
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
        lang.status = 'Status';
        lang.DealSum = 'Trade share';
        lang.StartDate = 'Start Date';
        lang.MaturityDate = 'Maturity Date';
        lang.PoolDBName = 'Pool DB Name';
        lang.ShouldPaySum = 'Pay Sum';
        lang.select = 'Please select an item';
        lang.isrec = 'Are sure to recycle data ?';
        lang.null = "Data can't be null";
        lang.isdel = 'Are you sure to delete data?';

    }










    //上面这个方法执行下面的方法，并且将其暴露出去
    ViewBuyBack = (function () {
         var vm = new Vue({
            el: '#app',
            data: {
                addData: ''
            }

        });
        dataOperate.GettransationManagerData(transationManagerJson);
        function transationManagerJson(json) {
            $("#grid").kendoGrid({
                dataSource: {
                    data: json,
                    //pageSize: 10
                },
                sortable: true,
                selectable: "row",
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
                            "class": "table-BussinessNo"
                        },
                        width: 300
                    },
                    {
                        field: "",
                        attributes: {
                            "class": "table-accde"
                        },
                        title: lang.status,
                        width: 150
                    },

                    {
                        field: "DealSum",
                        title: lang.DealSum,
                        width: 300
                    },
                    {
                        field: "StartDate",
                        title: lang.StartDate,
                        width: 300
                    },
                    {
                        field: "MaturityDate",
                        attributes: {
                            "class": "table-MaturityDate"
                        },
                        title: lang.MaturityDate,
                        width: 300
                    },
                       {
                           field: "PoolDBName",
                           title: lang.PoolDBName,
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
                console.log(h);
                $("#grid").find(".k-grid-content").css("height", h - 177 + "px");
            }
            gridHeight();
            //查看数据
            var grid = $("#grid").data("kendoGrid");
            var dataRows = grid.items();
            var data;
            var AccountNo;
            for (i = 0; i < dataRows.length; i++) {
                dataRows[i].onclick = function () {
                    data = $(this).find(".table-BussinessNo")[0].innerHTML;
                }
            }
            $("#ViewDetails").click(function () {
                if ((typeof data) == "string") {
                    $("#StandDiv").fadeIn();
                    $.anyDialog({
                        title: "查看详情",
                        width: 800,
                        height: 260,
                        html:$("#dialogDetails")
                    })
                    dataOperate.ViewRecycleProperty(data, ViewRecyclePropertyCB);
                } else {
                    GSDialog.HintWindow(lang.select);
                };
            });
            function ViewRecyclePropertyCB(json) {
                vm.addData = json;
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
                $("#RecycleCrossDate").val(getDateTime(ConvertJSONDateToJSDate(json[0].TransferDate)));
                $("#StartDate").val(getDateTime(ConvertJSONDateToJSDate(json[0].StartDate)));
                $("#MaturityDate").val(getDateTime(ConvertJSONDateToJSDate(json[0].MaturityDate)));
                $("#AccountNo").val(json[0].AccountNo);
                $("#CurrentPrincipalBalance").val(json[0].CurrentPrincipalBalance);
                $("#ShouldPaySum").val(json[0].DealSum);
                $("#DivisionName").val(json[0].DivisionName);
                $("#FactSum").val(json[0].FactSum);
                $("#PoolDBName").val(json[0].PoolDBName);
                $("#TrustCode").val(json[0].TrustCode);
            }
            //交易管理（回收确认）检索查询
            $("#Add").click(function () {
                console.log(data);
                if ((typeof data) == "string") {
                    GSDialog.HintWindowTF(lang.isrec, function () {
                        dataOperate.SaveRecycleProperty(data, SaveRecyclePropertyCB);
                    })
                }
            });
            //删除
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
            function SaveRecyclePropertyCB(json) {
                $(".k-state-selected").find(".table-accde").text("已回收");
                console.log($(".k-state-selected").find(".table-accde"));
            }

            //交易管理（回收管理）检索查询

            $("#PoolDBNameBtn").click(function () {
                var PoolDBNameDate1 = $("#PoolDBNameDate1").val();
                var PoolDBNameDate = $("#PoolDBNameDate").val();
                if (!(PoolDBNameDate == "") && !(PoolDBNameDate1 == "")) {
                    dataOperate.viewQueryTransferPropertyForRecycle(PoolDBNameDate, PoolDBNameDate1, viewQueryTransferPropertyForRecycleCB);
                    $("#viewDiv").fadeIn();
                    $("#view").dialog();
                } else {
                    GSDialog.HintWindow(lang.null)
                }
            })
            function viewQueryTransferPropertyForRecycleCB(jsondata) {
                console.log(jsondata);
                $("#AddDetailsDiv").fadeIn();
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
                for (i = 0; i < jsondata.length; i++) {
                    var date = new Date(parseInt(jsondata[i].StartDate.slice(6)));
                    var Month = date.getMonth();
                    var D = date.getDate();

                    if (parseInt(Month) + 1 < 10)
                        Month = "0" + String(parseInt(Month) + 1);
                    else
                        Month = String(parseInt(Month) + 1);
                    if (parseInt(D) < 10)
                        D = "0" + D;
                    jsondata[i].StartDate = date.getFullYear() + '-' + Month + '-' + D;
                }
                $("#queryGrid").kendoGrid({
                    dataSource: jsondata,
                    height: 425,
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
                            field: "PoolDBName",
                            title: lang.PoolDBName,
                            attributes: {
                                "class": "table-PoolDBName",
                                "id": "table-PoolDBName"
                            },
                            width: 80
                        },
                        {
                            field: "DealSum",
                            title: lang.ShouldPaySum,
                            attributes: {
                                "class": "table-DealSum",
                                "id": "table-DealSum"

                            },
                            width: 80
                        },

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
                            field: "MaturityDate",
                            title: lang.MaturityDate,
                            attributes: {
                                "class": "table-MaturityDate",
                                "id": "table-MaturityDate"
                            },
                            width: 80
                        },
                        {
                            field: "StartDate",
                            title: lang.StartDate,
                            attributes: {
                                "class": "table-StartDate",
                                "id": "table-StartDate"
                            },
                            width: 80
                        }
                    ]
                })
                $.anyDialog({
                    title: "增加",
                    width: 800,
                    height: 500,
                    html: $("#AddDetails")
                })
            }
        };
    })();
});







