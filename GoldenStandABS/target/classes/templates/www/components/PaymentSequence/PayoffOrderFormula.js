define(function (require) {
    var $ = require('jquery');
    var toast = require('toast');
    var GSDialog = require("gsAdminPages");
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var vue = require('Vue2');
    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var trustId = common.getQueryString("tid") ? common.getQueryString("tid") : "";
    window.vm = new vue({
        el: '#app',
        data: {
            subjects: [],//可选科目数据
            trustId: trustId,
            TableData: [],//公式列表数据
            str: [],//拼接的数据
            name: "",
            code: "",
            Ids: "",//修改name的id
            targetex: "",
            rename: "",
            amount: true,//互转金额显示
            condition: false,//互转条件显示
            newpage: '1'//显示保存还是更新方法 1保存 2更新
        },
        created: function () {
            var self = this;
            self.GetSubjects();
            self.GetTableData()
            $("#loading").hide()
        },
        methods: {
            GetSubjects: function () {//获取待选科目列表
                var self = this;
                var executeParam = {
                    'SPName': "TrustManagement.usp_GetAcionCodeByTrustId", 'SQLParams': [
                        { 'Name': 'trustId', 'Value': trustId, 'DBType': 'int' }
                    ]
                };
                common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    self.subjects = data;
                });
            },
            //获取表格数据
            GetTableData: function () {
                var self = this;
                var executeParam = {
                    'SPName': "TrustManagement.GetTrustFormularByTrustId", 'SQLParams': [
                        { 'Name': 'trustId', 'Value': trustId, 'DBType': 'int' }
                    ]
                };
                common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    self.TableData = data;
                });
            },
            //模糊查询
            search: function ($event) {
                var self = this;
                var target = $event.currentTarget;
                var value = $(target).val();
                if (value == "") {
                    $(".subjects .elements").show();
                } else {
                    $(".subjects .elements").hide();
                    $.each(self.subjects, function (i, v) {
                        if (v.Title.indexOf(value) != -1) {
                            $(".subjects .elements").eq(i).show()
                        }
                    })
                }

            },
            //添加元素
            AddElement: function (params, $event) {
                var self = this;
                var target = $event.currentTarget;
                var value = params.Value;
                if (typeof (self.str) == 'string') {
                    self.str = self.str.split("#");
                }
                self.str.push(value)
                console.log(self.str)
                //添加方框
                var tt = $(target).clone(true);
                tt.css("width", "calc(23.6% - 15px)");
                tt.appendTo($(".DisplayArea .dis"));

                //添加结果
                var apst = $(".resultArea .res").html();
                apst += "<span class='xro'>" + tt.text() + "</span>";
                $(".resultArea .res").html(apst);
            },
            //添加运算符
            AddOperator: function ($event) {
                var self = this;
                var target = $event.currentTarget;
                var value = $(target).find("span").text();
                if (typeof (self.str) == 'string') {
                    self.str = self.str.split("#");
                }
                self.str.push(value);
                console.log(self.str)
                //添加方框
                var tt = $(target).clone(true);
                tt.css({ "min-width": "30px", "flex": "unset" });
                tt.appendTo($(".DisplayArea .dis"));

                //添加结果
                var apst = $(".resultArea .res").html();
                apst += "<span class='xro'>" + tt.text() + "</span>";
                $(".resultArea .res").html(apst);
            },
            //添加数值
            AddNumber: function ($event) {
                var self = this;
                var target = $event.currentTarget;
                var value = $(target).find("span").text();
                if (typeof (self.str) == 'string') {
                    self.str = self.str.split("#");
                }
                if (self.str == '') {
                    self.str.push(value);
                    //添加方框
                    var tt = $(target).clone(true);
                    tt.css({ "min-width": "30px", "flex": "unset" });
                    tt.appendTo($(".DisplayArea .dis"));

                    //添加结果
                    var apst = $(".resultArea .res").html();
                    apst += "<span class='xro'>" + tt.text() + "</span>";
                    $(".resultArea .res").html(apst);
                } else {
                    if ($(".dis").find("div:last").hasClass('Numbers')) {
                        var vas = $(".dis").find("div:last").find("span").text();
                        //
                        self.str[self.str.length - 1] = vas + value;
                        //
                        $(".dis").find("div:last").find("span").text(vas + value);

                        var vass = $(".res").find(".xro:last").text();
                        $(".res").find(".xro:last").text(vass + value)
                    } else {
                        self.str.push(value);
                        //添加方框
                        var tt = $(target).clone(true);
                        tt.css({ "min-width": "30px", "flex": "unset" });
                        tt.appendTo($(".DisplayArea .dis"));

                        //添加结果
                        var apst = $(".resultArea .res").html();
                        apst += "<span class='xro'>" + tt.text() + "</span>";
                        $(".resultArea .res").html(apst);
                    }
                }
                console.log(self.str);
            },
            //切换表格
            changes: function (pas, $event) {
                var self = this;
                var pas = pas;
                var target = $event.currentTarget;
                $(target).addClass("active").siblings().removeClass("active");
                if (pas == "1") {
                    self.amount = true;
                    self.condition = false;
                } else {
                    self.amount = false;
                    self.condition = true;
                }
            },
            showbox: function () {
                var self = this;
                self.newpage = '1';
                //初始化
                self.rename = "";
                self.str = [];
                //删除方框
                $(".DisplayArea").find('.dis').html('');
                //删除结果
                $(".resultArea .res").html('');
                $("#DialogSOHO .ant-drawer-mask").addClass("open");
                $("#DialogSOHO .ant-drawer-content-wrapper").css("height", parseInt($("body").height() * 0.8) + "px");
            },
            closebox: function () {
                $("#DialogSOHO .ant-drawer-mask").removeClass("open");
                $("#DialogSOHO .ant-drawer-content-wrapper").css("height", "0px");
            },
            //添加舍入规则
            Addstrings: function ($event) {
                var self = this;
                var target = $event.currentTarget;
                var value = $(target).find("span").text();
                if (typeof (self.str) == 'string') {
                    self.str = self.str.split("#");
                }
                self.str.push(value);
                //添加方框
                var tt = $(target).clone(true);
                tt.css({ "min-width": "30px", "flex": "unset" });
                tt.appendTo($(".DisplayArea .dis"));

                //添加结果
                var apst = $(".resultArea .res").html();
                apst += "<span class='xro'>" + tt.text() + "</span>";
                $(".resultArea .res").html(apst);
            },
            //回退
            GoBack: function ($event) {
                var self = this;
                //回退方框
                if (typeof (self.str) == 'string') {
                    self.str = self.str.split("#");
                }
                self.str.pop()
                $(".DisplayArea").find('.dis').find("div:last").remove();
                $(".resultArea .res").find("span:last").remove();
            },
            //清除所有
            clearArea: function ($event) {
                var self = this;
                self.str =[];
                //删除方框
                $(".DisplayArea").find('.dis').html('');
                //删除结果
                $(".resultArea .res").html('');
            },
            //删除表格数据
            removeItem: function (items, id) {
                var self = this;
                GSDialog.HintWindowTF("是否删除该公式", function () {
                    self.TableData.remove(items);
                    var executeParam = {
                        'SPName': "TrustManagement.DeleteTrustFormularById", 'SQLParams': [
                            { 'Name': 'id', 'Value': id, 'DBType': 'int' }
                        ]
                    };
                    common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                        $.toast({ type: 'success', message: '删除成功',afterHidden: function () {
                            location.reload(true);
                        }})
                    });
                })

            },
            //检验公式是否合法
            TestFormula: function (string) {
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
                // 错误情况,等于符号在大于或者小于符号前面,或者俩个等于符号连续
                if (string.indexOf("=<") > -1 || string.indexOf("=>") > -1 || string.indexOf("==") > -1 || string.indexOf("<<") > -1 || string.indexOf(">>") > -1 || string.indexOf("><") > -1 || string.indexOf("<>") > -1) {
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
                if (/\([\+\-\*\/\<\>\=]/.test(string)) {
                    return false;
                }

                // 错误情况，)前面是运算符
                if (/[\+\-\*\/\<\>\=]\)/.test(string)) {
                    return false;
                }

                // 错误情况，(前面不是运算符
                if (/[^\+\-\*\/\<\>\=]\(/.test(string)) {
                    return false;
                }

                // 错误情况，)后面不是运算符
                if (/\)[^\+\-\*\/\<\>\=)]/.test(string)) {
                    return false;
                }
                //错误情况,运算符开头
                if (/^[+\-\*\/\<\>\=]/.test(string)) {
                    return false;
                }
                //错误情况,运算符结尾
                if (/[+\-\*\/\<\>\=]$/.test(string)) {
                    return false;
                }

                //校验关系   
                //数组 去除括号的部分
                $.each(arry, function (i, v) {
                    if (v == "(" || v == ")") {
                        arry1.remove(v);
                    }
                })
                var opx = []//存运算符
                //去除> < =
                arry = JSON.parse(JSON.stringify(arry1));

                $.each(arry, function (i, v) {
                    if (v == "=" || v == ">" || v == "<") {
                        opx = ['TC'];
                        arry1.remove(v);
                    }
                })
                //-> 剩下元素和运算符以及数值 
                arry = JSON.parse(JSON.stringify(arry1));

                $.each(arry, function (i, v) {
                    if (v == "+" || v == "-" || v == "*" || v == "/") {
                        opx.push(v);
                        arry1.remove(v);
                    }
                })

                arry = JSON.parse(JSON.stringify(arry1));
                //-> 剩下元素和数值 元素和数值的len-1 = 运算符的个数
                if (arry.length - 1 != opx.length) {
                    return false;
                }
                return true;
            },
            //编辑别名
            Edit: function (items, $event) {
                var self = this;
                var target = $event.currentTarget;
                self.Ids = items.Id;//公式ID
                self.rename = items.FormulaName;//公式别名
                self.code = items.FormulaCode;//公式名称
                self.str = items.FormulaValue;//公式value
                self.targetex = target;
                self.newpage = '2';//显示编辑方法
                //填充dom以及str
                var str = JSON.parse(JSON.stringify(self.str));
                //找到自定义公式
                var diyarry = [];
                var indiy = [];
                //去重
                var hash = [];
                var nexarry = [];
                $.each(self.subjects, function (i, v) {
                    if (hash.indexOf(v.Value) == -1) {
                            hash.push(v.Value);
                            nexarry.push(v)
                        }
                })
                self.subjects = nexarry;
                //
                $.each(self.subjects, function (i, v) {
                    if (v.Title.indexOf("自定义") > -1) {
                        diyarry.push(v.Value)
                    }
                })
                //diyarry 装有全部的自定义公式集合 indiy 拥有的自定义集合
                $.each(diyarry, function (j, k) {
                    if (str.indexOf(k) > -1) {
                        indiy.push(k);
                    }
                })
                $.each(indiy, function (q, o) {
                    str=str.replace(o, "DIYF");
                })
                //
                var b = str.split("#");
                var html = "";
                var strdom = ''
                var index = 0;
                $.each(b, function (j, q) {
                    if (q == "DIYF") {
                        b[j] = indiy[index];
                        index++;
                    }
                })
   
                //
                //分组找出元素,运算符和数值
                $.each(b, function (i, v) {
                    //数值
                    if (parseFloat(v) == v) {
                        html += "<div class='infonv Numbers'>" + "<span>" + v + "</span>" + "</div>";
                        strdom += "<span class='xro'>" + v + "</span>";
                    } else {
                        if (v.length == 1) {//运算符
                            html += '<div class="operators" style="min-width:30px;flex:unset">' + ' <span>' + v + '</span>' + '</div>'
                            strdom += "<span class='xro'>" + v + "</span>";
                        } else if (v == 'Round' || v == 'RoundUp' || v == 'RoundDown') {//舍入规则
                            html += '<div class="operators" style="width:100px;flex:unset">' + ' <span>' + v + '</span>' + '</div>'
                            strdom += "<span class='xro'>" + v + "</span>";
                        } else {
                            //元素
                            $.each(self.subjects, function (j, k) {
                                if (k.Value == v) {
                                    html += '<div class="elements" title="' + k.Title + '" values="' + k.Value + '" style="width:calc(23.6% - 15px)">' + '<span>' + k.Title + '</span>' + '</div>';
                                    strdom += "<span class='xro'>" + k.Title + "</span>";
                                }
                            })
                        }
                    }
                })
                //填充
                $(".DisplayArea").find('.dis').html('');;
                $(html).appendTo($(".DisplayArea").find('.dis'));

                $(".resultArea .res").html('');
                $(strdom).appendTo($(".resultArea .res"));

                $("#DialogSOHO .ant-drawer-mask").addClass("open");
                $("#DialogSOHO .ant-drawer-content-wrapper").css("height", parseInt($("body").height() * 0.8) + "px");
            },
            //保存
            savepage: function () {
                var self = this;
                if (self.str.length == 0) {
                    return false;
                }
                if (self.rename == "") {
                    $(".form-control").addClass("red-border");
                    return false
                } else {
                    $(".form-control").removeClass("red-border");
                }
                var tt = JSON.parse(JSON.stringify(self.str));
                if (typeof (tt) != "string") {
                    tt = tt.join("#")
                }
                    var executeParam = {
                        'SPName': "TrustManagement.usp_AddTrustFormular", 'SQLParams': [
                            { 'Name': 'trustId', 'Value': self.trustId, 'DBType': 'int' },
                        { 'Name': 'name', 'Value': self.rename, 'DBType': 'string' },
                            { 'Name': 'value', 'Value': tt, 'DBType': 'string' },
                            { 'Name': 'code', 'Value': $(".xro").text(), 'DBType': 'string' }
                        ]
                    };
                    common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                        $.toast({type: 'success', message: '保存成功', afterHidden: function () {
                                location.reload(true);
                        }})
                });
            },
            //更新
            Resave: function () {
                var self = this;
                if (self.str.length == 0) {
                    return false;
                }
                if (self.rename == "") {
                    $(".form-control").addClass("red-border");
                    return false
                } else {
                    $(".form-control").removeClass("red-border");
                }
                var tt = JSON.parse(JSON.stringify(self.str));
                if (typeof (tt) != "string") {
                    tt = tt.join("#")
        }
        var executeParam = {
                    'SPName': "TrustManagement.usp_UpdateTrustFormulaDisplayname", 'SQLParams': [
                        { 'Name': 'id', 'Value': self.Ids, 'DBType': 'int' },
                        { 'Name': 'name', 'Value': self.rename, 'DBType': 'string' },
                        { 'Name': 'value', 'Value': tt, 'DBType': 'string' },
                { 'Name': 'code', 'Value': $(".xro").text(), 'DBType': 'string' }
            ]
        };
        common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
            $.toast({type: 'success', message: '修改成功', afterHidden: function () {
                   location.reload(true);
            }})
        });
        }

        }
    })
})