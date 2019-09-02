/**
 * 费用状态查询和设置 Page: TrustFeePaymentSettings.html
 */
//(function ($) {   // 费用状态设置
define(function(require){
    var $ = require('jquery');
    var wcfProxy = require('app/productManage/Scripts/wcfProxy');
    var wcfDataServices = new wcfProxy();
    //var trustFeeSettings = new TrustFeeSettings();
    //trustFeeSettings.initialize();
    
    initialize();
    function TrustFeeSettings() {      
    };

    TrustFeeSettings.prototype ={
        //var wcfDataServices = new WcfDataServices();
        // Initialize page
        initialize : function () {
            var appViewModel = new AppViewModel();
            wcfDataServices.getTrustCodeList().then(function (data) {
                var trustList = JSON.parse(data);
                $.each(trustList, function (index, trustItem) {
                    appViewModel.trustCodes.push(trustItem.TrustCode);
                });

                ko.applyBindings(appViewModel);
                $('#ddlTrustCode').trigger('change');
            });
        },

        // Knockout Models
        AppViewModel : function() {
            var self = this;
            // models for UI
            self.trustCodes = ko.observableArray([]);
            self.transactionDates = ko.observableArray([]);
            self.trustFees = ko.observableArray([]);

            // 费用日期修改后刷新费用数据
            self.transactionDateChanged = function (source, event) {
                var trustCode = $('#ddlTrustCode').val();
                var transDate = event.target.value;

                wcfDataServices.getTrustFeePaymentInterface(trustCode, transDate).then(function (data) {
                    var trustFeeData = JSON.parse(data);
                    self.trustFees.removeAll();
                    $.each(trustFeeData, function (index, trustFee) {
                        var status;
                        switch (trustFee.TransactionStatus) {
                            case 0:
                                status = '未推送';
                                break;
                            case 1:
                                status = '已推送';
                                break;
                            default:
                                status = '不推送';
                        }
                        self.trustFees.push({
                            id: trustFee.Id,
                            feeType: trustFee.FeeType,
                            name: trustFee.DisplayName,
                            payAmount: trustFee.PayAmt,
                            startDate: getStringDate(trustFee.StartDate).dateFormat('yyyy-MM-dd'),
                            endDate: getStringDate(trustFee.EndDate).dateFormat('yyyy-MM-dd'),
                            transactionDate: getStringDate(trustFee.TransactionDate).dateFormat('yyyy-MM-dd'),
                            transactionStatus: trustFee.TransactionStatus,
                            status: status,
                            allowPush: trustFee.TransactionStatus !== 2
                        });
                    });
                });
            }

            // 专项计划修改后刷新日期
            self.trustCodeChanged = function (source, event) {
                var trustCode = event.target.value;
                wcfDataServices.getTrustFeeDateList(trustCode).then(function (data) {
                    var trustList = JSON.parse(data);
                    self.transactionDates.removeAll();
                    $.each(trustList, function (index, trustItem) {
                        self.transactionDates.push(getStringDate(trustItem.TransactionDate).dateFormat('yyyy-MM-dd'));
                    });

                    $('#ddlTransactionDate').trigger('change');
                });
            }

            // 保存费用状态
            self.updateTransactionStatus = function () {
                var feesXml = '<fees>';
                var trustFees = self.trustFees();
                for (var i = 0, length = trustFees.length; i < length; i++) {
                    var fee = trustFees[i];
                    if (fee.allowPush) {
                        // 原来状态是不推送，则更新为未推送
                        if (fee.transactionStatus === 2) {
                            fee.transactionStatus = 0;
                        }
                    } else {
                        fee.transactionStatus = 2;
                    }

                    feesXml += '<fee>'
                        + '<id>' + fee.id + '</id>'
                        + '<status>' + fee.transactionStatus + '</status>'
                        + '</fee>';
                }
                feesXml += '</fees>';
                wcfDataServices.updateUpdateTrustFeeTransactionStatus(feesXml).then(function (data) {
                    var r = JSON.parse(data);
                    if (r.length > 0) {
                        if (r[0].Result === 'OK') {
                            alert('保存成功');
                        } else {
                            alert('保存失败');
                        }
                    }
                });
            }
        }
    }

    //return new TrustFeeSettings();
});

    // 费用设置Wcf数据接口
    /*function WcfDataServices() {
        function getWcfCommon(param) {
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?appDomain=TrustManagement&resultType=commom&executeParams=" + window.JSON.stringify(param);
            return $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "jsonp",
                crossDomain: true,
                contentType: "application/json;charset=utf-8",
                beforeSend: function () {
                    //$('#loading').fadeOut();
                }
            });
        }

        // Get trusts list
        function getTrustCodeList() {
            var trustCodeParam = {
                "SPName": "usp_GetTrustListPerTrustFeePayment",
                "SQLParams": []
            };

            return getWcfCommon(trustCodeParam);
        }

        // Get trust fee date list
        function getTrustFeeDateList(trustCode) {
            var trustFeeDateParam = {
                "SPName": "usp_GetTrustFeePaymentDateList",
                "SQLParams": [
                    {
                        "Name": "TrustCode",
                        "value": trustCode,
                        "DBType": "string"
                    }
                ]
            };

            return getWcfCommon(trustFeeDateParam);
        }

        // Get trust fee payment data
        function getTrustFeePaymentInterface(trustCode, transactionDate) {
            var trustFeeParam = {
                "SPName": "usp_GetTrustFeePaymentInterface",
                "SQLParams": [
                    {
                        "Name": "TrustCode",
                        "value": trustCode,
                        "DBType": "string"
                    },
                    {
                        "Name": "TransactionDate",
                        "value": transactionDate,
                        "DBType": "date"
                    },
                    {
                        "Name": "OrganizationCode",
                        "value": 'CRC',
                        "DBType": "string"
                    }
                ]
            };
            return getWcfCommon(trustFeeParam);
        }

        // Update fee status
        function updateUpdateTrustFeeTransactionStatus(feeDataXml) {
            var feeDataParam = {
                "SPName": "usp_UpdateTrustFeePaymentTransactionStatus",
                "SQLParams": [
                    {
                        "Name": "FeeData",
                        "value": feeDataXml,
                        "DBType": "xml"
                    }
                ]
            };
            return getWcfCommon(feeDataParam);
        }

        return {
            getTrustCodeList: getTrustCodeList,
            getTrustFeeDateList: getTrustFeeDateList,
            getTrustFeePaymentInterface: getTrustFeePaymentInterface,
            updateUpdateTrustFeeTransactionStatus: updateUpdateTrustFeeTransactionStatus
        }
    }*/
    //})(jQuery);

