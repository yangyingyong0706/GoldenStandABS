define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var Vue = require('Vue2');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var trustId = common.getQueryString('tid');
    var codeId = common.getQueryString('codeId');
    var infoID = common.getQueryString('infoID');
    var Amount = common.getQueryString('Amount');
    var Rate = common.getQueryString('Rate');
    var BondName = common.getQueryStringSpecial('BondName');
    var StartDate = common.getQueryString('StartDate');
    var EndDate = common.getQueryString('EndDate');
    var PendDate = common.getQueryString('PendDate');
    var PStartDate = common.getQueryString('PStartDate');
    var ClickIndex = common.getQueryString('ClickIndex');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    require('date_input');
    Vue.filter('ReturnMoney', function (p) {
        p = p.replace(/,/g, "")
        var res = p.replace(/\d+/, function (n) { // 先提取整数部分
            return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                return $1 + ",";
            });
        })
        return res;
    })
    window.vm = new Vue({
        el: '#PageMainContainer',
        data: {
            personList: [],//受让方信息数组
            selectCode: '',//选择的受让方code
            datalist: [],//计算信息
            assignor: '',//转让方
            Amount: Amount,//可转金额
            selectName: "",//受让方名称
            Rate:Rate,//默认利率
            BondName: BondName,//债券信息
            StartDate: StartDate,
            EndDate: EndDate,
            PStartDate: PStartDate,
            PendDate: PendDate,
            ClickIndex: ClickIndex
        },
        created: function () {
            var self = this
            self.GetPersonList()
            $(".layerhanf").height($("body").height() - 142);
        },
        mounted: function () {
            var self = this
            
        },
        methods: {
            //获取受让方列表信息
            GetPersonList: function () {
                var self = this;
                var executeParam = {
                    SPName: 'usp_GetInvestorNameAndIdByTrustId', SQLParams: [
                        { Name: 'trsutId', value: trustId, DBType: 'int' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    self.personList = data;
                    var item;
                    //受让方信息排除转让方的信息
                    $.each(self.personList, function (i, v) {
                        if (v.Id == codeId) {
                            item = v
                            self.assignor = v.InvestorName
                        }
                    })
                    self.personList.remove(item)
                    //如果只有一个投资人的情况
                    if (self.personList.length != 0) {
                        self.selectCode = self.personList[0].Id;
                    } 
                   
                });
            },
            //添加计算信息
            addinfo: function () {
                var self = this;
                var obj = {};
                var LetMoney = $(".LetMoney");
                var Times = $(".datetimes");
                var Rates = $(".Rate");
                var len = Rates.length-1;
                var go=false;
                var StartDate=self.StartDate.replace(/-/g,"");
                var EndDate = self.EndDate.replace(/-/g, "");
                var PStartDate = self.PStartDate.replace(/-/g, "");
                var PendDate = self.PendDate.replace(/-/g, "");
                var realyStartDate;
                var realyEndDate;
                var realyStartDates
                var realyEndDates
                //比较4个日期,区4个日期交集 开始取大,结束取小
                if (StartDate < PStartDate) {
                    realyStartDate = PStartDate
                    realyStartDates = self.PStartDate
                } else {
                    realyStartDate = StartDate
                    realyStartDates = self.StartDate
                }
                if (EndDate < PendDate) {
                    realyEndDate = EndDate
                    realyEndDates = self.EndDate
                } else {
                    realyEndDate = PendDate
                    realyEndDates = self.PendDate
                }
                //
                if (self.personList.length == 0) {
                    GSDialog.HintWindow("受让方不能为空")
                    return false;
                }
                //如果是第一次添加不参与计算
                if (self.datalist.length == 0) {
                    obj.assignor = self.assignor;
                    obj.Amount = self.Amount;
                    obj.selectName = self.selectName;
                    obj.Rate = self.Rate;
                    self.datalist.push(obj);
                } else {//第二次添加需要先验证,没有问题之后添加
                    //验证空值和日期不合理的情况 || LetMoney.eq(len).val() == "" || Times.eq(len).val() == ""
                    if (Rates.eq(len).val() == "") {
                        Rates.eq(len).addClass("borderRed");
                    } 
                    if (LetMoney.eq(len).val() == "") {
                        LetMoney.eq(len).addClass("borderRed");
                    }
                    if (Times.eq(len).val() == "") {
                        Times.eq(len).addClass("borderRed");
                    }
                    if (Times.eq(len).val().lastIndexOf('输入') != -1) {
                        Times.eq(len).addClass("borderRed");
                    }
                    if (!(Times.eq(len).val().replace(/-/g, "") > realyStartDate) || Times.eq(len).val().replace(/-/g, "") >= realyEndDate) {
                        GSDialog.HintWindow("转让时间应在" + realyStartDates + " " + "~" + " " + realyEndDates + "之间")
                        return false
                    }
                    if (self.datalist[len].Amount - parseFloat(LetMoney.eq(len).val().replace(/,/g, "")) < 0) {
                        GSDialog.HintWindow("转让金额不可超过可转金额")
                        return false;
                    } else {
                        if (Times.eq(len).hasClass("borderRed") || LetMoney.eq(len).hasClass("borderRed") || Rates.eq(len).hasClass("borderRed")) {
                            go=false
                        } else {
                            go=true
                        }
                    }
                    //验证通过
                    if (go) {
                        obj.assignor = self.assignor;
                        var fixed = self.datalist[len].Amount.split(".")[1] ? self.datalist[len].Amount.split(".")[1].length : 0;
                        obj.Amount = self.datalist[len].Amount - parseFloat(LetMoney.eq(len).val().replace(/,/g, ""));
                        obj.Amount=obj.Amount.toFixed(fixed)
                        obj.Amount = obj.Amount.toString();
                        obj.selectName = self.selectName;
                        obj.Rate = self.Rate;
                        self.datalist.push(obj);
                    }
                }
                //
                Vue.nextTick(function () {
                    var len = $(".LetMoney").length-1;
                    $(".LetMoney").attr("disabled", true)
                    $(".datetimes").attr("disabled", true);
                    $(".Rate").attr("disabled", true);
                    $(".Rate").eq(len).attr("text", vm.selectCode)
                    $(".LetMoney").eq(len).removeAttr("disabled");
                    $(".datetimes").eq(len).removeAttr("disabled");
                    $(".Rate").eq(len).removeAttr("disabled");
                    $(".date-plugins").date_input();
                })             
            },
            //删除信息
            removeItem: function (items) {
                var self = this;
                self.datalist.remove(items);
            },
            //重置转让信息
            resite: function () {
                var self = this;
                var LetMoney = $(".LetMoney");
                var Times = $(".datetimes");
                var Rates = $(".Rate");
                var len = $(".LetMoney").length - 1;
                if (len >= 0) {
                    LetMoney.eq(len).val("");
                    Times.eq(len).val("");
                    Rates.eq(len).val("")
                    $(".LetMoney").eq(len).removeAttr("disabled");
                    $(".datetimes").eq(len).removeAttr("disabled");
                    $(".Rate").eq(len).removeAttr("disabled");
                }
            },
            //确认转让
            tobexml: function () {
                var self = this;
                var xml = "<data>"
                var LetMoney = $(".LetMoney");
                var Times = $(".datetimes");
                var Rates = $(".Rate");
                var len = Rates.length - 1;
                var StartDate = self.StartDate.replace(/-/g, "");
                var EndDate = self.EndDate.replace(/-/g, "");
                var PStartDate = self.PStartDate.replace(/-/g, "");
                var PendDate = self.PendDate.replace(/-/g, "");
                var realyStartDate;
                var realyEndDate;
                var realyStartDates
                var realyEndDates
                var go = false;
                //比较4个日期,区4个日期交集 开始取大,结束取小
                if (StartDate < PStartDate) {
                    realyStartDate = PStartDate
                    realyStartDates = self.PStartDate
                } else {
                    realyStartDate = StartDate
                    realyStartDates = self.StartDate
                }
                if (EndDate < PendDate) {
                    realyEndDate = EndDate
                    realyEndDates = self.EndDate
                } else {
                    realyEndDate = PendDate
                    realyEndDates = self.PendDate
                }
                //
                //没有数据不执行
                if (self.datalist.length == 0) {
                    return false
                } else {
                    if (Rates.eq(len).val() == "") {
                        Rates.eq(len).addClass("borderRed");
                    }
                    if (LetMoney.eq(len).val() == "") {
                        LetMoney.eq(len).addClass("borderRed");
                    }
                    if (Times.eq(len).val() == "") {
                        Times.eq(len).addClass("borderRed");
                    }
                    if (Times.eq(len).val().lastIndexOf('输入') != -1) {
                        Times.eq(len).addClass("borderRed");
                    }
                    if (!(Times.eq(len).val().replace(/-/g, "") > realyStartDate) || Times.eq(len).val().replace(/-/g, "") >= realyEndDate) {
                        GSDialog.HintWindow("转让时间应在" + realyStartDates + " " + "~" + " " + realyEndDates + "之间")
                        return false
                    }
                    if (self.datalist[len].Amount - parseFloat(LetMoney.eq(len).val().replace(/,/g, "")) < 0) {
                        GSDialog.HintWindow("转让金额不可超过可转金额")
                        return false;
                    } else {
                        if (Times.eq(len).hasClass("borderRed") || LetMoney.eq(len).hasClass("borderRed") || Rates.eq(len).hasClass("borderRed")) {
                            go = false
                        } else {
                            go = true
                        }
                    }
                    //验证通过拼装xml
                    if (go) {
                        $.each(LetMoney, function (i, v) {
                            xml += "<item><sourceId>" + infoID + "</sourceId>"
                            xml += "<targetInvestorId>" + Rates.eq(i).attr("text") + "</targetInvestorId>"
                            xml += "<transferAmount>" + LetMoney.eq(i).val().replace(/,/g, "") + "</transferAmount>"
                            xml += "<transferDate>" + Times.eq(i).val() + "</transferDate>"
                            xml += "<couponBasis>" + Rates.eq(i).val() + "</couponBasis>"
                            xml += "<dimReportingDateId>" + PendDate + "</dimReportingDateId></item>"
                        })
                        xml += "</data>";
                        console.log(xml)
                        var executeParam = {
                            SPName: 'usp_TransferBeneficial', SQLParams: [
                                { Name: 'TrustId', value: trustId, DBType: 'int' },
                                { Name: 'datalist', value: xml, DBType: 'xml' }
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                            if (data[0].result > 0) {
                                GSDialog.HintWindow("转让成功", function () {
                                    $("#DC_TimeLine li", window.parent.document).eq(vm.ClickIndex).trigger("click");
                                    $("#modal-close", window.parent.document).trigger("click");
                                })
                            } else {
                                GSDialog.HintWindow("" + data[0].message)
                            }
                        })
                    }
                }                   
                
            }
        },
        watch: {
            selectCode: function () {
                var self = this;
                $.each(self.personList, function (i, v) {
                    if (v.Id == self.selectCode) {
                        self.selectName = v.InvestorName
                    }
                })
                
            }
        }
    });
    $("body").on("keyup", ".LetMoney", function () {
        $(this).removeClass("borderRed")
        common.MoveNumFormt(this)
    })
    $("body").on("change", ".date-plugins", function () {
        $(this).removeClass("borderRed")
        common.checkDateNew(this)
    })
    $("body").on("change", ".Rate", function () {
        $(this).removeClass("borderRed")
        var data = $(this).val()
        var index = $(this).parent().parent().index();
        var tex = new RegExp("[^.0-9]");
        if (tex.test(data)) {
            $(this).val("")
            return false
        }
        if (parseFloat(data) != data) {
            $(this).val("")
            return false
        }
        vm.datalist[index].Rate = $(this).val()
    })
    window.onresize = function() {
        $(".layerhanf").height($("body").height() - 142);
    }
    $(".layerhanf").scroll(function () {
       
        var scrollTop = this.scrollTop;
        $(".layerhanf>.table").find("thead:first").attr("style", "transform: translateY(" + scrollTop + "px);background: #dedede;")
    });
});
