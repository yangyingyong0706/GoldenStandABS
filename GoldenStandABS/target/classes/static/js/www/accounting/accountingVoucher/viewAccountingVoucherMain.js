
define(['jquery', 'kendo.all.min', 'gs/uiFrame/js/common', 'jquery.localizationTool', 'gs/webStorage', 'gs/webProxy', 'app/transactionManage/script/dataOperate', 'jquery-ui', 'Vue', 'kendomessagescn', 'kendoculturezhCN'], function ($, kendo, common, localizationTool, webStorage, webProxy, dataOperate, JqUi, vue) {
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


            'id:title1': {
                'en_GB': 'Accounting accounting'
            },
            'id:title2': {
                'en_GB': 'Accounting voucher inquiry'
            },
            'id:btnView': {
                'en_GB': 'View'
            },
            'id:title3': {
                'en_GB': 'Flow number'
            },
            'id:check': {
                'en_GB': 'Check'
            },
            'id:tab1': {
                'en_GB': 'Flow number'
            },
            'id:tab2': {
                'en_GB': 'Account date'
            },
            'id:tab3': {
                'en_GB': 'Flash mark'
            },
            'id:tab4': {
                'en_GB': 'Currency'
            }
            
        }
    });
    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();

    lang = {};
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.tab1 = 'Account number'
        lang.tab2 = 'Account Date'
        lang.tab3 = 'Trading variety'
        lang.tab4 = 'Transaction number'
        lang.tab5 = 'Agent'
        lang.tab6 = 'Flash mark'
        lang.tab7 = 'Reviewer'

        lang.info1 = 'Please select the items you want to view!'
        lang.info2 = 'View the details'

        lang.line1 = 'Abstract'
        lang.line2 = 'Accounting subjects'
        lang.line3 = 'Borrow'
        lang.line4 = 'Loan'

    } else {
        lang.tab1 = '记账流水号'
        lang.tab2 = '记账日期'
        lang.tab3 = '交易品种'
        lang.tab4 = '交易编号'
        lang.tab5 = '经办人'
        lang.tab6 = '冲销标志'
        lang.tab7 = '复核人'

        lang.info1 = '请选择想要查看的条目'
        lang.info2 = '查看详情'

        lang.line1 = '摘要'
        lang.line2 = '会计科目'
        lang.line3 = '借'
        lang.line4 = '贷'

    }


    //上面这个方法执行下面的方法，并且将其暴露出去
    ViewAccountingSubjectsMain = (function () {
        $(document).ready(function () {
            dataOperate.viewCertificationDetails("", viewCertificationDetailsCB);

            function viewCertificationDetailsCB(json) {
                for (i = 0; i < json.length; i++) {
                    //时间转换
                    var date = new Date(parseInt(json[i].AccountDate.slice(6)));
                    var Month = date.getMonth();
                    var D = date.getDate();

                    if (parseInt(Month) + 1 < 10)
                        Month = "0" + String(parseInt(Month) + 1);
                    else
                        Month = String(parseInt(Month) + 1);
                    if (parseInt(D) < 10)
                        D = "0" + D;
                    json[i].AccountDate = date.getFullYear() + '-' + Month + '-' + D;
                }

                
                kendo.culture("zh-CN");
                $("#grid").kendoGrid({
                    dataSource: {
                        data: json,
                        //pageSize: 10
                    },
                    sortable: true,
                    selectable: "row",
                    reorderable: true,
                    resizable: true,
                    pageable: true,
                    columns: [
                        {
                            field: "SerialNo",
                            title: lang.tab1,
                            attributes: {
                                "class": "table-SerialNo",
                                "id": "Tabel-SerialNo"
                            },
                            width: 80
                        },
                        {
                            field: "AccountDate",
                            title: lang.tab2,
                            attributes: {
                                "class": "table-AccountDate",
                                "id": "Tabel-AccountDate"
                            },
                            width: 80
                        },
                        {
                            field: "TradeType",
                            title: lang.tab3,
                            attributes: {
                                "class": "table-TradeType",
                                "id": "Tabel-TradeType"
                            },
                            width: 80
                        },
                        {
                            field: "TradeNo",
                            title: lang.tab4,
                            attributes: {
                                "class": "table-TradeNo",
                                "id": "Tabel-TradeNo"
                            },
                            width: 80
                        },
                        {
                            field: "Agent",
                            title: lang.tab5,
                            attributes: {
                                "class": "table-Agent",
                                "id": "Tabel-Agent"
                            },
                            width: 80
                        },
                         {
                             field: "AbatementMark",
                             title: lang.tab6,
                             attributes: {
                                 "class": "table-AbatementMark",
                                 "id": "Tabel-AbatementMark"
                             },
                             width: 80
                         },
                        {
                            field: "Reviewer",
                            title: lang.tab7,
                            attributes: {
                                "class": "table-Reviewer",
                                "id": "Tabel-Reviewer"
                            },
                            width: 80
                        }

                    ]
                });

                function gridHeight() {
                    var h = $("body").height()
                    $("#grid").find(".k-grid-content").css("height", h - 145 + "px");
                }

                gridHeight();

                var grid0 = $("#grid").data("kendoGrid");
                var dataRows = grid0.items();
                var data0;
                var data1;
                var data2;
                var AccountNo;
                var deleteData;
                var PoolDBNamegrid;

                for (i = 0; i < dataRows.length; i++) {
                    dataRows[i].onclick = function () {
                        data0 = $(this).find(".table-SerialNo")[0].innerHTML;
                        
                    }
                }

                $("#ViewDetails").click(function () {
                    if ((typeof data0) == "string") {
                        $.anyDialog({
                            title: lang.info2,
                            html: $("#lookDetails"),
                            width: 800,
                            height:468
                        })
                        $("#lookDetailscontent").fadeIn();
                        dataOperate.getSceneByCode(data0, getSceneByCodeCB);
                    } else {
                        //alert("test for  !!!");
                        alert(lang.info1);
                    };
                });

                function getSceneByCodeCB(jsondata) {
                    
                    for (i = 0; i < jsondata.length; i++) {
                        //时间转换
                        var date = new Date(parseInt(jsondata[i].AccountDate.slice(6)));
                        var Month = date.getMonth();
                        var D = date.getDate();

                        if (parseInt(Month) + 1 < 10)
                            Month = "0" + String(parseInt(Month) + 1);
                        else
                            Month = String(parseInt(Month) + 1);
                        if (parseInt(D) < 10)
                            D = "0" + D;
                        jsondata[i].AccountDate = date.getFullYear() + '-' + Month + '-' + D;
                    }
                    $("#detailsSerialNo").val(jsondata[0].SerialNo);
                    $("#detailAccountDate").val(jsondata[0].AccountDate);
                    $("#detailAbatementMark").val(jsondata[0].AbatementMark);
                    $("#detailCurrency").val(jsondata[0].currency);
                    $("#detailsgrid").kendoGrid({
                        dataSource: {
                            data: jsondata,
                            pageSize: 10
                        },
                        height: 300,
                        sortable: true,
                        selectable: "row",
                        reorderable: true,
                        resizable: true,
                        pageable: true,
                        columns: [
                            {
                                field: "Abstract",
                                title: lang.line1,
                                attributes: {
                                    "class": "table-Abstract",
                                    "id": "Tabel-Abstract"
                                },
                                width: 80
                            },
                            {
                                field: "Subject",
                                title: lang.line2,
                                attributes: {
                                    "class": "table-Subject",
                                    "id": "Tabel-Subject"
                                },
                                width: 80
                            },
                            {
                                field: "Debeit",
                                title: lang.line3,
                                attributes: {
                                    "class": "table-Debeit",
                                    "id": "Tabel-Debeit"
                                },
                                width: 80
                            },
                            {
                                field: "Credit",
                                title: lang.line4,
                                attributes: {
                                    "class": "table-Credit",
                                    "id": "Tabel-Credit"
                                },
                                width: 80
                            }
                        ]
                    });
                }

            };
        });

    })();
});
