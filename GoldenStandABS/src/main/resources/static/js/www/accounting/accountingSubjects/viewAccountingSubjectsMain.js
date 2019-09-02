
define(['jquery', 'kendo.all.min', 'gs/uiFrame/js/common', 'jquery.localizationTool', 'gs/webStorage', 'gs/webProxy', 'app/transactionManage/script/dataOperate', 'jquery-ui', 'Vue', 'kendomessagescn', 'kendoculturezhCN', "gs/uiFrame/js/gs-admin-2.pages"], function ($, kendo, common, localizationTool, webStorage, webProxy, dataOperate, JqUi, vue, kendomessagescn, kendoculturezhCN, GSDialog) {
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
                'en_GB': 'Accounting subject management'
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

            'id:subject0': {
                'en_GB': 'All accounting subjects'
            },
            'id:subject1': {
                'en_GB': 'Asset class'
            },
            'id:subject2': {
                'en_GB': 'Cost class'
            },
            'id:subject3': {
                'en_GB': 'Expenses'
            },
            'id:subject4': {
                'en_GB': 'Liability category'
            },
            'id:subject5': {
                'en_GB': 'Rights and interests'
            },
            'id:subject6': {
                'en_GB': 'Income class'
            },
            
            'id:tab1': {
                'en_GB': 'Subject number'
            },
            'id:tab2': {
                'en_GB': 'Account name'
            },
            'id:tab3': {
                'en_GB': 'Subject category'
            },
            'id:tab4': {
                'en_GB': 'Balance direction'
            },
            'id:tab5': {
                'en_GB': 'Revenue and expenditure'
            },
            'id:tab6': {
                'en_GB': 'Account date'
            },

            'id:edit1': {
                'en_GB': 'Subject number'
            },
            'id:edit2': {
                'en_GB': 'Subject name'
            },
            'id:edit3': {
                'en_GB': 'Higher level subjects'
            },
            'id:edit4': {
                'en_GB': 'Subject category'
            },
            'id:edit5': {
                'en_GB': 'Balance direction'
            },
            'id:edit6': {
                'en_GB': 'Revenue and expenditure'
            },

            'id:add1': {
                'en_GB': 'Accounting subject management'
            },
            'id:add2': {
                'en_GB': 'Closing date'
            },
            'id:add3': {
                'en_GB': 'exchange'
            },
            'id:add4': {
                'en_GB': 'Flow number'
            },
            'id:add5': {
                'en_GB': 'Flash mark'
            },
            'id:add6': {
                'en_GB': 'Transaction number'
            },
            'id:add7': {
                'en_GB': 'Account date'
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
        lang.tab1 = 'Subject number'
        lang.tab2 = 'Subject name'
        lang.tab3 = 'Subject category'
        lang.tab4 = 'Balance direction'
        lang.tab5 = 'revenue and expenditure'
        lang.tab6 = 'New'
        lang.tab7 = 'Edit'

        lang.info1 = 'Is it sure to delete data ?'
        lang.info2 = 'Please select the data to be edited'
        lang.info3 = 'Delete success!'
        lang.info4 = 'Input error! '
        $('#Newsave').val("Save information")
        $('#EditSave').val("Save information")
        $('#save').val("Save information")

    } else {
        lang.tab1 = '科目编号'
        lang.tab2 = '科目名称'
        lang.tab3 = '科目类别'
        lang.tab4 = '余额方向'
        lang.tab5 = '收支方向'
        lang.tab6 = '新增'
        lang.tab7 = '编辑'

        lang.info1 = '是否确定删除数据? '
        lang.info2 = '请选择所要编辑的数据'
        lang.info3 = '删除成功！'
        lang.info4 = '输入有误!'
        $('#Newsave').val("保存信息")
        $('#EditSave').val("保存信息")
        $('#save').val("保存信息")
    }





    //上面这个方法执行下面的方法，并且将其暴露出去
    ViewAccountingSubjects = (function () {
        function getGridHeight(obj) {
            var h = $('body').height();
            obj.find(".k-grid-content.k-auto-scrollable").css("height", h - 220 + "px");
        }
        //第一次加载
        $("#tabs").tabs();
        var str = "";
        dataOperate.viewSubject(str, viewSubjectCB);
        kendo.culture("zh-CN");

        function viewSubjectCB(json) {
            $("#grid0").kendoGrid({

                dataSource: {
                    data: json,
                    //分页
                    //pageSize: 10
                },
                selectable: "row",
                sortable: true,
                reorderable: true,
                resizable: true,
                pageable: true,
                columns: [
                    {
                        field: "SubjectNo",
                        title: lang.tab1,
                        attributes: {
                            "class": "table-SubjectNo",
                            "id": "Tabel-SubjectNo"
                        },
                        width: 80
                    },
                    {
                        field: "SubjectName",
                        title: lang.tab2,
                        attributes: {
                            "class": "table-SubjectName",
                            "id": "Tabel-SubjectName"
                        },
                        width: 80
                    },
                    {
                        field: "SubjectType",
                        title: lang.tab3,
                        attributes: {
                            "class": "table-SubjectType",
                            "id": "Tabel-SubjectType"
                        },
                        width: 80
                    },
                    {
                        field: "BalanceDirection",
                        title: lang.tab4,
                        attributes: {
                            "class": "table-BalanceDirection",
                            "id": "Tabel-BalanceDirection"
                        },
                        width: 80
                    },
                    {
                        field: "RecAndDisDirection",
                        title: lang.tab5,
                        attributes: {
                            "class": "table-RecAndDisDirection",
                            "id": "Tabel-RecAndDisDirection"
                        },
                        width: 80
                    },

                ]
            });

            getGridHeight($('#grid0'));

            var grid0 = $("#grid0").data("kendoGrid");
            var dataRows = grid0.items();
            var data0;
            var data1;
            var data2;
            var AccountNo;
            var deleteData;
            var PoolDBNamegrid;

            for (i = 0; i < dataRows.length; i++) {
                dataRows[i].onclick = function () {
                    data0 = $(this).find(".table-SubjectNo")[0].innerHTML;
                }
            }

            //新增
            var Newsave = $("#Newsave");
            $("#ViewDetails").click(function () {
                $("#StandDiv").fadeIn();
                $.anyDialog({
                    title: lang.tab6,
                    width: 600,
                    height: 250,
                    html: $("#dialogDetails")
                })
            });

            Newsave.click(function () {
                var SubjectNo = $("#SubjectNoval").val();
                var SubjectName = $("#SubjectNameval").val();
                var SuperiorSubject = $("#SuperiorSubjectVal").val();
                var SubjectType = $("#SubjectTypeval").val();
                var BalanceDirection = $("#BalanceDirectionval").val();
                var RecAndDisDirection = $("#RecAndDisDirectionval").val();
                if (!(SubjectNo == "") && !(SubjectName == "") && !(SuperiorSubject == "") && !(SubjectType == "") && !(BalanceDirection == "") && !(RecAndDisDirection == "")) {
                    dataOperate.AddSubject(SubjectNo, SubjectName, SuperiorSubject, SubjectType, BalanceDirection, RecAndDisDirection, AddSubjectCB);
                } else {
                    GSDialog.HintWindow(lang.info4,"",false);
                }
            })

            function AddSubjectCB(json) {
                console.log(json)
            }

            //编辑
            $("#Edit").click(function () {
                if ((typeof data0) == "string") {
                    $("#EditDetailsDiv").fadeIn();
                    $.anyDialog({
                        title: lang.tab7,
                        width: 600,
                        height: 250,
                        html: $("#EditDetails")
                    })
                    dataOperate.getSubjectByNo(data0, getSubjectByNoCB);
                } else {
                    GSDialog.HintWindow(lang.info2);
                };
            });

            function getSubjectByNoCB(json) {
                $("#SubjectNoEdit").val(json[0].SubjectNo);
                $("#RecAndDisDirectionEdit").val(json[0].RecAndDisDirection);
                $("#SubjectNameEdit").val(json[0].SubjectName);
                $("#BalanceDirectionEdit").val(json[0].BalanceDirection);
                $("#SubjectTypeEdit").val(json[0].SubjectType);
                $("#SuperiorSubjectEdit").val(json[0].SuperiorSubject);
            }

            //编辑保存
            $("#EditSave").click(function () {
                var EditObj = {
                    SubjectNoEdit: $("#SubjectNoEdit").val(),
                    RecAndDisDirectionEdit: $("#RecAndDisDirectionEdit").val(),
                    SubjectNameEdit: $("#SubjectNameEdit").val(),
                    BalanceDirectionEdit: $("#BalanceDirectionEdit").val(),
                    SubjectTypeEdit: $("#SubjectTypeEdit").val(),
                    SuperiorSubjectEdit: $("#SuperiorSubjectEdit").val(),
                };
                dataOperate.editSubjectByNo(EditObj.SubjectNoEdit, EditObj.SubjectNameEdit, EditObj.SuperiorSubjectEdit, EditObj.SubjectTypeEdit, EditObj.BalanceDirectionEdit, EditObj.RecAndDisDirectionEdit);
            });


            //删除
            $("#Delete").click(function () {
                if ((typeof data0) === "string") {
                    GSDialog.HintWindowTF(lang.info1, function () {
                        dataOperate.deleteSubjectByNo(data0, deleteSubjectByNoCB);
                    })
                }

            });
            function deleteSubjectByNoCB(json) {
                $(".k-state-selected").fadeOut();
                GSDialog.HintWindow(lang.info3);
            }

            //资产
            $("#subject1").click(function () {
                var str = "资产";
                dataOperate.viewSubject(str, viewSubjectCB);
                function viewSubjectCB(json) {
                    $("#grid").kendoGrid({
                        dataSource: json,
                        selectable: "row",
                        sortable: true,
                        reorderable: true,
                        resizable: true,
                        pageable: true,
                        columns: [
                            {
                                field: "SubjectNo",
                                title: lang.tab1,
                                attributes: {
                                    "class": "table-SubjectNo",
                                    "id": "Tabel-SubjectNo"
                                },
                                width: 200
                            },
                            {
                                field: "SubjectName",
                                title: lang.tab2,
                                attributes: {
                                    "class": "table-SubjectName",
                                    "id": "Tabel-SubjectName"
                                },
                                width: 200
                            },
                            {
                                field: "SubjectType",
                                title: lang.tab3,
                                attributes: {
                                    "class": "table-SubjectType",
                                    "id": "Tabel-SubjectType"
                                },
                                width: 200
                            },
                            {
                                field: "BalanceDirection",
                                title: lang.tab4,
                                attributes: {
                                    "class": "table-BalanceDirection",
                                    "id": "Tabel-BalanceDirection"
                                },
                                width: 200
                            },
                            {
                                field: "RecAndDisDirection",
                                title: lang.tab5,
                                attributes: {
                                    "class": "table-RecAndDisDirection",
                                    "id": "Tabel-RecAndDisDirection"
                                },
                                width: 200
                            },
                        ]
                    })
                };

                viewSubjectCB(json);

                getGridHeight($('#grid'));
                //变量初始化
                var grid = $("#grid").data("kendoGrid");
                var dataRows = grid.items();
                var data;
                var delectData;
                var BussinessNoData;
                for (i = 0; i < dataRows.length; i++) {
                    dataRows[i].onclick = function () {
                        data = $(this).find(".table-BussinessNo")[0].innerHTML;
                        delectData = $(this).find(".table-TransferDate")[0].innerHTML + "," + $(this).find(".table-PoolDBName")[0].innerHTML + "," + $(this).find(".table-BussinessNo")[0].innerHTML + "," + $(this).find(".table-AccountNo")[0].innerHTML;
                    }
                }



            })

            //成本
            $("#subject2").click(function () {
                var str = "成本";
                dataOperate.viewSubject(str, viewSubjectCB);
                function viewSubjectCB(json) {
                    $("#grid1").kendoGrid({
                        dataSource: json,
                        selectable: "row",
                        sortable: true,
                        reorderable: true,
                        resizable: true,
                        pageable: true,
                        columns: [
                            {
                                field: "SubjectNo",
                                title: lang.tab1,
                                attributes: {
                                    "class": "table-SubjectNo",
                                    "id": "Tabel-SubjectNo"
                                },
                                width: 80
                            },
                            {
                                field: "SubjectName",
                                title: lang.tab2,
                                attributes: {
                                    "class": "table-SubjectName",
                                    "id": "Tabel-SubjectName"
                                },
                                width: 80
                            },
                            {
                                field: "SubjectType",
                                title: lang.tab3,
                                attributes: {
                                    "class": "table-SubjectType",
                                    "id": "Tabel-SubjectType"
                                },
                                width: 80
                            },
                            {
                                field: "BalanceDirection",
                                title: lang.tab4,
                                attributes: {
                                    "class": "table-BalanceDirection",
                                    "id": "Tabel-BalanceDirection"
                                },
                                width: 80
                            },
                            {
                                field: "RecAndDisDirection",
                                title: lang.tab5,
                                attributes: {
                                    "class": "table-RecAndDisDirection",
                                    "id": "Tabel-RecAndDisDirection"
                                },
                                width: 80
                            },

                        ]
                    });
                };
                viewSubjectCB(json);
                getGridHeight($('#grid1'));
            })

            //费用
            $("#subject3").click(function () {
                var str = "费用";
                dataOperate.viewSubject(str, viewSubjectCB);
                function viewSubjectCB(json) {
                    //console.log(json);
                    $("#grid2").kendoGrid({
                        dataSource: json,
                        selectable: "row",
                        sortable: true,
                        reorderable: true,
                        resizable: true,
                        pageable: true,
                        columns: [
                            {
                                field: "SubjectNo",
                                title: lang.tab1,
                                attributes: {
                                    "class": "table-SubjectNo",
                                    "id": "Tabel-SubjectNo"
                                },
                                width: 200
                            },
                            {
                                field: "SubjectName",
                                title: lang.tab2,
                                attributes: {
                                    "class": "table-SubjectName",
                                    "id": "Tabel-SubjectName"
                                },
                                width: 200
                            },
                            {
                                field: "SubjectType",
                                title: lang.tab3,
                                attributes: {
                                    "class": "table-SubjectType",
                                    "id": "Tabel-SubjectType"
                                },
                                width: 200
                            },
                            {
                                field: "BalanceDirection",
                                title: lang.tab4,
                                attributes: {
                                    "class": "table-BalanceDirection",
                                    "id": "Tabel-BalanceDirection"
                                },
                                width: 200
                            },
                            {
                                field: "RecAndDisDirection",
                                title: lang.tab5,
                                attributes: {
                                    "class": "table-RecAndDisDirection",
                                    "id": "Tabel-RecAndDisDirection"
                                },
                                width: 200
                            },

                        ]
                    });
                };
                viewSubjectCB(json)
                getGridHeight($('#grid2'));
            })

            //负债
            $("#subject4").click(function () {
                var str = "负债";
                dataOperate.viewSubject(str, viewSubjectCB);
                function viewSubjectCB(json) {
                    //console.log(json);
                    $("#grid3").kendoGrid({
                        dataSource: json,
                        selectable: "row",
                        sortable: true,
                        reorderable: true,
                        resizable: true,
                        pageable: true,
                        columns: [
                            {
                                field: "SubjectNo",
                                title: lang.tab1,
                                attributes: {
                                    "class": "table-SubjectNo",
                                    "id": "Tabel-SubjectNo"
                                },
                                width:200
                            },
                            {
                                field: "SubjectName",
                                title: lang.tab2,
                                attributes: {
                                    "class": "table-SubjectName",
                                    "id": "Tabel-SubjectName"
                                },
                                width: 200
                            },
                            {
                                field: "SubjectType",
                                title: lang.tab3,
                                attributes: {
                                    "class": "table-SubjectType",
                                    "id": "Tabel-SubjectType"
                                },
                                width: 200
                            },
                            {
                                field: "BalanceDirection",
                                title: lang.tab4,
                                attributes: {
                                    "class": "table-BalanceDirection",
                                    "id": "Tabel-BalanceDirection"
                                },
                                width: 200
                            },
                            {
                                field: "RecAndDisDirection",
                                title: lang.tab5,
                                attributes: {
                                    "class": "table-RecAndDisDirection",
                                    "id": "Tabel-RecAndDisDirection"
                                },
                                width: 200
                            },

                        ]
                    });
                };
                viewSubjectCB(json);
                getGridHeight($('#grid3'));
            })

            //权益
            $("#subject5").click(function () {
                var str = "权益";
                dataOperate.viewSubject(str, viewSubjectCB);
                function viewSubjectCB(json) {
                    $("#grid4").kendoGrid({
                        dataSource: json,
                        selectable: "row",
                        sortable: true,
                        reorderable: true,
                        resizable: true,
                        pageable: true,
                        columns: [
                            {
                                field: "SubjectNo",
                                title: lang.tab1,
                                attributes: {
                                    "class": "table-SubjectNo",
                                    "id": "Tabel-SubjectNo"
                                },
                                width: 200
                            },
                            {
                                field: "SubjectName",
                                title: lang.tab2,
                                attributes: {
                                    "class": "table-SubjectName",
                                    "id": "Tabel-SubjectName"
                                },
                                width: 200
                            },
                            {
                                field: "SubjectType",
                                title: lang.tab3,
                                attributes: {
                                    "class": "table-SubjectType",
                                    "id": "Tabel-SubjectType"
                                },
                                width: 200
                            },
                            {
                                field: "BalanceDirection",
                                title: lang.tab4,
                                attributes: {
                                    "class": "table-BalanceDirection",
                                    "id": "Tabel-BalanceDirection"
                                },
                                width: 200
                            },
                            {
                                field: "RecAndDisDirection",
                                title: lang.tab5,
                                attributes: {
                                    "class": "table-RecAndDisDirection",
                                    "id": "Tabel-RecAndDisDirection"
                                },
                                width: 200
                            },

                        ]
                    });
                };
                viewSubjectCB(json)
                getGridHeight($('#grid4'));
            })

            //收入
            $("#subject6").click(function () {
                var str = "收入";
                dataOperate.viewSubject(str, viewSubjectCB);
                function viewSubjectCB(json) {
                    //console.log(json);
                    $("#grid5").kendoGrid({
                        dataSource: json,
                        selectable: "row",
                        sortable: true,
                        reorderable: true,
                        resizable: true,
                        pageable: true,
                        columns: [
                            {
                                field: "SubjectNo",
                                title: lang.tab1,
                                attributes: {
                                    "class": "table-SubjectNo",
                                    "id": "Tabel-SubjectNo"
                                },
                                width: 200
                            },
                            {
                                field: "SubjectName",
                                title: lang.tab2,
                                attributes: {
                                    "class": "table-SubjectName",
                                    "id": "Tabel-SubjectName"
                                },
                                width: 200
                            },
                            {
                                field: "SubjectType",
                                title: lang.tab3,
                                attributes: {
                                    "class": "table-SubjectType",
                                    "id": "Tabel-SubjectType"
                                },
                                width: 200
                            },
                            {
                                field: "BalanceDirection",
                                title: lang.tab4,
                                attributes: {
                                    "class": "table-BalanceDirection",
                                    "id": "Tabel-BalanceDirection"
                                },
                                width: 200
                            },
                            {
                                field: "RecAndDisDirection",
                                title: lang.tab5,
                                attributes: {
                                    "class": "table-RecAndDisDirection",
                                    "id": "Tabel-RecAndDisDirection"
                                },
                                width: 200
                            },
                        ]
                    });
                };
                viewSubjectCB(json)
                getGridHeight($('#grid5'));
            })
        };
    })();
});
