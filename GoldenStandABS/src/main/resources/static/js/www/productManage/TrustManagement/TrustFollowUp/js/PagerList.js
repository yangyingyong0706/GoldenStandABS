/// <reference path="../../TrustWizard/Scripts/jquery-1.7.2.min.js" />
/// <reference path="jquery.datagrid.js" />
/// <reference path="jquery.datagrid.options.js" />
/// <reference path="../../TrustWizard/Scripts/common.js" />
var PagerListModule;

define(function (require) {
    var $ = require('jquery');
    require('jquery.datagrid');
    require('jquery.datagrid.options');
    var common = require('common');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var GlobalVariable = require('globalVariable');
    var FilePathConfig = require('gs/FilePathConfig');
    var listCategory = {
        AssetDetails: 'AssetDetails',//底部资产列表
        Originator: 'Originator'//原始权益人列表
    };
    var GSDialog = require("gsAdminPages")
    var displayColumns = {
        AssetDetails: [
            {
                field: "", title: "序号",sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {  return data.rowindex; }
            },
            {
                field: "PayDate", title: "回款日", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                //,render: function (data) {
                //    return data.value ? getStringDate(data.value).dateFormat('ygetStringDateyyy-MM-dd') : '';
                //}
            },
            {
                field: "AccountNo", title: "合同编号",sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            { field: "CustomerName", title: "债务人名称", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
            //{
            //    field: "ContractDate", title: "签约日", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd,
            //    render: function (data) {
            //        return data.value ? getStringDate(data.value).dateFormat('yyyy-MM-dd') : '';
            //    }
            //},
            {
                field: "StartDate", title: "开始日", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    return data.value ? common.getStringDate(data.value).dateFormat('yyyy-MM-dd') : '';
                }
            },
            {
                field: "EndDate", title: "到期日", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    return data.value ? common.getStringDate(data.value).dateFormat('yyyy-MM-dd') : '';
                }
            },
            {
                field: "InterestRate", title: "利率（%）", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            {
                field: "CurrentPrincipalBalance", title: "本金余额（元）", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            {
                field: "status", title: "状态", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                //,render: function (data) { return data.row.InArrear ? '逾期' : (data.row.IsPrepaid ? '早偿' : '正常'); }
            },
            /*{
                field: "InArrear", title: "是否逾期", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) { return data.value ? '是' : '否'; }
            },
            {
                field: "IsPrepaid", title: "是否早偿", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) { return data.value ? '是' : '否'; }
            },*/
            {
                field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    var viewPageUrl = './TrustFollowUp/AssetPaymentSchedule.html?trustId=' + data.row.TrustId + '&accountNo=' + data.row.AccountNo;
                    var html = '<a href="javascript: showDialogPage(\'' + viewPageUrl + '\',\'资产现金流\',1000,600);">现金流</a>';

                    html += '&nbsp;&nbsp;&nbsp;';
                    var editPageUrl = './TrustFollowUp/AssetDetail.html?tid=' + data.row.TrustId + '&ano=' + data.row.AccountNo + '&dimreportingdateid=' + data.row.DimReportingDateId + '&payDate=' + getPayDate();
                    html += '<a href="javascript: showDialogPage(\'' + editPageUrl + '\',\'基础资产编辑\',1000,600);">编辑</a>';

                    return html;
                }
            }
        ],

        Originator: [
            {
                field: "Name", title: "名称", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                //,
                //render: function (data) {
                //    return '<a href="#">' + data.value + '</a>';
                //}
            },
            { field: "Rating", title: "原始权益人主体评级", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd },
            {
                field: "ReportingDate", title: "报告日", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    return data.value ? common.getStringDate(data.value).dateFormat('yyyy-MM-dd') : '';
                }
            },
            {
                field: "TotalAssetAmt", title: "总资产", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    return common.numFormt(data.value)
                }
            },
            {
                field: "NetAssetAmt", title: "净资产", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    return common.numFormt(data.value)
                }
            },
            {
                field: "TurnOver", title: "营业收入", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    return common.numFormt(data.value)
                }
            },
            {
                field: "NetProfit", title: "净利润", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    return common.numFormt(data.value)
                }
            },
            {field: "AssetDebitRatio", title: "资产负债率", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,},
            { field: "AssetNPRatio", title: "不良率", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
            {
                field: "AuditReport", title: "审计报告", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    //return '<a href="' + FilePathConfig.GetFilePath(data.row.TrustId, "tblOriginator", data.row.OriginatorId, data.value) + '" target="_blank">' + data.value + '</a>';
                    return  data.value
                }
            },
            {
                field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    var $div = $('<div/>');
                    var $html = $('<a style="cursor:pointer">修改&nbsp;&nbsp;</a>');
                    var $delete = $('<a style="cursor:pointer">删除</a>');
                    $div.append($html);
                    $div.append($delete);
                    $delete.click(function deleteOriginatorByOriginatorId() {
                        GSDialog.HintWindowTF("确定删除？", function () {
                            var executeParam = {
                                SPName: 'usp_DeleteOriginatorByOriginatorId', SQLParams:
                                    [{ Name: 'OriginatorId', Value: data.row.OriginatorId, DBType: 'int' }]
                            };

                            var sContent = JSON.stringify(executeParam);
                            var serviceUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' +
                                sContent + "&resultType=com";
                            $.ajax({
                                type: "GET",
                                cache: false,
                                url: serviceUrl,
                                dataType: "jsonp",
                                crossDomain: true,
                                contentType: "application/xml;charset=utf-8",
                                data: {},
                                success: function (response) {
                                    if (typeof response == "string")
                                        response = JSON.parse(response);
                                },
                                error: function (response) { GSDialog.HintWindow("error:" + response); }
                            });

                            // history.go(0); 

                            // 关闭的回调 list 的刷新方法
                            PagerListModule.Filter({});
                        })
                        // alert('删除成功！');
                    });


                    $html.anyDialog({
                        width: 900,	// 弹出框内容宽度
                        height: 500, // 弹出框内容高度
                        title: '原始权益人信息',	// 弹出框标题
                        url: '../OriginalOwner/OriginalOwner.html?oid=' + data.row.OriginatorId,
                        onClose: function () {
                            //关闭的回调 list 的刷新方法
                            PagerListModule.Filter({});
                        }
                    });
                    return $div;
                }
            }
        ]
    };

    PagerListModule = function () {
        var listCate, spName, trustId, svcUrl, $dtGrid;

        var initArgs = function (cate, sp, tId, url, continerId) {
            listCate = cate;
            spName = sp;
            trustId = tId,
            svcUrl = url;
            $dtGrid = $(continerId);
        };

        var dataBind = function (fnCallBack) {
            $dtGrid.datagrid({
                source: function () {
                    var params = this.params();
                    return syncGetRemoteData(params);
                },
                col: displayColumns[listCate],
                attr: 'mytable',
                paramsDefault: { paging: 20, where: getWhere(), payDate: (typeof getPayDate != "undefined" ? getPayDate() : undefined) },
                noData: "<p class='noData'>当前视图没有可显示记录。</p>",
                pagerPosition: "bottom",
                pager: "mypager",
                sorter: "mysorter",
                /*onBefore: function() {
          
                },
                onData: function() {
          
                },
                onRowData: function(data) {
          
                },*/
                onComplete: function () {
                    $(".mytable").on("click", ".table-td", function () {
                        $(".mytable .table-td").removeClass("active");
                        $(this).addClass("active");
                    });

                    if (fnCallBack) { fnCallBack(this.settings.recordCount); }
                }
            });
        };
        var syncGetRemoteData = function (gridParams) {
            var executeParam = { SPName: spName, SQLParams: [] };

            var start = (gridParams.page - 1) * gridParams.paging + 1;
            var end = gridParams.page * gridParams.paging;
            executeParam.SQLParams.push({ Name: 'start', Value: start, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'end', Value: end, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'trustId', Value: trustId, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'orderby', Value: (gridParams.orderby) ? gridParams.orderby : null, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'direction', Value: (gridParams.direction) ? gridParams.direction : null, DBType: 'string' });
            if (typeof gridParams.payDate != "undefined")
                executeParam.SQLParams.push({ Name: 'payDate', Value: (gridParams.payDate) ? gridParams.payDate : null, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'where', Value: (gridParams.where) ? gridParams.where : null, DBType: 'string' });

            var executeParams = encodeURIComponent(JSON.stringify(executeParam));

            var sourceData = { total: 0, data: [] };
            $.ajax({
                cache: false,
                type: "GET",
                async: false,
                url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=DatagridDataSource',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                },
                error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); }
            });
            return sourceData;
        };

        var filterData = function (filters) {
            $dtGrid.datagrid('reset');
            $dtGrid.datagrid("fetch", filters);
        };

        var fetchMetaData = function (executeParams, fnCallBack) {
            var executeParams = encodeURIComponent(JSON.stringify(executeParams));
            $.ajax({
                cache: false,
                type: "GET",
                url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    var sourceData;
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }

                    if (fnCallBack) { fnCallBack(sourceData); }
                },
                error: function (response) { GSDialog.HintWindow('Error occursed when fetch the filter metadata!'); }
            });
        };

        var searchWhere = function () {
            var filterWhere = getWhere();
            PagerListModule.Filter({ 'where': filterWhere });
        }
        var getWhere = function () {
            var filterWhere = '';
            $('.list-filters .filter').each(function () {
                var $this = $(this);
                var value = $this.val();
                if (!value || value.length < 1) { return true; }

                var param = $this.attr('name');
                if ($this.hasClass('like')) {
                    filterWhere += ' and ' + param + ' like N\'%' + value + '%\'';
                } else {
                    filterWhere += ' and ' + param + ' = N\'' + value + '\'';
                }
            });
            return filterWhere;
        }

        return {
            Init: initArgs,
            DataBind: dataBind,
            Filter: filterData,
            FetchMetaData: fetchMetaData,
            searchWhere: searchWhere,
            getWhere: getWhere
        };

    }();

    var WcfProxy = (function () {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

        function getSourceData(execParam) {
            var executeParam = execParam;
            return ExecuteRemoteData(executeParam);
        }
        function ExecuteRemoteData(executeParam) {
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var sourceData = [];
            $.ajax({
                cache: false,
                type: "GET",
                async: false,
                url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=commom',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                },
                error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); }
            });
            return sourceData;
        }

        return { GetSourceData: getSourceData };
    })();

    return {
        listCategory: listCategory
    , displayColumns: displayColumns
    , PagerListModule: PagerListModule
       , WcfProxy:WcfProxy
    }
});
