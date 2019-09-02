
define(['jquery', 'kendo.all.min', 'gs/uiFrame/js/common', 'app/transactionManage/script/dataOperate', 'jquery-ui', 'Vue', 'jquery.localizationTool', 'gs/webStorage', 'gsAdminPages'], function ($, kendo, common, dataOperate, JqUi, vue, jl, webStorage, GSDialog) {




    var lang = {};
    $('#selectLanguageDropdown_viewRecycleMark').localizationTool({
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

            'class:viewRecycleMark_transactionManage': {
                'en_GB': 'Transaction Manage'
            },
            'class:viewRecycleMark_RecycleMark': {
                'en_GB': 'Recycle Mark'
            },
            'class:viewRecycleMark_ViewDetails': {
                'en_GB': 'Details'
            },
            'class:viewRecycleMark_PoolDB': {
                'en_GB': 'Pool DB: '
            },
            'class:viewRecycleMark_PoolDBNameBtn': {
                'en_GB': 'Search'
            },
            'title::class:viewRecycleMark_dialogDetails': {
                'en_GB': 'Details:'
            },
            'class:viewRecycleMark_NetAssetValue': {
                'en_GB': 'Net Asset Value: '
            },
            'class:viewRecycleMark_NetAssetValueModify': {
                'en_GB': 'Modify'
            },
            'value::class:viewRecycleMark_save': {
                'en_GB': 'Save'
            },
            'title::class:viewRecycleMark_AddDetails': {
                'en_GB': 'Search Result'
            }






        }
    });

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_viewRecycleMark').localizationTool('translate', userLanguage);
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

    lang.BussinessType = '业务类型';
    lang.DivisionName = '经办机构（分行）';
    lang.FactSum = '实际结算金额（元）';
    lang.OperationDate = '赎回/回购日';
   
    lang.PoolDBName = '资产池';
    lang.Principal = '借据本金余额（元）';
    lang.PropertyType = '资产组合类型';
    
    lang.CustomerId = '客户编号';
    lang.AccountNo = '资产编号';
    lang.DealSum = '交易份额';



    lang.NetAssetValue = '单位进价（元）';
    
   
    lang.select = '请选择想要查看的条目';
    lang.null = '检索的内容有误！';
    lang.modify = '修改成功！';
    




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
       
        lang.PoolDBName = 'Pool DB Name';
        lang.NetAssetValue = 'Net Asset Value';
        lang.null = "Data can't be null";
        lang.select = 'Please select an item';
      

        lang.BussinessType = 'Bussiness Type';
        
        lang.FactSum = 'Fact Sum';
        lang.OperationDate = 'Operation Date';

       
        lang.Principal = 'Principal';
        lang.PropertyType = 'Property Type';

        lang.CustomerId = 'Customer Id';
       
        lang.DealSum = 'Trade share';


        lang.modify = 'Modify successfully！';
        
        

        
       

    }








    //上面这个方法执行下面的方法，并且将其暴露出去
    (function RecycleMark() {
        //获取数据
        dataOperate.GetBuyBackDisplay(GetBuyBackDisplayCB);
        function GetBuyBackDisplayCB(json) {
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
                        field: "BussinessType",
                        title: lang.BussinessType,
                        attributes: {
                            "class": "table-BussinessType",
                            "id": "table-BussinessType"
                        },
                        width: 80
                    },
                    {
                        field: "DevisionName",
                        title: lang.DivisionName,
                        attributes: {
                            "class": "table-DevisionName",
                            "id": "table-DevisionName"
                        },
                        width: 80
                    },
                    {
                        field: "FactSum",
                        title: lang.FactSum,
                        width: 80
                    },
                    {
                        field: "OperationDate",
                        title: lang.OperationDate,
                        attributes: {
                            "class": "table-OperationDate",
                            "id": "table-OperationDate"
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
                        field: "Principal",
                        title: lang.Principal,
                        width: 80
                    },
                    {
                        field: "PropertyType",
                        title: lang.PropertyType,
                        attributes: {
                            "class": "table-PropertyType",
                            "id": "table-PropertyType"
                        },
                        width: 80
                    },
                ]
            });
            //获取iframe适应宽度
            function gridHeight() {
                var h = $("body").height()
                console.log(h);
                $("#grid").find(".k-grid-content").css("height", h - 172+ "px");
            }
            gridHeight();
            //交易管理（回购上划）查询数据
            var grid = $("#grid").data("kendoGrid");
            var dataRows = grid.items();
            var data0;
            var data1;
            var data2;
            var AccountNo;
            var deleteData;
            var PoolDBNamegrid;
            for (i = 0; i < dataRows.length; i++) {
                dataRows[i].onclick = function () {
                    data0 = $(this).find(".table-PoolDBName")[0].innerHTML;
                    data1 = $(this).find(".table-BussinessType")[0].innerHTML;
                    data2 = $(this).find(".table-OperationDate")[0].innerHTML;
                    //deleteData = $(this).find(".table-ClearanceBuyBackDate")[0].innerHTML + "," + $(this).find(".table-PoolDBName")[0].innerHTML + "," + $(this).find(".table-DevisionName")[0].innerHTML;
                }
            }
            //查看详情
            $("#ViewDetails").click(function () {
                if ((typeof data0) == "string") {
                    var NetAssetValueDateDiv = $(".NetAssetValueDateDiv");
                    NetAssetValueDateDiv.fadeIn();
                    dataOperate.ViewBuyBackOn(data0, data1, data2, ViewBuyBackOnCB);
                } else {
                    GSDialog.HintWindow(lang.select);
                };
            });
            function ViewBuyBackOnCB(json) {
                $("#StandDiv").fadeIn();
                $.anyDialog({
                    title: "查看详情",
                    html: $("#dialogDetails"),
                    width: 800,
                    height: 500

                })
                $("#detailsGrid").kendoGrid({
                    dataSource: {
                        data: json,
                        pageSize: 10
                    },
                    height: 350,
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
                            field: "CustomerId",
                            title: lang.CustomerId,
                            attributes: {
                                "class": "table-CustomerId",
                                "id": "tableCustomerId"
                            },
                            width: 80
                        },
                        {
                            field: "AccountNo",
                            title: lang.AccountNo,
                            attributes: {
                                "class": "table-AccountNo",
                            },
                            width: 80
                        },

                        {
                            field: "DealSum",
                            title: lang.DealSum,
                            attributes: {
                                "class": "table-DealSum",
                            },
                            width: 80
                        },
                        {
                            field: "NetAssetValue",
                            title: lang.NetAssetValue,
                            attributes: {
                                "class": "table-NetAssetValue",
                            },
                            width: 80
                        },
                        {
                            field: "DealSum",
                            title: lang.FactSum,
                            attributes: {
                                "id": "table-DealSum",
                            },
                            width: 80
                        }

                    ]
                });
                //交易管理（清仓回购）批量修改单位净价
                $("#NetAssetValueBtn").click(function () {
                    var NetAssetValueDate = $("#NetAssetValueDate");
                    var deleteDataobj = deleteData.split(",");
                    var updatasum = {
                        PoolDBName: {
                            updatasumDataTime: deleteDataobj[0],
                            updatasumDataname: deleteDataobj[1],
                            updatasumDevisionName: deleteDataobj[2]
                        },
                        NetAssetValue: NetAssetValueDate.val(),
                    }
                    dataOperate.UpdateClearanceBuyBackNetAssetValue(updatasum.PoolDBName.updatasumDataname, updatasum.PoolDBName.updatasumDataTime, updatasum.PoolDBName.updatasumDevisionName, updatasum.NetAssetValue, UpdateClearanceBuyBackNetAssetValueCB);
                })
                function UpdateClearanceBuyBackNetAssetValueCB(json) {
                    GSDialog.HintWindow("修改成功！")
                };
            }
            //交易管理（回购上划）检索查询
            $("#PoolDBNameBtn").click(function () {
                var MaturityDate = $("#PoolDBNameDate").val();
                var tabelPoolData = $(".table-PoolDBName");
                var DevisionNameData = $("#table-DevisionName");
                if (!(MaturityDate == "")) {
                    dataOperate.QueryBuyBackOn(MaturityDate, DevisionNameData.html(), QueryBuyBackOnCB);
                } else {
                    GSDialog.HintWindow(lang.null);
                }
            })
            function QueryBuyBackOnCB(jsondata) {
                console.log(jsondata)
                $("#AddDetailsDiv").fadeIn();
                $.anyDialog({
                    html: $("#AddDetails"),
                    title: "检索",
                    width: 800,
                    height:500
                })
                for (i = 0; i < jsondata.length; i++) {
                    var date = new Date(parseInt(jsondata[i].OperationDate.slice(6)));
                    var Month = date.getMonth();
                    var D = date.getDate();

                    if (parseInt(Month) + 1 < 10)
                        Month = "0" + String(parseInt(Month) + 1);
                    else
                        Month = String(parseInt(Month) + 1);
                    if (parseInt(D) < 10)
                        D = "0" + D;
                    jsondata[i].OperationDate = date.getFullYear() + '-' + Month + '-' + D;
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
                            field: "BussinessType",
                            title: lang.BussinessType,
                            attributes: {
                                "class": "table-BussinessType",
                                "id": "table-BussinessType"
                            },
                            width: 80
                        },
                        {
                            field: "DevisionName",
                            title: lang.DivisionName,
                            attributes: {
                                "class": "table-DevisionName",
                                "id": "table-DevisionName"

                            },
                            width: 80
                        },

                        {
                            field: "FactSum",
                            title: lang.FactSum,
                            attributes: {
                                "class": "table-FactSum",
                                "id": "table-FactSum"
                            },
                            width: 80
                        },
                        {
                            field: "OperationDate",
                            title: lang.OperationDate,
                            attributes: {
                                "class": "table-OperationDate",
                                "id": "table-OperationDate"
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
                            field: "Principal",
                            title: lang.Principal,
                            attributes: {
                                "class": "table-Principal",
                                "id": "table-Principal"
                            },
                            width: 80
                        },
                        {
                            field: "PropertyType",
                            title: lang.PropertyType,
                            attributes: {
                                "class": "table-PropertyType",
                                "id": "table-PropertyType"
                            },
                            width: 80
                        },
                    ]
                })
            }

            //交易管理（回购上划）批量修改单位净价

            $("#Edit").click(function () {
                $("#EditDetailsDiv").fadeIn();
                $("#EditDetails").dialog();
            });
            $("#Add").click(function () {
                $("#AddDetailsDiv").fadeIn();
                $("#AddDetails").dialog();
            });
            $("#Delete").click(function () {
                $("#DeleteDetailsDiv").fadeIn();
                $("#DeleteDetails").dialog();
            });
        };
    })();
});







