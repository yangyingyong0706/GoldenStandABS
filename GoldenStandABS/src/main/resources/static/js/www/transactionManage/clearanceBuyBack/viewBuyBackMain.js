
define(['jquery', 'kendo.all.min', 'gs/uiFrame/js/common', 'app/transactionManage/dataOperate'], function ($, kendo, common, dataOperate) {
    //上面这个方法执行下面的方法，并且将其暴露出去
    ViewBuyBack = function () { };
    ViewBuyBack.prototype = {
        demo: function () {
            DataOperate.GettransationManagerData(transationManagerJson);
            function transationManagerJson(json) {
                $("#grid").kendoGrid({
                    dataSource: {
                        data: json,
                        pageSize: 10
                    },
                    height: 550,
                    sortable: true,
                    selectable: "row",
                    reorderable: true,
                    resizable: true,
                    pageable: true,
                    columns: [
                        {
                            field: "AccountNo",
                            title: "资产编号",
                            attributes: {
                                "class": "table-BussinessNo"
                            },
                            width: 80
                        },
                        {
                            field: "",
                            attributes: {
                                "class": "table-accde"
                            },
                            title: "交易状态",
                            width: 80
                        },

                        {
                            field: "DealSum",
                            title: "交易份额",
                            width: 80
                        },
                        {
                            field: "StartDate",
                            title: "起始日",
                            width: 80
                        },
                        {
                            field: "MaturityDate",
                            attributes: {
                                "class": "table-MaturityDate"
                            },
                            title: "到期日",
                            width: 80
                        },
                           {
                               field: "PoolDBName",
                               title: "资产池名称",
                               width: 80
                           },
                    ]
                });
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
                    console.log(data)
                    if ((typeof data) == "string") {
                        $("#StandDiv").fadeIn();
                        $("#dialogDetails").dialog();
                        DataOperate.ViewRecycleProperty(data, ViewRecyclePropertyCB);
                    } else {
                        alert("请选择想要查看的条目");
                    };
                });
                function ViewRecyclePropertyCB(json) {
                    console.log(json);
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
                    $("#TransferDate").val(getDateTime(ConvertJSONDateToJSDate(json[0].TransferDate)));
                    $("#StartDate").val(getDateTime(ConvertJSONDateToJSDate(json[0].StartDate)));
                    $("#transationMaturityDate").val(getDateTime(ConvertJSONDateToJSDate(json[0].MaturityDate)));
                }
                //交易管理（回收确认）检索查询
                $("#Add").click(function () {
                    console.log(data);
                    if ((typeof data) == "string") {
                        if (confirm("是否确定回收数据！")) {

                            DataOperate.SaveRecycleProperty(data, SaveRecyclePropertyCB);

                        }
                    }
                });
                function SaveRecyclePropertyCB(json) {
                    $(".k-state-selected").find(".table-accde").text("已回收");
                    console.log($(".k-state-selected").find(".table-accde"));
                }

                //交易管理（回收管理）检索查询

                $("#PoolDBNameBtn").click(function () {
                    var PoolDBNameDate1 = $("#PoolDBNameDate1").val();
                    var PoolDBNameDate = $("#PoolDBNameDate").val();
                    if (!(PoolDBNameDate == "") && !(PoolDBNameDate1 == "")) {
                        DataOperate.viewQueryTransferPropertyForRecycle(PoolDBNameDate, PoolDBNameDate1, viewQueryTransferPropertyForRecycleCB);
                        $("#viewDiv").fadeIn();
                        $("#view").dialog();
                    } else {
                        alert("检索数据不能为空")
                    }
                })
                function viewQueryTransferPropertyForRecycleCB(jsondata) {
                    console.log(jsondata);
                    $("#AddDetailsDiv").fadeIn();
                    $("#AddDetails").dialog();
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
                        height: 550,
                        selectable: "row",
                        sortable: true,
                        reorderable: true,
                        resizable: true,
                        pageable: true,
                        columns: [
                            {
                                field: "PoolDBName",
                                title: "资产池",
                                attributes: {
                                    "class": "table-PoolDBName",
                                    "id": "table-PoolDBName"
                                },
                                width: 80
                            },
                            {
                                field: "DealSum",
                                title: "应付金额",
                                attributes: {
                                    "class": "table-DealSum",
                                    "id": "table-DealSum"

                                },
                                width: 80
                            },

                            {
                                field: "AccountNo",
                                title: "资产编号",
                                attributes: {
                                    "class": "table-AccountNo",
                                    "id": "table-AccountNo"
                                },
                                width: 80
                            },
                            {
                                field: "MaturityDate",
                                title: "截止日期",
                                attributes: {
                                    "class": "table-MaturityDate",
                                    "id": "table-MaturityDate"
                                },
                                width: 80
                            },
                            {
                                field: "StartDate",
                                title: "开始日期",
                                attributes: {
                                    "class": "table-StartDate",
                                    "id": "table-StartDate"
                                },
                                width: 80
                            }
                        ]
                    })
                }
            };
        }
    }
    return new ViewBuyBack();
});







