define(function (require) {
    var $ = require('jquery');
    //require('jquery.datagrid');
    //require('jquery.datagrid.options');
    //var page = require('./js/PagerList');
    var GlobalVariable = require('globalVariable');
    require('date_input');
    var kendoGridModel = require('./kendoGridModel');
    var common = require('common');
    var webProxy = require('../../wcfProxy');
    var Vue = require('Vue2');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');

    var trustId = common.getQueryString('tid');

    var height = $(window).height() - 120;
    var h = $(window).height() - 145;
    console.log(screen.height, $(window).height());
    var filter = '';// "where DimSourceTrustID = " + trustId + " and ParentPoolId=0";
    //资产明细列表
    function initGrid() {
        var kdGridAssetDetail = new kendoGridModel(height);
        var assetDetailOptions = {
            renderOptions: {
                height: h,
                scrollable: true,
                resizable: true,
                columns: [
                            { field: "TrustId", title: '产品Id', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "TrustBondName", title: '分级信息', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "SubscriberName", title: '认购人名称', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "SubscriberCode", title: '认购人代码', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "SubscribeAmount", title: '认购金额', template: '#=SubscribeAmount?self.numFormt(SubscribeAmount):""#', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "AssociationRelationship", title: '关联关系说明', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "SubscribeType_1", title: '认购人类型一级', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "SubscribeType_2", title: '认购人类型二级', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "SocialSecurity", title: '社保等具体类型说明', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "OtherFund", title: '其他私募投基金具体类型说明', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "OtherPlan", title: '其他投资计划具体类型说明', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } },
                            { field: "OtherInvestor", title: '中国证监会规定的其他投资者具体类型说明', width: "150px", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                ]
            },
            dataSourceOptions: {
                pageSize: 20,
                otherOptions: {
                    orderby: "Id",
                    direction: "asc",
                    DBName: 'TrustManagement',
                    appDomain: 'TrustManagement',
                    executeParamType: 'extend',
                    defaultfilter: filter,
                    executeParam: function () {
                        var result = {
                            SPName: 'usp_GetSubscriberInfoByTrustId',
                            SQLParams: [
                                { Name: 'TrustId', Value: trustId, DBType: 'int' }
                            ],
                            //把TrustCode传到kendoGridModel里
                        };
                        return result;
                    }
                }
            }
        };
        //初始化资产明细的kendougrid
        kdGridAssetDetail.Init(assetDetailOptions, 'gridAssetDetail');
        kdGridAssetDetail.RunderGrid();



    }
    this.numFormt = function (p) {
        if (parseFloat(p) == p) {
            var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                    return $1 + ",";
                });
            })
            return res;
        }
        else
            return p;
    }
    this.returndate = function (date) {
        var year = date.substring(0, 4);
        var mounth = date.substring(4, 6);
        var day = date.substring(6, 8);
        return year + "-" + mounth + "-" + day;
    }
    $(function () {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        initGrid();
        app = new Vue({
            el: '#investMain',
            data: {
                loading:true,
                TrustId: trustId,
                BoundId: 0,
                SubscriberName: '',//认购人名称
                SubscriberCode: '', //认购人代码
                SubscribeAmount: 0,//认购金额
                SubscribeDate:'2018-11-11',//认购日期
                AssociationRelationship:'',//关联关系说明
                SubscribeType_1: '',//认购人类型一级
                SubscribeType_2: '',//认购人类型二级
                SocialSecurity: '',//社保等具体类型说明
                OtherFund:'',//其他私募投基金具体类型说明
                OtherPlan:'',//其他投资计划具体类型说明
                OtherInvestor:'',//中国证监会规定的其他投资者具体类型说明
                TrustBondCodeList: [],//根据专项计划代码返回的债券信息
                TrustBondName: '',//选择的投资债券代码
                TrustBondId:0,//
                isAdd: 0, //判断是否是新增投资信息还是编辑投资信息
                check: false
            },
            mounted: function () {
                var self = this
                self.loading = false;
            },
            methods: {

                //项目代码校验
                checkTurst: function ($event) {
                    var self = this;
                    var obj = $event.target;
                    var $this = $(obj);
                    var objValue = $this.val();
                    self.check = false;
                    if ($this.hasClass("theInputBorderRed")) {
                        $this.removeClass("theInputBorderRed")
                    }
                    //var pattern = new RegExp("[`%~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
                    var pattern = new RegExp("[^0-9a-zA-Z-_]");
                    var testfirst = new RegExp("[_-]");
                    if (testfirst.test(objValue.substring(0, 1))) {
                        GSDialog.HintWindow("输入不合法,首字母只能是数据或者字母", function () {
                            $this.addClass("theInputBorderRed");
                            $this.val("");
                            $this.focus();
                            self.check = false;
                        }, "", false);
                        return false
                    }
                    else if (pattern.test(objValue)) {
                        GSDialog.HintWindow("输入不合法,只能输入数字,字母,下划线,破折号的组合", function () {
                            $this.addClass("theInputBorderRed");
                            $this.val('')
                            $this.focus();
                            self.check = false;
                        }, "", false);

                        return false
                    } else {
                        self.check = true;
                    }
                },
                //千分位添加
                Tbadd: function (p, $event) {
                    var $event = $event
                    p = p.replace(/,/g, "");
                    var self = this;
                    var res = '';
                    if (parseFloat(p) == p) {
                        res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                            return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                                return $1 + ",";
                            });
                        })
                        if ($event == "1") {
                            self.SubscribeAmount = res;
                        } else {
                            self.SubscribeAmount = res;
                        }
                        return false
                    } else {
                        if ($event == "1") {
                            self.SubscribeAmount = "";
                        } else {
                            self.SubscribeAmount = "";
                        }
                    }
                    return false
                },
                addInvest: function () {
                    var self = this;

                    self.TrustBondName = '';//产品分级信息
                    self.SubscriberName = '';//认购人名称
                    self.SubscriberCode = '';//认购人代码
                    self.SubscribeAmount = 0;//认购金额
                    self.SubscribeDate = '';//认购时间
                    self.AssociationRelationship = '';//关联关系说明
                    self.SubscribeType_1 = '';//认购人类型一级
                    self.SubscribeType_2 = '';//认购人类型二级
                    self.SocialSecurity = '';//社保等具体类型说明
                    self.OtherFund = '';//其他私募投基金具体类型说明
                    self.OtherPlan = '';//其他投资计划具体类型说明
                    self.OtherInvestor = '';//中国证监会规定的其他投资者具体类型说明
                    self.BoundId = 0;

                    this.BoundId = 0;

                    self.isAdd = 0;
                    var executeParaminfo = {
                        SPName: 'usp_GetTrustBondByTrustId', SQLParams: [
                        //{ Name: 'trustId', value: trustId, DBType: 'int' }
                        { Name: 'trustId', value: trustId, DBType: 'int' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                        if (data.length == 0) {
                            GSDialog.HintWindow('请录入该产品的债券信息');
                            return
                        }
                        self.TrustBondCodeList = data;

                        self.selectedTrustBondCode = self.TrustBondCodeList[0].TrustBondCode;
                        self.dialog = $.anyDialog({
                            width: 600,
                            height: 440,
                            title: "新增认购人信息",
                            html: $('#investBound').show(),
                            onClose: function () {
                            }
                        });

                    })

                },
                editInvest: function () {
                    this.isAdd = 1
                    var self = this
                    self.TrustBondName = '';//产品分级信息
                    self.SubscriberName = '';//认购人名称
                    self.SubscriberCode = '';//认购人代码
                    self.SubscribeAmount = 0;//认购金额
                    self.SubscribeDate = '';//认购时间
                    self.AssociationRelationship = '';//关联关系说明
                    self.SubscribeType_1 = '';//认购人类型一级
                    self.SubscribeType_2 = '';//认购人类型二级
                    self.SocialSecurity = '';//社保等具体类型说明
                    self.OtherFund = '';//其他私募投基金具体类型说明
                    self.OtherPlan = '';//其他投资计划具体类型说明
                    self.OtherInvestor = '';//中国证监会规定的其他投资者具体类型说明
                    self.BoundId = 0;

                    var grid = $("#gridAssetDetail").data("kendoExtGrid");
                    if (grid.select().length != 1) {
                        GSDialog.HintWindow('请选择需要变更的认购信息');
                    } else {
                        var executeParam = {
                            SPName: 'usp_GetTrustBondByTrustId', SQLParams: [
                                //{ Name: 'trustId', value: trustId, DBType: 'int' }
                                { Name: 'trustId', value: trustId, DBType: 'int' }
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (res) {
                            self.TrustBondCodeList = res
                            var data = grid.dataItem(grid.select());
                            self.TrustId = data.TrustId;
                            self.TrustBondName = data.TrustBondName;//产品分级信息
                            self.SubscriberName = data.SubscriberName;//认购人名称
                            self.SubscriberCode = data.SubscriberCode;//认购人代码
                            self.SubscribeAmount = data.SubscribeAmount != "" ? common.numFormt(data.SubscribeAmount) : data.SubscribeAmount;//认购金额
                            self.SubscribeDate = data.SubscribeDate;//认购时间
                            self.AssociationRelationship = data.AssociationRelationship;//关联关系说明
                            self.SubscribeType_1 = data.SubscribeType_1;//认购人类型一级
                            self.SubscribeType_2 = data.SubscribeType_2;//认购人类型二级
                            self.SocialSecurity = data.SocialSecurity;//社保等具体类型说明
                            self.OtherFund = data.OtherFund;//其他私募投基金具体类型说明
                            self.OtherPlan = data.OtherPlan;//其他投资计划具体类型说明
                            self.OtherInvestor = data.OtherInvestor;//中国证监会规定的其他投资者具体类型说明
                            self.BoundId = data.Id;
                            self.dialog = $.anyDialog({
                                width: 600,
                                height: 440,
                                title: "编辑投资详情",
                                html: $('#investBound').show(),
                                onClose: function () {
                                }
                            });
                        });

                    }
                },
                saveInvest: function () {
                    var self = this;
                    var flag = true;
                    if (flag) {
                        var items = '<Items><TrustId>{0}</TrustId><TrustBondName>{1}</TrustBondName><SubscriberName>{2}</SubscriberName>'
                        items +='<SubscriberCode>{3}</SubscriberCode><SubscribeAmount>{4}</SubscribeAmount><SubscribeDate>{5}</SubscribeDate>';
                        items +='<AssociationRelationship>{6}</AssociationRelationship><SubscribeType_1>{7}</SubscribeType_1>';
                        items +='<SubscribeType_2>{8}</SubscribeType_2><SocialSecurity>{9}</SocialSecurity><OtherFund>{10}</OtherFund>';
                        items += '<OtherPlan>{11}</OtherPlan><OtherInvestor>{12}</OtherInvestor><Id>{13}</Id><TrustBondId>{14}</TrustBondId></Items>';

                        var iflag = 0;
                        self.isAdd == 0 ? iflag = 0 : iflag = self.BoundId
                        //获取trustbondId
                        for (var i = 0; i < self.TrustBondCodeList.length; i++) {
                            if (self.TrustBondName == self.TrustBondCodeList[i].TrustBondName) {
                                self.TrustBondId = self.TrustBondCodeList[i].TrustBondId;
                                break;
                            }
                        }
                        //这里下面的数据
                        items = items.format(self.TrustId, self.TrustBondName, self.SubscriberName, self.SubscriberCode, self.SubscribeAmount ? self.SubscribeAmount.replace(/,/g, "") : self.SubscribeAmount, self.SubscribeDate, self.AssociationRelationship, self.SubscribeType_1, self.SubscribeType_2, self.SocialSecurity, self.OtherFund, self.OtherPlan, self.OtherInvestor, iflag, self.TrustBondId)
                        executeParam = {
                            SPName: 'usp_SaveSubscriberInfo', SQLParams: [
                                { Name: 'Items', value: items, DBType: 'string' }
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                            if (data[0].result == 1) {
                                $('#modal-close').trigger('click');
                                GSDialog.HintWindow('保存成功');
                                kendoGridModel().RefreshGrid();
                                self.TrustBondName='';//产品分级信息
                                self.SubscriberName='';//认购人名称
                                self.SubscriberCode='';//认购人代码
                                self.SubscribeAmount=0;//认购金额
                                self.SubscribeDate='';//认购时间
                                self.AssociationRelationship='';//关联关系说明
                                self.SubscribeType_1='';//认购人类型一级
                                self.SubscribeType_2='';//认购人类型二级
                                self.SocialSecurity='';//社保等具体类型说明
                                self.OtherFund='';//其他私募投基金具体类型说明
                                self.OtherPlan='';//其他投资计划具体类型说明
                                self.OtherInvestor = '';//中国证监会规定的其他投资者具体类型说明
                                self.BoundId = 0;
                            }
                        });
                    }

                    return
                },
                deleteInvest: function () {
                    var boundId = 0;
                    var grid = $("#gridAssetDetail").data("kendoExtGrid");
                    if (grid.select().length != 1) {
                        GSDialog.HintWindow('请选择选项');
                    } else {
                        var data = grid.dataItem(grid.select());
                        boundId = data.Id;
                        if (confirm('确认删除该记录吗？')) {
                            var executeParam = {
                                SPName: 'usp_DeleteSubscriberInfo', SQLParams: [
                                    { Name: 'Id', value: boundId, DBType: 'int' }
                                ]
                            };
                            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                                if (data[0].result == 1) {
                                    GSDialog.HintWindow('删除成功');
                                    //common.alertMsg('删除成功!', 1);
                                    kendoGridModel().RefreshGrid()

                                } else {
                                    GSDialog.HintWindow('删除失败');
                                    //common.alertMsg('删除失败!', 0);
                                }

                            });
                        }
                    }


                }
            },
            computed: {
            }
        });
    });

});
