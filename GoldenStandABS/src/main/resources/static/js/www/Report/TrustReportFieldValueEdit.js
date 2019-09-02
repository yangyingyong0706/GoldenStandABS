define(function (require) {
    var $ = require("jquery");
    var Vue = require("Vue2");
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var GSDialog = require("gsAdminPages");
    var TrustId = common.getQueryString('TrustId');
    var DimReportingDateId = common.getQueryString('DimReportingDateId');
    var ReportTypeId = common.getQueryString('ReportTypeId');
    var DataSourceId = common.getQueryString('DataSourceId');
    var TableCode = common.getQueryString('TableCode');
    var TrustReportField = common.getQueryString('TrustReportField');
    var history
    var tableName
    var gv = require('globalVariable');
    var vm = new Vue({
        el: "#app",
        data: {
            StatisticalList: [],
            count: 0,
            StatisticalLists: [],
        },
        created: function () {
            this.RenderList();
        },
        mounted: function () {
            var self = this;
            $.each(self.StatisticalList, function (i, v) {
                self.disabledInputs(i);
            })
            $("#loading").hide();
            $("body").css("overflow", "auto");
        },
        methods: {
            addItem: function () {
                var self = this;
                var p = new Object();
                this.$nextTick(function () {
                    var datalist = {}
                    $.extend(true, datalist, self.StatisticalLists);;
                    $.each(datalist, function (j, m) {
                        datalist[j] = "";
                    })
                    self.StatisticalList.unshift(datalist);
                    // })
                    self.count++;
                })

            },
            removeItem: function (index) {
                var self = this;
                var object = self.StatisticalList[index];
                GSDialog.HintWindowTF("是否删除该字段", function () {
                    self.StatisticalList.remove(object);
                    self.count--;
                    if (self.count < 0) self.count = 0
                    $.each(self.StatisticalList, function (i, v) {
                        self.disabledInputs(i);
                    })
                });

            },
            saveConfig: function () {
                var self = this;
                if (self.StatisticalList.length == 0) {
                    GSDialog.HintWindow("数据不能为空！");
                    return false
                }
                var self = this;
                if (false == self.verifyData()) {
                    GSDialog.HintWindow("请检查数据填写,不能整行为空！");
                    return false
                }
                var saveXml = '<Items>'
                $.each(self.StatisticalList, function (i, p) {
                    var n = i + 1;
                    $.each(p, function (j, m) {
                        saveXml += '<Item TrustId="' + TrustId +
                            '" DimReportingDateId="' + DimReportingDateId +
                            '" ReportTypeId="' + (ReportTypeId == null ? '' : ReportTypeId) +
                            '" DataSourceId="' + DataSourceId +
                            '" TableCode="' + TableCode +
                            '" TableRowKey="' + n +
                            '" ItemCode="' + $.trim(j) +
                            '" ItemValue="' + $.trim(m) + '" />'
                    })


                })
                saveXml += '</Items>'
                var executeParam = {
                    'SPName': "TrustManagement.usp_SaveTrustReportDataTableCodeXml", 'SQLParams': [
                       { 'Name': 'Xml', 'Value': saveXml, 'DBType': 'xml' }
                    ]
                };
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    GSDialog.HintWindow("保存成功", function () {
                        location.reload(true);
                    })
                });
            },
            stripscript: function (obj) {
                $(obj.srcElement).removeClass("theInputBorderRed");
                $(obj.srcElement).removeClass("border_red");
                common.stripscript(obj.srcElement)
            },
            CHZNClass: function (obj) {
                $(obj.srcElement).removeClass("border_red");
            },
            verifyData: function () {
                var rtn;
                $.each(this.StatisticalList, function (i, p) {
                    var a = 0; b = 0;
                    $.each(p, function (j, m) {
                        a++;
                        if (m == "") {
                            b++;
                        }
                    })

                    if (a == b) {
                        rtn = false
                    }
                });
                return rtn;
            },
            verifyDatas: function () {

                var rtn;
                var self = this;
                for (var j = 0; j < self.count; j++) {
                    $.each(history, function (i, p) {
                        if (p.DistributionTypeCode == $(".font-ll").eq(j).val()) {
                            rtn = false;
                        }
                    });
                }
                if (self.count == 0) {
                    var newarry = []
                    $.each(self.StatisticalList, function (i, p) {
                        newarry.push(p.DistributionTypeCode)
                    })
                    function isRepeat(arr) {

                        var hash = {};

                        for (var i in arr) {

                            if (hash[arr[i]])

                                return true;

                            hash[arr[i]] = true;

                        }

                        return false;

                    }
                    if (isRepeat(newarry)) {
                        rtn = false
                    }
                }
                return rtn;
            },
            changeselect: function (index) {
                var self = this;
                console.log(self.StatisticalList[index].Unit)
            },

            RenderList: function () {
                var self = this;
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                var executeParam = {
                    'SPName': "TrustManagement.usp_GetTrustReportDataTableName",
                    'SQLParams': [
                        { 'Name': 'TrustId', 'Value': TrustId, 'DBType': 'int' },
                        { 'Name': 'DimReportingDateId', 'Value': DimReportingDateId, 'DBType': 'int' },
                        { 'Name': 'ReportTypeId', 'Value': ReportTypeId, 'DBType': 'int' },
                        { 'Name': 'DataSourceId', 'Value': DataSourceId, 'DBType': 'int' },
                        { 'Name': 'TableCode', 'Value': TableCode, 'DBType': 'string' },
                        { 'Name': 'TrustReportField', 'Value': TrustReportField, 'DBType': 'string' }
                    ]
                };

                common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {

                    self.StatisticalLists = data[0];
                    tableName = data[0];
                    data.remove(data[0]);
                    self.StatisticalList = data;
                    history = JSON.parse(JSON.stringify(data));
                });
            },

        }
    })
})