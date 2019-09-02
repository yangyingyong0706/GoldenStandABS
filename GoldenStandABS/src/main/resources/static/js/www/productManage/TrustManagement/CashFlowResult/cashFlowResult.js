

define(function (require) {

    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');

    (function () {
        var getUrlParam = function (name) {
            var s = location.search;
            if (s != null && s.length > 1) {
                var sarr = s.substr(1).split("&");
                var tarr;
                for (i = 0; i < sarr.length; i++) {
                    tarr = sarr[i].split("=");
                    if (tarr.length == 2 && tarr[0].toLowerCase() == name.toLowerCase()) {
                        return tarr[1];
                    }
                }
                return null;
            }
        }
        // 获取现金流数据
        var getData = function (trustId, spName, callback) {
            var sContent = encodeURIComponent('{ "SPName": "' + spName + '", "SQLParams": [{ "Name": "trustId", "value": "' + trustId + '", "DBType": "int" }] }');
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' + sContent + '&resultType=commom&_=' + Math.random() * 150;
            $.ajax({
                url: serviceUrl,
                type: 'GET',
                dataType: 'json',
                contentType: "application/json;charset=utf-8",
                data: {},
                success: function (response) {
                    if (response == "") {
                        response = undefined;
                    } else {
                        response = JSON.parse(response);
                    }
                    callback(response);
                },
                error: function (response) { alert(response.responseText); }
            });
        }

        var $grid = $('#grid'),
            trustId = getUrlParam('trustId');

        getData(trustId, "usp_GetTrustParameterByTrustId", function (res) {

            var spread = new GcSpread.Sheets.Spread($grid[0]);
            spread.tabStripVisible(false); // 是否显示表单标签

            var spreadNS = GcSpread.Sheets,
                sheet = spread.getSheet(0),
                SheetArea = spreadNS.SheetArea;

            //sheet.defaults.rowHeight = 25;
            sheet.defaults.colWidth = 100;
            sheet.isPaintSuspended(true); // 开始绘制
            spread.canUserDragDrop(false);
            sheet.setColumnCount(10, SheetArea.viewport);
            sheet.setColumnWidth(0, 180);

            sheet.setValue(1, 0, "假设参数");
            var k5 = k4 = 0, x5 = x4 = 1;
            $.each(res, function (i, v) {
                if (v.GroupId === 1 || v.GroupId === 2) {
                    if (v.GroupId === 1) {
                        sheet.setValue(2, 0, v.DisplayName);
                        sheet.setValue(2, 1, v.ItemValue);
                    } else {
                        sheet.setValue(2, 4, v.DisplayName);
                        sheet.setValue(2, 5, v.ItemValue);
                    }
                } else {
                    if (v.GroupId === 3) {
                        sheet.setValue(3, 0, v.DisplayName);
                        sheet.setValue(3, 1, v.ItemValue);
                    }
                    if (v.GroupId === 4) {
                        sheet.setValue(4, k4, v.DisplayName);
                        sheet.setValue(4, x4, v.ItemValue);
                        k4 += 2;
                        x4 += 2;
                    }
                    if (v.GroupId === 5) {
                        sheet.setValue(5, k5, v.DisplayName);
                        sheet.setValue(5, x5, v.ItemValue);
                        k5 += 2;
                        x5 += 2;
                    }
                }
            });
            sheet.getCells(2, 0, 5, sheet.getColumnCount(SheetArea.viewport)).backColor("#f4f4f4");
            sheet.getCells(2, 1, 5, 1).backColor('#fff265').hAlign(spreadNS.HorizontalAlign.right);
            sheet.getCells(4, 3, 5, 3).backColor('#fff265').hAlign(spreadNS.HorizontalAlign.right);
            sheet.getCells(2, 5, 5, 5).backColor('#fff265').hAlign(spreadNS.HorizontalAlign.right);
            sheet.getCells(4, 7, 5, 7).backColor('#fff265').hAlign(spreadNS.HorizontalAlign.right);
            sheet.getCells(4, 9, 5, 9).backColor('#fff265').hAlign(spreadNS.HorizontalAlign.right);
            sheet.setBorder(new spreadNS.Range(2, 0, 4, sheet.getColumnCount(SheetArea.viewport) + 1), new spreadNS.LineBorder("#555", spreadNS.LineStyle.thin), { all: true });

            getData(trustId, "usp_GetCashFlowRunResultByTrustId", function (data) {

                // 从这里开始绘制回收款区间
                var loansRow = initRow = 7, loansLen = 0; // 从第七行开始绘制

                sheet.setRowCount(initRow + 1, SheetArea.viewport);
                $.each(data, function (k, d) {
                    //if (!loansLen) loansLen = Object.keys(d).length;
                    if (0 === d.GroupId || 1 === d.GroupId) {
                        loansRow += 1;
                        loansLen++;
                        sheet.addRows(sheet.getRowCount(SheetArea.viewport), 1);
                        if (0 === d.GroupId) {
                            var x = 1;
                            $.each(d, function (i, v) {
                                if (i !== 'GroupId' && i != 'ItemCode' && i != 'ItemDisplayName') {
                                    var ColCount = sheet.getColumnCount(SheetArea.viewport);
                                    if (x >= ColCount) sheet.addColumns(ColCount, 1);
                                    sheet.setValue(loansRow, x, (i === 'Periods_Total') ? '合计' : v);
                                    x++;
                                }
                            });
                        }

                        if (1 === d.GroupId) {
                            var x = 0;
                            $.each(d, function (i, v) {
                                if (i !== 'GroupId' && i != 'ItemCode') {
                                    sheet.setValue(loansRow, x, (v === null) ? '-' : v);
                                    x++;
                                }
                            })
                        }
                    }
                });

                //sheet.setValue(2, 1, "2017/01/02");
                //sheet.setValue(2, 2, "2017/6/25");
                //sheet.setValue(2, 3, "2017/9/25");

                //sheet.setValue(3, 0, "期初可分配现金流");
                //sheet.setValue(4, 0, "账户流入总金额");

                sheet.addSpan(initRow, 0, 2, 1);
                sheet.setValue(initRow, 0, "内容");
                sheet.addSpan(initRow, 1, 1, sheet.getColumnCount(SheetArea.viewport) - 1); // 合并横轴从第一个到视窗上的最后一个单元格
                sheet.setValue(initRow, 1, "回收款期间");

                sheet.getCells(initRow, 0, loansRow, sheet.getColumnCount(SheetArea.viewport)).backColor("#dce6f1"); // 从0开始 (纵轴，横轴，纵轴，横轴)
                sheet.getCells(initRow, 0, initRow + 1, sheet.getColumnCount(SheetArea.viewport)).vAlign(spreadNS.VerticalAlign.center).hAlign(spreadNS.HorizontalAlign.center);
                sheet.getCells(initRow + 1, 1, loansRow, sheet.getColumnCount(SheetArea.viewport)).hAlign(spreadNS.HorizontalAlign.right);
                sheet.setBorder(new spreadNS.Range(initRow, 0, loansLen + 1, sheet.getColumnCount(SheetArea.viewport) + 1), new spreadNS.LineBorder("#777", spreadNS.LineStyle.thin), { all: true });

                // 从这里绘制计息期间
                loansRow = initRow = sheet.getRowCount(SheetArea.viewport) + 1, loansLen = 0;
                sheet.addRows(sheet.getRowCount(SheetArea.viewport), 2);
                $.each(data, function (k, d) {
                    if (0 === d.GroupId || 2 === d.GroupId) {
                        loansRow += 1;
                        loansLen++;
                        sheet.addRows(sheet.getRowCount(SheetArea.viewport), 1);
                        if (0 === d.GroupId) {
                            var x = 1;
                            $.each(d, function (i, v) {
                                if (i !== 'GroupId' && i != 'ItemCode' && i != 'ItemDisplayName') {
                                    sheet.setValue(loansRow, x, (i === 'Periods_Total') ? '合计' : v);
                                    x++;
                                }
                            });
                        }

                        if (2 === d.GroupId) {
                            var x = 0;
                            $.each(d, function (i, v) {
                                if (i !== 'GroupId' && i != 'ItemCode') {
                                    sheet.setValue(loansRow, x, (v === null) ? '-' : v);
                                    x++;
                                }
                            })
                        }
                    }
                });
                sheet.addSpan(initRow, 0, 2, 1);
                sheet.setValue(initRow, 0, "内容");
                sheet.addSpan(initRow, 1, 1, sheet.getColumnCount(SheetArea.viewport) - 1);
                sheet.setValue(initRow, 1, "计息期间");

                sheet.getCells(initRow, 0, loansRow, sheet.getColumnCount(SheetArea.viewport)).backColor("#f2dcdb"); // 从0开始 (纵轴，横轴，纵轴，横轴)
                sheet.getCells(initRow, 0, initRow + 1, sheet.getColumnCount(SheetArea.viewport)).vAlign(spreadNS.VerticalAlign.center).hAlign(spreadNS.HorizontalAlign.center);
                sheet.getCells(initRow + 1, 1, loansRow, sheet.getColumnCount(SheetArea.viewport)).hAlign(spreadNS.HorizontalAlign.right);
                sheet.setBorder(new spreadNS.Range(initRow, 0, loansLen + 1, sheet.getColumnCount(SheetArea.viewport) + 1), new spreadNS.LineBorder("#777", spreadNS.LineStyle.thin), { all: true });

                loansRow = initRow = sheet.getRowCount(SheetArea.viewport) + 1, loansLen = 0;
                sheet.addRows(sheet.getRowCount(SheetArea.viewport), 2);
                $.each(data, function (k, d) {
                    if (3 === d.GroupId) {
                        var x = 0;
                        $.each(d, function (i, v) {
                            if (i !== 'GroupId' && i != 'ItemCode') {
                                sheet.setValue(loansRow, x, (v === null) ? '-' : v);
                                x++;
                            }
                        });
                        loansRow += 1;
                        loansLen++;
                        sheet.addRows(sheet.getRowCount(SheetArea.viewport), 1);
                    }
                });
                sheet.getCells(initRow, 0, loansRow - 1, sheet.getColumnCount(SheetArea.viewport)).backColor("#dce6f1"); // 从0开始 (纵轴，横轴，纵轴，横轴)
                sheet.getCells(initRow, 1, loansRow, sheet.getColumnCount(SheetArea.viewport)).hAlign(spreadNS.HorizontalAlign.right);
                sheet.setBorder(new spreadNS.Range(initRow, 0, loansLen, sheet.getColumnCount(SheetArea.viewport)), new spreadNS.LineBorder("#777", spreadNS.LineStyle.thin), { all: true });

                loansRow = initRow = sheet.getRowCount(SheetArea.viewport), loansLen = 0;
                sheet.addRows(sheet.getRowCount(SheetArea.viewport), 1);
                $.each(data, function (k, d) {
                    if (4 === d.GroupId) {
                        var x = 0;
                        $.each(d, function (i, v) {
                            if (i !== 'GroupId' && i != 'ItemCode') {
                                sheet.setValue(loansRow, x, (v === null) ? '-' : v);
                                x++;
                            }
                        });
                        loansRow += 1;
                        loansLen++;
                        sheet.addRows(sheet.getRowCount(SheetArea.viewport), 1);
                    }
                });
                sheet.getCells(initRow, 0, loansRow - 1, sheet.getColumnCount(SheetArea.viewport)).backColor("#f2dcdb"); // 从0开始 (纵轴，横轴，纵轴，横轴)
                sheet.getCells(initRow, 1, loansRow, sheet.getColumnCount(SheetArea.viewport)).hAlign(spreadNS.HorizontalAlign.right);
                sheet.setBorder(new spreadNS.Range(initRow, 0, loansLen, sheet.getColumnCount(SheetArea.viewport)), new spreadNS.LineBorder("#777", spreadNS.LineStyle.thin), { all: true });

                loansRow = initRow = sheet.getRowCount(SheetArea.viewport), loansLen = 0;
                sheet.addRows(sheet.getRowCount(SheetArea.viewport), 1);
                $.each(data, function (k, d) {
                    if (5 === d.GroupId) {
                        var x = 0;
                        $.each(d, function (i, v) {
                            if (i !== 'GroupId' && i != 'ItemCode') {
                                sheet.setValue(loansRow, x, (v === null) ? '-' : v);
                                x++;
                            }
                        });
                        loansRow += 1;
                        loansLen++;
                        sheet.addRows(sheet.getRowCount(SheetArea.viewport), 1);
                    }
                });
                sheet.getCells(initRow, 1, loansRow, sheet.getColumnCount(SheetArea.viewport)).vAlign(spreadNS.VerticalAlign.right).hAlign(spreadNS.HorizontalAlign.right);
                sheet.setBorder(new spreadNS.Range(initRow, 0, loansLen, sheet.getColumnCount(SheetArea.viewport)), new spreadNS.LineBorder("#777", spreadNS.LineStyle.thin), { all: true });

                sheet.isPaintSuspended(false); // 结束绘制
            });
        });
    })();
});