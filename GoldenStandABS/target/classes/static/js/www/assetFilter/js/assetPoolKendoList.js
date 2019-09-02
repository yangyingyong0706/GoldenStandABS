var height = $(window).height() - 30;
var kendouiGrid = new kendoGridModel(height);
var userName = $.cookie('gs_UserName');
var filter = '';
var isAdmin = false;
RoleOperate.getRolesByUserName(userName, function (data) {  //检查用户是否是管理员
    $.each(data, function (i, item) {
        if (item.IsRoot) {
            isAdmin = true;
        }
    });

    filter = isAdmin ? "where ParentPoolId=0 and userName!=''" : "where ParentPoolId=0 and userName = '" + userName + "' or AuditorUserName = '" + userName + "'";

    //filter = isAdmin ? 'where ParentPoolId=0' : 'where ParentPoolId=0 and userName=' + "'" + userName + "'" + 'or AuditorUserName=' + "'" + userName + "'";

 

    kendouiGrid.Init({
        renderOptions: {
            //height: 400,
            rowNumber: true
            , columns: [
                         { field: "PoolId", title: '标识', width: "10%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { template: '#=PoolId?TranToPoolPage(PoolId,PoolName):""#', title: '名称', width: "20%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "PoolDescription", title: '工作组描述', width: "25%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "OrganisationCode", title: '所属企业', width: "10%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "CreatedDate", title: '创建日期', template: '#=CreatedDate?getStringDate(CreatedDate).dateFormat("yyyy-MM-dd"):""#', width: "15%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "PoolStatusId", title: '状态', template: '#=PoolStatusId?TransStatus(PoolStatusId):""#', width: "10%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "TrustCode", title: '专项计划名称', width: "10%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
            ]
        }
        , dataSourceOptions: {
            pageSize: 20
            , otherOptions: {
                orderby: "PoolId"
                , direction: ""
                , appDomain: 'config'
                , executeParamType: 'extend'
                , defaultfilter: filter
                , executeParam: function () {
                    var result = {
                        SPName: 'usp_GetListWithPager'
                        , SQLParams: [
                            { Name: 'tableName', Value: 'config.view_Pools', DBType: 'string' }
                        ]
                    };
                    return result;
                }
            }
        }
    });
    kendouiGrid.RunderGrid();
});
function TransStatus(PoolStatusId) {
    var status;
    switch (PoolStatusId) {
        case 148:
            status = 'OPEN';
            break;
        case 149:
            status = 'INVALID';
            break;
        default:
            status = '';
            break;
    }
    return status;
}

function TranToPoolPage(PoolId,PoolName) {
    var html = '<a href="basePoolContent.html?PoolId={0}&PoolName={1}">{1}</a>'.format(PoolId, PoolName);
    return html;
}

function getPoolHeader() {
    var grid = $("#" + gridDomId).data("kendoExtGrid");
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

//function getOperate(tid, accountno, dimreportingdateid, payDate) {
//    var viewPageUrl = './TrustFollowUp/AssetPaymentSchedule.html?trustId=' + tid + '&accountNo=' + accountno;
//    var html = '<a href="javascript: showDialogPage(\'' + viewPageUrl + '\',\'资产现金流\',1000,600);">现金流</a>';

//    html += '&nbsp;&nbsp;&nbsp;';
//    var editPageUrl = './TrustFollowUp/AssetDetail.html?tid=' + tid + '&ano=' + accountno + '&dimreportingdateid=' + dimreportingdateid + '&payDate=' + payDate;
//    html += '<a href="javascript: showDialogPage(\'' + editPageUrl + '\',\'基础资产编辑\',1000,600);">编辑</a>';

//    return html;
//}

