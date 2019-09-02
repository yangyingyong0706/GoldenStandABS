
define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('common');

    var isOpen = false;
    $('#show-options-btn').click(function () {
        var $this = $(this);
        $('#more-options').slideToggle(200, function () {
            if ($(this).is(":visible")) {
                $this.css('background', '#f8f8f8').find('i').text('▲');
            } else {
                $this.css('background', '#fff').find('i').text('▼');
            }
        });
    });
    $('#PeriodsCalRule').on('change', function () {
        var value = $(this).val(), $Direction = $('#Direction');
        if (value == 0) {
            $Direction.html(
                '<option value="1">从资产到期日开始往前推算，资产到期日到前一还款日的区间作为单独一期</option>'+
                '<option value="2">从资产到期日开始往前推算，资产到期日到前一还款日的区间不作为单独一期</option>'+
                '<option value="3">从资产到期日开始往前推算，资产到期日所在月的还款日为最后一期还款日</option>'
            );
        } else {
            $Direction.html(
                '<option value="1">以导入剩余期数（remaining term）为准，从下一个还款日开始往后推算</option>'
            );
        }
    });
    $('#CalculateRTBySystem').on('change', function () {
        var $RTCalculationRuleOptions = $('#RTCalculationRule-Options');
        if ($(this).is(':checked')) {
            $RTCalculationRuleOptions.show();
        } else {
            $RTCalculationRuleOptions.hide();
        }
    });
    // 缓存拆分规则
    if (window.localStorage) {
        var splitOptions = localStorage.getItem('splitOptions');
        if (splitOptions) {
            splitOptions = JSON.parse(splitOptions);
            $.each(splitOptions, function (k, v) {
                var obj = $('#' + k);
                if (obj[0]) {
                    if (obj[0].tagName.toLowerCase() == 'input') {
                        var type = obj.attr('type');
                        if (type == 'radio') {
                            $("input[name='"+k+"'][value='"+v+"']").prop('checked', true);
                        } else {
                            obj.prop('checked', (v === '1') ? true : false);
                            if (k === 'CalculateRTBySystem') {
                                if (v == '1') {
                                    obj.trigger('change');
                                }
                            }
                        }
                    } else {
                        obj.val(v);
                        if (k === 'PeriodsCalRule') {
                            if (v == '1') {
                                obj.trigger('change');
                            }
                        }
                    }
                }
            });
        }
    }
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var TrustId = common.getQueryString('TrustId');
    var executeParam = { SPName: 'usp_GetFactLoanDate', SQLParams: [] };
    executeParam.SQLParams.push({ Name: 'TrustId', Value: TrustId, DBType: 'int' });

    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
    $.ajax({
        cache: false,
        type: "GET",
        async: false,
        url: svcUrl + 'appDomain=dbo&executeParams=' + executeParams ,
        dataType: "json",
        contentType: "application/xml;charset=utf-8",
        data: {},
        success: function (response) {
            var sourceData;
            if (typeof response === 'string') { sourceData = JSON.parse(response); }
            else { sourceData = response; }
            var options="";
            $.each(sourceData, function (i, item) {
                options += '<option value="' + item.ReportingDate + '">' + item.ReportingDate + '</option>';
            });
            $('#ReportingDate').append(options);
        },
        error: function (response) { alert('Error occursed while requiring the remote source data!'); }
    });

    $('#btnSubmit').click(function () {
        var data = {
            IsBaseOnLoanTerm : $('#IsBaseOnLoanTerm').val(),
            CalculateInterestByDays : $('#CalculateInterestByDays').val(),
            CalculateHeadInterestByDay : $('#CalculateHeadInterestByDay').val(),
            CountLastInterestPeriodByDay : $('#CountLastInterestPeriodByDay ').val(),
            IsBasedOnReportingDate : $('input[name="IsBasedOnReportingDate"]:checked').val(),
            PeriodsCalRule: $('#PeriodsCalRule').val(),
            TrailPeriodsCalRule: $('#TrailPeriodsCalRule').val(),
            IsRidPrepaid: $('#IsRidPrepaid').val(),
            Direction : $('#Direction').val(),
            IsUserStatusNormal: $('#IsUserStatusNormal').is(':checked') ? '1' : '0',
            IsLoanGradeLevelNormal: $('#IsLoanGradeLevelNormal').is(':checked') ? '1' : '0',
            IsNotInArrears: $('#IsNotInArrears').is(':checked') ? '1' : '0',
            IsNotMatured: $('#IsNotMatured').is(':checked') ? '1' : '0',
            CalculateRTBySystem : $('#CalculateRTBySystem').is(':checked') ? '1' : '0',
            RTCalculationRule : $('input[name="RTCalculationRule"]:checked').val()
        }
        if (window.localStorage)
            localStorage.setItem('splitOptions', JSON.stringify(data));
       


        require(['goldenstand/taskProcessIndicator', 'goldenstand/sVariableBuilder'/*, 'goldenstand/webProxy', 'common'*/],
                  function (taskIndicator, sVariableBuilder/*, webProxy, common*/) {
                      sVariableBuilder.AddVariableItem('TrustId', TrustId, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('ReportingDate', $('#ReportingDate').val(), 'String', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('IsBaseOnLoanTerm', data.IsBaseOnLoanTerm, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('CalculateInterestByDays', data.CalculateInterestByDays, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('CalculateHeadInterestByDay', data.CalculateHeadInterestByDay, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('IncludeAPBFPoolCloseDate', 0, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('IsBasedOnReportingDate', data.IsBasedOnReportingDate, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('CountLastInterestPeriodByDay', data.CountLastInterestPeriodByDay, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('PeriodsCalRule', data.PeriodsCalRule, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('TrailPeriodsCalRule', data.TrailPeriodsCalRule, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('IsRidPrepaid', data.IsRidPrepaid, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('Direction', data.Direction, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('IsUserStatusNormal', data.IsUserStatusNormal, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('IsLoanGradeLevelNormal', data.IsLoanGradeLevelNormal, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('IsNotInArrears', data.IsNotInArrears, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('IsNotMatured', data.IsNotMatured, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('CalculateRTBySystem', data.CalculateRTBySystem, 'Int', 1, 0, 0);
                      sVariableBuilder.AddVariableItem('RTCalculationRule', data.RTCalculationRule, 'Int', 1, 0, 0);
                      var sVariable = sVariableBuilder.BuildVariables();
                      var tIndicator = new taskIndicator({
                          width: 600,
                          height: 550,
                          clientName: 'CashFlowProcess',
                          appDomain: 'Task',
                          taskCode: 'ImportTrustAssetByFactLoan',
                          sContext: sVariable,
                          callback: function () {
                              self.location.reload();
                          }
                      });
                      tIndicator.show();
                  });

    });
});