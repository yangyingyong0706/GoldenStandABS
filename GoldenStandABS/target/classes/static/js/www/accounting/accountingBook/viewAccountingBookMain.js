define(['jquery', 'kendo.all.min', 'gs/uiFrame/js/common','jquery.localizationTool','gs/webStorage', 'gs/webProxy','app/transactionManage/script/dataOperate', 'jquery-ui', 'Vue', 'kendomessagescn', 'kendoculturezhCN', "gsAdminPages"], function ($, kendo, common,localizationTool,webStorage,webProxy, dataOperate, JqUi, Vue, kendomessagescn, kendoculturezhCN, GSDialog) {
    //require('jquery.localizationTool');
    //webStorage = require('gs/webStorage');
    //webProxy = require('gs/webProxy');

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
                'en_GB': 'Account management'
            },
            'id:btnAdd': {
                'en_GB': 'Add'
            },
            'id:btnEdit': {
                'en_GB': 'Edit'
            },
            'id:btnDel': {
                'en_GB': 'Delete'
            },
            'id:title3': {
                'en_GB': 'Account number'
            },
            'id:BookNoBtn': {
                'en_GB': 'retrieval'
            },
            'id:tab1': {
                'en_GB': 'Account number'
            },
            'id:tab2': {
                'en_GB': 'Account name'
            },
            'id:tab3': {
                'en_GB': 'Remarks'
            },
            'id:add1': {
                'en_GB': 'Account number'
            },
            'id:add2': {
                'en_GB': 'Account name'
            },
            'id:add3': {
                'en_GB': 'Remarks: '
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
        lang.tab2 = 'Account name'
        lang.tab3 = 'Remarks'
        lang.tab4 = 'Price allocation'
        lang.tab5 = 'Edit'
        lang.info1 = 'Please select the items to be deleted'
        lang.info2 = 'Please select the data to be edited'
        lang.info3 = 'Delete success!'
        lang.info4 = 'Retrieved data can not be empty'
        $('#save').val("Save information")

    } else {
        lang.tab1 = '账套号'
        lang.tab2 = '账套名称'
        lang.tab3 = '备注'
        lang.tab4 = '对价分配'
        lang.tab5 = '编辑'
        lang.info1 = '请选择删除的条目'
        lang.info2 = '请选择所要编辑的数据'
        lang.info3 = '删除成功！'
        lang.info4 = '检索数据不能为空'
        $('#save').val("保存信息")
    }

    //上面这个方法执行下面的方法，并且将其暴露出去
    ViewAccountingBookMain = (function () {
        var vm = new Vue({
            el: '#app',
            data: {
                data1:''
            }

        });

        dataOperate.GetAccountSet(AccountSetJson);

        var item;
        var h = $("body").height() - 69;
        function AccountSetJson(json) {
            kendo.culture("zh-CN");

            $("#grid").kendoGrid({
                dataSource: {
                    data: json,
                    pageSize: 10
                },
                height:h,
                selectable: "row",
                sortable: true,
                reorderable: true,
                resizable: true,
                pageable: true,
                columns: [
                    {
                        field: "AccountSetNo",
                        title: lang.tab1,
                        attributes: {
                            "class": "table-AccountSetNo",
                            "id": "table-AccountSetNo"

                        },
                        width: 80
                    },
                    {
                        field: "AccountSetName",
                        title: lang.tab2,
                        width: 80
                    },
                    {
                        field: "Remark",
                        title: lang.tab3,
                        width: 80
                    },
                ]
            });

            //查看数据
            var grid = $("#grid").data("kendoGrid");

            var dataRows = grid.items();
            var data;

            var delectData;
            var BussinessNoData;

            for (i = 0; i < dataRows.length; i++) {
                dataRows[i].onclick = function () {
                    data = $(this).find(".table-AccountSetNo")[0].innerHTML;
                    //delectData = $(this).find(".table-TransferDate")[0].innerHTML + "," + $(this).find(".table-PoolDBName")[0].innerHTML + "," + $(this).find(".table-BussinessNo")[0].innerHTML + "," + $(this).find(".table-AccountNo")[0].innerHTML;
                }
            }

            //新建数据
            $("#Add").click(function () {
                $("#AddDetailsDiv").fadeIn();
                $.anyDialog({
                    title: lang.tab4,
                    width: 600,
                    height: 205,
                    html: $("#AddDetails")
                })
            });

            //删除数据
            $("#Delete").click(function () {
                if ((typeof data) === "string") {
                    dataOperate.DeleteAccountSet(data, DeleteAccountSetCB);
                }
                else {
                    GSDialog.HintWindow(lang.info1);
                }
            });

            function DeleteAccountSetCB(json) {
                $(".k-state-selected").fadeOut();
                GSDialog.HintWindow(lang.info3);
            }

            //编辑数据
            var eidtItem1 = $("#eidtItem")
            $("#Edit").click(function () {
                if ((typeof data) === "string") {
                    $("#EditDetailsDiv").fadeIn();
                    $.anyDialog({
                        title: lang.tab5,
                        width: 600,
                        height: 205,
                        html:$("#EditDetails")
                    })
                    dataOperate.GetAccountSetForUpdate(data, GetAccountSetForUpdateCB);
                } else {
                    console.log(GSDialog)
                    GSDialog.HintWindow(lang.info2)
                }
            });

            function GetAccountSetForUpdateCB(json) {
                vm.data1 = json;
                $("#AccountSetNo").val(json[0].AccountSetNo);
                $("#AccountSetName").val(json[0].AccountSetName);
                $("#Remark").val(json[0].Remark);
            }

            //检索查询
            $("#BookNoBtn").click(function () {
                var BookNo = $("#BookNo").val();
                if (!(BookNo == "")) {
                    dataOperate.QueryAccountSet(BookNo, QueryAccountSetCB);

                } else {
                    GSDialog.HintWindow(lang.info4)
                }
            });

            function QueryAccountSetCB(json) {
                console.log(json)
            }
        };
    })();
})
