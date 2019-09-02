

function RemoveColButtomSHClick(obj) {
    var $this = $(obj);
    if ($this.text().indexOf("显示") >= 0) {
        self.RemoveColButtomSH(true);
        $this.text("隐藏删除按钮");
    }
    else {
        self.RemoveColButtomSH(false);
        $this.text("显示删除按钮");
    }
}

function RemoveColButtomSH(show) {
    var sytles = document.CSSStyleSheet ? document.CSSStyleSheet : document.styleSheets;
    $.each(sytles, function (i, sheet) {
        if (sheet.href.indexOf("bootstrap.min.css") > -1) {
            var rs = sheet.cssRules ? sheet.cssRules : sheet.rules;
            $.each(rs, function (j, cssRule) {
                if (cssRule.selectorText && cssRule.selectorText.indexOf(".btn") > -1 && cssRule.selectorText.indexOf(".btn-remove") > -1) {
                    if (show == true) {
                        cssRule.style.display = "inline-block";
                    } else {
                        cssRule.style.display = "none";
                    }
                    return false;
                }
            });
            return false;
        }
    });
}

function commafyback(num) {
    var x = num.split(',');
    return parseFloat(x.join(""));
}

function format(num, cent) {
    if (cent == "") cent = 2;
    return (num.toFixed(cent) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
}
define(function (require) { 
    $ = require('jquery');
    var ui = require('jquery-ui');
    require('asyncbox');
    require('date_input');
    var ko = require('knockout');
    var komapping = require('knockout.mapping');
    ko.mapping = komapping;
    var common = require('common');
    var gsUtil = require('gsUtil');
    var GlobalVariable = require('globalVariable');
    require('app/productManage/interface/numberFormat_interface');
    var numberFormat = new NumberFormatUtils();
    require('app/productManage/interface/trustTransactionInput_interface');
    var trustId = common.getQueryString('tid');
    var GSDialog = require("gsAdminPages");
    var nowDate = "2016-01-25";
    var TrustTransactionInput = (function () {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";

        var dataModel = {
            DataList: []
            , UnDataList: []
        };
        var viewModel = {};
        function init() {
            initDatePlugins();
            if (trustId != 0) {
                initMetaData();
                initData();
                //$('#TrustTransactionInputDiv .form-control').change(function () {                 数据校验功能全部移至HTML页面中。
                //Validation.ValidControlValue($(this));
                //});
            }
            initTipAsset();
            AutoStartWork();
        }
        //导入文件自动计算值
        function AutoStartWork() {
            //当期资产回收款
            var value1 = $("#TrustPlanAccount_Interest_Collected").val().replace(/\"/g, "");
            var value2 = $("#TrustPlanAccount_Principal_Collected").val().replace(/\"/g, "");
            if (value1 != 0 || value2 != 0) {
                value1 = commafyback(value1);
                value2 = commafyback(value2);
                var new1 = accAdd(value1, value2)
                new1 = numberFormat.formatMoney(new1, "auto");
                $("#TrustPlanAccount_Total_Collected").val(new1);
                $("#TrustPlanAccount_Total_Collected").removeClass("warning");
            }
            //当期资产赎回款
            var value3 = $("#RedeemUnqualifiedAssets_ToInterest_Input").val().replace(/\"/g, "");
            var value4 = $("#RedeemUnqualifiedAssets_ToPrincipal_Input").val().replace(/\"/g, "");
            if (value3 != 0 || value4 != 0) {
                value3 = commafyback(value3);
                value4 = commafyback(value4);
                var new2 = accAdd(value3, value4)
                new2 = numberFormat.formatMoney(new2, "auto");
                $("#RedeemUnqualifiedAssets_Total_Input").val(new2);
                $("#RedeemUnqualifiedAssets_Total_Input").removeClass("warning");
            }
            //当期清仓回购款
            var value4 = $("#AssetBuyBack_ToInterest_Input").val().replace(/\"/g, "");
            var value5 = $("#AssetBuyBack_ToPrincipal_Input").val().replace(/\"/g, "");
            if (value4 != 0 || value5 != 0) {
                value4 = commafyback(value4);
                value5 = commafyback(value5);
                var new3 = accAdd(value4, value5)
                new3 = numberFormat.formatMoney(new3, "auto");
                $("#AssetBuyBack_Total_Input").val(new3);
                $("#AssetBuyBack_Total_Input").removeClass("warning");
            }
            //当期循环购买差额
            var value6 = $("#TopUpDifference_ToInterest_Input").val().replace(/\"/g, "");
            var value7 = $("#TopUpDifference_ToPrincipal_Input").val().replace(/\"/g, "");
            if (value6 != 0 || value7 != 0) {
                value6 = commafyback(value6);
                value7 = commafyback(value7);
                var new4 = accAdd(value6, value7)
                new4 = numberFormat.formatMoney(new4, "auto");
                $("#TopUpDifference_Total_Input").val(new4);
                $("#TopUpDifference_Total_Input").removeClass("warning");
            }
            //当期合格投资
            var value8 = $("#InvestmentIncome_ToInterest_Input").val().replace(/\"/g, "");
            var value9 = $("#InvestmentIncome_ToPrincipal_Input").val().replace(/\"/g, "");
            if (value8 != 0 || value9 != 0) {
                value8 = commafyback(value8);
                value9 = commafyback(value9);
                var new5= accAdd(value8, value9)
                new5= numberFormat.formatMoney(new5, "auto");
                $("#InvestmentIncome_Total_Input").val(new5);
                $("#InvestmentIncome_Total_Input").removeClass("warning");
            }
            //当期其他收入
            var value10 = $("#OtherIncome_ToInterest_Input").val().replace(/\"/g, "");
            var value11 = $("#OtherIncome_ToPrincipal_Input").val().replace(/\"/g, "");
            if (value10 != 0 || value11 != 0) {
                value10 = commafyback(value10);
                value11 = commafyback(value11);
                var new6= accAdd(value10, value11)
                new6 = numberFormat.formatMoney(new6, "auto");
                $("#OtherIncome_Total_Input").val(new6);
                $("#OtherIncome_Total_Input").removeClass("warning");
            }
        }
        //初始化金额提示
        function initTipAsset() {
            var inputTarget = $('#TrustTransactionInputTarget').find('input[type="text"]');
            $(inputTarget).each(function () {
                var inputObj = $(this);
                var tipDivObj = $(this).parent().parent().next().children();
                var tipObj = $(tipDivObj).children('.fieldtip');
                common.tipCHNums(inputObj, tipDivObj);
            });
            var inputTarget2 = $('#TrustTransactionInputTarget2').find('input[type="text"]');
            $(inputTarget2).each(function () {
                var inputObj = $(this);
                var tipDivObj = $(this).parent().parent().next().children();
                var tipObj = $(tipDivObj).children('.fieldtip');
                common.tipCHNums(inputObj, tipDivObj);
            });
            var inputTarget3 = $('#TrustTransactionInputTarget3').find('input[type="text"]');
            $(inputTarget3).each(function () {
                var inputObj = $(this);
                var tipDivObj = $(this).parent().parent().next().children();
                var tipObj = $(tipDivObj).children('.fieldtip');
                common.tipCHNums(inputObj, tipDivObj);
            });
            var inputTarget4 = $('#TrustTransactionInputTarget4').find('input[type="text"]');
            $(inputTarget4).each(function () {
                var inputObj = $(this);
                var tipDivObj = $(this).parent().parent().next().children();
                var tipObj = $(tipDivObj).children('.fieldtip');
                common.tipCHNums(inputObj, tipDivObj);
            });
            var inputTarget5 = $('#TrustTransactionInputTarget5').find('input[type="text"]');
            $(inputTarget5).each(function () {
                var inputObj = $(this);
                var tipDivObj = $(this).parent().parent().next().children();
                var tipObj = $(tipDivObj).children('.fieldtip');
                common.tipCHNums(inputObj, tipDivObj);
            });
            var inputTarget6 = $('#TrustTransactionInputTarget6').find('input[type="text"]');
            $(inputTarget6).each(function () {
                var inputObj = $(this);
                var tipDivObj = $(this).parent().parent().next().children();
                var tipObj = $(tipDivObj).children('.fieldtip');
                common.tipCHNum(inputObj, tipObj, tipDivObj);
            });
        }
        function initDatePlugins() {
            $("#TrustTransactionInputDiv").find('.date-plugins').date_input();
        }
        function initMetaData() {
            var list = getFilterMetaData();
            nowDate = list[0].OptionValue;
            $('#TransactionDateSpan').text(list[0].OptionText)
            if (list) {
                var html = '';//'<option value="all">所有</option>';
                //sortData(list, 'OptionValue');
                $.each(list, function (i, item) {
                    html += '<li attr="' + item.OptionValue + '">' + (i+1) + '. ' + item.OptionText + '</li>';
                });
                $('#TransactionDateUl').html(html);
            }
        }
        function sortData(datalist, column) {
            datalist = datalist.sort(function (b, a) {
                return a[column] - b[column];
            });
        }
        function getFilterMetaData() {
            var executeParam = {
                SPName: 'usp_GetTrustTransactionInputFilterMetaData', SQLParams: [
                    { Name: 'TrustId', value: trustId, DBType: 'string' }
                ]
            };
            return executeRemoteData(executeParam);
        }

        function accAdd(arg1, arg2) {
            var r1, r2, m, c;
            try {
                r1 = arg1.toString().split(".")[1].length;
            }
            catch (e) {
                r1 = 0;
            }
            try {
                r2 = arg2.toString().split(".")[1].length;
            }
            catch (e) {
                r2 = 0;
            }
            c = Math.abs(r1 - r2);
            m = Math.pow(10, Math.max(r1, r2));
            if (c > 0) {
                var cm = Math.pow(10, c);
                if (r1 > r2) {
                    arg1 = Number(arg1.toString().replace(".", ""));
                    arg2 = Number(arg2.toString().replace(".", "")) * cm;
                } else {
                    arg1 = Number(arg1.toString().replace(".", "")) * cm;
                    arg2 = Number(arg2.toString().replace(".", ""));
                }
            } else {
                arg1 = Number(arg1.toString().replace(".", ""));
                arg2 = Number(arg2.toString().replace(".", ""));
            }
            return (arg1 + arg2) / m;
        }

        //function accAdd(arg1, arg2) {


        //    //var sq1, sq2, m;
        //    //try {
        //    //    sq1 = arg1.toString().split(".")[1].length;
        //    //}
        //    //catch (e) {
        //    //    sq1 = 0;
        //    //}
        //    //try {
        //    //    sq2 = arg2.toString().split(".")[1].length;
        //    //}
        //    //catch (e) {
        //    //    sq2 = 0;
        //    //}
        //    //m = Math.pow(10, Math.max(arg1, arg2));
        //    //var result = (arg1 * m + arg2 * m) / m
        //    //return result
          
        //    var r1, r2, m, rz, rz2;
        //    try {
        //        r1 = parseFloat("0." + arg1.toString().split(".")[1]); //取得小数部分
        //        rz = parseFloat(arg1.toString().split(".")[0]);//整数部分
        //    } catch (e) { r1 = 0 }
        //    try {
        //        r2 = parseFloat("0." + arg2.toString().split(".")[1]);
        //        rz2 = parseFloat(arg2.toString().split(".")[0]);
        //    } catch (e) { r2 = 0 }
        //    var Result = r1 + rz + r2 + rz2;
        //    return Result
        //}
        function initData() {
            var listData = getSourceData();
            dataModel.DataList = [];
            dataModel.UnDataList = [];
            dataModel.typeone = [];
            dataModel.typetwo = [];
            dataModel.typethree = [];
            dataModel.typefour = [];
            dataModel.typefive = [];
            dataModel.typeSix = [];
            $.each(listData, function (i, v) {
                if (v.InputType == "Account") {
                    dataModel.typeone.push(v);
                }
                if (v.InputType == "Income") {
                    dataModel.typetwo.push(v);
                }
                if (v.InputType == "Accounttransfer") {
                    dataModel.typethree.push(v);
                }
                if (v.InputType == "AssetSituation") {
                    dataModel.typefour.push(v);
                }
                if (v.InputType == "TopUpSituation") {
                    dataModel.typefive.push(v);
                }
                if (v.InputType == "NextPrediction") {
                    dataModel.typeSix.push(v);
                }               
            })
            if (listData && listData.length > 0)
                $("#InputSource").val(listData[0].InputSource);
            if ($("#InputSource").val().length <= 0)
                // 将“招商证券”修改为空格
                $("#InputSource").val(" ");

            //var listNode = document.getElementById('TrustTransactionInputDiv'); 
            var listNode = document.getElementById('divDataList');
            for (var i = 0; i < listData.length; i++) {
                //数据源处理...
                if (listData[i].IsCompulsory || listData[i].IsHaveData)
                    dataModel.DataList.push(listData[i]);
                else
                    dataModel.UnDataList.push(listData[i]);
            }
            dataModel.DataList = [];
            dataModel.DataList = dataModel.typeone.concat(dataModel.typetwo);
            dataModel.DataList =dataModel.DataList.concat(dataModel.typethree);
            dataModel.DataList =dataModel.DataList.concat(dataModel.typefour);
            dataModel.DataList = dataModel.DataList.concat(dataModel.typefive);
            dataModel.DataList = dataModel.DataList.concat(dataModel.typeSix);
            ko.unapplyBindings($(listNode), false);
            //ko.unapplyBindings($("TrustTransactionInputTarget,#TrustTransactionInputTarget1"), false);
            //$("#TrustTransactionInputTarget").empty();
            
            $("#TrustTransactionInputTarget1").html($("#TrustTransactionInputTemplate1").html());
            $("#TrustTransactionInputTarget").html($("#TrustTransactionInputTemplate").html());
            $("#TrustTransactionInputTarget2").html($("#TrustTransactionInputTemplate").html());
            $("#TrustTransactionInputTarget3").html($("#TrustTransactionInputTemplate").html());
            $("#TrustTransactionInputTarget4").html($("#TrustTransactionInputTemplate").html());
            $("#TrustTransactionInputTarget5").html($("#TrustTransactionInputTemplate").html());
            $("#TrustTransactionInputTarget6").html($("#TrustTransactionInputTemplate").html());
            viewModel = ko.mapping.fromJS(dataModel);
            ko.applyBindings(viewModel, listNode);
            //使页面进入便展示循环购买情况
            if (decodeURI(escape(common.getQueryString('ActionDisplayName'))) && common.getQueryString('SessionId')) {
                $("#changeli").find("li").eq(4).addClass("li_active").siblings().removeClass("li_active");
                $(".form-panel.item>div").eq(4).show().siblings().hide();
            }
            
            //initDatePlugins();
            initTipAsset();
            var array = [];
            var idarray = [];
            for (var i = 0; i < $(".form-panel.item>div").length; i++) {
                var h = $(".form-panel.item>div").eq(i).find(">.col-12").height();
                array.push(h);
            }
            $(".form-panel.item>div").eq(4).css("height", array[4] + 50 + "px");
            $("#divDataList").on("click", "li", function () {
                var divlist = $(".form-panel.item>div");
                var index = $(this).index();
                $(this).addClass("li_active").siblings().removeClass("li_active");
                divlist.eq(index).css("height", array[index] + 50 + "px");
                divlist.eq(index).show().siblings().hide();
            })
            var $h1 = $(".divbox1").find(">.col-12").height();
            $(".divbox1").css("height", $h1 + 50 + "px");
            //
            $.each(dataModel.DataList, function (v, i) {
                idarray.push(i.Code);
            })
            for (var i = 0; i < idarray.length; i++) {
                $(".form-panel.item").find("input").eq(i).attr("id", idarray[i]);
            }
            $(".field-details").tooltip({});
            AutoStartWork()
            //one group
            $("#InterestAccount_OpeningBalance_Input").keyup(function () {
                var value = $(this).val();
                console.log(value);
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#PrincipalAccount_OpeningBalance_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value,value1);
               newN =numberFormat.formatMoney(newN, "auto")
               $("#TrustAccount_OpeningBalance_Input").val(newN);
            })
            $("#PrincipalAccount_OpeningBalance_Input").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#InterestAccount_OpeningBalance_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#TrustAccount_OpeningBalance_Input").val(newN);
            })
            $("#TrustAccount_OpeningBalance_Input").blur(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#InterestAccount_OpeningBalance_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var value2 = $("#PrincipalAccount_OpeningBalance_Input").val();
                value2 = value2.replace(/\"/g, "");
                value2 = commafyback(value2);
                if (accAdd(value1, value2) != value) {
                    $(this).addClass("warning");
                } else {
                    $(this).removeClass("warning");
                }
            })
            //two group
            $("#TrustPlanAccount_Interest_Collected").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#TrustPlanAccount_Principal_Collected").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#TrustPlanAccount_Total_Collected").val(newN);
            })
            $("#TrustPlanAccount_Principal_Collected").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#TrustPlanAccount_Interest_Collected").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#TrustPlanAccount_Total_Collected").val(newN);
            })
            $("#TrustPlanAccount_Total_Collected").blur(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#TrustPlanAccount_Principal_Collected").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var value2 = $("#TrustPlanAccount_Interest_Collected").val();
                value2 = value2.replace(/\"/g, "");
                value2 = commafyback(value2);
                console.log(value, value1, value2);
                if (accAdd(value2, value1) != value) {
                    $(this).addClass("warning");
                } else {
                    $(this).removeClass("warning");
                }
            })
            //three group
            $("#RedeemUnqualifiedAssets_ToInterest_Input").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#RedeemUnqualifiedAssets_ToPrincipal_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#RedeemUnqualifiedAssets_Total_Input").val(newN);
            })
            $("#RedeemUnqualifiedAssets_ToPrincipal_Input").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#RedeemUnqualifiedAssets_ToInterest_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#RedeemUnqualifiedAssets_Total_Input").val(newN);
            })
            $("#RedeemUnqualifiedAssets_Total_Input").blur(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#RedeemUnqualifiedAssets_ToInterest_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var value2 = $("#RedeemUnqualifiedAssets_ToPrincipal_Input").val();
                value2 = value2.replace(/\"/g, "");
                value2 = commafyback(value2);
                if (accAdd(value2, value1) != value) {
                    $(this).addClass("warning");
                } else {
                    $(this).removeClass("warning");
                }
            })
            //four group
            $("#AssetBuyBack_ToInterest_Input").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#AssetBuyBack_ToPrincipal_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#AssetBuyBack_Total_Input").val(newN);
            })
            $("#AssetBuyBack_ToPrincipal_Input").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#AssetBuyBack_ToInterest_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#AssetBuyBack_Total_Input").val(newN);
            })
            $("#AssetBuyBack_Total_Input").blur(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#AssetBuyBack_ToPrincipal_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var value2 = $("#AssetBuyBack_ToInterest_Input").val();
                value2 = value2.replace(/\"/g, "");
                value2 = commafyback(value2);
                console.log(value, value1, value2);
                if (accAdd(value2, value1) != value) {
                    $(this).addClass("warning");
                } else {
                    $(this).removeClass("warning");
                }
            })
            //five group
            $("#TopUpDifference_ToInterest_Input").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#TopUpDifference_ToPrincipal_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#TopUpDifference_Total_Input").val(newN);
            })
            $("#TopUpDifference_ToPrincipal_Input").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#TopUpDifference_ToInterest_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#TopUpDifference_Total_Input").val(newN);
            })
            $("#TopUpDifference_Total_Input").blur(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#TopUpDifference_ToInterest_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var value2 = $("#TopUpDifference_ToPrincipal_Input").val();
                value2 = value2.replace(/\"/g, "");
                value2 = commafyback(value2);
                console.log(value, value1, value2);
                if (accAdd(value2, value1) != value) {
                    $(this).addClass("warning");
                } else {
                    $(this).removeClass("warning");
                }
            })
            //six group
            $("#InvestmentIncome_ToInterest_Input").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#InvestmentIncome_ToPrincipal_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#InvestmentIncome_Total_Input").val(newN);
            })
            $("#InvestmentIncome_ToPrincipal_Input").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#InvestmentIncome_ToInterest_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#InvestmentIncome_Total_Input").val(newN);
            })
            $("#InvestmentIncome_Total_Input").blur(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#InvestmentIncome_ToInterest_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var value2 = $("#InvestmentIncome_ToPrincipal_Input").val();
                value2 = value2.replace(/\"/g, "");
                value2 = commafyback(value2);
                console.log(value, value1, value2);
                if (accAdd(value2, value1) != value) {
                    $(this).addClass("warning");
                } else {
                    $(this).removeClass("warning");
                }
            })
            //seven group
            $("#OtherIncome_ToInterest_Input").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#OtherIncome_ToPrincipal_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#OtherIncome_Total_Input").val(newN);
            })
            $("#OtherIncome_ToPrincipal_Input").keyup(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#OtherIncome_ToInterest_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var newN = accAdd(value, value1);
                newN = numberFormat.formatMoney(newN, "auto");
                $("#OtherIncome_Total_Input").val(newN);
            })
            $("#OtherIncome_Total_Input").blur(function () {
                var value = $(this).val();
                value = value.replace(/\"/g, "");
                value = commafyback(value);
                var value1 = $("#OtherIncome_ToInterest_Input").val();
                value1 = value1.replace(/\"/g, "");
                value1 = commafyback(value1);
                var value2 = $("#OtherIncome_ToPrincipal_Input").val();
                value2 = value2.replace(/\"/g, "");
                value2 = commafyback(value2);
                console.log(value, value1, value2);
                if (accAdd(value2, value1) != value) {
                    $(this).addClass("warning");
                } else {
                    $(this).removeClass("warning");
                }
            })
            $(".dataFormat").blur(dataFormat).trigger("blur");
        }
        ko.unapplyBindings = function ($node, remove) {
            // unbind events
            $node.find("*").each(function () {
                $(this).unbind();
            });
            // Remove KO subscriptions and references
            if (remove) {
                ko.removeNode($node[0]);
            } else {
                ko.cleanNode($node[0]);
            }
        };
        function getSourceData() {
            var executeParam = {
                SPName: 'usp_GetTrustTransactionInput', SQLParams: [
                    { Name: 'TrustId', value: trustId, DBType: 'int' },
                    { Name: 'TransactionDate', value: nowDate, DBType: 'string' },
                ]
            };
            return executeRemoteData(executeParam);
        }
        function executeRemoteData(executeParam) {
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var sourceData = [];

            $.ajax({
                cache: false,
                type: "GET",
                async: false,
                url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=commom',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                },
                error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); }
            });
            return sourceData;
        }
        function saveTransactionInputClick() {
       
            var haveError = false;
            $('#TrustTransactionInputDiv .form-control').each(function () {
                var $this = $(this);
                if (!Validation.ValidControlValue($this)) { haveError = true; }
            });
            if (haveError) return;

            var transactionDate = nowDate//$("#TransactionDateSpan").text();
            var inputSource = $("#InputSource").val();
            dataModel = ko.mapping.toJS(viewModel);
            var items = '<items>';
            var regexp = /,/g;
            console.log(dataModel.DataList);
            $.each(dataModel.DataList, function (i, v) {
                v.Amount = $(".dataFormat").eq(i).val();
                items += '<item>';
                items += '<Code>' + v.Code + '</Code>';
                items += '<Name>' + v.Name + '</Name>';
                items += '<Amount>' + v.Amount.toString().replace(regexp, '') + '</Amount>';
                items += '<ToPaid>' + (v.ToPaid ? v.ToPaid : false) + '</ToPaid>';
                items += '</item>';
            });
            items += '</items>';
            console.log(items);
            var executeParam = {
                SPName: 'usp_UpdateTrustTransactionInput', SQLParams: [
                    { Name: 'trustId', value: trustId, DBType: 'string' },
                    { Name: 'transactionDate', value: transactionDate, DBType: 'string' },
                    { Name: 'inputSource', value: inputSource, DBType: 'string' },
                    { Name: 'items', value: items, DBType: 'xml' }
                ]
            };
            var result = executeRemoteData(executeParam);
            if (result[0].Result) {
                
                //处理项目管理任务单状态

                if (decodeURI(escape(common.getQueryString('ActionDisplayName'))) && common.getQueryString('SessionId')) {
                    var executeParams = {
                        SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                            { Name: 'SessionId', value: common.getQueryString('SessionId'), DBType: 'string' },
                            { Name: 'ProcessActionName', value: decodeURI(escape(common.getQueryString('ActionDisplayName'))), DBType: 'string' }

                        ]
                    };
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                        GSDialog.HintWindow('保存成功！');
                    });

                } else {
                    GSDialog.HintWindow('保存成功！');
                }
            } else {
                GSDialog.HintWindow('数据提交保存时出现错误！');
            }
        }
        function layertest() {

        }
        function addTransaction(obj) {
            var pDom = $(obj).parent().prev().find("option:checked");
            if (pDom.length <= 0) return;
            var pIndex = pDom.attr("dataIndex");
            var item = viewModel.UnDataList()[pIndex];
            item.IsHaveData(true);
            viewModel.DataList.push(item);
            viewModel.UnDataList.remove(item);
        }
        function removeTransaction(obj) {
            var pIndex = $(obj).parent().parent().parent().attr("dataIndex");
            var item = viewModel.DataList()[pIndex];
            item.IsHaveData(false);
            viewModel.UnDataList.push(item);
            viewModel.DataList.remove(item);
        }
        return {
            Init: init,
            InitData: initData,
            RemoveTransaction: removeTransaction,
            AddTransaction: addTransaction,
            SaveTransactionInputClick: saveTransactionInputClick,
            Layertest: layertest
        }
    })();

    var Validation = (function () {
        var TrustMngmtRegxCollection = {
            int: /^([-]?[1-9]+\d*$|^0)?$/,
            //decimal: /^([-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?)?$/,
            decimal: /^[-]?(\d){1,3}((,\d{3})*|(\d)*)(\.\d+)?$/,
            date: /^((\d{4})-(\d{2})-(\d{2}))?$/,
            datetime: /^((\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}))?$/
        };
        function validControlValue(obj) {
            var $this = $(obj);
            var objValue = $this.val();
            var valids = $this.attr('data-valid');

            //无data-valid属性，不需要验证
            if (!valids || valids.length < 1) { return true; }

            //如果有必填要求，必填验证
            if (valids.indexOf('required') >= 0) {
                if (!objValue || objValue.length < 1) {
                    $this.addClass('red-border');
                    return false;
                } else {
                    $this.removeClass('red-border');
                }
            }
            //暂时只考虑data-valid只包含两个值： 必填和类型
            var dataType = valids.replace('required', '').toLocaleLowerCase().trim();

            //通过必填验证，做数据类型验证
            var regx = TrustMngmtRegxCollection[dataType];
            if (!regx) { return true; }

            if (!regx.test(objValue)) {
                $this.addClass('red-border');  
                return false;
            } else {
                $this.removeClass('red-border');
            }
            return true;
        }
        return { ValidControlValue: validControlValue }
    })();
    
    $(function () {
        TrustTransactionInput.Init();
        TrustTransactionInput.Layertest();
        
    });

    function dataFormat() {
        var $control = $(this);
        //var mf = new window.NumberFormatUtils(); 
        var str = $control.val().replace(/\s+/g, '');
        str = commafyback(str);
        $control.val(str);
        var validationResult = Validation.ValidControlValue($control);
        if ((!(/(^[0-9]+,)|(\.\.)/.test($control.val()))) && validationResult) {
            //var formatResult = mf.formatMoney($control.val(), "auto");
            var formatResult = numberFormat.formatMoney($control.val(), "auto");
            $control.val(formatResult);
        }
    }
    
    $(function () {
        RemoveColButtomSH(false);
        $('#TransactionDateSpan').click(function (e) {
            e.stopPropagation();
            $(this).siblings('#TransactionDateUl').toggle()
        })
        var $Li = $('#TransactionDateUl>li');
        $Li.click(function (e) {
            e.stopPropagation();
            $(this).parent().toggle();    
            nowDate = $(this).attr('attr');
            if ($(this).text().split(' ')[1] != $('#TransactionDateSpan').html()) {
                InitData()
            }
            $('#TransactionDateSpan').html($(this).text().split('.')[1]);
        })
        $(document).click(function () {
            $('#TransactionDateUl').hide()
        });
        //$(".dataFormat").keyup(function () {
        //    var value = $(this).val();
        //    if (value == "") { $(this).val() } else {
        //        value = commafyback($(this).val());
        //        value = numberFormat.formatMoney(value, "auto");
        //        console.log(value);
        //        $(this).val(value)
        //    }
           
        //})
    })

    return TrustTransactionInput;
});