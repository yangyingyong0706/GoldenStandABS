
define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    require('jquery.datagrid');
    require('jquery.datagrid.options');
    require('date_input');
    require('app/basicData/Common/basic_interface');
    var GlobalVariable = require('globalVariable');
    var GSDialog = require("gsAdminPages")
    var trustId = common.getQueryString('tid');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var self = this;
    var listCategory = {
        Originator: 'Originator'//原始权益人列表
    };
    var displayColumns = {
        Originator: [
            {
                field: "CalendarName", title: "名称", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            {
                field: "Date", title: "日期", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd

            },
            { field: "Description", title: "描述", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd },
            {
                field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    PagerListModule.Datarow([data.row.Id], data.row);
                    var html = '<a  class="fbtn" style="cursor:pointer" onclick="self.PagerListModule.Edit(' + data.row.Id + ');"><i class="icon icon-edit btn btn-link" style="padding: 4px;"></i></a>';
                    html += '&nbsp; <a class="lbtn" style="cursor:pointer" onclick="self.PagerListModule.Del(' + data.row.Id + ');"><i class="fa fa-trash-o btn btn-link" style="color: #dd0000;padding: 4px;"></i></a>';
                    return html;
                }
            }
        ]
    };

    var PagerListModule = function () {
        var listCate, spName, trustId, svcUrl, $dtGrid, dataRowList = {};

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
                paramsDefault: { paging: 10 },
                noData: "<p class='noData'>当前视图没有可显示记录。</p>",
                pagerPosition: "bottom",
                pager: "mypager",
                sorter: "mysorter",
                onBefore: function () {
                    if (!isEmptyObject(dataRowList)) dataRowList = {};
                },
                /*onData: function() {
          
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
            //TrustManagement.tblAssetDetails
            executeParam.SQLParams.push({ Name: 'tableName', Value: 'TrustManagement.CalendarDate', DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'start', Value: start, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'end', Value: end, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'orderby', Value: (gridParams.orderby) ? gridParams.orderby : 'id', DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'direction', Value: (gridParams.direction) ? gridParams.direction : null, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'where', Value: ((gridParams.where) ? gridParams.where : ''), DBType: 'string' });

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
                    $.each(sourceData.data, function (i, n) {
                        sourceData.data[i].Date = sourceData.data[i].Date ? common.getStringDate(sourceData.data[i].Date).dateFormat('yyyy-MM-dd') : '';
                    });
                },
                error: function (response) { alert('Error occursed while requiring the remote source data!'); }
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
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }

                    if (fnCallBack) { fnCallBack(sourceData); }
                },
                error: function (response) { alert('Error occursed when fetch the filter metadata!'); }
            });
        };

        function edit(id) {
            updateCalendarDate(dataRowList[id]);
        }
        function del(id) {
            GSDialog.HintWindowTF("确定删除？", function () {
                var executeParam = {
                    SPName: 'usp_DeleteCalendarDate', SQLParams: [
                        { Name: 'id', value: id, DBType: 'int' }
                    ]
                };
                fetchMetaData(executeParam, function (result) {
                    if (result[0].Result) {
                        searchByWhere();
                        //alert('删除成功！');
                    } else {
                        GSDialog.HintWindow('删除数据时出现错误！');
                    }
                });
            })
        }

        function isEmptyObject(e) {
            var t;
            for (t in e)
                return !1;
            return !0
        }

        function datarow(key, value) {
            if (key && value) dataRowList[key] = value;
            else if (key) return dataRowList[key];
        }

        return {
            Init: initArgs,
            DataBind: dataBind,
            Filter: filterData,
            FetchMetaData: fetchMetaData,
            Edit: edit,
            Del: del,
            Datarow: datarow
        };

    }();
    self.PagerListModule = PagerListModule;
    function updateCalendarDate(obj) {
        $('#detailFormTitle').html('编辑公休假').attr('editId', obj.Id);
        $.each($('#divDetailForm .form-control'), function (i, n) {
            $(n).val(obj[$(n).attr('data-attr')]);
        });
    }
    function SaveCalendarData(Id) {
        //var items = '<items>';
        //$.each(dataModel.AdjustmentList, function (i, v) {
        //    items += '<item>';
        //    items += '<TrustId>' + trustId + '</TrustId>';
        //    items += '<AccountNo>' + accountNo + '</AccountNo>';
        //    items += '<StartDate>' + v.StartDate + '</StartDate>';
        //    items += '<EndDate>' + v.EndDate + '</EndDate>';
        //    items += '<InterestAdjustDate>' + v.InterestAdjustDate + '</InterestAdjustDate>';
        //    items += '<InterestRate>' + v.InterestRate + '</InterestRate>';
        //    items += '<InterestRateType>' + v.InterestRateType + '</InterestRateType>';
        //    items += '<PrincipalPaymentType>' + v.PrincipalPaymentType + '</PrincipalPaymentType>';
        //    items += '<AdjustEffectType>' + v.AdjustEffectType + '</AdjustEffectType>';
        //    items += '<InterestPaymentType>' + v.InterestPaymentType + '</InterestPaymentType>';
        //    items += '<InterestAdjustType>' + v.InterestAdjustType + '</InterestAdjustType>';
        //    items += '<PrincipalPaymentAmt>' + ((v.PrincipalPaymentAmt) ? v.PrincipalPaymentAmt : 0) + '</PrincipalPaymentAmt>';
        //    items += '</item>';
        //});
        //items += '</items>';

        var item = '<item>';
        item += '<{0}>{1}</{0}>'.format('Id', Id);
        $.each($('#divDetailForm .form-control'), function (i, n) {
            var code = $(n).attr('data-attr');
            item += '<{0}>{1}</{0}>'.StringFormat(code, $(n).val());
        });
        item += '</item>';
        //console.log(item);
        //return;
        var executeParam = {
            SPName: 'usp_UpdateCalendarDate', SQLParams: [
                { Name: 'items', value: item, DBType: 'xml' }
            ]
        };
        //todo:遮罩
        var result = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam);
        //todo:去掉遮罩
        if (result[0].Result == 1) {
            GSDialog.HintWindow('保存成功！');
        } else if (result[0].Result == 2) {
            GSDialog.HintWindow('对不起，该日期已存在，请更改日期！');
        } else if (result[0].Result == 0) {
            GSDialog.HintWindow('数据提交保存时出现错误！');
        }
    }

    $(function () {
        $('.date-plugins').date_input();
        PagerListModule.Init(listCategory.Originator, 'usp_GetListWithPager', trustId,
            GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
            '#divDataList');
        PagerListModule.DataBind(function (haveData) { });

        $('#btnReset').click(function () {
            $('.list-filters .filter').val('');
            PagerListModule.Filter({});
        });
        $('#btnSearch').click(function () {
            searchByWhere();
        });

        $('#btnCancel').click(function () {
            $('#detailFormTitle').html('添加公休假').removeAttr('editId');
            $('#divDetailForm .form-control').each(function () {
                var $this = $(this);
                $this.val('');
            });
        });
        $('#btnSave').click(function () {
            var haveError = false;
            $('#divDetailForm .form-control').each(function () {
                var $this = $(this);
                if (!CommonValidation.ValidControlValue($this)) { haveError = true; }
            });
            if (haveError) return;

            var editIndex = $('#detailFormTitle').attr('editId');
            if (editIndex) {
                SaveCalendarData(editIndex);
            } else {
                SaveCalendarData(0);
            }
        });
              
    });

    function searchByWhere() {
        var filterWhere = '';
        $('.list-filters .filter').each(function () {
            var $this = $(this);
            var value = $this.val();
            if (value.length < 1) { return true; }

            var param = $this.attr('name');
            if ($this.hasClass('like')) {
                filterWhere += ' and ' + param + ' like N\'%' + value + '%\'';
            } else {
                filterWhere += ' and ' + param + ' = N\'' + value + '\'';
            }
        });
        PagerListModule.Filter({ 'where': filterWhere });
    }
});
