define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    require('jquery.cookie');
    require('date_input');

    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    require('bootstrap');
    require('bootstrap_select');
    require('bootstrap_table');
    var common = require('common');
    var DataOperate = require('app/productDesign/js/dataOperate');
    require('app/productDesign/js/renderControl');
    require('asyncbox');
    var mac = require('app/productDesign/js/magic/magic.core');
    require('app/productDesign/js/magic/magic.dialog');

    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    require('gs/dataProcess');
    var GSDialog = require('gsAdminPages');
    var webProxy = require('webProxy');
    //require('autoComplete');
    require('devExtreme.dx.all');

    var self = this;
    var CallWCFSvc = appGlobal.CallWCFSvc;

    var BusinessCode = GlobalVariable.Business_Trust;
    var BusinessIdentifier;
    var PageId = 23;
    var set;
    var svcUrlTrustManagement = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&";
    var viewTemplate1 = "<table class=\"table table-bordered tb-nowrap table-hover\"> <label class=\"large\">加权平均</label>" +
                        "<tr>" +
                            "<th class=\"riskTransferResult_th\">情景</th>" +
                            "<th class=\"riskTransferResult_th\">概率</th>" +
                            "<th class=\"riskTransferResult_th\">总现金流</th>" +
                            "<th class=\"riskTransferResult_th\">转出部分</th>" +
                            "<th class=\"riskTransferResult_th\">自持部分</th>" +
                        "</tr>";
    var viewTemplate2 = "<table class=\"table table-bordered tb-nowrap table-hover\"> <label class=\"large\">方差</label>" +
                        "<tr>" +
	                        "<th class=\"riskTransferResult_th\">情景</th>" +
                            "<th class=\"riskTransferResult_th\">概率</th>" +
                            "<th class=\"riskTransferResult_th\">总现金流</th>" +
                            "<th class=\"riskTransferResult_th\">转出部分</th>" +
                            "<th class=\"riskTransferResult_th\">自持部分</th>" +
                        "</tr>";
    var contentTemplate = "<tr>" +
	                        "<td>$ScenarioId$</td><td>$Probability$</td><td>$TotalCashflow_NPV$</td><td>$OutgoingCashflow_NPV$</td><td>$RetainedCashflow_NPV$</td>" +
                        "</tr>";

    var viewModel;
    var dataModel = {
        'zh-CN': {
            Sections: [{
                Templ: GlobalVariable.UiTempl_Grid,
                Title: '分层信息',
                Identity: 'Section01Identity',
                FieldsSetting: {
                    GridView: [], Detail: [], DetailsTitle: '分层详细信息', DetailsOptionalFields: [], HasOptionalFields: true
                    , InnerText: { Operate: '操作', BtnView: '查看', BtnEdit: '编辑', BtnDelete: '删除', BtnSave: '添加', BtnClear: '清除' } //BtnRun: '运行', 
                },
                Buttons: [
                    { Text: '从静态池导入', Name: 'btn_Import', Class: 'normal_small_button' },
                    { Text: '保存设置', Name: 'btn_Save', Class: 'normal_small_button' },
                    { Text: '查看预测模型', Name: 'btn_ViewCashflowModel', Class: 'normal_small_button' },
                    { Text: '运行预测模型', Name: 'btn_CashflowModel', Class: 'normal_small_button' },
                    { Text: '查看压力测试模型', Name: 'btn_ShowModel', Class: 'normal_small_button' },
                    { Text: '运行压力测试', Name: 'btn_Run', Class: 'normal_small_button' },
                    { Text: '查看压力测试结果', Name: 'btn_View', Class: 'normal_small_button' },
                    { Text: '运行风险报酬转移测算', Name: 'btn_RunRishTransfer', Class: 'normal_small_button' },
                    { Text: '查看风险报酬转移结果', Name: 'btn_ViewRishTransfer', Class: 'normal_small_button' },
                    { Text: '进行融资成本摊销计算', Name: 'btn_AmortizationCalculation', Class: 'normal_small_button' },
                    { Text: '查看摊销计算结果', Name: 'btn_ViewCalculationResult', Class: 'normal_small_button' }
                    //{ Text: '保存', Click: 'SavePageItems(this)', Class: 'btn btn-primary' },
                    //{ Text: '运行', Click: 'Run(this)', Class: 'btn btn-primary' },
                    //{ Text: '查看结果', Click: 'ViewResults(this)', Class: 'btn btn-default' }
                ]
            }],
            Customize: { StressResult: '现金流压力测试结果明细', StressResultAggregation: '现金流压力测试加权平均IRR和WAL' }
        },

        'en-US': {
            Sections: [{
                Templ: GlobalVariable.UiTempl_Grid,
                Title: 'Layer Information',
                Identity: 'Section01Identity',
                FieldsSetting: {
                    GridView: [], Detail: [], DetailsTitle: 'Layer Details', DetailsOptionalFields: [], HasOptionalFields: true
                    , InnerText: { Operate: 'Operation', BtnView: 'View', BtnRun: 'Run', BtnEdit: 'Edit', BtnDelete: 'Delete', BtnSave: 'Save', BtnClear: 'Reset' }
                },
                Buttons: [

                    { Text: 'Import', Name: 'btn_Import', Class: 'btn btn-primary' },
                    { Text: 'Save', Name: 'btn_Save', Class: 'btn btn-primary' },
                    { Text: 'Run', Name: 'btn_Run', Class: 'btn btn-primary' },
                    { Text: 'RishTransfer', Name: 'btn_RunRishTransfer', Class: 'normal_small_button' },
                    { Text: 'View', Name: 'btn_View', Class: 'btn btn-default' },
                    { Text: 'Model', Name: 'btn_CashflowModel', Class: 'btn btn-default' },
                    { Text: 'Show', Name: 'btn_ShowModel', Class: 'btn btn-default' },
                    { Text: 'AmortizationCalculation', Name: 'btn_AmortizationCalculation', Class: 'normal_small_button' },
                    { Text: 'ViewCalculationResult', Name: 'btn_ViewCalculationResult', Class: 'normal_small_button' }
                ]
            }],
            Customize: { StressResult: 'Cashflow Stress Testing Result', StressResultAggregation: 'Cashflow Stress Testing Weighted Average IRR and WAL' }
        },

        Model: function () {
            return dataModel[set];
        }
    };
    //***********//GridViews Data Sort and UI Operation Events//***********//
    var gdvsGridSetting = {};
    var gdvOperation = {
        SortSourceData: function (items, sectionIndex) {
            var model = dataModel.Model(set).Sections[sectionIndex].FieldsSetting;
            var go = true;
            var rowId = 0;
            var details = null;
            while (go) {
                var row = $.grep(items, function (trustItem) {
                    return trustItem.GroupId01 == rowId;
                });
                if (row.length == 0) {
                    //当tbid=0时，row.length == 0，说明返回的只有模板
                    if (details == null) {
                        details = items;
                    }
                    go = false;
                } else {
                    if (details == null) {
                        details = row;
                    }
                    row = row.sort(function (a, b) {
                        return parseInt(a.SequenceNo) - parseInt(b.SequenceNo)
                    });

                    var gridItem = {};
                    $.each(row, function (i, d) {
                        gridItem[d.ItemCode] = d.ItemValue;
                        if (d.DataType == "Select") {
                            var item = DataOperate.getItemById(parseInt(d.ItemValue), set);
                            gridItem[d.ItemCode + "_Text"] = item.ItemAliasValue;
                        } else if (d.DataType == "Decimal") {
                            gridItem[d.ItemCode + "_Text"] = getMoneyText(d.ItemValue, set);
                        }
                    });
                    model.GridView.push(gridItem);
                }
                rowId++;
            }

            var gColumns = [];
            var gCodeIds = {};
            $.each(details, function (i, d) {
                d.ItemValue = '';
                if (d.Bit01) {//IsInGrid
                    gColumns.push(d);
                }
                if (!d.IsCompulsory) {//IsOptional
                    d.IsDisplay = 0;
                }

                gCodeIds[d.ItemCode] = d.ItemId;
                model.Detail.push(d);
            });
            gdvsGridSetting[sectionIndex] = { gridColumns: gColumns, gridCodeIds: gCodeIds };
        },
        AddOptionalField: function (obj) {
            var $section = $(obj).parents('.main-section');
            var sectionIndex = $section.attr('sectionIndex');
            var sectionId = $section.attr('id');

            var selSelector = '#' + sectionId + ' .gdv-optionalfields-select';
            var itemIndex = $(selSelector).val();
            if (!itemIndex) return;

            var item = viewModel.Sections()[sectionIndex].FieldsSetting.Detail()[itemIndex];
            item.IsDisplay(true);
            setFieldPlugins();
        },
        RemoveOptionalField: function (obj) {
            var $section = $(obj).parents('.main-section');
            var sectionIndex = $section.attr('sectionIndex');

            var itemIndex = $(obj).attr('itemIndex');

            var item = viewModel.Sections()[sectionIndex].FieldsSetting.Detail()[itemIndex];
            item.ItemValue('');
            item.IsDisplay(false);
        },
        Save: function (obj) {
            var $section = $(obj).parents('.main-section');
            var sectionIndex = $section.attr('sectionIndex');
            var sectionId = $section.attr('id');

            if (!ValidateSectionFields(sectionId)) return;

            var btnSaveSelector = '#' + sectionId + ' .gdv-detail-btnSave';
            var editIndex = $(btnSaveSelector).attr('editIndex');

            if (editIndex && editIndex != -1) {
                //Edit Existed
                this.Update(sectionIndex, editIndex);
                $('input[name="input_save"]').val('添加');
            } else {
                //New Add
                var detail = viewModel.Sections()[sectionIndex].FieldsSetting.Detail();
                var newItem = {};
                $.each(detail, function (i, item) {
                    var code = item.ItemCode();
                    if (item.DataType() == "Select") {
                        var text = $("#" + code).find("option:selected").text();
                        newItem[code + '_Text'] = text;
                    } else if (item.DataType() == "Decimal") {
                        newItem[code + '_Text'] = getMoneyText(item.ItemValue(), set);
                    }

                    newItem[item.ItemCode()] = item.ItemValue();
                });

                newItem = mapping.fromJS(newItem);
                viewModel.Sections()[sectionIndex].FieldsSetting.GridView.push(newItem);

                this.InitDetail(sectionIndex);
            }
            $(btnSaveSelector).attr('editIndex', -1);
        },
        Clear: function (obj) {
            var sectionIndex;
            if (isNaN(obj)) {
                var $section = $(obj).parents('.main-section');
                sectionIndex = $section.attr('sectionIndex');
            } else { sectionIndex = obj; }

            var detail = viewModel.Sections()[sectionIndex].FieldsSetting.Detail();
            $.each(detail, function (i, item) {
                var dataType = item.DataType().toLocaleLowerCase();
                if (dataType == "bool") {
                    item.ItemValue("0");
                } else {
                    if (dataType != "select") {
                        item.ItemValue("");
                    }
                }
            });
        },
        Detail: function (obj) {
            $('input[name="input_save"]').val('更新');
            var $section = $(obj).parents('.main-section');
            var sectionIndex = $section.attr('sectionIndex');
            var sectionId = $section.attr('id');

            var editIndex = $(obj).attr('itemIndex');

            var btnSaveSelector = '#' + sectionId + ' .gdv-detail-btnSave';
            $(btnSaveSelector).attr('editIndex', editIndex);

            this.InitDetail(sectionIndex);

            var item = viewModel.Sections()[sectionIndex].FieldsSetting.GridView()[editIndex];
            for (var key in item) {
                //key就是ItemCode
                var detail = viewModel.Sections()[sectionIndex].FieldsSetting.Detail();
                $.each(detail, function (i, d) {
                    if (d.ItemCode() == key) {
                        var itemValue = item[key]();
                        if (itemValue != "") {
                            d.ItemValue(itemValue);
                            d.IsDisplay(true);
                        }
                    }
                })
            }

            setFieldPlugins();
        },
        Update: function (sectionIndex, editIndex) {
            var item = viewModel.Sections()[sectionIndex].FieldsSetting.GridView()[editIndex];//里面包含所有属性
            var detail = viewModel.Sections()[sectionIndex].FieldsSetting.Detail();
            $.each(detail, function (i, d) {
                var code = d.ItemCode();
                item[code](d.ItemValue());
                if (d.DataType() == "Select") {
                    var text_s = $("#" + code).find("option:selected").text();
                    item[d.ItemCode() + '_Text'](text_s);
                } else if (d.DataType() == "Decimal") {
                    var text_d = getMoneyText(d.ItemValue(), set);
                    item[d.ItemCode() + '_Text'](text_d);
                }
            })
            this.InitDetail(sectionIndex);
        },
        Delete: function (obj) {
            var $section = $(obj).parents('.main-section');
            var sectionIndex = $section.attr('sectionIndex');
            var sectionId = $section.attr('id');

            var index = $(obj).attr('itemIndex');
            var oNew = viewModel.Sections()[sectionIndex].FieldsSetting.GridView()[index];
            viewModel.Sections()[sectionIndex].FieldsSetting.GridView.remove(oNew);

            var btnSaveSelector = '#' + sectionId + ' .gdv-detail-btnSave';
            $(btnSaveSelector).attr('editIndex', -1);

            this.InitDetail(sectionIndex);
        },
        InitDetail: function (sectionIndex) {
            var detail = viewModel.Sections()[sectionIndex].FieldsSetting.Detail();

            $.each(detail, function (i, item) {
                item.ItemValue("");
                if (!item.IsCompulsory()) {//IsOptional
                    item.IsDisplay(false);
                }
            });

            setFieldPlugins();
        },
        GetItems: function (sectionIndex) {
            var array = [];
            var gCodeIds = gdvsGridSetting[sectionIndex].gridCodeIds;
            var gridViewData = viewModel.Sections()[sectionIndex].FieldsSetting.GridView();
            $.each(gridViewData, function (i, data) {
                for (field in data) {
                    var itemId = gCodeIds[field];
                    if (itemId) {
                        var item = {};
                        item.ItemId = itemId;
                        item.ItemValue = data[field]();
                        item.SectionIndex = sectionIndex;
                        item.GroupId01 = i;
                        array.push(item);
                    }
                }
            });
            return array;
        }

        , OpenDialog: function (obj, title) {
            var $obj = $(obj);
            var $section = $obj.parents('.main-section');
            var sectionIndex = $section.attr('sectionIndex');
            var sectionId = $section.attr('id');

            var itemIndex = $obj.attr('itemIndex');
            var itemCode = $obj.attr('itemCode');
            var itemValue = $obj.text();

            var transData = { ItemCode: itemCode, ItemValue: itemValue };
            GSDialog.open(title, GlobalVariable.TrustManagementServiceHostURL + 'productDesign/stresstest/StressScenarios/CurveDialog_CD/CurveDialog_CD.html', transData, function (result) {
                console.log(result)
                if (result && result.isSave) {
                    var item = viewModel.Sections()[sectionIndex].FieldsSetting.GridView()[itemIndex];
                    item[itemCode](result.data);
                }
            }, 900, 560,"",false);
        }
        , View: function (obj) {
            var itemIndex = $(obj).attr('itemIndex');
            //alert(itemIndex);
            var executeParam = { SPName: 'CashflowStressTest.GetScenarioSessionInfo', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'TrustID', Value: BusinessIdentifier, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'ScenarioNo', Value: itemIndex, DBType: 'string' });

            var serviceUrl = GlobalVariable.QuickWizardServiceUrl + 'CommonGetWithConnName?connName=QuickWizard&exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
            CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                var code = data && data.length > 0 && data[0]['TaskCode'] ? data[0]['TaskCode'] : '';
                var sid = data && data.length > 0 && data[0]['SessionId'] ? data[0]['SessionId'] : '';

                window.open(GlobalVariable.SslHost + "CashFlowEngine/UITaskStudio/CashFLowDisplayer.html?appDomain=Task&taskCode=" + code + "&sessionId=" + sid + "&r=" + Math.random());
            });

        }
        , Run: function (obj) {
            var $section = $(obj).parents('.main-section');
            var sectionIndex = $section.attr('sectionIndex');
            var itemIndex = $(obj).attr('itemIndex');

            var items = gdvOperation.GetItems(sectionIndex);
            DataOperate.savePageData(BusinessCode, BusinessIdentifier, PageId, items, function (r) {
                var tpi = new top.TaskProcessIndicatorHelper();
                tpi.AddVariableItem('TrustId', BusinessIdentifier, 'int');
                tpi.AddVariableItem('PageId', PageId, 'int');
                tpi.AddVariableItem('EditIndex', itemIndex, 'int');

                tpi.ShowIndicator('Task', 'CashflowStressRun');
            });
        }
    };
    ////Konckout Rendering Plugin Register----for GridView display////
    ko.bindingHandlers.renderGridHeader = {
        init: function (element, valueAccessor, allBindings, viewModel) {
            var header = valueAccessor();
            var sectionIndex = allBindings.get('sectionIndex');
            var html = '';

            var gColumns = gdvsGridSetting[sectionIndex].gridColumns;
            $.each(gColumns, function (i, item) {
                html += '<th>' + item.ItemAliasValue + '</th>';
            });

            html += '<th>' + header + '</th>';
            $(html).appendTo($(element));
        }
    }
    ko.bindingHandlers.renderGridColumn = {
        init: function (element, valueAccessor, allBindings, viewModel) {
            var displayText = valueAccessor();
            var sectionIndex = allBindings.get('sectionIndex');
            var html = '';

            var gColumns = gdvsGridSetting[sectionIndex].gridColumns;
            $.each(gColumns, function (i, item) {
                var code = item.ItemCode;
                if (item.DataType == "Select" || item.DataType == "Decimal") {
                    code = code + "_Text";
                }
                if (code == 'PP' || code == 'PD') {
                    html += '<td align="center"><div class="fixed-len"  itemCode="' + code + '"'
                        + ' data-bind="text: ' + code + ', attr:{itemIndex:$index,  title:' + code + ' }"></div></td>';
                } else {
                    html += '<td data-bind="text: ' + code + '"></td>';
                }
            });
            html += '<td class="btn-group-sm">';
            html += '<input type="button" class="normal_small_button" name="input_view" data-bind="attr: { itemIndex: $index }" value="' + displayText.BtnView() + '"/> &nbsp;';
            //html += '<input type="button" class="btn btn-primary btn-sm" data-bind="attr: { itemIndex: $index }" onclick="gdvOperation.Run(this)" value="' + displayText.BtnRun() + '"/> &nbsp;';
            html += '<input type="button" class="normal_small_button" name="input_edit" data-bind="attr: { itemIndex: $index }" value="' + displayText.BtnEdit() + '"/> &nbsp;';
            html += '<input type="button" class="delet_normal_small_button" name="input_delete" data-bind="attr: { itemIndex: $index }" value="' + displayText.BtnDelete() + '"//>';
            html += '</td>';
            $(html).appendTo($(element));

            //onclick="gdvOperation.View(this)"
            //onclick="gdvOperation.Detail(this)" 
            //onclick="gdvOperation.Delete(this)"
        }
    }


    $(function () {
        BusinessIdentifier = common.getQueryString("tid");
        if (!BusinessIdentifier) {
            alert('Business Identifier is Required!');
            return;
        }

        set = common.getLanguageSet();
        DataOperate.getPageData(BusinessCode, BusinessIdentifier, PageId, set, PageItemsLoaded);
        registerBtnEvent();//注册按钮事件，以后再进行和其他页面统一
    });

    function PageItemsLoaded(items) {
        gdvOperation.SortSourceData(items, 0);

        viewModel = mapping.fromJS(dataModel.Model(set));
        ko.applyBindings(viewModel, $('#page_main_container').get(0));

        setFieldPlugins();
        $('#loading').fadeOut();
    }
    function setFieldPlugins() {
        $("#page_main_container").find('.date-plugins').date_input();
        //$(".fixed-len").tooltip();   ///??????
    }

    function ValidateSectionFields(sectionId) {
        var sectionFieldsSelector = '#' + sectionId + ' input[data-valid]';
        return common.validControls(sectionFieldsSelector);
    }
    function SavePageItems() {

        var items = gdvOperation.GetItems(0);

        var allItems = items;

        //DataOperate.savePageData(BusinessCode, BusinessIdentifier, PageId, allItems, function (result) {
        //    alert('保存成功');
        //});
        saveData(BusinessCode, BusinessIdentifier, PageId, allItems, function (result) {
            GSDialog.HintWindow('保存成功');
        });
    }

    function Run(obj) {
        var $section = $(obj).parents('.main-section');
        var sectionIndex = $section.attr('sectionIndex');
        var itemIndex = $(obj).attr('itemIndex');

        var items = gdvOperation.GetItems(0);
        saveData(BusinessCode, BusinessIdentifier, PageId, items, function (r) {
            //var tpi = new TaskProcessIndicatorHelper();
            //tpi.AddVariableItem('TrustID', BusinessIdentifier, 'int');
            //tpi.AddVariableItem('PageId', PageId, 'int');

            //tpi.ShowIndicator('Task', 'CashflowStressTest', function (result) {

            //});
            sVariableBuilder.AddVariableItem('TrustID', BusinessIdentifier, 'int', 0, 0, 0);
            sVariableBuilder.AddVariableItem('PageId', PageId, 'int', 0, 0, 0);
            //sVariableBuilder.AddVariableItem('EditIndex', itemIndex, 'int', 0, 0, 0);
            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'Task',
                taskCode: 'CashflowStressTest',
                sContext: sVariable,
                callback: function () {
                    //window.location.href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                    //window.location.href = window.location.href;
                    sVariableBuilder.ClearVariableItem();
                }
            });
            tIndicator.show();

        });
    }
    function ViewResults() {
        if ($('.main-customize').hasClass('hidden')) {
        getStressResults(function (rows) { displayTableData('#table_StressResults', rows); });
        getStressResultsAggregation(function (rows) { displayTableData('#table_StressResultsAggregation', rows); });
        $('.main-customize').removeClass('hidden');
            if(!$('.main-customize2').hasClass('hidden')) $('.main-customize2').addClass('hidden');
        } else {
            $('.main-customize').addClass('hidden');
        }
    }
    function displayTableData(tbDom, rows) {
        var $table = $(tbDom)
        if (!rows || rows.length < 1) { return }
        var tblThs = [];
        var row = rows[0];
        for (var col in row) {
            var th = { field: col, title: col, align: 'center' }
            tblThs.push(th);
        }
        $table.bootstrapTable('destroy');
        $table.bootstrapTable({ columns: tblThs, data: rows });
    }
    function getStressResults(callback) {
        var executeParam = { SPName: 'CashflowStressTest.GetStressResults', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TrustID', Value: BusinessIdentifier, DBType: 'string' });

        var serviceUrl = GlobalVariable.QuickWizardServiceUrl + 'CommonGetWithConnName?connName=QuickWizard&exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
        CallWCFSvc(serviceUrl, true, 'GET', callback);
    }
    function getStressResultsAggregation(callback) {
        var executeParam = { SPName: 'CashflowStressTest.GetStressResultsAggregation', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TrustID', Value: BusinessIdentifier, DBType: 'string' });

        var serviceUrl = GlobalVariable.QuickWizardServiceUrl + 'CommonGetWithConnName?connName=QuickWizard&exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
        CallWCFSvc(serviceUrl, true, 'GET', callback);
    }
    function ImportFromStaticPool() {
        var dialogPage = GlobalVariable.SslHost + '/GoldenStandABS/www/productDesign/stresstest/StressScenarios/viewSelectStaticPoolArreasSection/viewSelectStaticPoolArreasSection.html?trustId=' + BusinessIdentifier;
        GSDialog.open('选择静态池逾期区间', dialogPage, {}, function (val) {
            if (!val) { return; }
            var section = val.split(':')[0];
            var recovery = val.split(':')[1];
            var schedulePurpose = getSchedulePurpose();

            //Loading.Show('正在读取静态池...');
            var executeParam = { SPName: 'TrustManagement.usp_LoadStressCurvesFromStaticPool', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'TrustId', Value: BusinessIdentifier, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'ArrearsSection', Value: section, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'Recovery', Value: recovery, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'SchedulePurpose', Value: schedulePurpose, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'SID', Value: ScenarioId, DBType: 'int' });
            var serviceUrl = GlobalVariable.QuickWizardServiceUrl + 'CommonGetWithConnName?connName=TrustManagement&exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
            CallWCFSvc(serviceUrl, true, 'GET', function (d) {
                //Loading.Close();
                //parent.qwFrame.ReloadStep('scenarios');
                window.location.reload();
            });
            //Loading.Close();

        }, 500, 225,"",false);
    }

    //运行风险报酬转移测算
    function RunRiskTransfer() {
        sVariableBuilder.AddVariableItem('TrustID', BusinessIdentifier, 'int', 0, 0, 0);
        sVariableBuilder.AddVariableItem('PageId', PageId, 'int', 0, 0, 0);
        var sVariable = sVariableBuilder.BuildVariables();
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'Task',
            taskCode: 'CalculateRiskTransfer',
            sContext: sVariable,
            callback: function () {
                sVariableBuilder.ClearVariableItem();
            }
        });
        tIndicator.show();
    }

    //查看压力测试模型
    function ShowStressTestModel() {
        var executeParam = {
            SPName: 'TrustManagement.usp_GetCashflowTaskByTrustId', SQLParams: []
        };
        executeParam.SQLParams.push({
            Name: 'TrustId', Value: BusinessIdentifier, DBType: 'int'
        });
        var serviceUrl = GlobalVariable.QuickWizardServiceUrl + 'CommonGetWithConnName?connName=TrustManagement&exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
        webProxy.callWCFSvc(serviceUrl, false, 'GET', function (data) {
            var tcode = data[0]['StressTestTaskCode'];
            window.open(webProxy.baseUrl + "/CashFlowEngine/UITaskStudio/index.html?appDomain=Task&taskCode=" + tcode, '_blank');
        });

    }
    //////////////////////////
    globalVariable = { variableObj: null, arrObj: null };
    criteriaCode = "";
    function getQueryStoredProcedureProxy(appDomain, context, callback) {
        var newCashFlowStudioServieBase = location.protocol + "//" + location.host + "/CashFlowEngine/CashFlowStudioService.svc/jsAccessEP/";
        var serviceUrl = newCashFlowStudioServieBase + "GetQueryStoredProcedure/" + appDomain + "?r=" + Math.random() * 150;
        $.ajax({
            url: serviceUrl,
            type: 'POST',
            dataType: 'json',
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(context),
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

    //////////////////////////
    function getTaskSessionContextByTaskCode(appDomain, callback, trustcode) {

        var sContent = "{'SPName':'[usp_GetProcessTaskContextByTaskCode]'," +
                      "'TaskCode':'" + (trustcode + '_Cashflow') + "'" +
                      "}";
        getQueryStoredProcedureProxy(appDomain, sContent, function (response) {
            var strVariable = "";

            if (response != undefined) {
                var strTemplate = "<SessionVariable><Name>{0}</Name><Value>{1}</Value><DataType>{2}</DataType><IsConstant>{3}</IsConstant><IsKey>{4}</IsKey><KeyIndex>{5}</KeyIndex></SessionVariable>";
                $.each(response, function (i) {
                    strVariable += strTemplate.format(response[i].VariableName, response[i].VariableValue, response[i].VariableDataType, response[i].IsConstant, response[i].IsKey, response[i].KeyIndex);
                })
                strVariable = "<SessionVariables>{0}</SessionVariables>".format(strVariable);
            }
            callback(strVariable, trustcode);
        });
    }
    //////////
    function getVariableToJson(response, trustcode) {
        var trustCode = trustcode;
        //this.$refs.taskaction.$refs.taskdatainput.variables = dataProcess.variableXmlToJson(response);
        if (response) {
            var variableJson = dataProcess.variableXmlToJson(response);
            globalVariable.variableObj = variableJson;



            getTaskCodeListByTaskType('Task', function (response) {

                var searchResult = dataProcess.taskObject(response);
                $(searchResult).each(function (i) {

                    if (searchResult[i].CodeDictionaryCode.toLowerCase() == trustCode.toLowerCase()) {
                        criteriaCode = searchResult[i].CriteriaSetCode;

                        return false;
                    }
                });


                //3
                var startPeriodStr = "";
                var endPeriodStr = "";


                var variableModel = globalVariable.variableObj;



                var vVariableTemplate = "<SessionVariable><Name>{0}</Name><Value>{1}</Value><DataType>{2}</DataType><IsConstant>{3}</IsConstant><IsKey>{4}</IsKey><KeyIndex>{5}</KeyIndex></SessionVariable>";

                sVariableBuilder.AddVariableItem("CashFlowECSet", (criteriaCode + '_Cashflow'), 'nvarchar');
                sVariableBuilder.AddVariableItem("TaskCode", (trustCode + '_Cashflow'), 'nvarchar');


                variableModel.filter(function (item) {
                    if (item.Name == "StartPeriod") {
                        startPeriodStr = vVariableTemplate.format(item.Name, item.Value, item.DataType, item.IsConstant, item.IsKey, item.KeyIndex);
                        sVariableBuilder.AddVariableItem(item.Name, item.Value, item.DataType, item.IsConstant, item.IsKey, item.KeyIndex);
                    }
                });
                variableModel.filter(function (item) {
                    if (item.Name == "EndPeriod") {
                        endPeriodStr = vVariableTemplate.format(item.Name, item.Value, item.DataType, item.IsConstant, item.IsKey, item.KeyIndex);
                        sVariableBuilder.AddVariableItem(item.Name, item.Value, item.DataType, item.IsConstant, item.IsKey, item.KeyIndex);
                    }
                });
                if (startPeriodStr == "") {
                    sVariableBuilder.AddVariableItem("StartPeriod", 0, 'nvarchar');
                }
                if (endPeriodStr == "") {
                    sVariableBuilder.AddVariableItem("EndPeriod", 11, 'nvarchar');
                }


                var sVariable = sVariableBuilder.BuildVariables();


                var tIndicator = new taskIndicator({
                    width: 450,
                    height: 530,
                    clientName: 'CashFlowProcess',
                    appDomain: 'Task',
                    taskCode: (trustCode + '_Cashflow'),
                    sContext: sVariable,
                    callback: function () {
                        console.log('success')

                    }
                });
                tIndicator.show();





            });





            
        } else {
            GSDialog.HintWindow('相关信息未配置');
        }
        
        
    }
////////////

    function getTaskCodeListByTaskType(appDomain, callback) {
        var taskType = "CashFlow";
        var sContent = "{'SPName':'usp_GetTaskCodeListByTaskType'," +
                      "'TaskType':'" + taskType + "'" +
                      "}";
        getQueryStoredProcedureProxy(appDomain, sContent, callback);
    }

    //////////
    //查看预测模型
    function viewCashflowModel() {
        var trustCode = getTrustCodeByTrustId(BusinessIdentifier);

        window.open(GlobalVariable.CashFlowEngineServiceHostURL + "UITaskStudio/index.html?appDomain=Task&taskCode=" + (trustCode + '_Cashflow'), '_blank');


    }




    //预测现金流模型
    function CashflowModel() {
        var trustCode = getTrustCodeByTrustId(BusinessIdentifier);

        

        getTaskSessionContextByTaskCode('Task', getVariableToJson, trustCode);

        

        //window.open(GlobalVariable.CashFlowEngineServiceHostURL + "UITaskStudio/index.html?appDomain=Task&taskCode=" + (trustCode + '_Cashflow'), '_blank');

    }

    //查看风险报酬转移测算结果
    function LookItems() {
        if ($('.main-customize2').hasClass('hidden')) {
            $('.main-customize2').removeClass('hidden');
            if (!$('.main-customize').hasClass('hidden')) { $('.main-customize').addClass('hidden'); }
            var executeParam = {
                SPName: 'RiskTransfer.usp_GetRiskTransferResult', SQLParams: []
            };
            executeParam.SQLParams.push({ Name: 'BusinessIdentifier', Value: BusinessIdentifier, DBType: 'string' });

            var serviceUrl = GlobalVariable.QuickWizardServiceUrl + 'CommonGet?exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
            webProxy.callWCFSvc(serviceUrl, true, 'GET', Show);
        } else {
            $('.main-customize2').addClass('hidden');
        }
    }

    function Show(response) {
        var rs;
        var TotalCash
        var OutCash
        var RetainedCash
        var repl = document.getElementById('RawValue');
        var repp = document.getElementById("Variance");
        var reps = document.getElementById("ShowResult");
        $(repl).empty();
        $(repp).empty();
        $(reps).empty();
        var showResult = ''
        var html = '';
        var html2 = '';
        var flag = 1;
        html = html + viewTemplate1;
        html2 = html2 + viewTemplate2;
        var contentHtml;
        var json = response;
        var obj = eval(json);			//字符串转化为 数组

        for (var i = 0; i < obj.length; i++) {
            var dataJson = obj[i].DataJson;	//取出JSON字符串
            var dataArray = eval(dataJson);	//转化为数组
            for (var k = 0; k < dataArray.length; k++) {
                contentHtml = contentTemplate;	//获取模板
                var dataJsonObj = eval(dataArray[k]);	//转化为JSON对象
                for (j in dataJsonObj) {
                    contentHtml = contentHtml.replace('$' + j + '$', dataJsonObj[j]);
                    if (dataJsonObj[j] == 'Variance' || dataJsonObj[j] == 'Variance_WeighedAverage' || dataJsonObj[j] == 'SD') {
                        html2 += contentHtml;
                        if (dataJsonObj[j] == 'Variance_WeighedAverage') {
                            TotalCash = dataJsonObj['TotalCashflow_NPV'];
                            OutCash = dataJsonObj['OutgoingCashflow_NPV'];
                            RetainedCash = dataJsonObj['RetainedCashflow_NPV'];
                        }
                        //html2+='<br />';
                    }
                    else if (dataJsonObj[j] == 'RawValue' || dataJsonObj[j] == 'RawValue_WeighedAverage') {
                        html += contentHtml;
                        //html+='<br />';
                    }
                    else
                        flag = 0;
                }
            }
            html += '</table>'
            html2 += '</table>'

        }
        rs = (0.5 + (OutCash - RetainedCash) / (2 * TotalCash)) * 100;
        showResult += '<h3 class=\"large\" style="text-align:center">风险报酬转移:' + rs.toFixed(2) + '%' + '</h3><br /><br /><br /><br />'
        $(html).appendTo($(repl));
        $(html2).appendTo($(repp));
        $(showResult).appendTo($(reps));
    }

    //进行融资城摊销计算
    function AmortizationCalculation() {
        sVariableBuilder.AddVariableItem('TrustId', BusinessIdentifier, 'nvarchar', 0, 0, 0);
        var sVariable = sVariableBuilder.BuildVariables();
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'Task',
            taskCode: 'CalculateFinancialCostAmortization',
            sContext: sVariable,
            callback: function () {
                sVariableBuilder.ClearVariableItem();
            }
        });
        tIndicator.show();
    }

    //查看摊销计算结果
    function ViewCalculationResult() {
        if ($('.main-customize3').hasClass('hidden')) {
            $('.main-customize3').removeClass('hidden');
            if (!$('.main-customize').hasClass('hidden')) { $('.main-customize').addClass('hidden'); }
            if (!$('.main-customize2').hasClass('hidden')) { $('.main-customize2').addClass('hidden'); }

            var sContent = encodeURIComponent('{ "SPName": "' + 'dbo.usp_LoadFCAResult ' + '", "SQLParams": [{ "Name": "TrustId", "value": "' + BusinessIdentifier + '", "DBType": "int" }] }');
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' + sContent + '&resultType=commom&_=' +
                Math.random() * 150;

            webProxy.callWCFSvc(serviceUrl, true, 'GET', view);
        } else {
            $('.main-customize3').addClass('hidden');
        }
    }

    function view(response) {
        for (var i = 0; i < response.length; i++) {
            for (var item in response[i]) {
                if (response[i][item] == null || response[i][item] == 'null') {
                    response[i][item] = '--';
                }
            }
        }
        var datalist = response;

        showSummary('resultTable', datalist)

        datalist = ''
    }
 
    function showSummary(id, dataSurce) {
        $("#" + id).dxDataGrid({
            dataSource: dataSurce,
            columns: [
                {
                    dataField: "PeriodsId",
                    caption: "期数"
                },
                {
                    dataField: "InitialPrincipal",
                    caption: "初始剩余本金"
                },
                 {
                     dataField: "PayPrincipal",
                     caption: "偿付本金"
                 },
                {
                    dataField: "Date",
                    caption: "日期"
                },
                {
                    dataField: "Days",
                    caption: "天数"
                },
                {
                    dataField: "PayInterest",
                    caption: "偿付应付利息"
                },
                 {
                     dataField: "PrepaidCost",
                     caption: "待摊成本"
                 },
                {
                    dataField: "PrinAndInterest",
                    caption: "本期本息之和"
                },
                {
                    dataField: "TotalPresentValue",
                    caption: "本期合计现值"
                },
                {
                    dataField: "RealPeriodicRate",
                    caption: "实际期间利率"
                },
                 {
                     dataField: "InitialAmortizedCost",
                     caption: "期初摊余成本"
                 },
                {
                    dataField: "RealInterestCost",
                    caption: "本期实际利息"
                }
            ],

            //               SELECT PeriodsId AS '期数',InitialPrincipal AS '初始剩余本金',PayPrincipal AS '偿付本金', Date AS '日期',Days  AS '天数',PayInterest AS '偿付应付利息',PrepaidCost AS '待摊成本',
            //PrinAndInterest AS '本期本息之和',TotalPresentValue AS '本期合计现值',RealPeriodicRate AS '实际期间利率',InitialAmortizedCost AS '期初摊余成本',RealInterestCost AS '本期实际利息

            "export": {
                enabled: true,
                ignoreExcelErrors: true,
            },
        })
        $("#dalSummary").css("margin", "auto");

    }//showSummary


    //根据trustid获取trustcode
    function getTrustCodeByTrustId(trustid) {
        var executeParam = {
            SPName: 'usp_GetTrustInfo', SQLParams: [
                { Name: 'trustId', value: trustid, DBType: 'int' }
            ]
        };

        var result = common.ExecuteGetData(false, svcUrlTrustManagement, 'TrustManagement', executeParam);

        var res = ''
        if (result.length > 0) {
            result.forEach(function (v, i) {
                if (v.ItemCode == 'TrustCode') {
                    res = v.ItemValue;
                    return;
                }
            });
        }
        return res;
    }

    function saveData(businessCode, businessIdentifier, pageId, array, callback) {
        var itemsTmpl = '<is>{0}</is>';
        var itemTmpl = '<i><id>{0}</id><v>{1}</v><g1>{2}</g1><g2>{3}</g2><si>{4}</si></i>';

        var items = '';
        $.each(array, function (i, v) {
            var grouId01 = (typeof v.GroupId01 == 'undefined') ? '' : v.GroupId01;//存在GroupId01==0 情况
            items += itemTmpl.format(v.ItemId, v.ItemValue || '', grouId01, v.GroupId02 || '', v.SectionIndex || 0);
        });
        items = itemsTmpl.format(items);
        items = encodeURIComponent(items);

        var json = "{'DBName':'QuickWizard','Schema':'QuickWizard','SPName':'usp_SavePageItems',"
        + "'Params':{'BusinessCode':'" + businessCode + "','BusinessIdentifier':'" + businessIdentifier + "',"
        + "'PageId':'" + pageId + "','PageItemXML':'" + items + "','OutSessionId':''}}";

        json = "<SessionContext>{0}</SessionContext>".format(json);

        var serviceUrl = GlobalVariable.QuickWizardServiceUrl + 'DataCUD';
        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: json,
            success: function (data) {
                callback(data);
            },
            error: function (data) {
                alert("error is :" + data);
            }
        });
    }

    //注册界面按钮事件
    function registerBtnEvent() {
        var btnClick = $('.btn-group-sm, .form-save');
        var btn_addClick = $('#btn_add');

        var PDClick = $('td>div[itemCode="PD"]');//违约率
        var PPClick = $('td>div[itemCode="PP"]');//早偿率
        PDClick.unbind('click');
        PPClick.unbind('click');
        PDClick.on('click', function () {
            gdvOperation.OpenDialog(this, '违约率明细');
        });
        PPClick.on('click', function () {
            gdvOperation.OpenDialog(this, '早偿率明细');
        });

        //父元素委托点击事件
        btnClick.unbind('click');//先解绑click事件
        btnClick.click(function (event) {
            var ev = event || window.event;
            var target = ev.target || ev.srcElement;
            if (target.nodeName.toLowerCase() == 'button'
                || (target.nodeName.toLowerCase() == 'input' && target.type.toLowerCase() == 'button')
                || target.nodeName.toLocaleLowerCase() == 'i') {
                switch (target.name) {
                    case 'input_view':
                        gdvOperation.View(target);
                        break;
                    case 'input_edit':
                        gdvOperation.Detail(target);
                        break;
                    case 'input_delete':
                        gdvOperation.Delete(target);
                        break;
                    case 'input_clear':
                        gdvOperation.Clear(target);
                        break;
                    case 'input_save':
                        gdvOperation.Save(target);
                        registerBtnEvent();
                        break;
                    case 'btn_Save':
                        SavePageItems(target);
                        break;
                    case 'btn_Run':
                        Run(target);
                        break;
                    case 'btn_View':
                        ViewResults(target);
                        break;
                    case 'btn_Import':
                        ImportFromStaticPool(target);
                        break;
                    case 'btn_CashflowModel':
                        CashflowModel(target);
                        break;
                    case 'btn_ViewCashflowModel':
                        viewCashflowModel(target);
                        break;
                    case 'btn_ShowModel':
                        ShowStressTestModel(target);
                        break;
                    //case 'btn_add':
                    //    gdvOperation.AddOptionalField(target);
                    //    break;
                    case 'btn_RunRishTransfer':
                        RunRiskTransfer(target);
                        break;
                    case 'btn_ViewRishTransfer':
                        LookItems(target);
                        break;
                    default:
                        alert('点击有误！');
                        break;
                }
            }
        });
        btn_addClick.unbind('click');//先解绑click事件
        btn_addClick.click(function () {
            gdvOperation.AddOptionalField(this);
        });
    }
});
