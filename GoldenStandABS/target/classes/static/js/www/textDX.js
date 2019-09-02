define(['jquery', 'devExtreme.dx.all', 'devExtreme.jszip.min'], function ($, dxDataGrid, dxChart) {
    $("#demo").dxDataGrid({
        dataSource: weekData,/*获取数据可以直接连接json文件,也可以是赋值的变量对象数组等等,也可以是severs*/
        /* 获取severs对象数据
            dataSource: {
                store: {
                    type: "odata",
                    url: "https://js.devexpress.com/Demos/DevAV/odata/Products"
                },
                select: [
                    "Product_ID",
                    "Product_Name",
                    "Product_Cost",
                    "Product_Sale_Price",
                    "Product_Retail_Price",
                    "Product_Current_Inventory"
                ],
                filter: ["Product_Current_Inventory", ">", 0]
            },
        */
        editing: {
            mode: "row",
            allowUpdating: true,/*编辑行*/
            allowDeleting: true,
            allowAdding: true
        },
        showRowLines: true,/*显示行数*/
        showBorders: true,/*显示边框线*/
        sorting: {/*分类*/
            mode: "none"
        },
        paging: {/*分页*/
            pageSize: 10
        },
        onCellPrepared:function(options){
            var fieldData = options.value,
               fieldHtml = "";
            if (fieldData && fieldData.value) {
                if (fieldData.diff) {
                    options.cellElement.addClass((fieldData.diff > 0) ? "inc" : "dec");
                    fieldHtml += "<span class='current-value'>" +
                                fieldData.value +
                        "</span> <span class='diff'>" +
                        Math.abs(fieldData.diff).toFixed(2) +
                        "  </span>";
                } else {
                    fieldHtml = fieldData.value;
                }
                options.cellElement.html(fieldHtml);
            }
        },
        columns: [{
            dataField: "date",/*数据字段*/
            dataType: "date",/*数据类型*/
            width: 90
        },
           "open",/*不定义的列*/
           "close",
           {/*定义的列*/
               caption: "Dynamics",/*标题*/
               width: 155,/*宽度*/
               cellTemplate: function (container, options) {/*模板*/
                   container.addClass("chart-cell");
                   $("<div />").dxSparkline({
                       dataSource: options.data.dayClose,
                       argumentField: "date",/*变量字段*/
                       valueField: "close",/*值域*/
                       type: "line",
                       showMinMax: true,
                       minColor: "green",
                       maxColor: "red",
                       pointSize: 6,/*尺寸*/
                       size: {
                           width: 140,
                           height: 30
                       },
                       tooltip: {/*提示板*/
                           enabled: true
                       }
                   }).appendTo(container);
               }
           },
           "high",
           "low"
        ]
    })
})