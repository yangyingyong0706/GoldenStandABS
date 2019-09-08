
requirejs(['/asset/lib/config.js'], function (config) {
    require(['Vue2', 'common', 'callApi', 'globalVariable', 'jquery-ui', 'vuedraggable', 'gsAdminPages', 'anyDialog', 'vMessage']
        , function (Vue, common, CallApi, GlobalVariable, jqueryUi, draggable, GSdialog) {
            $(document).tooltip();
            //注册draggable组件
            Vue.component('draggable', draggable);
            var vm = new Vue({
                el: '#PageMainContainer',

                data: {
                    TrustID: null,
                    TrustBondName: [], //分层信息
                    Periods: [],
                    PeriodTimeLineWidth: 600,
                    DaysArr: [],
                    AllFees: [],
                    AllFees_OptionSource: [],
                    AllEvents: [],
                    ClickIndex: 0,
                    PeriodDetail: {
                        Index: null,
                        Start: null,
                        End: null,
                        Days: 0,
                        Dates: [],
                        Fees: [],
                        FeesParamList: [],//费用元素参数
                        Events: [],
                        Scenarios: [],//偿付情景
                    },
                    editingBondId: '',
                    ClassStructureLabels: [ // type:text/select/number
                        { name: '总计本金舍入规则', type: 'select', value: '' },
                        { name: '每份本金舍入规则', type: 'select', value: '' },
                        { name: '本息兑付（本金精度）', type: 'number', value: '' },
                        { name: '总计利息舍入规则', type: 'select', value: '' },
                        { name: '利息舍入规则', type: 'select', value: '' },
                        { name: '本息兑付（利息精度）', type: 'number', value: '' },
                        { name: '深交所专用（本金精度）', type: 'number', value: '' },
                        { name: '深交所专用（利息精度）', type: 'number', value: '' }
                    ],
                    RoundRules: [
                        'Round',
                        'RoundUp',
                        'RoundDown'
                    ],
                    editingBondModel: [
                        Number, Number, Number, Number, Number, Number, Number, Number
                    ],
                    updateEachTrustBondLayerTitle: '',
                    FeeDetail: { DisplayName: '', Parameters: [] },
                    EventDetail: { EventDescription: '', Operator: '', Threshold: '' },
                    ScenarioDetail: { ScenarioName: '', StartDate: '', EndDate: '', PrincipalPrecision: '', InterestPrecision: '', AllowInterestToPrincipal: '' },
                    PeriodScenarioIndex: null,
                    periodStartOptions: [],//起始日期下拉数据源
                    periodEndOptions: [], //终止日期下拉数据源,
                    feeTypeListModel: {},
                    FeeDataSources: [],
                    trustFeeName: '',
                },
                computed: {
                    //渲染dom
                    ReturnDom: function () {
                        var self = this;
                        var html = '';
                        var arry = [];
                        var FeeBase = self.FeeDataSources.FeeBase;
                        var PeriodBase = self.FeeDataSources.PeriodBase;
                        $.each(self.FeeDetail.Parameters, function (i, v) {
                            if (v.ParameterInputType == 'assembly') {
                                arry = v.ItemValue.split("#");
                            }
                        })
                        if (arry.length > 0) {
                            //分组找出元素,运算符和数值
                            $.each(arry, function (i, v) {
                                //数值
                                if (parseFloat(v.replace(/,/g, "")) == v.replace(/,/g, "")) {
                                    html += "<div class='infonv Numbers'>" + "<span>" + v + "</span>" + "</div>";
                                } else {
                                    if (v.length == 1) {//运算符
                                        html += '<div class="operators" style="min-width:30px;flex:unset">' + ' <span>' + v + '</span>' + '</div>'
                                    } else if (v == 'Round' || v == 'RoundUp' || v == 'RoundDown') {
                                        html += '<div class="operators" style="width:100px;flex:unset">' + ' <span>' + v + '</span>' + '</div>'
                                    } else {//元素
                                        $.each(FeeBase, function (j, k) {
                                            if (k.Value == v) {
                                                html += '<div class="elements" title="' + k.Title + '" values="' + k.Value + '" style="width:calc(23.6% - 15px)">' + '<span>' + k.Title + '</span>' + '</div>';
                                            }
                                        })

                                        $.each(PeriodBase, function (j, k) {
                                            if (k.Value == v) {
                                                html += '<div class="elements" title="' + k.Title + '" values="' + k.Value + '" style="width:calc(23.6% - 15px)">' + '<span>' + k.Title + '</span>' + '</div>';
                                            }
                                        })
                                    }
                                }
                            })
                            sessionStorage.setItem("ReturnDom", html);
                            Vue.nextTick(function () {
                                var html = sessionStorage.getItem("ReturnDom");
                                $('.dis').html('');;
                                $(html).appendTo($('.dis'));
                                sessionStorage.removeItem("ReturnDom");
                            })
                        } else {
                            return '';
                        }

                    },
                    //渲染str
                    ReturnStr: function () {
                        var self = this;
                        var html = '';
                        var arry = [];
                        var FeeBase = self.FeeDataSources.FeeBase;
                        var PeriodBase = self.FeeDataSources.PeriodBase;
                        $.each(self.FeeDetail.Parameters, function (i, v) {
                            if (v.ParameterInputType == 'assembly') {
                                arry = v.ItemValue.split("#");
                            }
                        })
                        if (arry.length > 0) {
                            //分组找出元素,运算符和数值
                            $.each(arry, function (i, v) {
                                //数值
                                if (parseFloat(v.replace(/,/g, "")) == v.replace(/,/g, "")) {
                                    html += "<span class='xro'>" + v + "</span>";;
                                } else {
                                    if (v.length == 1) {//运算符
                                        html += "<span class='xro'>" + v + "</span>";
                                    } else if (v == 'Round' || v == 'RoundUp' || v == 'RoundDown') {
                                        html += "<span class='xro'>" + v + "</span>";
                                    } else {//元素
                                        $.each(FeeBase, function (j, k) {
                                            if (k.Value == v) {
                                                html += "<span class='xro'>" + k.Title + "</span>";
                                            }
                                        })

                                        $.each(PeriodBase, function (j, k) {
                                            if (k.Value == v) {
                                                html += "<span class='xro'>" + k.Title + "</span>";
                                            }
                                        })
                                    }
                                }
                            })
                            sessionStorage.setItem("ReturnStr", html);
                            Vue.nextTick(function () {
                                var html = sessionStorage.getItem("ReturnStr");
                                $('.res').html('');
                                $(html).appendTo($('.res'));
                                sessionStorage.removeItem("ReturnStr");
                            })
                        } else {
                            return '';
                        }
                    },
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
                    Periods: function (val, oldVal) {
                        Vue.nextTick(function () {
                            $("#DC_TimeLine li").eq(0).trigger("click");
                        })

                    },
                    'PeriodDetail.Dates': function (val, oldVal) {
                        
                        this.$nextTick(function () {
                            var self = this;
                            $.each(val, function (i, v) {
                                i % 2 == 0 ? $(self.$refs.tagday[i]).css({ 'top': 45 }) : $(self.$refs.tagday[i]).css({ 'top': -42 });
                            })
                            $.each(val, function (i, v) {
                                for (a = i + 1; a < val.length; a++) {
                                    if (val[a].Date == v.Date && a - i >= 2) {
                                        if (a % 2 == 0) {
                                            var t = Number($(self.$refs.tagday[a - 2]).css('top').slice(0, -2)) + 20
                                            $(self.$refs.tagday[a]).css({ 'top': t })
                                        } else {
                                            var t = Number($(self.$refs.tagday[a - 2]).css('top').slice(0, -2)) - 20
                                            $(self.$refs.tagday[a]).css({ 'top': t })
                                        }
                                    } 
                                }
                            })

                            //拖拽改变日期
                            //$(".period-detail .period-dates .date").not(":first, :last").draggable({
                            //    axis: "x",
                            //    cursor: "move",
                            //    containment: "parent",
                            //    drag: function (event, ui) {
                            //        var left = ui.position.left;

                            //        var d = self.showDate(left);
                            //        $(this).find(".date-day").text(d);
                            //    },
                            //    stop: function (event, ui) {
                            //        var dateIndex = $(this).index();
                            //        self.PeriodDetail.Dates[dateIndex].Date = $(this).find(".date-day").text();
                            //        var $_this = $(this)
                            //        var dateIndex = $(this).index();
                            //        self.PeriodDetail.Dates[dateIndex].Date = self.showDate(ui.position.left);
                            //        var callApi = new CallApi('TrustManagement', 'dbo.usp_StructureDesign_DateUpdate', true);
                            //        callApi.AddParam({ Name: 'TrustID', Value: self.TrustID, DBType: 'int' });
                            //        callApi.AddParam({ Name: 'EventID', Value: self.PeriodDetail.Dates[dateIndex].EventID, DBType: 'int' });
                            //        callApi.AddParam({ Name: 'StartDate', Value: self.PeriodDetail.Dates[dateIndex].Date, DBType: 'date' });
                            //        callApi.ExecuteNoQuery(function (response) {

                            //            self.$message.success('更新成功!');
                                        
                            //            if (response < 1) {
                            //                self.$message.error('更新失败!');
                            //            }

                            //        });
                            //    }
                            //});
                            var dirDays = self.computeDays(self.PeriodDetail.Dates[0].Date, self.PeriodDetail.Dates[self.PeriodDetail.Dates.length - 1].Date)
                            var html = "";
                            for (i = 0 ; i < dirDays; i++) {
                                html = html + "<span></span>";
                            }
                            var hrWidth = $(this.$refs.hrPeriodTimeline).width();
                            if (hrWidth > this.PeriodTimeLineWidth) {
                                this.PeriodTimeLineWidth = hrWidth;
                            }
                          
                            $(this.$refs.hrPeriodTimeline).html("").append(html);
                            $(this.$refs.hrPeriodTimeline).find('span').each(function () {
                                $(this).css({ left: $(this).index() * (hrWidth / dirDays), width: (hrWidth / dirDays) })
                            })
                        })
                       
                       
                    },
                    'PeriodDetail.Scenarios': function () {
                        var self = this;
                        var t = 0
                        $(".tool-container .arrow").off()
                        $(".tool-container .arrow").click(function () {
                            $(this).parent(".tool").toggleClass("slide");
                            if (!$(this).parent().hasClass("payment-plan-tool") && $(this).parent().hasClass("slide")) {
                                $(this).parent().css({ left: "auto" })
                            } else if ($(this).parent().hasClass("payment-plan-tool") && !$(this).parent().hasClass("slide")) {
                                $(this).parent().css({ left: 0 })
                            }
                        })
                        $(".tool-container .tool").draggable({ handle: "h3", cursor: "move" });


                    },

                    'PeriodDetail.Fees': function () {
                        var self = this;
                        var isDrop = false;


                    },
                    AllEvents: function () {

                    }
                },
                methods: {
                    //
                    // 封装一个AJax请求方法
                    getSourceData: function (executeParam, callback) {
                        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                        common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, callback);
                    },
                    //
                    getTrustPeriod: function (callback) {
                        var self = this;
                        var executeParam = {
                            'SPName': "usp_GetTrustPeriod", 'SQLParams': [
                                { 'Name': 'TrustPeriodType', 'Value': 'PaymentDate_CF', 'DBType': 'string' },
                                { 'Name': 'TrustId', 'Value': self.TrustID, 'DBType': 'int' }
                            ]
                        };
                        self.getSourceData(executeParam, callback);
                    },
                    //
                    //toStringRoundingRules: function (rule) {
                    //    switch (rule) {
                    //        case '0':
                    //            return 'Round';
                    //            break;
                    //        case '1':
                    //            return 'RoundUp';
                    //            break;
                    //        case '2':
                    //            return 'RoundDown';
                    //            break;
                    //        default:
                    //            return 'error';
                    //    }
                    //},
                    updateEachTrustBondLayer: function () {
                        var self = this;
                        var dataString = '';
                        if (self.ClassStructureLabels[7].value !== '') {
                            for (var i = 0; i < self.editingBondModel.length; i++) {
                                if (i == 2 || i == 5 || i == 6 || i == 7) {
                                    if (!(/^\d+$/.test(self.editingBondModel[i]))) {
                                        GSdialog.HintWindow("基本配置信息未填完整或有误，请检查！");
                                        return;
                                    }
                                }
                                if (i != 7)
                                    dataString += self.editingBondModel[i] + ";";
                                else
                                    dataString += self.editingBondModel[i];
                            }
                        }
                        else {
                            for (var i = 0; i < 6; i++) {
                                if (i == 2 || i == 5) {
                                    if (!(/^\d+$/.test(self.editingBondModel[i]))) {
                                        GSdialog.HintWindow("基本配置信息未填完整或有误，请检查！");
                                        return;
                                    }
                                }
                                if (i != 5)
                                    dataString += self.editingBondModel[i] + ";";
                                else
                                    dataString += self.editingBondModel[i] + ';;';
                            }
                        }
                        var executeParam = {
                            'SPName': "usp_UpdateEachTrustBondLayer", 'SQLParams': [
                                { 'Name': 'TrustId', 'Value': self.TrustID, 'DBType': 'int' },
                                { 'Name': 'BondId', 'Value': self.editingBondId, 'DBType': 'int' },
                                { 'Name': 'ReportingDate', 'Value': self.PeriodDetail.End.replace(new RegExp("-", "gm"), ""), 'DBType': 'string' },
                                { 'Name': 'DataString', 'Value': dataString, 'DBType': 'string' },
                            ]
                        };
                        self.getSourceData(executeParam, function (res) {
                            if (res[0].result == 1) {
                                GSdialog.HintWindow("更新成功", function () {
                                    self.closebox();
                                });
                            }
                            else
                                GSdialog.HintWindow("更新失败");
                        });
                    },
                    //检验数学公式是否合法
                    TestFormula: function (string) {// TODO: 如何处理=？
                        // 剔除空白符
                        var self = this;
                        var arry = string.split("#");
                        var arry1 = JSON.parse(JSON.stringify(arry));
                        string = string.replace(/#/g, "");
                        if ("" === string) {
                            return true;
                        }
		
                        // 错误情况，运算符连续
                        if (/[\+\-\*\/]{2,}/.test(string)) {
                            return false;
                        }
		
                        // 空括号
                        if (/\(\)/.test(string)) {
                            return false;
                        }
		
                        // 错误情况，括号不配对
                        var stack = [];
                        for (var i = 0, item; i < string.length; i++) {
                            item = string.charAt(i);
                            if ('(' === item) {
                                stack.push('(');
                            } else if (')' === item) {
                                if (stack.length > 0) {
                                    stack.pop();
                                } else {
                                    return false;
                                }
                            }
                        }
                        if (0 !== stack.length) {
                            return false;
                        }
	   
                        // 错误情况，(后面是运算符 
                        if (/\([\+\-\*\/]/.test(string)) {
                            return false;
                        }
		
                        // 错误情况，)前面是运算符
                        if (/[\+\-\*\/]\)/.test(string)) {
                            return false;
                        }
		
                        // 错误情况，(前面不是运算符
                        if (/[^\+\-\*\/]\(/.test(string)) {
                            return false;
                        }
		
                        // 错误情况，)后面不是运算符
                        if (/\)[^\+\-\*\/\)]/.test(string)) {
                            return false;
                        }
                        //错误情况,运算符开头
                        if (/^[+\-\*\/]/.test(string)) {
                            return false;
                        }
                        //错误情况,运算符结尾
                        if (/[+\-\*\/]$/.test(string)) {
                            return false;
                        }
                 
                        //校验关系   
                            //数组 去除括号的部分
                        $.each(arry, function (i, v) {
                            if (v == "(" || v == ")") {
                                arry1.remove(v);
                            }
                        })
                        //-> 剩下元素和运算符以及数值 
                        arry = arry1
                        var opx = []//存运算符
                        $.each(arry, function (i, v) {
                            if (v == "+" || v == "-" || v == "*" || v == "/") {
                                opx.push(v);
                                arry1.remove(v);
                            }
                        })
                        //-> 剩下元素和数值 元素和数值的len-1 = 运算符的个数
                        arry = arry1
                        if (arry.length - 1 != opx.length) {
                            return false;
                        }
                        return true;
                    },
                    //初始化起始日期和终止日期下拉选项
                    initStartAndEndPeriod: function (response) {
                        
                        var self = this;
                        $.each(response, function (i, v) {
                            self.periodStartOptions.push({
                            	//TODO YANGYINGYONG
//                                'value': self.changeTimeStamp(new Date(eval(v.StartDate.replace("/Date(", "").replace(")/", ""))), 'int'),
//                                'text': self.changeTimeStamp(new Date(eval(v.StartDate.replace("/Date(", "").replace(")/", ""))), 'string')
                                'value': self.changeTimeStamp(new Date(eval(v.StartDate, "")), 'int'),
                                'text': self.changeTimeStamp(new Date(eval(v.StartDate, "")), 'string')
                            });
                            self.periodEndOptions.push({
                            	//TODO YANGYINGYONG
//                                'value': self.changeTimeStamp(new Date(eval(v.EndDate.replace("/Date(", "").replace(")/", ""))), 'int'),
//                                'text': self.changeTimeStamp(new Date(eval(v.EndDate.replace("/Date(", "").replace(")/", ""))), 'string')
                                'value': self.changeTimeStamp(new Date(eval(v.EndDate, "")), 'int'),
                                'text': self.changeTimeStamp(new Date(eval(v.EndDate, "")), 'string')
                            });
                        });
                    },
                    //

                    //时间戳转换成指定类型（int:20151103,string:2015-11-03）
                    changeTimeStamp: function (time, model) {
                        var datetime = new Date();
                        datetime.setTime(time);
                        var year = datetime.getFullYear();
                        var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
                        var day = datetime.getDate();
                        var result;
                        if (model.toLowerCase() == 'int') {
                            result = year * 10000 + month * 100 + day
                        } else if (model.toLowerCase() == 'string') {
                            result = year + "-" + month + "-" + (day < 10 ? '0' + day : day);
                        }
                        return result;
                    },
                    //渲染千分位
                    Trousht: function ($event, $index) {
                        var self = this;
                        var target = $event.currentTarget;
                        var index = $index;
                        var tex = new RegExp("[^.(0-9)]");
                        var p = $(target).val();
                        p = p.replace(/,/g, "")
                        if (tex.test(p)) {
                            p = p.replace(/[^\d.]/g, "")
                        }
                        var res = p.replace(/\d+/, function (n) { // 先提取整数部分
                            return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                                return $1 + ",";
                            });
                        })
                        self.FeeDetail.Parameters[index].ItemValue = res;
                        return false;
                    },
                    //编辑费用信息
                    updateFee: function (FeeDetail) {
                        var self = this;
                        var items = '<items>';
                        var data = FeeDetail;
                        var paymentDate = self.PeriodDetail.End;
                        var feeName = self.trustFeeName;
                        var string = '';
                        $.each(self.FeeDetail.Parameters, function (i, v) {
                            if (v.ParameterInputType == 'assembly') {
                                string = v.ItemValue;
                            }
                        })
           
                        //if (string.indexOf("Round") > -1 || string.indexOf("RoundUp") > -1 || string.indexOf("RoundDown") > -1) {//含有Round不校验

                        //} else {

                        //    if (!self.TestFormula(string)) {
                        //        GSdialog.HintWindow("公式不合法,请检查");
                        //        return false
                        //    }
                        //}

                        
                        $.each(data.Parameters, function (x, para) {
                            var t;
                            if (para.Name.indexOf("CustodyBank_Interest_Fee_InterestEndDay") == -1) {
                                t = para.ItemValue.toString().replace(/,/g, '')
                            } else {
                                if (isNaN(para.ItemValue)) {
                                    t = para.ItemValue.toString().replace(/,/g, '')
                                } else {
                                    t = -para.ItemValue.toString().replace(/,/g, '')
                                }

                            }
                            $.each(self.PeriodDetail.FeesParamList, function (j, k) {
                                if (para.Name.substring(0, para.Name.lastIndexOf('_')) == k.ItemCode.substring(0, k.ItemCode.lastIndexOf('_'))) {
                                    items += '<item>';
                                    items += '<TrustFeeName>' + feeName + '</TrustFeeName>';
                                    items += '<TrustFeeDisplayName>' + para.DisplayName + '</TrustFeeDisplayName>';
                                    items += '<ItemCode>' + k.ItemCode + '</ItemCode>';
                                    items += '<ItemValue>' + para.ItemValue + '</ItemValue>';
                                    items += '</item>';
                                }
                            })
                          
                        })
                        items += '</items>';
                        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                        var executeParam = {
                            'SPName': "usp_UpdateTrustFeeBySpecifiedDate", 'SQLParams': [
                                { 'Name': 'trustId', 'Value': self.TrustID, 'DBType': 'int' },
                                { 'Name': 'items', 'Value': items, 'DBType': 'xml' },
                                { 'Name': 'transactionDate', 'Value': paymentDate, 'DBType': 'date' }
                            ]
                        };
                        common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (response) {
                            if (response[0].result == "1") {
                                GSdialog.HintWindow("更新成功", function () {
                                self.closebox();
                                });
                            } else {
                                GSdialog.HintWindow("更新失败");
                            }
                        })
                    },
                    //删除费用
                    deletFee: function (feename, displayname) {
                        var self = this;
                        var FeeName = feename;
                        var trustid = self.TrustID;
                        var paymentDate = self.PeriodDetail.End;
                        //调用删除
                        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                        GSdialog.HintWindowTF("当前期数下费用信息会删除,确定删除吗?", function () {
                            var executeParam = {
                                'SPName': "usp_DeleteFeeByTrustIdAndDateAndFeeName", 'SQLParams': [
                                    { 'Name': 'trustId ', 'Value': trustid, 'DBType': 'int' },
                                    { 'Name': 'paymentDate', 'Value': paymentDate, 'DBType': 'string' },
                                    { 'Name': 'feeName ', 'Value': FeeName, 'DBType': 'string' }
                                ]
                            };
                            common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (response) {
                                GSdialog.HintWindow("删除成功", function () {
                                    $("#DC_TimeLine li").eq(self.PeriodDetail.Index).trigger("click")
                                });
                            })
                        })
                    },
                    //
                    //获取费用债券元素数据源
                    getDataOfBondFees: function (callback) {
                        var self = this;

                        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                        var executeParam = {
                            'SPName': "usp_GetBondFeesByTrustId", 'SQLParams': [
                                { 'Name': 'TrustId', 'Value': self.TrustID, 'DBType': 'int' }
                            ]
                        };

                        common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (response) {
                            if (response) {
                                self.dataOfBondFees = response;
                                if (self.dataOfBondFees.length > 0) {
                                    var dataTemp = JSON.parse(JSON.stringify(self.dataOfBondFees));
                                    var fee = [], bondPrincipal = [], bondInterest = [];
                                    $.each(dataTemp, function (i, v) {
                                        if (v.Type == 'Fee') {
                                            fee.push({ 'tpname': v.Name, 'DisplayName': v.DisplayName });
                                        } else if (v.Type == 'BondPrincipal') {
                                            bondPrincipal.push({ 'tpname': v.Name, 'DisplayName': v.DisplayName });
                                        } else if (v.Type == 'BondInterest') {
                                            bondInterest.push({
                                                'tpname': v.Name, 'DisplayName': v.DisplayName
                                        });
                                        }
                                    });
                                    self.AllFees = self.AllFees.concat(fee, bondPrincipal, bondInterest);
                                    
                                }
                            }
                        });

                        if (callback && (typeof callback == 'function')) {
                            callback();
                        }
                    },
                    
                    //
                    LoadAllPeriods: function (fnCallback) {
                        var self = this;
                        var callApi = new CallApi('TrustManagement', 'usp_StructureDesign_GetPeriods', true);
                        callApi.AddParam({ Name: 'TrustID', Value: self.TrustID, DBType: 'int' });
                        callApi.ExecuteDataTable(function (response) {
                        	if (typeof response == 'object') { response = JSON.stringify(response) }//当是object就转String字符串//TODO YANGYINGYONG
                            self.Periods = response;
                            for (i = 0, length = self.Periods.length; i < length; i++) {
                                self.DaysArr[i] = self.computeDays(self.Periods[i].EndDate, self.Periods[i].StartDate)
                            }
                            if (fnCallback && typeof fnCallback === 'function') {
                                fnCallback();
                            }
                        });
                    },
                    LoadAllFees: function () {
                        var self = this;
                        self.getDataOfBondFees();
                    },
                    LoadAllEvents: function () {
                        var self = this;
                        var callApi = new CallApi('TrustManagement', 'dbo.usp_StructureDesign_GetAllEvent', true);
                        callApi.AddParam({ Name: 'TrustID', Value: self.TrustID, DBType: 'int' });
                        callApi.ExecuteDataTable(function (response) {
                            self.AllEvents = response;
                        });
                    },

                    computeDays: function (start, end) {
                        var offsetTime = Math.abs((new Date(end) - new Date(start)) + 1);
                        return Math.floor(offsetTime / (3600 * 24 * 1e3));
                    },
                    ShowPeriodDetail: function (event, index, period) {
                        this.ClickIndex = index;
                        var $li = $(event.currentTarget);
                        $li.addClass('selected').siblings().removeClass('selected');
                        this.PeriodDetail.Index = index;
                        this.PeriodDetail.Start = period.StartDate;
                        this.PeriodDetail.End = period.EndDate;
                        this.PeriodDetail.Days = this.DaysArr[index];
                        var self = this;
                        var callApi = new CallApi('TrustManagement', 'dbo.usp_StructureDesign_GetPeriodDetail', true);
                        callApi.AddParam({ Name: 'TrustID', Value: self.TrustID, DBType: 'int' });
                        callApi.AddParam({ Name: 'StartDate', Value: period.StartDate, DBType: 'date' });
                        callApi.AddParam({ Name: 'EndDate', Value: period.EndDate, DBType: 'date' });
                        
                        callApi.ExecuteDataSet(function (response) {
                            if (!response || response.length < 1) { return; }
                            self.PeriodDetail.Dates = response[0];
                            self.PeriodDetail.Fees = response[1];
                            self.PeriodDetail.Scenarios = self.SortScenarios(response[3]);
                            self.PeriodDetail.Events = response[4];
                        });

                        var executeParam = {
                            'SPName': "usp_GetTrustFee", 'SQLParams': [
                                      { 'Name': 'TrustId', 'Value': self.TrustID, 'DBType': 'int' }
                                    , { 'Name': 'TransactionDate', 'Value': this.PeriodDetail.End, 'DBType': 'string' }
                            ]
                        };
                        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

                        common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
                            self.PeriodDetail.FeesParamList = data
                        });
                    },
                    //SortEvents: function (sArray) {
                    //    var self = this;
                    //    var eventsArr=[];
                    //    var eventListArr=[];
                    //    $.each(sArray, function (i, n) {
                    //        if (n.EventList) {
                    //            eventListArr = n.EventList.split(',');
                    //            eventListArr=eventListArr.map(function (item) {
                    //                return n.ScenarioName + ':'+ item
                    //            })
                    //            eventsArr = eventsArr.concat(eventListArr);
                    //        }
                            
                    //    })
                    //    return eventsArr
                    //},
                    SortScenarios: function (sArray) {
                        var scenarios = [];
                        //[{id,name,info=[{levelid,[{fee},{fee}]},{},{}]},{}]
                        $.each(sArray, function (i, n) {
                            //遍历返回的数据，生成一个对比的偿付情景
                            if (scenarios.length == 0) {
                                var scenario = {};
                                var sLevel = { id: '', elements: [] }
                                scenario.ScenarioId = n.ScenarioId;
                                scenario.ScenarioName = n.Name;
                                scenario.PrincipalPrecision = n.PrincipalPrecision;
                                scenario.InterestPrecision = n.InterestPrecision;
                                scenario.ScenarioInfo = [];
                                scenario.EventList = n.EventList;
                                sLevel.id = n.LevelId;
                                sLevel.elements.push(n)
                                scenario.ScenarioInfo.push(sLevel);
                                scenarios.push(scenario);
                            } else {
                                //
                                $.each(scenarios, function (c, v) {
                                    if (v.ScenarioId == n.ScenarioId) {
                                        $.each(v.ScenarioInfo, function (p, o) {
                                            if (o.id == n.LevelId) {
                                                o.elements.push(n);
                                            } else {
                                                if (v.ScenarioInfo.find(function (ii) {
                                                    return ii.id == n.LevelId
                                                })) {
                                                    return;
                                                }
                                                var sLevel = { id: '', elements: [] }
                                                sLevel.id = n.LevelId;
                                                sLevel.elements.push(n);
                                                v.ScenarioInfo.push(sLevel)
                                            }

                                        })
                                    } else if (v.ScenarioId != n.ScenarioId && !scenarios.find(function (i2) {
                                            return i2.ScenarioId == n.ScenarioId
                                    })) {
                                        var scenario = {};
                                        var sLevel = { id: '', elements: [] }
                                        scenario.ScenarioId = n.ScenarioId;
                                        scenario.ScenarioName = n.Name;
                                        scenario.PrincipalPrecision = n.PrincipalPrecision;
                                        scenario.InterestPrecision = n.InterestPrecision;
                                        scenario.EventList = n.EventList;
                                        scenario.ScenarioInfo = [];
                                        sLevel.id = n.LevelId;
                                        sLevel.elements.push(n)
                                        scenario.ScenarioInfo.push(sLevel);
                                        scenarios.push(scenario);
                                    }

                                })
                            }


                        })
                        return scenarios;
                        //for (var i = 0, length = sArray.length; i < length; i++) {
                        //    var s = sArray[i];
                        //    var scenario = eval('(' + s.Scenario + ')');
                        //    scenario.ScenarioId = s.ScenarioId;
                        //    scenarios.push(scenario);
                        //}
                        //return scenarios;
                    },
                    CalDateLeftOffset: function (date) {
                        
                        var self = this;
                        var dirDays = self.computeDays(self.PeriodDetail.Dates[0].Date, self.PeriodDetail.Dates[self.PeriodDetail.Dates.length - 1].Date)
                        var offesetdays = Math.floor((new Date(date) - new Date(self.PeriodDetail.Dates[0].Date)) / (3600 * 24 * 1e3));
                        return offesetdays / dirDays * this.PeriodTimeLineWidth - 12;
                    },
                    RemoveTrustCode: function (title) {
                        return title.replace(/\([^\)]*\)/g, "");
                    },
                    showDate: function (offsetLeft) {
                        var self = this;
                        var dir = Math.floor(new Date(self.PeriodDetail.Dates[self.PeriodDetail.Dates.length - 1].Date) - new Date(self.PeriodDetail.Dates[0].Date));
                        var d = ((offsetLeft + 12) / this.PeriodTimeLineWidth) * dir + new Date(self.PeriodDetail.Start).getTime()
                        return new Date(d).dateFormat("yyyy-MM-dd")
                    },

                    InitDialogDetail: function () {
                        this.FeeDetail = { DisplayName: '', Parameters: [] };
                        this.EventDetail = { EventDescription: '', Operator: '', Threshold: '' };
                        this.ScenarioDetail = { ScenarioName: '', StartDate: '', EndDate: '', PrincipalPrecision: '', InterestPrecision: '', AllowInterestToPrincipal: '' };
                        this.PeriodScenarioIndex = null;
                    },
                    GetFeeOptionSource: function (dataSourceName) {
                        return this.AllFees_OptionSource[dataSourceName];
                    },
                    getCashFlowFeeModelFromFile: function () {
                        var executeParams = {
                            'SPName': "usp_GetModelPathByTrustId", 'SQLParams': [
                                { 'Name': 'TrustId', 'Value': this.TrustID, 'DBType': 'int' }
                            ]
                        };
                        var serviceUrls = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                        var response = common.ExecuteGetData(false, serviceUrls, 'TrustManagement', executeParams);
                        response = response[0].Column1
                        var filePath = "E:\\TSSWCFServices\\TrustManagementService\\UITaskStudio\\Models\\" + response + "\\CashFlowFeeModel.Xml";
                        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "/GetFeesFromXMLFile?FilePath=" + filePath;
                        var self = this;
                        $.ajax({
                            url: serviceUrl,
                            type: "GET",
                            contentType: "application/json; charset=utf-8",
                            dataType: "jsonp",
                            crossDomain: true,
                            success: function (response) {
                                var jsonSource = jQuery.parseJSON(response);
                                //获取增加模板;
                                var serviceUrlex = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                                var executeParam = {
                                    SPName: 'TrustManagement.usp_GetFeeBaseItemAddition'
                                };
                                var con = [];
                                var repeat = [];
                                common.ExecuteGetData(false, serviceUrlex, 'TrustManagement', executeParam, function (data) {
                                    con = data;
                                });
                                for (var i = 0; i < con.length; i++) {
                                    for (var j = 0; j < jsonSource.DataSources.FeeBase.length; j++) {
                                        if (con[i].Value == jsonSource.DataSources.FeeBase[j].Value) {
                                            repeat.push(con[i]);
                                        }
                                    }
                                }
                                if (repeat.length > 0) {
                                    $.each(repeat, function (i, v) {
                                        con.remove(v);
                                    })
                                }
                                jsonSource.DataSources.FeeBase = jsonSource.DataSources.FeeBase.concat(con);
                                self.FeeDataSources = jsonSource.DataSources;
                                // 获取矩阵型费用选项
                                var tempUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                                var executeParam = {
                                    'SPName': "usp_GetMatrixRateNameAndIdByTrustId", SQLParams: [
                                        { 'Name': 'TrustId', 'Value': self.TrustID, 'DBType': 'int' }
                                    ]
                                };
                                var tempArray = common.ExecuteGetData(false, tempUrl, 'TrustManagement', executeParam)
                                var executeParam = {
                                    'SPName': "usp_GetBondCodeByTrustId", SQLParams: [
                                        { 'Name': 'TrustId', 'Value': self.TrustID, 'DBType': 'int' }
                                    ]
                                };
                                var tempArray2 = common.ExecuteGetData(false, tempUrl, 'TrustManagement', executeParam)
                                var SP_usp_GetMatrixRateNameAndIdByTrustId = [];
                                var SP_usp_GetBondCodeByTrustId =[];
                                tempArray2.forEach(element => {
                                    SP_usp_GetBondCodeByTrustId.push({ Title: element.ShortName, Value: element.TrustBondname })
                                });
                                tempArray.forEach(element => {
                                    SP_usp_GetMatrixRateNameAndIdByTrustId.push({ Title: element.DisPlayName, Value: element.MatrixId })
                                });
                                self.FeeDataSources.SP_usp_GetMatrixRateNameAndIdByTrustId = SP_usp_GetMatrixRateNameAndIdByTrustId;
                                self.FeeDataSources.SP_usp_GetBondCodeByTrustId = SP_usp_GetBondCodeByTrustId;
                                self.feeTypeListModel = jsonSource.Json;
                                
                                // end
                            },
                            error: function (response) {
                                alert("error:" + response);
                            }
                        });
                    },

                    /**************费用信息**************/
                    ///当前期费用项的详细参数信息====> this.FeeDetail
                    GetExistedFeeDetail: function (trustFeeName, feeDisplayName) {
                        var self = this;
                        var feeName = trustFeeName;
                        trustFeeName = trustFeeName.substr(0, trustFeeName.lastIndexOf('_'))
                        var feeDetailArr = [];
                        $.each(self.feeTypeListModel, function (i, v) {
                            var actionCode = v.ActionCode.substr(0, v.ActionCode.lastIndexOf('_'));
                            var trustFeeName2 = ''
                            $.each(self.PeriodDetail.Fees, function (i2, v2) {
                                trustFeeName2 = v2.TrustFeeName.substr(0, v2.TrustFeeName.lastIndexOf('_'));
                                if (trustFeeName2 == actionCode) { feeDetailArr.push(v) }
                            })
                        })
                        $.each(feeDetailArr, function (i, v) {
                            var actionCode = v.ActionCode.substr(0, v.ActionCode.lastIndexOf('_'));
                            $.each(self.PeriodDetail.FeesParamList, function (i2, v2) {
                                var trustFeeName3 = v2.TrustFeeName.substr(0, v2.TrustFeeName.lastIndexOf('_'));
                                var itemCode = v2.ItemCode.substr(0, v2.ItemCode.lastIndexOf('_'));
                                if (trustFeeName3 == actionCode) {
                                    $.each(v.Parameters, function (i3, v3) {
                                        var name = v3.Name.substr(0, v3.Name.lastIndexOf('_'));
                                        if (name == itemCode) {
                                            v3.ItemValue = v2.ItemValue;
                                        }
                                    })
                                }
                            })
                            
                        })
                        //
                        var executeParams = {
                            'SPName': "usp_GetFeeDetailsByDateAndName", 'SQLParams': [
                                { 'Name': 'trustId', 'Value': self.TrustID, 'DBType': 'int' },
                                { 'Name': 'transactionDate', 'Value': self.PeriodDetail.End, 'DBType': 'string' },
                                { 'Name': 'feeName', 'Value': feeName, 'DBType': 'string' }
                            ]
                        };
                        var serviceUrls = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                        var response = common.ExecuteGetData(false, serviceUrls, 'TrustManagement', executeParams);
                       
                        var feeDetailArr2 = $.grep(feeDetailArr, function (v, i) {
                            return v.ActionCode.substr(0, v.ActionCode.lastIndexOf('_')) == trustFeeName
                        })
                        feeDetailArr2[0].feeDisplayName = feeDisplayName;
                        var newArry = response;
                        //拼费用编辑数据
                        $.each(feeDetailArr2[0].Parameters, function (i, v) {
                            $.each(newArry, function (j, k) {
                                if (v.Name.substring(0, v.Name.lastIndexOf('_')) == k.ItemCode.substring(0, k.ItemCode.lastIndexOf('_'))) {//匹配2个数组
                                    v.ItemValue = k.ItemValue;
                                }
                            })

                        })

                        //保管银行利息单独处理
                        if (trustFeeName == 'CustodyBank_Interest_Fee') {
                            $.each(feeDetailArr2[0].Parameters, function (i, v) {
                                if (v.Name.indexOf('CustodyBank_Interest_Fee_InterestRatio') != -1) {
											feeDetailArr2[0].Parameters = [];
											feeDetailArr2[0].Parameters.push(v);
										}

                            })
                            
                        }
                        self.FeeDetail = feeDetailArr2[0];
                    },
                    ///当前期费用项中移除费用信息
                    RemoveExistedFee: function (fee) {
                        ////可能不用验证：当前期的费用理应都是存在于某一个偿付情境中，目前删除为临时做法
                        //var allLevelsFees = [];
                        //for (var i = 0, slength = this.PeriodDetail.Scenarios.length; i < slength; i++) {
                        //    var scenario = this.PeriodDetail.Scenarios[i];
                        //    $.each(scenario.PaymentSequence.Levels, function (s, level) {
                        //        $.each(level.BondFees, function (o, fee) {
                        //            allLevelsFees.push(fee.Name);
                        //        });                                 
                        //    });
                        //}
                        //if (allLevelsFees.indexOf(trustFeeName) > -1) {
                        //    alert('当前费用存在于偿付情景，暂时无法移除！');
                        //    return;
                        //}

                        ////periodEndDate = '2016-01-25', trustFeeName = 'AssetService_Fee_2';
                        if (!confirm('确认移除该费用信息？')) { return; }
                        var self = this;
                        var callApi = new CallApi('TrustManagement', 'dbo.usp_StructureDesign_RemoveFee', true);
                        callApi.AddParam({ Name: 'TrustID', Value: self.TrustID, DBType: 'int' });
                        callApi.AddParam({ Name: 'TranscationDate', Value: self.PeriodDetail.End, DBType: 'date' });
                        callApi.AddParam({ Name: 'TrustFeeName', Value: fee.TrustFeeName, DBType: 'string' });
                        callApi.ExecuteNoQuery(function (response) {
                            if (response < 1) {
                                alert('费用删除失败!');
                                return;
                            }
                            self.PeriodDetail.Fees.remove(fee);
                            alert('费用删除成功!');
                        });
                    },
                    ///当前期费用信息中添加新的费用信息====> this.FeeDetail
                    AddNewFee_Get: function (feeName) {
                        var self = this;
                        
                        //periodEndDate = '2016-01-25', feeName = 'AssetService_Fee_#Id#';
                        var trustFeeName = feeName.substring(0, feeName.lastIndexOf('_#') + 1);
                        var callApi = new CallApi('TrustManagement', 'dbo.usp_StructureDesign_GetFeeCount', true);
                        callApi.AddParam({ Name: 'TrustID', Value: self.TrustID, DBType: 'int' });
                        callApi.AddParam({ Name: 'TranscationDate', Value: self.PeriodDetail.End, DBType: 'date' });
                        callApi.AddParam({ Name: 'TrustFeeName', Value: trustFeeName, DBType: 'string' });
                        callApi.ExecuteDataTable(function (response) {
                            var currentIndex = parseInt(response[0].CurrentIndex) + 1;

                            var feeDefinition = $.grep(self.AllFees, function (fee) { return fee.ActionCode === feeName });
                            feeDefinition = feeDefinition[0];
                            var fd = {
                                ActionCode: trustFeeName + currentIndex,
                                DisplayName: feeDefinition.DisplayName + currentIndex,
                                MethodDisplayName: feeDefinition.MethodDisplayName,
                                Parameters: feeDefinition.Parameters,
                            };
                            $.each(fd.Parameters, function (i, param) {

                                var paramCodeName = param.Name.substring(0, param.Name.lastIndexOf('_') + 1);
                                param.Name = paramCodeName + currentIndex;

                            });

                            self.FeeDetail = fd;
                        });
                    },
                    //
                    closebox: function () {
                        $("#dialog-FeeDetail .ant-drawer-mask").removeClass("open");
                        $("#dialog-FeeDetail .ant-drawer-content-wrapper").css("height", "0px");
                        $("#dialog-ClassStructureDetail .ant-drawer-mask").removeClass("open");
                        $("#dialog-ClassStructureDetail .ant-drawer-content-wrapper").css("height", "0px");
                    },
                    ///保存往当前期费用信息中添加的新的费用信息、更新现有当前期费用信息
                    UpdateFee: function (fnCallback) {
                        var self = this;

                        var items = [], itemTmpl = '<item><Code>{0}</Code><Value>{1}</Value></item>';
                        $.each(self.FeeDetail.Parameters, function (i, param) {

                            items.push(itemTmpl.format(param.Name, param.ItemValue));
                        });
                        items = '<items>{0}</items>'.format(items.join(''));
                        var callApi = new CallApi('TrustManagement', 'dbo.usp_StructureDesign_UpdateFee', true);
                        callApi.AddParam({ Name: 'TrustID', Value: self.TrustID, DBType: 'int' });
                        callApi.AddParam({ Name: 'TransactionDate', Value: self.PeriodDetail.End, DBType: 'date' });
                        callApi.AddParam({ Name: 'TrustFeeName', Value: self.FeeDetail.ActionCode, DBType: 'string' });
                        callApi.AddParam({ Name: 'TrustFeeDisplayName', Value: self.FeeDetail.DisplayName, DBType: 'string' });
                        callApi.AddParam({ Name: 'FeeItems', Value: items, DBType: 'xml' });
                        callApi.ExecuteNoQuery(function (response) {
                            fnCallback(response);
                        });
                    },

                    /**************偿付情景**************/
                    ///更新偿付情景:偿付情境中添加、移除、排序费用信息时，更新整个偿付情景(JSON)
                    UpdateScenario: function (scenario) {
                        var self = this;

                        if (scenario.ScenarioInfo.length > 0) {
                            levels = scenario.ScenarioInfo.length
                        }
                        //构造偿付情景json串适配偿付情景页面
                        var jsonscenario = {
                            TrustId: self.TrustID,
                            ScenarioName: scenario.ScenarioName,
                            StartDateId: parseInt(self.PeriodDetail.Start.replace(new RegExp("-", "gm"), "")),
                            EndDateId: parseInt(self.PeriodDetail.End.replace(new RegExp("-", "gm"), "")),
                            PrincipalPrecision: scenario.PrincipalPrecision,
                            InterestPrecision: scenario.InterestPrecision,
                            ExcludedDatesId: "",
                            Levels: Array.apply(null, Array(levels)).map(function (item, i) {
                                i += 1;
                                return {
                                    Id: i,
                                    Elements: []
                                };

                            }),
                            ScenarioId: scenario.ScenarioId,
                            Accounts: ''
                        };
                        
                        
                        //json串添加level层级
                        $.each(jsonscenario.Levels, function (ind, item) {
                            $.each(scenario.ScenarioInfo, function (secind, secitem) {
                                if (secitem.id == item.Id) {
                                    $.each(secitem.elements, function (feeide, feeitem) {
                                        var tempfeeitem = {};
                                        tempfeeitem.DisplayName = feeitem.DisplayName;
                                        tempfeeitem.Name = feeitem.tpname;
                                        tempfeeitem.Code = '';
                                        tempfeeitem.ProcessorName = '';
                                        tempfeeitem.Category = '';
                                        tempfeeitem.Type = 'Fee';
                                        tempfeeitem.RuleType = '';
                                        tempfeeitem.ClassType = '';
                                        tempfeeitem.Amount = '';
                                        tempfeeitem.Percentage = '';
                                        tempfeeitem.AllocationRuleOfSameLevel = '';
                                        tempfeeitem.Source = '';
                                        tempfeeitem.Target = '';
                                        tempfeeitem.ElementNames = '';
                                        tempfeeitem.ElementRange = '';
                                        tempfeeitem.TrustbondId = -1;
                                        item.Elements.push(tempfeeitem);
                                    })

                                }

                            })

                        })
                       
                        //获取xml
                        var levels = '<levels><level>{0}</level><leveldisplayname><displayname>{1}</displayname></leveldisplayname><levelname><name>{2}</name></levelname><leveltype><type>{3}</type></leveltype></levels>'
                        var strElement = '';
                        $.each(jsonscenario.level, function (jsonind, jsonitem) {
                            $.each(jsonitem.elements, function (eleind, eleitem) {
                                strElement = [strElement, levels.format(jsonitem.id, eleitem.DisplayName, eleitem.Name, eleitem.Type)].join('')
                            })
                        
                        })
                        var rootxml = '<root>{0}</root>'.format(strElement);



                        ////var scenario = this.PeriodDetail.Scenarios[scenarioIndex];
                        var callApi = new CallApi('TrustManagement', 'TrustManagement.usp_SaveScenarioConstruction', true);
                        callApi.AddParam({ Name: 'TrustID', Value: self.TrustID, DBType: 'int' });
                        callApi.AddParam({ Name: 'ScenarioID', Value: scenario.ScenarioId, DBType: 'int' });
                        callApi.AddParam({ Name: 'ScenarioXML', Value: rootxml, DBType: 'string' });
                        callApi.AddParam({ Name: 'startdate', Value: parseInt(self.PeriodDetail.Start.replace(new RegExp("-", "gm"), "")), DBType: 'int' });
                        callApi.AddParam({ Name: 'enddate', Value: parseInt(self.PeriodDetail.End.replace(new RegExp("-", "gm"), "")), DBType: 'int' });

                        callApi.AddParam({ Name: 'ScenarioJSON', Value: JSON.stringify(jsonscenario), DBType: 'string' });

                        callApi.ExecuteNoQuery(function (response) {
                            self.$message.success('此偿付情景保存成功!')
                            
                            if (response < 1) {
                                self.$message.error('此偿付情景保存失败!')
                            }
                        });

                    },
                    ///更新偿付情景:原更新偿付情景存储过程（新增、更新）
                    UpdateScenario_Full: function (scenario, scenarioinfo) {
                        var self = this;
                        var callApi = new CallApi('TrustManagement', 'TrustManagement.usp_SaveTrustPaymentSequenceConstruction', true);
                        callApi.AddParam({ Name: 'TrustId', Value: self.TrustID, DBType: 'int' });
                        callApi.AddParam({ Name: 'ScenarioId', Value: scenario.ScenarioId || 0, DBType: 'int' });
                        callApi.AddParam({ Name: 'ScenarioName', Value: scenario.ScenarioName, DBType: 'string' });
                        callApi.AddParam({ Name: 'StartDate', Value: scenario.StartDateId, DBType: 'string' });
                        callApi.AddParam({ Name: 'EndDate', Value: scenario.EndDateId, DBType: 'string' });
                        callApi.AddParam({ Name: 'ExcludedDates', Value: scenario.ExcludedDatesId, DBType: 'string' });
                        callApi.AddParam({ Name: 'PrincipalPrecision', Value: scenario.PrincipalPrecision, DBType: 'string' });
                        callApi.AddParam({ Name: 'InterestPrecision', Value: scenario.InterestPrecision, DBType: 'string' });
                        callApi.AddParam({ Name: 'PaymentSequence', Value: JSON.stringify(scenario), DBType: 'string' });
                        //callApi.AddParam({ Name: 'TrustStartTime', Value: this.PeriodDetail.Start, DBType: 'string' });
                        //callApi.AddParam({ Name: 'TrustEndTime', Value: this.PeriodDetail.End, DBType: 'string' });
                        callApi.ExecuteDataTable(function (response) {
                            ////
                            scenario.ScenarioId = response[0].result;

                            scenarioinfo.ScenarioId = response[0].result;
                            self.PeriodDetail.Scenarios.push(scenarioinfo);

                            var temprule = {};
                            temprule.Rules = [];

                            var callApi1 = new CallApi('TrustManagement', 'TrustManagement.usp_SaveTrustPaymentSequenceConstructionRules', true);
                            callApi1.AddParam({ Name: 'TrustId', Value: self.TrustID, DBType: 'int' });
                            callApi1.AddParam({ Name: 'ScenarioId', Value: scenario.ScenarioId || 0, DBType: 'int' });
                            callApi1.AddParam({ Name: 'Rules', Value: JSON.stringify(temprule), DBType: 'string' });
                            callApi1.AddParam({ Name: 'PaymentSequence', Value: JSON.stringify(scenario), DBType: 'string' });
                            ////
                           
                            callApi1.ExecuteDataTable(function (response) {

                                $('.Scenario-Toolbox').addClass('hidden');
                                $('.Scenario-Toolbox-Empty').removeClass('hidden');
                               self.$message.success('偿付情景添加成功!');

                            })

                        });
                    },
                    AddNewScenario: function () {
                        if (!this.ScenarioDetail.ScenarioName) {
                            self.$message.warning('请输入偿付情景名称！');
                            return;
                        };

                        
                        var currentScenariosLength = this.PeriodDetail.Scenarios.length;
                        //if (currentScenariosLength > 0) {
                        //    levels = this.PeriodDetail.Scenarios[0].ScenarioInfo.length;
                        //}
                        var levels = 7;
                        var self = this;
                        if (self.ScenarioDetail.EndDate <= self.ScenarioDetail.StartDate) {
                            self.$message.error('开始时间需要小于结束时间！');
                            return;
                        }



                        var scenario = {
                            TrustId: self.TrustID,
                            ScenarioName: self.ScenarioDetail.ScenarioName,
                            StartDateId: self.ScenarioDetail.StartDate,
                            EndDateId: self.ScenarioDetail.EndDate,
                            PrincipalPrecision: self.ScenarioDetail.PrincipalPrecision,
                            InterestPrecision: self.ScenarioDetail.InterestPrecision,
                            ExcludedDatesId: "",
                            ScenarioInfo: Array.apply(null, Array(levels)).map(function (item, i) {
                                i += 1;
                                return {
                                    id: i,
                                    elements: []
                                };
                            }),
                            ScenarioId: 0
                        };

                        //this.PeriodDetail.Scenarios.push(scenario);
                        this.PeriodScenarioIndex = currentScenariosLength;

                        var tempscen = JSON.parse(JSON.stringify(scenario));
                        tempscen.Levels = [];
                        tempscen.Accounts = [];
                        delete tempscen.ScenarioInfo;
                        delete tempscen.TrustId;
                        tempscen = tempscen;

                        self.UpdateScenario_Full(tempscen, scenario);
                        self.InitDialogDetail();
                        //setTimeout(function () {
                        //    $('.Scenario-Toolbox-Empty, .Scenario-Toolbox').addClass('hidden');
                        //    $('.Scenario-Toolbox[data-index="' + currentScenariosLength + '"]').removeClass('hidden');
                        //}, 500);
                    },
                    RemoveScenario: function (scenario) {
                        if (!confirm('确定删除该偿付情景？')) {
                            return;
                        }

                        this.PeriodDetail.Scenarios.remove(scenario);
                        if (scenario.ScenarioId) {
                            var self = this;
                            var callApi = new CallApi('TrustManagement', 'dbo.usp_StructureDesign_RemoveScenario', true);
                            callApi.AddParam({ Name: 'TrustID', Value: self.TrustID, DBType: 'int' });
                            callApi.AddParam({ Name: 'ScenarioID', Value: scenario.ScenarioId, DBType: 'int' });
                            callApi.ExecuteNoQuery(function (response) {
                                if (response < 1) {
                                    self.$message.error('删除失败!');
                                    return;
                                }
                                self.$message.success('删除成功!');
                                $('.Scenario-Toolbox-Empty').removeClass('hidden');
                            });
                        }
                    },
                    /**************事件操作**************/
                    ///事件新增、修改
                    UpdateEvent: function (fncallback) {
                        var self = this;

                        var callApi = new CallApi('TrustManagement', 'dbo.usp_StructureDesign_UpdateEvent', true);
                        if (self.EventDetail.TrustEventId) {
                            callApi.AddParam({ Name: 'TrustEventID', Value: self.EventDetail.TrustEventId, DBType: 'int' });
                        }
                        callApi.AddParam({ Name: 'TrustID', Value: self.TrustID, DBType: 'int' });
                        callApi.AddParam({ Name: 'ItemID', Value: self.EventDetail.ItemId, DBType: 'int' });
                        callApi.AddParam({ Name: 'ItemCode', Value: self.EventDetail.ItemCode, DBType: 'string' });
                        callApi.AddParam({ Name: 'Operator', Value: self.EventDetail.Operator, DBType: 'string' });
                        callApi.AddParam({ Name: 'Threshold', Value: self.EventDetail.Threshold, DBType: 'string' });
                        if (self.EventDetail.TrustEventId) {
                            callApi.ExecuteNoQuery(function (res) {
                                if (res > 0) {
                                    self.$message.success('更新成功!');
                                    fncallback();
                                } else {
                                    self.$message.error('更新失败!');
                                }
                            });
                        } else {
                            callApi.ExecuteDataTable(function (response) {
                                if (!response || !response.length) {
                                    self.$message.error('事件添加失败！');
                                    return;
                                }
                                self.$message.success('事件添加成功！');
                                fncallback(response[0].TrustEventId);
                            });
                        }
                    },
                    RemoveEvent: function (trustEvent) {
                        if (!confirm('确定删除事件？')) {
                            return;
                        }
                        var self = this;
                        var callApi = new CallApi('TrustManagement', 'dbo.usp_StructureDesign_EventRemove', true);
                        callApi.AddParam({ Name: 'TrustEventID', Value: trustEvent.TrustEventId, DBType: 'int' });
                        callApi.ExecuteDataTable(function (response) {
                            alert('删除成功');
                            self.PeriodDetail.Events.remove(trustEvent);
                        });
                    },

                    editFees: function (trustFeeName, feeDisplayName, isAddNew) {
                      
                        var self = this;
                        self.trustFeeName = trustFeeName;
                        if (isAddNew) {
                            self.AddNewFee_Get(trustFeeName);
                        } else {
                            self.GetExistedFeeDetail(trustFeeName, feeDisplayName);
                        }

                        //$("#dialog-FeeDetail").dialog({
                        //    dialogClass: "no-close",
                        //    title: "编辑费用",
                        //    height: 400,
                        //    width: 500,
                        //    modal: true,
                        //    buttons: {
                        //        "取消": function () {
                        //            self.InitDialogDetail();
                        //            $(this).dialog("close")
                        //        }
                        //    }
                        //})
                        var type = trustFeeName.indexOf("Formula_Fee");
                        $("#dialog-FeeDetail .ant-drawer-mask").addClass("open");
                        $("#dialog-FeeDetail .ant-drawer-content-wrapper").css("height", "410px");
                        if (type > -1) $("#dialog-FeeDetail .ant-drawer-content-wrapper").css("height", "600px");
                    },

                    editClassStructure: function (BondId) {
                        var self = this;
                        self.editingBondId = BondId;
                        self.updateEachTrustBondLayerTitle = self.TrustBondName[BondId].name;
                        var executeParam = {
                            'SPName': "usp_GetEachTrustBondLayer", 'SQLParams': [
                                { 'Name': 'TrustId', 'Value': self.TrustID, 'DBType': 'int' },
                                { 'Name': 'BondId', 'Value': BondId, 'DBType': 'int' },
                                { 'Name': 'ReportingDate', 'Value': self.PeriodDetail.End.replace(new RegExp("-", "gm"), ""), 'DBType': 'string' }
                            ]
                        };
                        self.getSourceData(executeParam, function (res) {
                            self.ClassStructureLabels[0].value = res[0].TotalPrincipalRoundingRule;
                            self.editingBondModel[0] = res[0].TotalPrincipalRoundingRule;
                            self.ClassStructureLabels[1].value = res[0].PrincipalRoundingRule;
                            self.editingBondModel[1] = res[0].PrincipalRoundingRule;
                            self.ClassStructureLabels[2].value = res[0].PrincipalPrecision;
                            self.editingBondModel[2] = res[0].PrincipalPrecision;
                            self.ClassStructureLabels[3].value = res[0].TotalInterestRoundingRule;
                            self.editingBondModel[3] = res[0].TotalInterestRoundingRule;
                            self.ClassStructureLabels[4].value = res[0].InterestRoundingRule;
                            self.editingBondModel[4] = res[0].InterestRoundingRule;
                            self.ClassStructureLabels[5].value = res[0].InterestPrecision;
                            self.editingBondModel[5] = res[0].InterestPrecision;
                            self.ClassStructureLabels[6].value = res[0].PAIPrincipalPrecision;
                            self.editingBondModel[6] = res[0].PAIPrincipalPrecision;
                            self.ClassStructureLabels[7].value = res[0].PAIInterestPrecision;
                            self.editingBondModel[7] = res[0].PAIInterestPrecision;
                        });
                        $("#dialog-ClassStructureDetail .ant-drawer-mask").addClass("open");
                        $("#dialog-ClassStructureDetail .ant-drawer-content-wrapper").css("height", "410px");
                    },

                    editScenarios: function (s) {
                        var self = this
                        self.ScenarioDetail = s
                        //this.PeriodScenarioIndex = index;
                        $("#dialog-ScenarioDetail").dialog({
                            dialogClass: "no-close",
                            title: "编辑偿付情景",
                            height: 400,
                            width: 500,
                            modal: true,
                            buttons: {
                                "更新": function () {
                                    self.UpdateScenario_Full(s);
                                    $(this).dialog("close");
                                },
                                "删除": function () {
                                    self.RemoveScenario(s);
                                    $(this).dialog("close");
                                },
                                '取消': function () {
                                    self.editScenarioCancel(s);
                                    $(this).dialog("close");
                                }
                            }
                        })
                        //$('.Scenario-Toolbox-Empty, .Scenario-Toolbox').addClass('hidden');
                        //$('.Scenario-Toolbox[data-index="' + index + '"]').removeClass('hidden');
                    },
                    editScenarioCancel: function (scenario) {
                        this.InitDialogDetail();
                        if (scenario.ScenarioId == 0) {
                            this.PeriodDetail.Scenarios.remove(scenario);
                        }

                        $('.Scenario-Toolbox').addClass('hidden');
                        $('.Scenario-Toolbox-Empty').removeClass('hidden');
                    },
                    editEvent: function (index, isAddNew) {
                        var self = this;
                        this.EventDetail = (isAddNew) ? this.AllEvents[index]
                            : this.PeriodDetail.Events[index];
                        $("#dialog-EventDetail").dialog({
                            dialogClass: "no-close",
                            title: "编辑事件",
                            height: 400,
                            width: 500,
                            modal: true,
                            buttons: {
                                "确认": function () {
                                    var $dialog = $(this);
                                    self.UpdateEvent(function (newEventId) {
                                        if (isAddNew) {
                                            self.EventDetail.TrustEventId = newEventId;
                                            self.PeriodDetail.Events.push(self.EventDetail);
                                        }
                                        self.InitDialogDetail();
                                        $dialog.dialog("close");
                                    });
                                },
                                "取消": function () {
                                    self.InitDialogDetail();
                                    if (isAddNew) {
                                        //TODO: 把拖新进来的事件移除
                                    }

                                    $(this).dialog("close")
                                }
                            }
                        });
                    },
                    changeFee: function (evt) {
                        var self = this
                        if (evt.added) {
                            self.editFees(evt.added.element.ActionCode, null, 1);
                            //在editFees中已经增加了该元素，此处删除，避免重复增加
                            self.PeriodDetail.Fees.remove(evt.added.element);
                        }


                    },
                    changeEvent: function (evt) {
                        var self = this
                        if (evt.added) {
                            self.editEvent(2, 1);

                        }
                    },
                    changeScenior: function (evt) {
                    },
                    openScenior: function (scenior) {
                        var self = this;
                        var tid = common.getQueryString('trustId'),
                            sceniorName = scenior.ScenarioName,
                            isStructure = 1,
                            StartDate = self.PeriodDetail.Start.replace(/\-/g, ''),
                            EndDate = self.PeriodDetail.End,//.replace(/\-/g,''),
                            ScenarioId = scenior.ScenarioId
                        productPermissionState = 1,
                        queryStr = '/GoldenStandABS/www/components/PaymentSequence/PaymentSequenceSetting.html?tid=' + tid + '&productPermissionState=' + productPermissionState + '&isStructure=' + isStructure + '&ScenarioId=' + ScenarioId + '&StartDate=' + StartDate + '&EndDate=' + EndDate;
                        //tid=178&productPermissionState=1&isStructure=1&ScenarioId=59&StartDate=20160926&EndDate=20161025
                        GSdialog.open(sceniorName, queryStr, null, function () { }, 1100, 580)

                    },
                    //切换选择模板
                    changeLi: function ($event) {
                        var self = this;
                        var target = $event.currentTarget;
                        $(target).removeClass("active").addClass("active").siblings().removeClass("active");
                        if ($(target).val() == "1") {
                            $(target).parents(".changeTab").find(".FeeBase").show();
                            $(target).parents(".changeTab").find(".PeriodBase").hide();
                        } else {
                            $(target).parents(".changeTab").find(".FeeBase").hide();
                            $(target).parents(".changeTab").find(".PeriodBase").show();
                        }
                    },
                    //添加元素
                    AddElement: function (params, $event) {
                        var self = this;
                        var target = $event.currentTarget;
                        var value = params.Value;
                        $.each(self.FeeDetail.Parameters, function (i, v) {
                            if (v.ParameterInputType == 'assembly') {
                                var str = "";
                                if (v.ItemValue == '') {
                                    str += value;
                                    v.ItemValue = str;
                                } else {
                                    str += v.ItemValue + "#" + value;
                                    v.ItemValue = str
                                }
                            }
                        })
                        //添加方框
                        var tt = $(target).clone(true);
                        tt.css("width", "calc(23.6% - 15px)");
                        tt.appendTo($(target).parents(".changeTab").next().find(".DisplayArea .dis"));

                        //添加结果
                        var apst = $(target).parents(".changeTab").next().find(".resultArea .res").html();
                        apst += "<span class='xro'>" + tt.text() + "</span>";
                        $(target).parents(".changeTab").next().find(".resultArea .res").html(apst);
                    },
                    //添加运算符
                    AddOperator: function ($event) {
                        var self = this;
                        var target = $event.currentTarget;
                        var value = $(target).find("span").text();
                        $.each(self.FeeDetail.Parameters, function (i, v) {
                            if (v.ParameterInputType == 'assembly') {
                                var str = "";
                                if (v.ItemValue == '') {
                                    str += value;
                                    v.ItemValue = str;
                                } else {
                                    str += v.ItemValue + "#" + value;
                                    v.ItemValue = str
                                }
                            }
                        })
                        //添加方框
                        var tt = $(target).clone(true);
                        tt.css({ "min-width": "30px", "flex": "unset" });
                        tt.appendTo($(target).parents(".showArea").find(".DisplayArea .dis"));

                        //添加结果
                        var apst = $(target).parents(".showArea").find(".resultArea .res").html();
                        apst += "<span class='xro'>" + tt.find('span').text() + "</span>";
                        $(target).parents(".showArea").find(".resultArea .res").html(apst);
                    },
                    //添加数值
                    AddNumber: function ($event) {
                        var self = this;
                        var target = $event.currentTarget;
                        var index = $(".eidtbox:visible").index();
                        var value = $(target).find("span").text();
                        $.each(self.FeeDetail.Parameters, function (i, v) {
                            if (v.ParameterInputType == 'assembly') {
                                if (v.ItemValue == '') {
                                    v.ItemValue += value;
                                    //添加方框
                                    var tt = $(target).clone(true);
                                    tt.css({ "min-width": "30px", "flex": "unset" });
                                    tt.appendTo($(target).parents(".showArea").find(".DisplayArea .dis"));

                                    //添加结果
                                    var apst = $(target).parents(".showArea").find(".resultArea .res").html();
                                    apst += "<span class='xro'>" + tt.find('span').text() + "</span>";
                                    $(target).parents(".showArea").find(".resultArea .res").html(apst);
                                } else {
                                    if ($(".dis").eq(index).find("div:last").hasClass('Numbers')) {
                                        v.ItemValue += value;
                                        var vas = $(".dis").find("div:last").find("span").text();
                                        $(".dis").find("div:last").find("span").text(vas + value);
                                        var vass = $(".res").find(".xro:last").text();
                                        $(".res").find(".xro:last").text(vass + value)
                                    } else {
                                        v.ItemValue += "#" + value;
                                        //添加方框
                                        var tt = $(target).clone(true);
                                        tt.css({ "min-width": "30px", "flex": "unset" });
                                        tt.appendTo($(target).parents(".showArea").find(".DisplayArea .dis"));
                                        //添加结果
                                        var apst = $(target).parents(".showArea").find(".resultArea .res").html();
                                        apst += "<span class='xro'>" + tt.find('span').text() + "</span>";
                                        $(target).parents(".showArea").find(".resultArea .res").html(apst);
                                    }

                                }
                            }
                        })
                        
                    },
                    //添加舍入规则
                    Addstrings: function ($event) {
                        var self = this;
                        var target = $event.currentTarget;
                        var value = $(target).find("span").text();
                        $.each(self.FeeDetail.Parameters, function (i, v) {
                            if (v.ParameterInputType == 'assembly') {
                                var str = "";
                                if (v.ItemValue == '') {
                                    str += value;
                                    v.ItemValue = str;
                                } else {
                                    str += v.ItemValue + "#" + value;
                                    v.ItemValue = str
                                }
                            }
                        })
                        //添加方框
                        var tt = $(target).clone(true);
                        tt.css({ "min-width": "30px", "flex": "unset" });
                        tt.appendTo($(target).parents(".showArea").find(".DisplayArea .dis"));

                        //添加结果
                        var apst = $(target).parents(".showArea").find(".resultArea .res").html();
                        apst += "<span class='xro'>" + tt.find('span').text() + "</span>";
                        $(target).parents(".showArea").find(".resultArea .res").html(apst);
                    },
                    //返回千分位
                    ReturnT: function ($event) {
                        var self = this;
                        var target = $event.currentTarget;
                        var p = $(target).val();
                        p = p.replace(/,/g, "")
                        var res = p.replace(/\d+/, function (n) { // 先提取整数部分
                            return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                                return $1 + ",";
                            });
                        })
                        $(target).val(res);
                    },
                    //清除所有
                    clearArea: function ($event) {
                        var self = this;
                        var target = $event.currentTarget;
                        $.each(self.FeeDetail.Parameters, function (i, v) {
                            if (v.ParameterInputType == 'assembly') {
                                v.ItemValue = ""
                            }
                        })
                        //删除方框
                        $(target).parents(".DisplayArea").find('.dis').html('');

                        //删除结果
                        $(target).parents(".DisplayArea").next().find(".res").html('');
                    },
                    //回退
                    GoBack: function ($event) {
                        var self = this;
                        var target = $event.currentTarget;
                        var str = '';
                        $.each(self.FeeDetail.Parameters, function (i, v) {
                            if (v.ParameterInputType == 'assembly') {
                                var value = v.ItemValue.split("#").slice(0, -1).join("#")
                                v.ItemValue = value;
                                str = v.ItemValue;
                            }
                        })
                        //回退方框
                        var arry = str.split("#");
                        var FeeBase = self.FeeDataSources.FeeBase;
                        var PeriodBase = self.FeeDataSources.PeriodBase;
                        var html = "";
                        var strdom = ''
                        //分组找出元素,运算符和数值
                        $.each(arry, function (i, v) {
                            //数值
                            if (parseFloat(v.replace(/,/g, "")) == v.replace(/,/g, "")) {
                                html += "<div class='infonv Numbers'>" + "<span>" + v + "</span>" + "</div>";
                            } else {
                                if (v.length == 1) {//运算符
                                    html += '<div class="operators" style="min-width:30px;flex:unset">' + ' <span>' + v + '</span>' + '</div>'
                                } else if (v == 'Round' || v == 'RoundUp' || v == 'RoundDown') {
                                    html += '<div class="operators" style="width:100px;flex:unset">' + ' <span>' + v + '</span>' + '</div>'
                                } else {//元素
                                    $.each(FeeBase, function (j, k) {
                                        if (k.Value == v) {
                                            html += '<div class="elements" title="' + k.Title + '" values="' + k.Value + '" style="width:calc(23.6% - 15px)">' + '<span>' + k.Title + '</span>' + '</div>';
                                        }
                                    })

                                    $.each(PeriodBase, function (j, k) {
                                        if (k.Value == v) {
                                            html += '<div class="elements" title="' + k.Title + '" values="' + k.Value + '" style="width:calc(23.6% - 15px)">' + '<span>' + k.Title + '</span>' + '</div>';
                                        }
                                    })
                                }
                            }
                        })
                        $(target).parents(".DisplayArea").find('.dis').html('');
                        $(html).appendTo($(target).parents(".DisplayArea").find('.dis'));

                        //回退结果
                        $(target).parents(".DisplayArea").next().find(".res").html('');
                        $(strdom).appendTo($(target).parents(".DisplayArea").next().find(".res"));
                    }

                },
                mounted: function () {
                    var self = this;
                    var trustId = common.getQueryString('trustId');
                    if (!trustId || isNaN(trustId)) {
                        return;
                    }
                    this.TrustID = trustId;
                    this.LoadAllPeriods(function () {
                        self.LoadAllFees();
                        self.LoadAllEvents();
                    });
                    self.getTrustPeriod(function (response) {
                        self.initStartAndEndPeriod(response);
                    });
                    self.getCashFlowFeeModelFromFile();
                    //初始化TrustBond
                    var executeParam = {
                        'SPName': "usp_GetTrustBondNameByTrustId", 'SQLParams': [
                            { 'Name': 'TrustId', 'Value': self.TrustID, 'DBType': 'int' }
                        ]
                    };
                    self.getSourceData(executeParam, function (res) {
                        for (var resIndex = 0; resIndex < res.length; resIndex++)
                            self.TrustBondName.push({ 'name': res[resIndex].ItemValue, 'BondId': res[resIndex].TrustBondId });
                    });
                },
                beforeCreate: function () {

                },
                created: function () {

                },
                beforeMounted: function () {

                },

            });
        });
});
