define(function (require) {
    var $ = require('jquery');
    var anydialog = require('anyDialog');
    //var kendoGridModel = require('app/basicData/TrustManagementService/TrustManagement/common/Scripts/kendoGridModel');
    var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');
    var roleOperate = require('gs/uiFrame/js/roleOperate');
    var GSDialog = require("gsAdminPages")
    //require('app/productManage/interface/trustList_interface');
    var self = this;
    var userName = roleOperate.cookieName();
    var isAdmin = false;
    var filter = '';
    var height = $(window).height() - 70;
    roleOperate.getRolesByUserName(userName, function (data) {  //检查用户是否是管理员
        $.each(data, function (i, item) {
            if (item.IsRoot) {
                isAdmin = true;
            }
        })


        var kendouiGrid = new kendoGridModel(height);
        kendouiGrid.Init({
            renderOptions: {
                columns: [
                         { field: "Id", title: '序号', width: "80", headerAttributes: { "class": "table-header-cell", style: "text-align: center;" }, attributes: { "class": "table-cell", style: "text-align: center;" } }
                        , { field: "Category", title: '类型', width: "80", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "SubCategory", title: '子类型', width: "80", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "SubCategoryCode", title: '子类型代码', width: "100", headerAttributes: { "class": "table-header-cell", style: "text-align: center;" }, attributes: { "class": "table-cell", style: "text-align: center;" } }
                        , { field: "BaseRate", title: '基准利率', width: "80", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "type", title: '利率类别', width: "100", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "PubDate", title: '发布日期', template: '#=PubDate?self.getStringDate(PubDate).dateFormat("yyyy-MM-dd"):""#', width: "10%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                ]
            }
            , dataSourceOptions: {

                otherOptions: {
                    orderby: "type"
                    , direction: ""
                    , DBName: 'TrustManagement'
                    , appDomain: 'TrustManagement'
                    , executeParamType: 'extend'
                    , defaultfilter: filter
                    , executeParam: function () {
                        var result = {
                            SPName: 'usp_GetListWithPager'
                            , SQLParams: [
                                { Name: 'tableName', Value: 'TrustManagement.view_VIRates', DBType: 'string' }
                            ]
                        };
                        return result;
                    }
                }
            }
        });
        kendouiGrid.RunderGrid();
    });
    
    $(function () {
        $("#btnNewVISet").anyDialog({
            width: 600,	// 弹出框内容宽度
            height: 440, // 弹出框内容高度
            title: '新增',	// 弹出框标题
            url: './VIRateOperation.html?operation=new',
            changeallow: true,
            scrolling: false,
            draggable: true
        });

        $("#btnEditVI").click(function () {
           
            getVIRowData(
                function (data) {
                    var subCategory = escape(data.SubCategory);
                    $.anyDialog({
                        width: 600,	// 弹出框内容宽度
                        height: 200, // 弹出框内容高度
                        title: '编辑',	// 弹出框标题
                        url: './VIRateOperation.html?operation=edit&subcategorycode=' + data.SubCategoryCode + '&pubdate=' + data.PubDate + '&baserate=' + data.BaseRate + '&subcategory=' + subCategory + '&type=' + data.type + '&id=' + data.Id + '&category=' + data.Category,
                        changeallow: true,
                        scrolling: false,
                        draggable: true
                    });
                }
            )
        });
    });

    function getVIRowData(callback) {
        
        var grid = $("#grid").data("kendoExtGrid");
        if (grid.select().length != 1) {
            GSDialog.HintWindow('请选择一条要操作的数据');
        } else {
            var dataRows = grid.items();
            // 获取行号
            var rowIndex = dataRows.index(grid.select());
            // 获取行对象
            var data = grid.dataItem(grid.select());
            callback(data);
        }
    }

    self.getStringDate=function(strDate) {
        //var str = '/Date(1408464000000)/';
        if (!strDate) {
            return '';
        }
        var str = strDate.replace(new RegExp('\/', 'gm'), '');
        return eval('new ' + str);
    }

});