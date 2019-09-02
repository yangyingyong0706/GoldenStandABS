define(function (require) {
    var $ = require("jquery");
    var Vue = require("Vue2");
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var GSDialog = require("gsAdminPages");
    var history
    var vm = new Vue({
        el: "#app",
        data: {
            StatisticalList: [],
            count:0
        },
        created: function () {
            this.RenderList();
        },
        mounted: function () {
            var self = this;
            $.each(self.StatisticalList, function (i,v) {
                self.disabledInputs(i);
            })
            $("#loading").hide();
            $("body").css("overflow", "auto");
        },
        methods: {
            addItem: function () {
                var self = this;
                var p = new Object();
                p.DistributionTypeCode = ''; //字段英文
                p.DistributionTypeName = '';//字段汉字
                p.Interval = '';//字段区间
                p.MinValue = '';//最小值
                p.MaxValue = '';//最大值
                p.IncludingBelow = 'Y';//是否带有xx以下的区间
                p.IncludingAbove = 'Y';//是否带有xx以上的区间
                p.DefaultClosedSide = 'L';//区间闭端
                p.Separator = ''; //间隔符号
                p.Unit = '元';//单位
                p.TableName = "";//表名
                p.ColumnType = "fact" //fact区间类型,dim枚举类型
                p.FiledType = "金额类型";
                self.StatisticalList.unshift(p);
                this.$nextTick(function () {
                    $.each(self.StatisticalList, function (i, v) {
                        self.disabledInputs(i);
                    })
                    self.count++;
                })

            },
            removeItem: function (index) {
                var self = this;
                var object = self.StatisticalList[index];
                GSDialog.HintWindowTF("是否删除该字段", function () {
                    self.StatisticalList.remove(object);
                    self.count--;
                    if (self.count < 0) self.count=0
                    $.each(self.StatisticalList, function (i, v) {
                        self.disabledInputs(i);
                    })
                });

            },
            saveConfig: function () {
                var self = this;
                if (false == self.verifyData()) {
                    GSDialog.HintWindow("请检查数据填写");
                    return false
                }
                if (false == self.verifyDatas()) {
                    GSDialog.HintWindow("该字段已存在请勿重复添加");
                    return false
                }
                var dimsql = "";
                var sql = 'truncate table [config].[DistributionConfig] \n insert into [config].[DistributionConfig] values \n';
                var result = "";
                $.each(self.StatisticalList, function (i, p) {
                    if (p.ColumnType == "dim") {
                        dimsql += "('" + $.trim(p.DistributionTypeCode)
                       + "',N'" + $.trim(p.DistributionTypeName) + "'," + "N'" + $.trim(p.TableName) + "',N'" +  $.trim(p.ColumnType) + "'),\n";
                    } else {
                        sql += "('" + $.trim(p.DistributionTypeCode)
                       + "',N'" + $.trim(p.DistributionTypeName) + "'," + p.Interval.replace(/,/g, "") + ","
                       + p.MinValue.replace(/,/g, "") + "," + p.MaxValue.replace(/,/g, "")
                       + ",N'" + p.IncludingBelow + "',N'" + p.IncludingAbove
                       + "',N'" + p.DefaultClosedSide + "',N'" + p.Separator + "',N'" +  $.trim(p.Unit) + "',N'" +  $.trim(p.TableName) + "',N'" +  $.trim(p.FiledType) + "',N'" +  $.trim(p.ColumnType) + "'),\n";
                    }
                   
                })
                sql = sql.substring(0, sql.length - 2)
                result += sql + "\n" + "\n insert into [config].[DistributionConfig](DistributionTypeCode,DistributionTypeName,TableName,ColumnType) values \n" + dimsql;
                result = result.slice(0, -2);
                var executeParam = {
                    'SPName': "config.usp_SaveDistributionConfig", 'SQLParams': [
                        { Name: 'SqlScript', value: result, DBType: 'string' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'DAL_SEC_PoolConfig', executeParam, function (data) {
                    GSDialog.HintWindow("保存成功", function () {
                        location.reload(true);
                    })
                });
            },
            //输入值千分位表示
            CodingVerificationOne: function (obj,index) {
                var self=this;
                var data = $(obj.srcElement).val()
                var res = common.ReturnNumFormt(data);
                $(obj.srcElement).removeClass("border_red")
                self.StatisticalList[index].Interval = res;
            },
            CodingVerificationTwo: function (obj,index) {
                var self = this;
                var data = $(obj.srcElement).val()
                var res = common.ReturnNumFormt(data);
                $(obj.srcElement).removeClass("border_red")
                self.StatisticalList[index].MinValue = res;
            },
            CodingVerificationThree: function (obj, index) {
                var self = this;
                var data = $(obj.srcElement).val()
                var res = common.ReturnNumFormt(data);
                $(obj.srcElement).removeClass("border_red")
                self.StatisticalList[index].MaxValue = res;
            },
            //数据静态渲染千分位
            numFormtOne: function (obj, index) {
                var self = this;
                var res = common.numFormt(obj);
                self.StatisticalList[index].Interval = res;
                return res;
            },
            numFormtTwo: function (obj, index) {
                var self = this;
                var res = common.numFormt(obj);
                self.StatisticalList[index].MinValue = res;
                return res;
            },
            numFormtThree: function (obj, index) {
                var self = this;
                var res = common.numFormt(obj);
                self.StatisticalList[index].MaxValue = res;
                return res;
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
                    if (p.ColumnType != "dim") {
                        if (isNaN(p.MinValue.replace(/,/g, "")) || parseFloat(p.MinValue.replace(/,/g, "")) < 0) {
                            $(".MinValue").eq(i).addClass("border_red");
                            rtn = false;
                        } else {
                            $(".MinValue").eq(i).removeClass("border_red");
                        }
                        if (isNaN(p.Interval.replace(/,/g, "")) || parseFloat(p.Interval.replace(/,/g, "")) <= 0) {
                            $(".Interval").eq(i).addClass("border_red");
                            rtn = false;
                        } else {
                            $(".Interval").eq(i).removeClass("border_red");
                        }
                        if (isNaN(p.MaxValue.replace(/,/g, ""))) {
                            $(".MaxValue").eq(i).addClass("border_red");
                            rtn = false
                        } else {
                            $(".MaxValue").eq(i).removeClass("border_red");
                        }
                        if (parseFloat(p.MaxValue.replace(/,/g, "")) < parseFloat(p.MinValue.replace(/,/g, "")) + parseFloat(p.Interval.replace(/,/g, ""))) {
                            $(".MinValue").eq(i).addClass("border_red");
                            $(".Interval").eq(i).addClass("border_red");
                            $(".MaxValue").eq(i).addClass("border_red");
                            rtn = false
                        }
                        if (p.DistributionTypeCode == "") {
                            $(".DistributionTypeCode").eq(i).addClass("border_red");
                            rtn = false
                        }
                        if (p.DistributionTypeName == "") {
                            $(".DistributionTypeName").eq(i).addClass("border_red");
                            rtn = false
                        }
                        if (p.TableName == "") {
                            $(".TableName").eq(i).addClass("border_red");
                            rtn = false
                        }
                        if (p.MinValue == "") {
                            $(".MinValue").eq(i).addClass("border_red");
                            rtn = false;
                        }
                        if (p.Interval == "") {
                            $(".Interval").eq(i).addClass("border_red");
                            rtn = false;
                        }
                        if (p.MaxValue == "") {
                            $(".MaxValue").eq(i).addClass("border_red");
                            rtn = false;
                        }
                        if (p.Separator == "") {
                            $(".Separator").eq(i).addClass("border_red");
                            rtn = false;
                        }
                    } else {
                        if (p.DistributionTypeCode == "") {
                            $(".DistributionTypeCode").eq(i).addClass("border_red");
                            rtn = false
                        }
                        if (p.DistributionTypeName == "") {
                            $(".DistributionTypeName").eq(i).addClass("border_red");
                            rtn = false
                        }
                        if (p.TableName == "") {
                            $(".TableName").eq(i).addClass("border_red");
                            rtn = false
                        }
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
            disabledInputs: function (index) {
                var self = this;
                if (self.StatisticalList[index].ColumnType == "dim") {
                    self.StatisticalList[index].DefaultClosedSide = "";
                    self.StatisticalList[index].IncludingAbove = "";
                    self.StatisticalList[index].IncludingBelow = "";
                    self.StatisticalList[index].Separator = "";
                    self.StatisticalList[index].Unit = "";
                    self.StatisticalList[index].Interval = "";
                    self.StatisticalList[index].MaxValue = "";
                    self.StatisticalList[index].MinValue = "";
                    self.StatisticalList[index].FiledType = "";
                    $(".disabledon").eq(index).find(".disabledondis").attr("disabled", true);
                } else {
                    $(".disabledon").eq(index).find(".disabledondis").removeAttr("disabled");
                }
            },
            disabledInput:function(index){
                var self = this;
                if (self.StatisticalList[index].ColumnType == "dim") {
                    self.StatisticalList[index].DefaultClosedSide = "";
                    self.StatisticalList[index].IncludingAbove = "";
                    self.StatisticalList[index].IncludingBelow = "";
                    self.StatisticalList[index].Separator = "";
                    self.StatisticalList[index].Unit = "";
                    self.StatisticalList[index].Interval = "";
                    self.StatisticalList[index].MaxValue = "";
                    self.StatisticalList[index].MinValue = "";
                    self.StatisticalList[index].FiledType = "";
                    $(".disabledon").eq(index).find(".disabledondis").attr("disabled", true);
                } else {
                    self.StatisticalList[index].DefaultClosedSide = "L";
                    self.StatisticalList[index].IncludingAbove = "Y";
                    self.StatisticalList[index].IncludingBelow = "Y"
                    self.StatisticalList[index].FiledType = "金额类型";
                    self.StatisticalList[index].Unit = "元";
                    $(".disabledon").eq(index).find(".disabledondis").removeAttr("disabled");
                }
            },
            changeselect:function(index){
                var self = this;
                console.log(self.StatisticalList[index].Unit)
            },
            RenderList: function () {
                var self = this;
                var executeParam = {
                    'SPName': "config.usp_GetAllConfigCode", 'SQLParams': [
                    ]
                };
                self.count=0;
                common.ExecuteGetData(false, svcUrl, 'DAL_SEC_PoolConfig', executeParam, function (data) {
                    self.StatisticalList = data;
                    history = JSON.parse(JSON.stringify(data));
                });
            },
        }
    })
})