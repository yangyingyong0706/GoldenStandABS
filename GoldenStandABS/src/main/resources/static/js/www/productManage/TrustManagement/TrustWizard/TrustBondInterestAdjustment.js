
define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    require('date_input');
    //var anydialog = require('anyDialog');
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');
    //var roleOperate = require('app/productManage/TrustManagement/Common/Scripts/roleOperate');
    var ko = require('knockout');
    var komapping = require('knockout.mapping');
    ko.mapping = komapping;
    var common = require('common');
    var gsUtil = require('gsUtil');
    var GlobalVariable = require('globalVariable');

    //var numberFormat = require('app/productManage/interface/numberFormat_interface');
    require('asyncbox');
    var GSDialog = require('gsAdminPages');

    var trustId = common.getQueryString('trustId');
    var trustBondId = common.getQueryString('trustBondId');


    function initKo() {
        var editModel = function (data) {
            if (data.BaseDate == "1900-01-01") {
                data.BaseDate = parseInt(data.StartDate.substring(0, 4)) + 1 + "-01-01"
            }
            this.Id = data.Id;
            this.TrustId = data.TrustId;
            this.TrustBondId = data.TrustBondId;
            this.InterestType = ko.observable(data.InterestType);
            this.PBCRatesCode = ko.observable(data.PBCRatesCode);
            this.StartDate = ko.observable(data.StartDate);
            this.EndDate = ko.observable(data.EndDate);
            this.BaseRate = ko.observable(data.BaseRate);
            this.AdjustValueBasedOnRatio = ko.observable(data.AdjustValueBasedOnRatio);
            this.AdjustValueBasedOnNumber = ko.observable(data.AdjustValueBasedOnNumber);
            this.BaseDate = ko.observable(data.BaseDate);
            this.AdjustType = ko.observable(data.AdjustType);
            this.AdjustFrequency = ko.observable(data.AdjustFrequency);
            this.DayCountType = ko.observable(data.DayCountType);
            this.changePBCCode = function (data, event) {
                var $el = $(event.srcElement || event.target).find('option:selected');
                this.BaseRate($el.attr('baserate'));
                this.InterestType($el.attr('interesttype'));
            }.bind(this);
            this.isFixed = ko.computed(function () {
                return this.AdjustType() === 'fixed';
            }, this);
            this.AdjustType.subscribe(function (v) {
                if (v == 'fixed') {
                    this.DayCountType('');
                }
                
            }.bind(this));
            $("[data-toggle='tooltip']").tooltip({});
        }
        var viewModel = function () {
            var self = this;
            this.adjustmentList = ko.observableArray(GetSourceData(trustId, trustBondId));
            this.assetStart = common.getQueryString('start');
            this.assetEnd = common.getQueryString('end');
            this.editData = ko.observableArray();
            this.PBCRatesCodeOptions = GetPeriodData(this.assetStart);
            this.AdjustTypeOptions = [{ text: '固定', value: 'fixed' }, { text: '相对', value: 'relative' }];
            this.DateTypeOptions = [
                { text: '自然日', value: 'natureDay' },
                { text: '工作日', value: 'workingDay' },
                { text: '年', value: 'years' },
                { text: '月', value: 'months' }
            ];
            this.assetStartEndPeriod = ko.computed(function () {
                return this.assetStart + ' - ' + this.assetEnd;
            }, this);
            this.editExistedAdjustment = function (index) {
                var i = index();
                self.editData(new editModel(self.adjustmentList()[i]));
            };
            this.cancelEditing = function () {
                self.editData([]);
            }
            this.myPostProcessingLogic = function () {
                $("[data-toggle='tooltip']").tooltip({});
            };


            this.save = function () {
                var editData = self.editData();
                var v = ko.toJS(editData);
                if (!/(^[1-9]\d*$)/.test(v.AdjustFrequency) && v.AdjustType == "fixed") {
                    $(".aclock").css("border", "1px solid  #ec3333");
                    GSDialog.HintWindow("调息方式为固定时,调息填写数值必须大于零")
                    return false
                } else if (!/(^[0-9]\d*$)/.test(v.AdjustFrequency) && v.AdjustType == "relative") {
                    $(".aclock").css("border", "1px solid  #ec3333");
                    GSDialog.HintWindow("请输零或者正整数")
                    return false
                }else{
                    $(".aclock").css("border", "1px solid #ddd");
                }
                var items = '<items>';
                items += '<item>';
                items += '<TrustId>' + trustId + '</TrustId>';
                items += '<TrustBondId>' + trustBondId + '</TrustBondId>';
                items += '<StartDate>' + v.StartDate + '</StartDate>';
                items += '<EndDate>' + v.EndDate + '</EndDate>';
                items += '<BaseRate>' + v.BaseRate + '</BaseRate>';
                items += '<AdjustType>' + v.AdjustType + '</AdjustType>';
                items += '<BaseDate>' + v.BaseDate + '</BaseDate>';
                items += '<DayCountType>' + v.DayCountType + '</DayCountType>';
                items += '<AdjustFrequency>' + v.AdjustFrequency + '</AdjustFrequency>';
                items += '<PBCRatesCode>' + v.PBCRatesCode + '</PBCRatesCode>';
                items += '<InterestType>' + v.InterestType + '</InterestType>';
                items += '<AdjustValueBasedOnRatio>' + v.AdjustValueBasedOnRatio + '</AdjustValueBasedOnRatio>';
                items += '<AdjustValueBasedOnNumber>' + v.AdjustValueBasedOnNumber + '</AdjustValueBasedOnNumber>';
                items += '</item>';
                items += '</items>';
                var executeParam = {
                    SPName: 'usp_UpdatetblTrustBondVariableRate', SQLParams: [
                        { Name: 'trustId', value: trustId, DBType: 'int' },
                        { Name: 'trustBoundId', value: trustBondId, DBType: 'string' },
                        { Name: 'items', value: items, DBType: 'xml' }
                    ]
                };
                var result = ExecuteRemoteData(executeParam);
                if (result[0].Result) {
                    GSDialog.HintWindow('保存成功！');
                    self.adjustmentList([v]);
                    self.editData([]);
                    $('.ab_close', parent.document).trigger('click');
                } else {
                    GSDialog.HintWindow('请到日期设置界面配置日期信息！');
                }
                //if (result[0].Result) {
                //    //debugger
                //    alert('保存成功！');
                //    self.adjustmentList([v]);
                //    self.editData([]);
                //} else {
                //    alert('数据提交保存时出现错误！');
                //}
            }
        }

        var dataModel = new viewModel();
        ko.applyBindings(dataModel);
        $('.date-plugins').date_input();
    }
    initKo();
    function GetSourceData(trustId, trustBondId) {

        var executeParam = {
            SPName: 'usp_GettblTrustBondVariableRate', SQLParams: [
                    { Name: 'trustId', value: trustId, DBType: 'int' },
                    { Name: 'trustBoundId', value: trustBondId, DBType: 'string' }
            ]
        };
        return ExecuteRemoteData(executeParam);
    }
    function GetPeriodData(assetStart) {
        var executeParam = {
            SPName: 'usp_GettblPBCRates', SQLParams: [
                    { Name: 'StartDate', value: assetStart, DBType: 'string' }
            ]
        };
        return ExecuteRemoteData(executeParam);
    }

    function ExecuteRemoteData(executeParam) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
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
            error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        });
        return sourceData;
    }

});
