var reset;
define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    require('date_input');
    var kendoGrid = require('kendo.all.min');
    var common = require('common');
    window.common = require('common');
    var webProxy = require('app/productManage/Scripts/wcfProxy');
    var Vue = require('Vue2');
    require("kendomessagescn");
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var trustId = common.getQueryString('tid');
    var filter = '';// "where DimSourceTrustID = " + trustId + " and ParentPoolId=0";
    var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?';
    var self = this;
     reset=function(that) {
         var value = $(that).val();
         var index = $(that).index();
         console.log(value, index)
         $("#subsidiaryGrid").data("kendoGrid").dataSource.options.data
         vm.$data.subsidiaryList
     }
     window.removelicensorItem = function (that) {
         var data = vm.$data.licensorList;
         var Id = $(that)[0].id;
         if ($(that).hasClass("NotAllow")) {
             return false
         }
         $.each(data, function (i, v) {
             if (v.Id == Id) {
                 data.remove(v);
                 vm.$data.selectList.push(v)
                 return false
             }
         })
         vm.RenderlicensorGrid('licensorGrid', data, $("#licensorGrid").height())
     }
     window.removeassigneeItem = function (that) {
         var data = vm.$data.assigneeList;
         var Id = $(that)[0].id;
         if ($(that).hasClass("NotAllow")) {
             return false
         }
         $.each(data, function (i, v) {
             if (v.Id == Id) {
                 data.remove(v);
                 vm.$data.selectList.push(v)
                 return false
             }
         })
         vm.RenderassigneeGrid('assigneeGrid', data, $("#assigneeGrid").height())
     }
    $(function () {
     window.vm = new Vue({
            el: '#app',
            data: {
                selectList: [],//出让方和受让方的select选择数据
                licensorList: [],//出让方list
                assigneeList: [],//受让方list
                subsidiaryList: [],//转让明细数据源
                selectDateTimeList: [],//日期时间列表数据源
            },
            created: function () {
                var self = this;
                self.RenderDateTime();
            },
            mounted: function () {
                var self = this
                self.RenderSelectList();
                $("#loading").hide()
            },
            methods: {
                //渲染转让日期时间列表
                RenderDateTime:function(){
                    var self = this;
                    var executeParaminfo = {
                        SPName: 'usp_GetInvestorPeriod', SQLParams: [
                            { Name: 'trustId', value: trustId, DBType: 'int' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                        self.selectDateTimeList = data
                    })
                },
                //渲染选择列表
                RenderSelectList: function () {
                    var self = this;
                    var StartDate = '';
                    var EndDate = '';
                    if ($("#selectDateTime").val()) {
                         StartDate = $("#selectDateTime").val() ? $("#selectDateTime").val().substring(0, $("#selectDateTime").val().lastIndexOf("~")) : '';
                         EndDate = $("#selectDateTime").val().substring($("#selectDateTime").val().lastIndexOf("~") + 1);
                    }
                    var executeParaminfo = {
                        SPName: 'usp_GetInvestorInfo', SQLParams: [
                            { Name: 'trustId', value: trustId, DBType: 'int' },
                            { Name: 'startDate', value: StartDate, DBType: 'string' },
                            { Name: 'endDate', value: EndDate, DBType: 'string' },
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                        self.selectList=data
                    })
                    self.RenderlicensorGrid('licensorGrid', self.licensorList, $("#licensorGrid").height())
                    self.RenderassigneeGrid('assigneeGrid', self.assigneeList, $("#assigneeGrid").height())
                    self.RendersubsidiaryGrid('subsidiaryGrid', self.subsidiaryList, $("#subsidiaryGrid").height())
                },
                //选择不同的日期时间再渲染数据,清空所有渲染kendogrid数据
                selectRenderHandler:function($event){
                    var self = this;
                    var target = $event.currentTarget;
                    var StartDate = '';
                    var EndDate = '';
                    if ($("#selectDateTime").val()) {
                          StartDate = $("#selectDateTime").val().substring(0, $("#selectDateTime").val().lastIndexOf("~"));
                          EndDate = $("#selectDateTime").val().substring($("#selectDateTime").val().lastIndexOf("~") + 1);
                    }

                    var executeParaminfo = {
                        SPName: 'usp_GetInvestorInfo', SQLParams: [
                            { Name: 'trustId', value: trustId, DBType: 'int' },
                             { Name: 'startDate', value: StartDate, DBType: 'string' },
                            { Name: 'endDate', value: EndDate, DBType: 'string' },
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                        self.selectList = data
                    })
                    self.licensorList=[]
                    self.assigneeList=[]
                    self.subsidiaryList = []
                    self.RenderlicensorGrid('licensorGrid', self.licensorList, $("#licensorGrid").height())
                    self.RenderassigneeGrid('assigneeGrid', self.assigneeList, $("#assigneeGrid").height())
                    self.RendersubsidiaryGrid('subsidiaryGrid', self.subsidiaryList, $("#subsidiaryGrid").height())
                },
                //添加select选择渲染grid列表
                addItemRender: function ($event) {
                    var self = this;
                    var target = $event.currentTarget;
                    var Name = $(target).prev().val();
                    var id = $(target).prev()[0].id;
                    if ($(target).hasClass("NotAllow")) {
                        return false
                    }
                    $.each(self.selectList, function (i, v) {
                        if (v.displayname == Name) {
                            if (id == 'licensor') {
                                self.licensorList.unshift(v)
                                self.RenderlicensorGrid('licensorGrid', self.licensorList, $("#licensorGrid").height())
                            } else {
                                self.assigneeList.unshift(v)
                                self.RenderassigneeGrid('assigneeGrid', self.assigneeList, $("#assigneeGrid").height())
                            }
                            self.selectList.remove(v)
                            return false
                        }
                    })
                },
                //添加转让明细渲染Grid;
                addItemTransferRender: function ($event) {
                    var self = this;
                    var target = $event.currentTarget;
                    var transfer = $(target).parent().find("#transfer").val();
                    var benefit = $(target).parent().find("#benefit").val();
                    if (!transfer || !benefit) {
                        return false
                    }
                    //判断TrustBondCode是否一致
                    
                    var transferBondCode = transfer.substring(transfer.lastIndexOf('_') + 1);
                    var benefitBondCode = benefit.substring(benefit.lastIndexOf('_') + 1);
                    var go = true;//判断code是否重复
                    var flag=true//判断金额和日期的校验标识
                    if (transferBondCode != benefitBondCode) {
                        GSDialog.HintWindow('同档债券才可以互转');
                        return false
                    }
                    var arryA = [];
                    var obj={}
                    $.each(self.licensorList, function (i, v) {
                        if (v.displayname == transfer) {
                            arryA.push(v)
                            return false
                        }
                    })
                    $.each(self.assigneeList, function (i, v) {
                        if (v.displayname == benefit) {
                            obj.displaynames = v.displayname;
                            obj.TargetId = v.Id;
                            return false
                        }
                    })
                    arryA = JSON.parse(JSON.stringify(arryA));
                    arryA[0].displaynames = obj.displaynames;
                    arryA[0].TargetId = obj.TargetId;
                    //判断转让方和受让方是否存在
                    $.each(self.subsidiaryList, function (i, v) {
                        if (arryA[0].displaynames == v.displaynames && arryA[0].displayname == v.displayname) {
                            go = false;
                            return false
                        }
                       
                    })
                    if (!go) {
                        GSDialog.HintWindow('相同的转让情景已经存在,不能重复添加');
                        return false;
                    }
                    if (self.subsidiaryList.length == 0) {//新增第一条数据
                        arryA[0].disabled = 0;
                        self.subsidiaryList.push(arryA[0]);
                    } else {//处理之前的数据重新赋值
                        var dates = $(".dateTime");
                        var TurnMoney = $(".TurnMoney");
                        var rates = $(".rate");
                        $.each(self.subsidiaryList, function (i, v) {
                            if (dates.eq(i).val() == "" || TurnMoney.eq(i).val() == "") {//转让金额或者日期没有填写
                                GSDialog.HintWindow('有转让金额或者日期没有填写');
                                flag=false
                                return false
                            }
                            if (dates.eq(i).val() == "输入日期格式不合法") {//日期书写格式不正确
                                GSDialog.HintWindow('输入日期格式不合法,请重新输入');
                                flag = false
                                return false
                            }
                        })
                        if (flag) {//填写了金额和日期,进行计算重新赋值数据
                            var numberdate = self.subsidiaryList[self.subsidiaryList.length - 1];                          
                            var value = parseFloat(TurnMoney.eq(self.subsidiaryList.length - 1).val().replace(/,/g,""));
                            if (self.subsidiaryList[self.subsidiaryList.length - 1].InvestAmount - value < 0) {//钱不够转不允许转钱
                                GSDialog.HintWindow('转让金额不合理,请重新输入');
                                return false
                            }
                            var Time = dates.eq(self.subsidiaryList.length - 1).val();
                            var rate = rates.eq(self.subsidiaryList.length - 1).val();
                            self.subsidiaryList[self.subsidiaryList.length - 1].TransferAmount = value;
                            self.subsidiaryList[self.subsidiaryList.length - 1].Time = Time;
                            self.subsidiaryList[self.subsidiaryList.length - 1].rate = rate;
                            self.subsidiaryList[self.subsidiaryList.length - 1].disabled = 1;
                            if (arryA[0].InvestName + "_" + arryA[0].TrustBondCode == numberdate.InvestName + "_" + numberdate.TrustBondCode) {//设计到相同的账户以及可以编辑的状态才去验算
                                arryA[0].InvestAmount = self.subsidiaryList[self.subsidiaryList.length - 1].InvestAmount - value;
                                self.subsidiaryList.push(arryA[0]);
                                
                            } else {
                                self.subsidiaryList.push(arryA[0]);
                            }

                          
                        }
                    }
                    //判断转让明细列表是否存在数组如果存在,上面2个kengoGrid的删除操作锁死
                    if (self.subsidiaryList.length > 0) {
                        $(".icon.icon-trash-empty").addClass("NotAllow");
                        $(".assigneeAdd").addClass("NotAllow");
                        $(".licensorAdd").addClass("NotAllow");
                    }
                    self.RendersubsidiaryGrid('subsidiaryGrid', self.subsidiaryList, $("#subsidiaryGrid").height())

                },
                //完成数据拼接组装xml
                CompleteTransfer: function ($event) {
                    var self = this;
                    var dates = $(".dateTime");
                    var TurnMoney = $(".TurnMoney");
                    var rates = $(".rate");
                    var flag = true//判断金额和日期的校验标识
                    var xml = "<data>"
                    if (self.subsidiaryList.length == 0) {
                        return false
                    }
                    $.each(self.subsidiaryList, function (i, v) {
                        if (dates.eq(i).val() == "" || TurnMoney.eq(i).val() == "") {//转让金额或者日期没有填写
                            GSDialog.HintWindow('有转让金额或者日期没有填写');
                            flag = false
                            return false
                        }
                    })
                    if (flag) {//填写了金额和日期,进行计算重新赋值数据
                        var numberdate = self.subsidiaryList[self.subsidiaryList.length - 1];
                        var value = parseFloat(TurnMoney.eq(self.subsidiaryList.length - 1).val().replace(/,/g,""));
                        if (self.subsidiaryList[self.subsidiaryList.length - 1].InvestAmount - value < 0) {//钱不够转不允许转钱
                            GSDialog.HintWindow('转让金额不合理,请重新输入');
                            return false
                        }
                        dates.eq(self.subsidiaryList.length - 1).attr("disabled", "disabled");
                        TurnMoney.eq(self.subsidiaryList.length - 1).attr("disabled", "disabled")
                        rates.eq(self.subsidiaryList.length - 1).attr("disabled", "disabled")
                        $.each(self.subsidiaryList, function (i, v) {
                            xml += "<item><sourceId>" + v.Id + "</sourceId>"
                            xml += "<targetId>" + v.TargetId + "</targetId>"
                            xml += "<transferAmount>" + TurnMoney.eq(i).val().replace(/,/g,"") + "</transferAmount>"
                            xml += "<couponBasis>" + rates.eq(i).val() + "</couponBasis>"
                            xml += "<transferDate>" + dates.eq(i).val() + "</transferDate></item>"
                        })
                        xml+="</data>"
                        var executeParaminfo = {
                            SPName: 'usp_TransferBeneficial', SQLParams: [
                                { Name: 'TrustId', value: trustId, DBType: 'int' },
                                 { Name: 'datalist', value: xml, DBType: 'xml' },
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                                if (data[0].result=='1') {
                                    GSDialog.HintWindow('转让成功', function () {
                                        location.reload(true);
                                    });
                                } else {
                                    self.subsidiaryList = [];
                                    GSDialog.HintWindow('转让失败,填写数据有误,请重新填写');
                                }
                        })
                    }
                },
                RenderlicensorGrid: function (id, datas, height) {
                    var grid = $("#"+id).kendoGrid({
                        dataSource: datas,
                        height: height,
                        selectable: "multiple",
                        filterable: true,
                        sortable: true,
                        resizable: true,//动态改变列的宽度,在scrollable为true的时候有效,scrollable默认为true
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            buttonCount: 5,
                            page: 1,
                            pageSize: 20,
                            pageSizes: [20, 50, 100, 500],  
                        },
                        columns: [
                            {
                                field: "", title: '操作', width: "80px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, template: function (data) {
                                    return '<i class="icon icon-trash-empty" onclick=removelicensorItem(this) style="color:#d00000" title="删除" id="' + data.Id + '"></i>'
                                }
                            },
                         
                           {
                               field: "InvestName", title: '出让方', width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, template: function (items) {
                                   return items.displayname
                               }
                           },
                            { field: "InvestAmount", title: '金额', width: "160px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, format: '{0:#,0.00}' },
                            { field: "IssueDate", title: '开始时间', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "LegalMaturityDate", title: '结束时间', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "CouponBasis", title: '利率', width: "80px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                         
                        ],
                        dataBound: function () {

                        }
                    });

                },
                RenderassigneeGrid: function (id, datas, height) {
                    var grid = $("#" + id).kendoGrid({
                        dataSource: datas,
                        height: height,
                        selectable: "multiple",
                        filterable: true,
                        sortable: true,
                        resizable: true,//动态改变列的宽度,在scrollable为true的时候有效,scrollable默认为true
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            buttonCount: 5,
                            page: 1,
                            pageSize: 20,
                            pageSizes: [20, 50, 100, 500],
                        },
                        columns: [
                            {
                                field: "", title: '操作', width: "80px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, template: function (data) {
                                    return '<i class="icon icon-trash-empty" onclick=removeassigneeItem(this) style="color:#d00000" title="删除" id="' + data.Id + '"></i>'
                                }
                            },
                           { field: "InvestName", title: '受让方', width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" },template: function (items) {
                               return items.displayname
                           } },
                            { field: "InvestAmount", title: '金额', width: "160px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, format: '{0:#,0.00}' },
                            { field: "IssueDate", title: '开始时间', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "LegalMaturityDate", title: '结束时间', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "CouponBasis", title: '利率', width: "80px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },

                           
                        ],
                        dataBound: function () {

                        }
                    });

                },
                RendersubsidiaryGrid: function (id, datas, height) {
                    var grid = $("#" + id).kendoGrid({
                        dataSource: datas,
                        height: height,
                        selectable: "multiple",
                        filterable: true,
                        sortable: true,
                        resizable: true,//动态改变列的宽度,在scrollable为true的时候有效,scrollable默认为true
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            buttonCount: 5,
                            page: 1,
                            pageSize: 20,
                            pageSizes: [20, 50, 100, 500],
                        },
                        columns: [
                           {
                               field: "InvestName", title: '转让方', width: "200px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, template: function (items) {
                                   return items.displayname
                               }
                           },
                            { field: "InvestAmount", title: '可转金额', width: "160px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, format: '{0:#,0.00}' },
                             {
                                 field: "", title: '转让金额', width: "160px", template: function (data) {
                                     data.TransferAmount = data.TransferAmount ? data.TransferAmount : "";
                                     data.TransferAmount = common.numFormt(data.TransferAmount)
                                     if (data.disabled == '1') {
                                         return '<input class="TurnMoney"  onchange="common.MoveNumFormt(this)" disabled value="' + data.TransferAmount + '">'
                                     } else {
                                         return '<input onchange="common.MoveNumFormt(this)" class="TurnMoney" value="' + data.TransferAmount + '">'
                                     }
                                  
                                 }, headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" },
                             },
                            {
                                field: "", title: '转让时间', width: "150px", template: function (data) {
                                    data.Time = data.Time ? data.Time : "";
                                    if (data.disabled == '1') {
                                        return '<input class="dateTime" disabled value="' + data.Time + '" onchange="common.checkDateNew(this)">'
                                    } else {
                                        return '<input  class="dateTime"    value="' + data.Time + '" onchange="common.checkDateNew(this)">'
                                    }
                                }, headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" },
                            },
                            { field: "assigneeInvestName", title: '受让方', width: "200px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" }, template: function (items) {
                                return items.displaynames
                                }
                            },
                            {
                                field: "", title: '转让利率', width: "80px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" },
                                template: function (data) {
                                    data.rate = data.rate ? data.rate : "";
                                    if (data.disabled == '1') {
                                        return '<input class="rate"   disabled value="' + data.rate + '">'
                                    } else {
                                        return '<input  class="rate"  value="' + data.rate + '">'
                                    }
                                }
                            },
                        ],
                        dataBound: function () {

                        }
                    });
                },
                //重置转让按钮
                ReSetItems: function () {
                    var self = this;
                    self.subsidiaryList = [];
                    $(".icon.icon-trash-empty").removeClass("NotAllow");
                    $(".assigneeAdd").removeClass("NotAllow");
                    $(".licensorAdd").removeClass("NotAllow");
                    self.RendersubsidiaryGrid('subsidiaryGrid', self.subsidiaryList, $("#subsidiaryGrid").height())
                },
            },

        });
    });

});
