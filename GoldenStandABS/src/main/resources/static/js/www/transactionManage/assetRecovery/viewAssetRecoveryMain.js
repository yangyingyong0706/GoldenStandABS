define(['jquery', 'kendo.all.min', 'gs/uiFrame/js/common', 'app/transactionManage/script/dataOperate', 'jquery-ui', 'Vue', 'jquery.localizationTool', 'gs/webStorage', 'gs/uiFrame/js/gs-admin-2.pages', 'gs/globalVariable'], function ($, kendo, common, dataOperate, JqUi, vue, jl, webStorage, GSDialog, gs) {
    //上面这个方法执行下面的方法，并且将其暴露出去
    var lang = {};
    ViewAssetRecoveryMain = (function () {

        //require('jquery.localizationTool');
        //var webStorage = require('gs/webStorage');


        $('#selectLanguageDropdown_viewAssetRecovery').localizationTool({
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

                'id:span_transactionManage': {
                    'en_GB': 'Transaction Manage'
                },
                'id:span_assetRecovery': {
                    'en_GB': 'Asset Recovery'
                },
                'id:content_label_assetRecovery_Details': {
                    'en_GB': 'Details'
                },
                'id:content_label_assetRecovery_Add': {
                    'en_GB': 'Recovery'
                },
                'id:content_label_assetRecovery_MaturityDate': {
                    'en_GB': 'DeadLine:'
                },
                'id:content_label_assetRecovery_assetNo': {
                    'en_GB': 'AssetNo:'
                },
                'id:PoolDBNameBtn': {
                    'en_GB': 'Search'
                }


            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_viewAssetRecovery').localizationTool('translate', userLanguage);
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
        lang.StartDate = '起始日';
        lang.MaturityDate = '到期日';
        lang.PoolDBName = '资产池名称';
        lang.select = '请选择想要查看的条目';
        lang.isrec = '是否确定回收数据！';
        lang.rec = '已回收';
        lang.null = '检索数据不能为空';
        

        
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
            lang.select = 'Please select an item';
            lang.isrec = 'Are you sure to redeem data！';
            lang.rec = 'Recovery';
            lang.null = "Data can't be null !";
        }





        dataOperate.GettransationManagerData(transationManagerJson);
        function transationManagerJson(json) {
            $("#grid").kendoGrid({
                dataSource: {
                    data: json,
                    pageSize: 10
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
                            "class": "table-AccountNo"
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
                $("#grid").find(".k-grid-content").css("height", h - 176 + "px");
            }
            gridHeight();
            //查看数据
            var grid = $("#grid").data("kendoGrid");
            //测试
            var dataSource = $("#grid").data("kendoGrid").dataSource;
            console.log(dataSource)
            console.log(dataSource._pristineData)
            var dataRows = grid.items();
            console.log(dataRows)
            var data;
            var AccountNo;
            for (i = 0; i < dataRows.length; i++) {
                dataRows[i].onclick = function () {
                    data = $(this).find(".table-AccountNo")[0].innerHTML;
                }
            }
            $("#ViewDetails").click(function () {
                console.log(data)
                if ((typeof data) == "string") {
                    $("#StandDiv").fadeIn();
                    $("#dialogDetails").dialog();
                    dataOperate.ViewRecycleProperty(data, ViewRecyclePropertyCB);
                } else {
                    GSDialog.HintWindow(lang.select);
                };
            });
            function ViewRecyclePropertyCB(json) {
                console.log(json);
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
                $("#TransferDate").val(getDateTime(ConvertJSONDateToJSDate(json[0].TransferDate)));
                $("#StartDate").val(getDateTime(ConvertJSONDateToJSDate(json[0].StartDate)));
                $("#transationMaturityDate").val(getDateTime(ConvertJSONDateToJSDate(json[0].MaturityDate)));
                $("#AccountNo").val(json[0].AccountNo);
                $("#CurrentPrincipalBalance").val(json[0].CurrentPrincipalBalance);
                $("#DealSum").val(json[0].DealSum);
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
                        console.log(111)
                        dataOperate.SaveRecycleProperty(data, SaveRecyclePropertyCB);
                    })
                }
            });
            function SaveRecyclePropertyCB(json) {
                $(".k-state-selected").find(".table-accde").text(lang.rec);
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
                            title: lang.DealSum,
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
                //$("#AddDetails").dialog();
                var bdiv = $("#AddDetails");
                $.anyDialog({
                    width: "800",
                    height: "500",
                    html:bdiv,

                })
            }
        };
    })();
    
});