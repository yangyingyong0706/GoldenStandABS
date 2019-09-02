define(function (require) {
    var $ = require('jquery');
    var toast = require('toast');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var Vue = require('Vue2');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var trustId = common.getQueryString('tid');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    window.vm = new Vue({
        el: '#PageMainContainer',
        data: {
            Periods: [],
            trustId: trustId,
            DaysArr: [],
            ClickIndex: 0,
            data: [],
            endDate: "",
            startDate:"",
        },
        created: function () {
            var self = this
            self.LoadAllPeriods();
        },
        mounted: function () {
            Vue.nextTick(function () {
                $("#DC_TimeLine li").eq(0).trigger("click");
            })
        },
        methods: {
            //加载所有的期数
            LoadAllPeriods: function (fnCallback) {
                var self = this;
                var executeParam = {
                    SPName: 'usp_GetInvestorPeriod', SQLParams: [
                        { Name: 'TrustId', value: self.trustId, DBType: 'string' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    self.Periods = data;
                    for (i = 0, length = self.Periods.length; i < length; i++) {
                        self.DaysArr[i] = self.computeDays(self.Periods[i].EndDate, self.Periods[i].StartDate)
                    }
                    if (fnCallback && typeof fnCallback === 'function') {
                        fnCallback();
                    }
                });
            },
            computeDays: function (start, end) {
                var offsetTime = Math.abs((new Date(end) - new Date(start)) + 1);
                return Math.floor(offsetTime / (3600 * 24 * 1e3));
            },
            //换期数渲染下面的表格数据
            ShowPeriodDetail: function (event, index, period) {
                var self = this;
                self.ClickIndex = index;
                var $li = $(event.currentTarget);
                var startTime = period.StartDate;
                var endTime = period.EndDate;
                self.endDate = period.EndDate;
                self.startDate = period.StartDate;
                $li.addClass('selected').siblings().removeClass('selected');
                var executeParam = {
                    SPName: 'usp_GetInvestorDeailsByTrustIdAndDate', SQLParams: [
                        { Name: 'trustId', value: self.trustId, DBType: 'int' },
                        { Name: 'startDate', value: startTime, DBType: 'string' },
                         { Name: 'endDate', value: endTime, DBType: 'string' },
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    self.data = JSON.parse(data[0].result).data
                    $(".icon.icon-bottom").addClass("iconHanlder")
                    $(".templete").remove()
                    Vue.nextTick(function () {
                        $(".module").eq(0).find(".showflage").eq(0).trigger("click");
                    })

                });

            },
            //显示下方表格或者隐藏下方表格
            showdetailTable: function ($event, items) {
                var self = this;
                var target = $event.currentTarget;
                //append项目
                var dom = "";
                window.list = items
                if (items.BondInfo.length == 0) {
                    dom += '<tr class="templete" style="display:none"><td colspan="9"><div class="nodate"><span>没有债券信息</span></div></td>';
                    if (!$(target).parent().next().hasClass("templete")) {
                        $(target).parent().after(dom)

                    } else {
                        $(target).parent().next().remove();
                        $(target).parent().after(dom)
                    }
                }
                dom += '<tr class="templete"  style="display:none" ><td colspan="2"><div class="nav_left"><ul class="ulstyle">'
                $.each(items.BondInfo, function (i, v) {
                    if (i == 0) {
                        dom += '<li class="activeli changeinfomation" data-set=' + v.BondName + '>'
                        dom += '<i class="icon icon-money" style="margin-right:10px"></i>' + v.BondName + "</li>"
                    } else {
                        dom += '<li   class="changeinfomation" data-set=' + v.BondName + '>'
                        dom += '<i class="icon icon-money" style="margin-right:10px"></i>' + v.BondName + "</li>"
                    }

                })
                dom += '</ul></div></td><td colspan="7" style="padding:15px"><table class="table"><thead><tr><th>投资规模</th><th>剩余本金</th><th>有效起始日</th>'
                dom += '<th>有效截止日</th><th>利率</th><th>操作</th></tr></thead><tbody class="infoinner">'
                $.each(items.BondInfo, function (i, v) {
                    $.each(v.Details, function (j, k) {
                        var str = "<tr data-get=" + v.BondName + ">"
                        str += "<td>" + common.numFormt(k.InvestAmount) + "</td>";
                        str += "<td>" + common.numFormt(k.PrincipalBalance) + "</td>";
                        str += "<td>" + k.StartDate + "</td>";
                        str += "<td>" + k.EndDate + "</td>";
                        str += "<td>" + k.CouponBasis + "</td>";
                        str += '<td onclick="Transfn(this)" data-info="' + k.Id + '" data-money="' + k.PrincipalBalance + '" data-Rate="' + k.CouponBasis + '" data-codeId="' + items.InvestorInfo.Id + '" data-StartDate="' + k.StartDate + '" data-EndDate="' + k.EndDate + '"><span class="spanSty">转让<span></td>'
                        str += '<tr>';
                        dom += str
                    })
                })
                dom += '</tbody></table></td></tr>'
                console.log(dom)
                if (!$(target).parent().next().hasClass("templete")) {
                    $(target).parent().after(dom)
                } else {
                    $(target).parent().next().remove();
                    $(target).parent().after(dom)
                }
                if ($(target).find("i").hasClass("iconHanlder")) {
                    //显示表格
                    $(target).find("i").removeClass("iconHanlder");
                    $(target).parent().next().show(30);
                    Vue.nextTick(function () {
                        $(target).parent().next().find(".changeinfomation").eq(0).trigger("click");
                    })

                } else {
                    //隐藏表格
                    $(target).find("i").addClass("iconHanlder");
                    $(target).parent().next().hide(30)
                }
            },
            //编辑第一层数据
            editor: function ($event, items) {
                var self = this;
                var items = items;
                var Id = items.InvestorInfo.Id
                var target = $event.currentTarget;
                if ($(target).find("i").hasClass('icon-cinema')) {
                    $(target).find("i").removeClass("icon-cinema");
                    $(target).find("i").addClass("icon-check");
                    $(target).find("i").prop("title", "确定");
                    $(target).parents("tr").find(".input_style").removeAttr("readonly");
                    $(target).parents("tr").find(".input_style").css("border", "1px solid #ccc")
                } else {
                    $(target).find("i").removeClass("icon-check");
                    $(target).find("i").addClass("icon-cinema");
                    $(target).find("i").prop("title", "编辑");
                    $(target).parents("tr").find(".input_style").css("border", "none")
                    $(target).parents("tr").find(".input_style").attr("readonly", true)
                    var arry = $(target).parents('.module').find('input');
                    var str1 = items.InvestorInfo.InvestorName +
                        items.InvestorInfo.InvestorCode +
                        items.InvestorInfo.InvestorAccount +
                        items.InvestorInfo.AccountName +
                        items.InvestorInfo.BankName +
                        items.InvestorInfo.Account;
                    var str2 = ""
                    var xml = "<data>"
                    $.each(arry, function (i, v) {
                        str2 += $(v).val()
                    })
                    if (str1 == str2) {
                        return false
                    }
                    $.each(arry, function (i, v) {
                        switch (i) {
                            case 0:
                                xml += "<InvestorName>" + $(v).val() + "</InvestorName>"
                                break;
                            case 1:
                                xml += "<InvestorCode>" + $(v).val() + "</InvestorCode>"
                                break;
                            case 2:
                                xml += "<InvestorAccount>" + $(v).val() + "</InvestorAccount>"
                                break;
                            case 3:
                                xml += "<AccountName>" + $(v).val() + "</AccountName>"
                                break;
                            case 4:
                                xml += "<BankName>" + $(v).val() + "</BankName>"
                                break;
                            case 5:
                                xml += "<Account>" + $(v).val() + "</Account>"
                                break;
                        }
                    })
                    xml += "<Id>" + Id + "</Id>"
                    xml += "<Amount></Amount></data>";
                    console.log(xml)
                    var executeParam = {
                        SPName: 'usp_UpdateInvestorOfTrust', SQLParams: [
                            { Name: 'data', value: xml, DBType: 'xml' },
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                        if (data[0].result > 0) {
                            $.toast({
                                type: 'success', message: '编辑成功', afterHidden: function () {
                                    $("#DC_TimeLine li").eq(self.ClickIndex).trigger("click");
                                }
                            })
                        }
                    });
                }

            },
            //添加投资人信息
            addinvestors: function () {
                $.anyDialog({
                    title: "添加投资人信息",
                    html: $("#AddForm").clone(true).show(),
                    width: 600,
                    height: 440
                })
            },
            //删除item
            removeItem: function ($event, id) {
                var Id = id
                var self = this
                GSDialog.HintWindowTF("会删除掉所有的数据是否继续", function () {
                    var executeParam = {
                        SPName: 'usp_DeleteInvestorInfoByInvestorId', SQLParams: [
                            { Name: 'investorId', value: Id, DBType: 'string' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                        $.toast({type: 'success', message: '删除成功', afterHidden: function () {
                             $("#DC_TimeLine li").eq(self.ClickIndex).trigger("click");
                        }})
                    });
                }, '');
            },
            //新增债券信息
            addItem: function (event, id) {
                var Id = id;
                var self = this
                GSDialog.open('新增债券信息', 'BondInformation.html?tid=' + trustId + "&InvestorId=" + Id + "&step=" + self.ClickIndex + "&endDate=" + self.endDate, '',
                    function () {
                        $("#DC_TimeLine li").eq(self.ClickIndex).trigger("click");
                    }, '600', '384')
            }
        },
        watch: {
            ClickIndex: function (val, oldVal) {
                var self = this;
                var width = $(window).width()
                var num = Math.floor(width / 190) - 2;
                var left = $("#DC_TimeLine li").eq(val).offset().left;
                var right = width - left;
                if (val > oldVal) {
                    if (right < 200) {
                        $("#DC_TimeLine").scrollLeft((val - num) * 190);
                    }
                } else if (val < oldVal) {
                    if (left < 300) {
                        $("#DC_TimeLine").scrollLeft((val - 1) * 190);
                    }
                }
            },
        }
    });
    //确定添加投资人信息阻止XML以及验证
    $("body").on("click", "#SavefirstInfo", function () {
        var target = $(this);
        var go = false;
        var lists = $(target).parents(".container-fluid").find(".form-control");
        var xml = "<data>"
        $.each(lists, function (i, v) {
            if (v.value == "") {
                GSDialog.HintWindow("必填项不能为空", '', false);
                go = false;
                return false
            }
            if (i == 0) {
                xml += "<investorName>" + v.value + "</investorName>"

            }
            if (i == 1) {
                xml += "<investorCode>" + v.value + "</investorCode>"
            }
            if (i == 2) {
                xml += "<InvestorAccount>" + v.value + "</InvestorAccount>"
            }
            if (i == 3) {
                xml += "<AccountName>" + v.value + "</AccountName>"

            }
            if (i == 4) {
                xml += "<BankName>" + v.value + "</BankName>"
            }
            if (i == 5) {
                xml += "<Account>" + v.value + "</Account>"
            }

            go = true;
        })
        if (go) {
            xml += "<Amount></Amount>"
            xml += "<TrustId>" + trustId + "</TrustId>"
            xml += "</data>"
            console.log(xml)
            //进入存储过程重新加载
            var executeParam = {
                SPName: 'usp_AddInvestorOfTrust', SQLParams: [
                    { Name: 'data', value: xml, DBType: 'xml' }
                ]
            };
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                $.toast({type: 'success', message: '添加投资人成功', afterHidden: function () {
                    $("#DC_TimeLine li").eq(vm.ClickIndex).trigger("click");
                }})
            });

        }
    })
    //更改表格数据
    $("body").on("click", ".changeinfomation", function () {
        var target = $(this);
        target.addClass("activeli").siblings().removeClass("activeli")
        var info = $(target).attr("data-set")
        var dir = $(target).parents('.templete').find('.infoinner tr')
        $.each(dir, function (j, k) {
            if (info != $(k).attr("data-get")) {
                $(k).hide()
            } else {
                $(k).show()
            }
        })

    })
    window.Transfn = function (that) {
        //tid=1&codeId=1&infoID=1&Amount=5000&BondName=优先A&Rate=0.5
        var infoID = $(that).attr("data-info");
        var codeId = $(that).attr("data-codeId");
        var Amount = $(that).attr("data-money");
        var Rate = $(that).attr("data-Rate");
        var BondName = $(that).parent().attr("data-get");
        var StartDate = $(that).attr("data-StartDate");
        var EndDate = $(that).attr("data-EndDate");
        GSDialog.open(BondName + '_收益权转让', 'usufruct.html?tid=' + trustId + "&codeId=" + codeId + "&infoID=" + infoID + "&Amount=" + Amount + "&Rate=" + Rate + "&BondName=" + BondName + "&StartDate=" + StartDate + "&EndDate=" + EndDate + "&ClickIndex=" + vm.ClickIndex + "&PStartDate=" + vm.startDate + "&PendDate=" + vm.endDate, '',
                       function () {
                       }, '900', '400')
    }
});
