

define(function (require) {
    var $ = require('jquery');
    //var ko = require('knockout');
    //var common = require('common');
    var ko = require('knockout');
    var komapping = require('knockout.mapping');
    ko.mapping = komapping;
    var viewTrustWizard = require('app/productManage/TrustManagement/TrustWizard/viewTrustWizard');

    // 注册我的方法
    //viewTrustWizard.registerMethods(TrustWaterFall);

    var TrustWaterFallModule = (function () {

        var viewModel = null;
        var wcfdata = [
            //{ Category: "TrustItem", ItemId: "", ItemCode: "TrustCode", ItemValue: "JD1001", ItemAliasValue: "产品代码", IsCompulsory: true, DataType: "txt", },
            //{ Category: "TrustItem", ItemId: "", ItemCode: "Trustname", ItemValue: "", ItemAliasValue: "信息披露频率", IsCompulsory: true, DataType: "drop", },
            //{ Category: "TrustItem", ItemId: "", ItemCode: "TrustCode", ItemValue: "京东金融", ItemAliasValue: "产品名称", IsCompulsory: true, DataType: "txt", },
            //{ Category: "TrustItem", ItemId: "", ItemCode: "TrustCode", ItemValue: "", ItemAliasValue: "支持循环结构", IsCompulsory: false, DataType: "bool", },
            //{ Category: "TrustWaterFall", ItemId: "", ItemCode: "TrustWaterFallCode", ItemValue: "20170212,10000,12%|20170312,10000,13%|20170412,10000,15%", ItemAliasValue: "信托现金流", iscompulsory: true, DataType: "Date", },
            //{ Category: "TrustWaterFall", ItemId: "", ItemCode: "TrustWaterFallCode", ItemValue: "20170212,,|20160712,10000,8%", ItemAliasValue: "信托现金流", IsCompulsory: true, DataType: "Date", }
        ];

        var itemidtemp = "";
        var itemcodetemp = "";
        var Categorytemp = "";
        var datatypetemp = "";
        var callbackdate = "";
        var PoolCloseDate = "";
        var CollectionDate = "";
        var datecout = "";

        var frequency = "";

        var wcfsavedata = [];

        var TrustWaterFalldata = { Specialplan: [] };

        var initArgs = function (data) {
            wcfdata = data;
        };

        function TrustWaterFalljson(obj) {
            //Specialplanname: "远东201600150420期", SpecialplanReceivablesdate: '201600150418', principal: "", interest: ""
            var temp = obj.ItemValue.split('|')
            Categorytemp = obj.Category;
            itemidtemp = obj.ItemId;
            itemcodetemp = obj.ItemCode;
            datatypetemp = obj.DataType;

            getcallbackdate();
            getqujian1callbackdate();
            getqujian2callbackdate();
            getfrequency();

            for (var i = 0; i < temp.length; i++) {

                var tempdate = temp[i].split(',');
                if (tempdate.length < 3)
                    continue;

                var json = {
                    Category: "TrustWaterFall",
                    itemid: obj.ItemId,
                    itemcode: obj.ItemCode,
                    Specialplanname: obj.ItemAliasValue,
                    SpecialplanReceivablesdate: TrustExtensionNameSpace.getWorkDate(tempdate[0]),
                    principal: tempdate[1],
                    interest: tempdate[2],
                    totle: tempdate.length <= 3 ? parseFloat(tempdate[1]) + parseFloat(tempdate[2]) : tempdate[3],
                    PoolCloseDate: tempdate.length > 4 ? tempdate[4] : "",
                    CollectionDate: tempdate.length > 5 ? tempdate[5] : "",
                    value: temp[i],
                    type: obj.DataType,
                    required: obj.IsCompulsory
                }
                callbackdate = GetDate(tempdate[0]);
                callbackdate.setMonth(callbackdate.getMonth());

                if (tempdate.length > 5) {
                    CollectionDate = GetDate(tempdate[5]);
                    CollectionDate.setMonth(CollectionDate.getMonth());
                }
                else {
                    CollectionDate.setMonth(CollectionDate.getMonth() + parseFloat(frequency) * temp.length);
                    // CollectionDate=setFormatMonth(CollectionDate,parseFloat(frequency) * temp.length);
                }

                if (tempdate.length > 4) {
                    PoolCloseDate = GetDate(tempdate[4]);
                    PoolCloseDate.setMonth(PoolCloseDate.getMonth());
                }
                else {
                    PoolCloseDate.setMonth(CollectionDate.getDate() + 1);
                    //PoolCloseDate=setFormatMonth(PoolCloseDate, parseFloat(frequency) + temp.length);
                }




                viewModel.Specialplan.push(ko.mapping.fromJS(json));
            }
        }

        var GetDate = function (datestr) {
            if (datestr != null && typeof datestr != "undefined")
                return new Date(datestr.split("-")[0], datestr.split("-")[1] - 1, datestr.split("-")[2])
            else
                return null;
        }

        var DateToString = function (date) {
            if (date == "Invalid Date") {
                return "";
            }
            var month = (date.getMonth() + 1).toString();
            var dom = date.getDate().toString();
            if (month.length == 1) month = "0" + month;
            if (dom.length == 1) dom = "0" + dom;
            return date.getFullYear() + "-" + month + "-" + dom;
        }

        var addSpecialplan = function () {
            getfrequency();
            if (viewModel.Specialplan().length == 0) {
                getcallbackdate();
                getqujian1callbackdate();
                getqujian2callbackdate();
            }
            else {
                callbackdate.setMonth(callbackdate.getMonth() + parseFloat(frequency));
                //PoolCloseDate.setDate(CollectionDate.getDate() + 1);
                PoolCloseDate = new Date(new Date(CollectionDate).setDate(CollectionDate.getDate() + 1));
                // CollectionDate.setMonth(CollectionDate.getMonth() + parseFloat(frequency));
                CollectionDate = setFormatMonth(CollectionDate, parseFloat(frequency));
            }
            var datestring = DateToString(new Date(new Date(CollectionDate).setDate(CollectionDate.getDate() + parseFloat(datecout))));
            var self = this;
            var json = {
                Category: "TrustWaterFall",
                itemid: itemidtemp,
                itemcode: itemcodetemp,
                Specialplanname: "",
                SpecialplanReceivablesdate: datestring == "" ? datestring : TrustExtensionNameSpace.getWorkDate(datestring),
                principal: "",
                interest: "",
                totle: "",
                PoolCloseDate: DateToString(PoolCloseDate),
                CollectionDate: DateToString(CollectionDate),
                value: "",
                type: datatypetemp,
                required: true
            }
            viewModel.Specialplan.push(ko.mapping.fromJS(json));

            callbackdate.setMonth(callbackdate.getMonth());
            PoolCloseDate.setMonth(PoolCloseDate.getMonth());
            CollectionDate.setMonth(CollectionDate.getMonth());

            dateSetType();
        }

        //修正JS指定日期加上整月后与Sql Server日期不一致情况；例如：2016-1-31 加上3个月，应该为2016-4-30日，但JS返回的结果却为2016-5-1日
        var setFormatMonth = function (obj, i) {
            //  callbackdate.setMonth(callbackdate.getMonth() + parseFloat(frequency));
            var temp = new Date(new Date(obj).setMonth(obj.getMonth() + parseFloat(i)));

            if (temp.getMonth() - obj.getMonth() > i) {
                return stringToDate(getFirstAndLastMonthDay(temp.getFullYear(), temp.getMonth() - 1, 1));//返回上个月最后一天
                // return new Date(temp.setDate(temp.getDate() - 1));
            }
            else {
                var lastday = getFirstAndLastMonthDay(obj.getFullYear(), obj.getMonth(), 0);
                if (lastday == obj.getDate()) {
                    return stringToDate(getFirstAndLastMonthDay(temp.getFullYear(), temp.getMonth(), 1));
                }
            }

            return temp;
        }


        function getFirstAndLastMonthDay(year, month, type) {
            var firstdate = year + '-' + month + '-01';
            var day = new Date(year, parseInt(month + 1), 0);
            var lastdate = year + '-' + parseInt(month + 1) + '-' + day.getDate();//获取当月最后一天日期  
            //给文本控件赋值。同下
            if (type == 1)
                return lastdate; ////返回当月最后一天日期
            else
                return day.getDate();//返回当月最后一天日期数
        }

        var stringToDate = function (string) {
            var matches;
            if (matches = string.match(/^(\d{4,4})-(\d{1,2})-(\d{2,2})$/)) {
                return new Date(matches[1], matches[2] - 1, matches[3]);
            } else {
                return null;
            };
        }

        //获得某月的最后一天  
        function getLastDay(year, month) {
            var new_year = year;    //取当前的年份          
            var new_month = month++;//取下一个月的第一天，方便计算（最后一天不固定）          
            if (month > 12) {
                new_month -= 12;        //月份减          
                new_year++;            //年份增          
            }
            var new_date = new Date(new_year, new_month, 1);                //取当年当月中的第一天          
            return (new Date(new_date.getTime() - 1000 * 60 * 60 * 24)).getDate();//获取当月最后一天日期          
        }


        //获取回收款转付日
        var getcallbackdate = function () {
            //回收款转付日
            callbackdate = TrustExtensionNameSpace.GetDateSetListByCode(2, "FundTransferDate")
            if (callbackdate == "")
                callbackdate = new Date();
            else
                callbackdate = GetDate(callbackdate);
        }

        //获取资产池封包日（基准日）
        var getqujian1callbackdate = function () {
            //回收款转付日
            PoolCloseDate = TrustExtensionNameSpace.GetDateSetListByCode(1, "PoolCloseDate")
            if (PoolCloseDate == "")
                PoolCloseDate = new Date();
            else
                PoolCloseDate = GetDate(PoolCloseDate);
        }
        //获取首次计算日
        var getqujian2callbackdate = function () {
            //回收款转付日
            CollectionDate = TrustExtensionNameSpace.GetDateSetListByCode(1, "CollectionDate")
            if (CollectionDate == "")
                CollectionDate = new Date();
            else
                CollectionDate = GetDate(CollectionDate);
        }


        //获取支付频率
        var getfrequency = function () {
            ////支付频率
            frequency = TrustExtensionNameSpace.GetDateSetListByCode(1, "RemittanceFrequency")
            if (frequency == "")
                frequency = 0;
            //回转间隔日
            datecout = TrustExtensionNameSpace.GetDateSetListByCode(2, 'FundTransferDate', 'DateCount')
            if (datecout == "")
                datecout = 0;
        }

        function dateSetType() {
            $("#TrustWaterFall").find('.date-plugins').date_input();
        }

        function removeSpecialplan(obj) {
            var $obj = $(obj);
            // if ($obj.hasClass('dataRequired')) { return }
            var index = $obj.attr('dataIndex');
            var oNew = viewModel.Specialplan()[index];
            viewModel.Specialplan.remove(oNew);

            console.log(viewModel.Specialplan().length)

            if (index == viewModel.Specialplan().length) {
                //回收款转付日
                if (index > 0) {
                    callbackdate = GetDate(viewModel.Specialplan()[index - 1].SpecialplanReceivablesdate());
                    callbackdate.setMonth(callbackdate.getMonth());
                }
                else {
                    callbackdate = new Date();
                }

                //资产池封包日（基准日）
                if (index > 0) {
                    PoolCloseDate = GetDate(viewModel.Specialplan()[index - 1].PoolCloseDate());
                    PoolCloseDate.setMonth(PoolCloseDate.getMonth());
                }
                else {
                    PoolCloseDate = new Date();
                }

                //首次计算日
                if (index > 0) {
                    CollectionDate = GetDate(viewModel.Specialplan()[index - 1].CollectionDate());
                    CollectionDate.setMonth(CollectionDate.getMonth());
                }
                else {
                    CollectionDate = new Date();
                }
            }

        }

        function viwModelBinding() {
            console.log(TrustWaterFalldata);
            var obj = eval(wcfdata);
            //回收款转付日
            //callbackdate = TrustExtensionNameSpace.GetDateSetListByCode(2, "FundTransferDate")
            //if (callbackdate == "")
            //    callbackdate = new Date();

            ////支付频率
            //frequency = TrustExtensionNameSpace.GetDateSetListByCode(1, "RemittanceFrequency")
            //if (frequency == "")
            //    frequency = 2;

            console.log("TrustWaterFalldata:" + TrustWaterFalldata);
            console.log(TrustWaterFalldata);

            var node = document.getElementById('TrustWaterFall');
            viewModel = ko.mapping.fromJS(TrustWaterFalldata);

            ko.applyBindings(viewModel, node);


            for (var i = 0; i < obj.length; i++) {
                var oNew = "";
                switch (obj[i].Category) {
                    case "TrustItem":

                        break;
                    case "TrustWaterFall":
                        TrustWaterFalljson(obj[i]);
                        break;
                }
            }


            //TrustWaterFalldata = viewModel;
        }

        function waterfalltotle(obj) {
            var ii = viewModel.Specialplan();

            var $obj = $(obj);
            var index = $obj.attr('dataIndex');
            var oNew = viewModel.Specialplan()[index];
            if (oNew.principal() != parseFloat(oNew.principal()) || oNew.interest() != parseFloat(oNew.interest()))
                return;
            oNew.totle(parseFloat(oNew.principal()) + parseFloat(oNew.interest()));
        }


        function preview() {
            var mm = TrustWaterFallModule.ReturnviewModel();
            var jsontemp = ko.mapping.toJSON(mm);
            var obj = eval('(' + jsontemp + ')');
            var print_tpl = '<div class="ItemBox"><h3 class="h3">{0}</h3><div class="ItemInner">{1}</div></div>';
            var tpl = "";

            $.each(obj.Specialplan, function (i, n) {

                tpl += "  <div class=\"ItemContent\">";
                tpl += "      <div class=\"ItemTitle\">收款日期：" + n.SpecialplanReceivablesdate + "</div>";
                tpl += "      <div class=\"Item\">";
                tpl += "          <label>本金</label>";
                tpl += "          <span>" + n.principal + "元</span>";
                tpl += "      </div>";
                tpl += "      <div class=\"Item\">";
                tpl += "         <label>利息</label>";
                tpl += "         <span>" + n.interest + "元</span>";
                tpl += "      </div>";
                tpl += "      <div class=\"Item\">";
                tpl += "         <label>合计</label>";
                tpl += "         <span>" + n.totle + "元</span>";
                tpl += "      </div>";
                tpl += "      <div class=\"Item\">";
                tpl += "         <label>收集期间</label>";
                tpl += "         <span>" + n.PoolCloseDate + "~" + n.CollectionDate + "</span>";
                tpl += "      </div>";

                tpl += "  </div>";
            })


            console.log(print_tpl.format("专项计划现金流", tpl));
            return print_tpl.format("专项计划现金流", tpl);
        }

        function ReturnviewModel() {
            return viewModel;
        }

        //日期期间显示格式化
        function Datequjian(obj1, obj2) {
            console.log(obj1() + "~" + obj2());
            return obj1() + "~" + obj2();
        }

        function Datequjianupdate(obj) {
            var text = $(obj).val();
            var index = $(obj).attr('dataIndex');
            var oNew = viewModel.Specialplan()[index];
            if (text.indexOf('~') > 0 || text.indexOf('～') > 0) {
                var temp = text.split('~');
                if (text.indexOf('~') < 0) {
                    temp = text.split('～');
                }

                if (temp.length == 2 && RQcheck(temp[0]) && RQcheck(temp[1])) {
                    oNew.PoolCloseDate($.trim(temp[0]));
                    oNew.CollectionDate($.trim(temp[1]));
                    $(obj).removeClass('red-border');
                    return true;
                }
            }
            $(obj).addClass('red-border');
            return false
        }

        var RQcheck = function (RQ) {
            var date = $.trim(RQ);
            var result = date.match(/^(\d{1,4})(-|\/|.)(\d{1,2})\2(\d{1,2})$/);

            if (result == null)
                return false;
            var d = new Date(result[1], result[3] - 1, result[4]);
            return (d.getFullYear() == result[1] && (d.getMonth() + 1) == result[3] && d.getDate() == result[4]);
        }

        //金额格式化显示
        function fmoney(s, n) {
            n = n > 0 && n <= 20 ? n : 2;
            // s = s.replace(",", "");
            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
            var l = s.split(".")[0].split("").reverse(),
            r = s.split(".")[1];
            t = "";
            for (i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
            }

            //  $(obj).removeEventListener("onkeyup", mouse, false);
            //$(obj).val(t.split("").reverse().join("") + "." + r);
            // $(obj).addEventListener("onkeyup", key, false);//按下键盘按键时触发事件
            return t.split("").reverse().join("") + "." + r;
        }

        //金额格式化还原
        function rmoney(s) {
            return parseFloat(s.replace(/[^\d\.-]/g, ""));
        }

        return {
            InitArgs: initArgs,
            viwModelBinding: viwModelBinding,
            AddItem: addSpecialplan,
            RemoveItem: removeSpecialplan,
            ReturnviewModel: ReturnviewModel,
            preview: preview,
            fmoney: fmoney,
            dateSetType: dateSetType,
            waterfalltotle: waterfalltotle,
            Datequjian: Datequjian,
            Datequjianupdate: Datequjianupdate
        };
    })();

    var TrustWaterFall = {
        // init 和 update 为必须
        init: function () {
            // 初始化绑定数据
            var data = this.getCategoryData('TrustWaterFall');
            // 这里用于绑定数据后赋值给全局变量
            TrustWaterFallModule.InitArgs(data);

            console.log(TrustWaterFallModule);
            TrustWaterFallModule.viwModelBinding();
            TrustWaterFallModule.dateSetType();
            //this.registControlsValueChange(':input');
        },
        // 上传数据 
        update: function () {
            // 将数据转换成字符串并拼接
            var self = this;
            var mm = TrustWaterFallModule.ReturnviewModel();
            var jsontemp = ko.mapping.toJSON(mm);
            var obj = eval('(' + jsontemp + ')');
            var tpl = [];
            var datastring = "";
            var Category = "TrustWaterFall";
            var itemcode = "";
            var itemid = "";
            $.each(obj.Specialplan, function (i, n) {
                // this指向问题
                Category = n.Category;
                itemcode = n.itemcode;
                itemid = n.itemid;
                datastring += n.SpecialplanReceivablesdate + "," + n.principal + "," + n.interest +
                    "," + n.totle + "," + n.PoolCloseDate + "," + n.CollectionDate + "|";
            })

            tpl.push(viewTrustWizard.api.getTemplate(Category, '', '', '', '', itemid, itemcode, datastring.substring(0, datastring.length - 1), "", "", ""));

            console.log(tpl);
            return tpl;
        },
        //预览
        preview: function () {
            return TrustWaterFallModule.preview();
        },
        validation: function () {
            // return this.validControls('#TrustWaterFall');
            var re = true;
            var list = $("#TrustWaterFall input[name='datequjian']")
            for (var i = 0; i < list.length; i++) {
                re = TrustWaterFallModule.Datequjianupdate(list[i]) & re;
            }

            return this.validControls('#TrustWaterFall input[data-valid]') & re;
        }
    }

    return TrustWaterFall;

});

