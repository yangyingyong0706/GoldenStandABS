function getPoolHeader() {
    var grid = $("#grid").data("kendoExtGrid");
    if (grid.select().length != 1) {
        alert('请选择要操作的资产池');
    } else {
        //var dataRows = grid.items();
        //// 获取行号
        //var rowIndex = dataRows.index(grid.select());
        // 获取行对象
        var data = grid.dataItem(grid.select());
        return data;
    }
}