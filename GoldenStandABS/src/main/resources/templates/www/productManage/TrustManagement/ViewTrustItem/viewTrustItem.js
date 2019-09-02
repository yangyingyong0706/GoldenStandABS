var TrustItemModule;
var common;
var CheckStyle;
//新建产品校验TrustCode和TrustId
//把validControlValue暴露到window中去
CheckStyle = function (obj) {
    var $this = $(obj);
    //var objValue = $this.val().replace(/,/g, "");
    var id = $this.parent().attr("id");
    var objValue = $this.val();
    console.log(id)
    //var regOne = new RegExp("[^-_|0-9|A-Za-z]");
    //if (regOne.test(objValue)) {
    //    $this.val("请输入合法的证券代码")
    //    objValue = "请输入合法的证券代码"
    //}
    if ($this.hasClass("theInputBorderRed")) {
        $this.removeClass("theInputBorderRed")
    }
    var pattern = new RegExp("[^0-9a-zA-Z-_]");
    var testfirst = new RegExp("[_-]");
    if (testfirst.test(objValue.substring(0, 1))) {
        $this.val("首字母只能是数据或者字母");
        $this.addClass("theInputBorderRed");
        $this.blur();
        return false
    }
    if (pattern.test(objValue)) {
        $this.val("只能数字,字母,下划线,破折号的组合");
        $this.addClass("theInputBorderRed");
        $this.blur();
        return false
    }
}
function validControlValue(obj, type) {
    if (type == "date") {
        common.formatData(obj)
    }
    var $this = $(obj);
    var objValue = $this.val().replace(/,/g, "");
    var valids = $this.attr('data-valid');

    //无data-valid属性，不需要验证
    if (!valids || valids.length < 1) { return true; }

    //如果有必填要求，必填验证
    if (valids.indexOf('Required') >= 0) {
        if (!objValue || objValue.length < 1) {
            $this.addClass('red-border');
            return false;
        } else {
            $this.removeClass('red-border');
        }
    }
    //暂时只考虑data-valid只包含两个值： 必填和类型
    var dataType = valids.replace('Required', '').toLocaleLowerCase().trim();

    // Remote ajax 验证
    if (dataType === 'remote') {
        if ($this.data('remote-valid') === 'error') {
            $this.addClass('red-border');
            return false;
        } else {
            $this.removeClass('red-border');
        }
    }

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
//function stripscript(obj) {
//    var $this = $(obj);
//    var objValue = $this.val();
//    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
//    if (pattern.test(objValue)) {
//        GSDialog.HintWindow("输入不合法,不能输入特殊符号")
//        $this.blur();
//        return false
//    }
//}
var validTrustCodeRemote;
require(['app/productManage/TrustManagement/ViewTrustItem/viewTrustWizard'], function (viewTrustWizard) {
    validTrustCodeRemote = viewTrustWizard.validTrustCodeRemote;

});
define(function (require) {
    var $ = require('jquery');
    var anydialog = require('anyDialog');
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');require('gs/Kendo/kendoGridModel');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    common = require('common');
    var ko = require('knockout');
    var komapping = require('knockout.mapping');
    ko.mapping = komapping;
    require('asyncbox');
    var GSDialog = require("gsAdminPages")
    //require('jquery.shCircleLoader-min');
    var number = require('app/productManage/TrustManagement/Common/Scripts/format.number');
    var viewTrustWizard = require('app/productManage/TrustManagement/ViewTrustItem/viewTrustWizard');
    require('app/productManage/TrustManagement/ViewTrustItem/renderControl');
    require('knockout.validation.min');
    require('bootstrap');
    require("app/projectStage/js/project_interface");
    inputNull = common.inputNull
    var GlobalVariable = require('globalVariable');
    //var gsUtil = require('gsUtil');
    var webStorage = require('gs/webStorage');
    var AnotherEntry = common.getQueryStringSpecial('AnotherEntry');


    require('jquery.localizationTool');
    langx = {};
    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langx.info1 = 'Please enter the asset source code'
        langx.info2 = 'Asset codes can only input numbers, letters, and underscores.'
        langx.info3 = 'Please enter the name of the asset source'
        langx.codeFirst = 'Encoding ('
        langx.codeEnd = ') already exist, click OK to update the asset source?'
        langx.nameFirst = 'The name ('
        langx.nameEnd = '), it has already existed.'

    } else {
        langx.info1 = '请输入资产来源编码'
        langx.info2 = '资产编码只能输入数字、字母和下划线'
        langx.info3 = '请输入资产来源名称'
        langx.codeFirst = '编码('
        langx.codeEnd = ')已经存在，点击确定更新该资产来源？'
        langx.nameFirst = '名称('
        langx.nameEnd = ')已经存在。'

    }
    function getLangvti() {
        var langtli = {};
        var userLanguage = webStorage.getItem('userLanguage');


        if (userLanguage && userLanguage.indexOf('en') > -1) {
            langtli.Cancle = 'Cancle';
            langtli.Edit = 'Edit';
            langtli.AddOrganisation = 'Add Organisation';

        } else {
            langtli.Cancle = '取消';
            langtli.Edit = '编辑';
            langtli.AddOrganisation = '增加资产来源';

        }
        return langtli;
    }

    TrustItemModule = (function () {
        var lang = getLangvti();
        var viewModel = null;
        var wcfdata = [];
        var itemidtemp = "";
        var itemcodetemp = "";
        var Categorytemp = "";
        var datatypetemp = "";

        var wcfsavedata = [];

        var trustitemdata = {
            displayFields: [], optionalFields: [], BondFields: [], BondOptionalFields: [], ZXFields: [],
            logkeyup: function (place, event) {
                var event = window.event;
                number.checkNumberFunc({}, event, place.ItemValue);

            },
            formatp: function (p) {
                if (parseFloat(p) == p) {
                    var ret = number.convertNumberN(1, p);
                    return ret;
                }
                //else
                // return p == "" ? "0.00" : (p == null ? "0.00" : p);
            }
        };
        //loading
        if (document.readyState == "complete") //当页面加载状态 
        {
            $("#loading").fadeOut();
        }

        var initArgs = function (data) {
            wcfdata = data;
        };

        function Trustjson(obj) {
            var json = {
                Category: obj.Category,
                ItemId: obj.ItemId,
                ItemCode: obj.ItemCode,
                ItemAliasValue: obj.ItemAliasValue,
                ItemValue: obj.ItemValue,
                DataType: obj.DataType,
                IsCompulsory: obj.IsCompulsory,
                SPId: obj.SPId,
                SPCode: obj.SPCode,
                SPRItemCode: obj.SPRItemCode,
                TBId: obj.TBId,
                UnitOfMeasure: obj.UnitOfMeasure,
                Precise: obj.Precise
            };
            if (obj.DataType == "Select") {

            }
            else if (obj.DataType == "bool") {
                json.ItemValue = obj.ItemValue == 1 || obj.ItemValue.toLowerCase() == "true";
            }
            else if (obj.DataType == "Date") {
                if (obj.ItemValue == "") {
                    var myDate = new Date();
                    json.ItemValue = DateToString(myDate);
                }
                else {
                    json.ItemValue = DateToString(GetDate(obj.ItemValue));
                }
            }
            else if (obj.DataType == "Int") {
                if (obj.ItemValue == "") {
                    json.ItemValue = 0;
                }
            }
            return json;
        }


        var GetDate = function (datestr) {
            if (datestr != null && typeof datestr != "undefined")
                return new Date(datestr.split("-")[0], datestr.split("-")[1] - 1, datestr.split("-")[2])
            else
                return null;
        }

        var DateToString = function (date) {
            var month = (date.getMonth() + 1).toString();
            var dom = date.getDate().toString();
            if (month.length == 1) month = "0" + month;
            if (dom.length == 1) dom = "0" + dom;
            return date.getFullYear() + "-" + month + "-" + dom;
        }




        var addNew = function () {
            var index = document.getElementById('selOptionalFields').value;
            if (index != "" && index > -1) {
                var oNew = viewModel.optionalFields()[index];
                viewModel.optionalFields.remove(oNew);
                viewModel.displayFields.push(oNew);
                var fieldtipClass2 = $(".fieldtip")[2];
                var field1Class2 = $(".field1")[2];
                var mminputClass2 = $(".mminput")[2];
                common.tipCHNum($(mminputClass2), $(fieldtipClass2), $(field1Class2));
            }
            var fieldtipClass2 = $(".fieldtip")[2];
            var field1Class2 = $(".field1")[2];
            var mminputClass2 = $(".mminput")[2];
            common.tipCHNum($(mminputClass2), $(fieldtipClass2), $(field1Class2));
            dateSetType();
        }


        function removeLi(obj) {
            var $obj = $(obj);
            if ($obj.hasClass('dataRequired')) {
                return
            }
            var index = $obj.attr('dataIndex');
            var oNew = viewModel.displayFields()[index];
            viewModel.displayFields.remove(oNew);
            viewModel.optionalFields.push(oNew);
        }

        var addBond = function () {
            var index = document.getElementById('bondOptionalFields').value;
            if (index != "" && index > -1) {
                var oNew = viewModel.BondOptionalFields()[index];
                viewModel.BondOptionalFields.remove(oNew);
                viewModel.BondFields.push(oNew);
            }

            dateSetType();
        }

        function removeBond(obj) {
            var $obj = $(obj);
            if ($obj.hasClass('dataRequired')) {
                return
            }
            var index = $obj.attr('dataIndex');
            var oNew = viewModel.BondFields()[index];
            viewModel.BondFields.remove(oNew);
            viewModel.BondOptionalFields.push(oNew);
        }

        var addZXItem = function () {
            var json = {
                Category: "TrustInfoExtensionItem",
                ItemId: itemidtemp,
                ItemCode: itemcodetemp,
                ItemAliasValue: "",
                ItemValue: "",
                DataType: datatypetemp,
                IsCompulsory: true,
                SPId: "",
                SPCode: "",
                SPRItemCode: "",
                TBId: "",
                UnitOfMeasure: "",
                Precise: ""
            }

            viewModel.ZXFields.push(ko.mapping.fromJS(json));
        }

        function removeZXItem(obj) {
            var $obj = $(obj);

            var index = $obj.attr('dataIndex');
            var oNew = viewModel.ZXFields()[index];
            viewModel.ZXFields.remove(oNew);


        }

        function TrustInfoExtensionjson(obj) {
            var temp = obj.ItemValue.split('|')
            Categorytemp = obj.Category;
            itemidtemp = obj.ItemId;
            itemcodetemp = obj.ItemCode;
            datatypetemp = obj.DataType;
            if (temp == "")
                return;
            for (var i = 0; i < temp.length; i++) {
                var json = {
                    Category: "TrustInfoExtensionItem",
                    ItemId: obj.ItemId,
                    ItemCode: obj.ItemCode,
                    Specialplanname: obj.ItemAliasValue,
                    ItemValue: temp[i],
                    DataType: obj.DataType,
                    IsCompulsory: true,
                    SPId: "",
                    SPCode: "",
                    SPRItemCode: "",
                    TBId: "",
                    UnitOfMeasure: "",
                    Precise: ""
                }
                trustitemdata.ZXFields.push(ko.mapping.fromJS(json));
            }
        }

        function viwModelBinding() {
            var obj = eval(wcfdata);
            for (var i = 0; i < obj.length; i++) {

                var oNew = "";
                switch (obj[i].Category) {
                    case "TrustItem":
                        oNew = Trustjson(obj[i]);
                        if (obj[i].IsCompulsory.toLowerCase() == "true" || obj[i].ItemValue != "")
                            trustitemdata.displayFields.push(oNew);
                        else
                            trustitemdata.optionalFields.push(oNew);
                        break;
                        //case "TrustWaterFall":

                        //    break;
                    case "TrustInfoExtensionItem":
                        oNew = Trustjson(obj[i]);

                        if (obj[i].IsCompulsory.toLowerCase() == "true" || obj[i].ItemValue != "") {
                            if (obj[i].ItemCode.endWith("_T")) {
                                trustitemdata.BondFields.push(oNew);
                            }
                            else if (obj[i].ItemCode.endWith("_ZX")) {
                                TrustInfoExtensionjson(obj[i]);
                                // trustitemdata.ZXFields.push(oNew);
                            }
                            else {
                                trustitemdata.displayFields.push(oNew);
                            }
                        }
                        else {
                            if (obj[i].ItemCode.endWith("_T")) {
                                trustitemdata.BondOptionalFields.push(oNew);
                            }
                            else if (obj[i].ItemCode.endWith("_ZX")) {

                                TrustInfoExtensionjson(obj[i]);
                                // trustitemdata.ZXFields.push(oNew);
                            }
                            else {
                                trustitemdata.optionalFields.push(oNew);
                            }
                        }
                        break;
                }
            }
            var node = document.getElementById('TrustItemDiv');
            viewModel = ko.mapping.fromJS(trustitemdata);

            ko.applyBindings(viewModel, node);
            ismark = true;
            trustitemdata = viewModel;

            var $editTrustCodeBtn = $("#editTrustCodeBtn");
            if (AnotherEntry == '1') {
                $('select').prop("disabled", "disabled");
                $('input').prop("disabled", "disabled");
                $('.btn.btn-link').prop("disabled", "disabled");
                $.each($('.input-group-addon'), function (i, v) {
                    if ($(v).html() == '封包日资产池未偿本金余额' || $(v).html() == '发行规模(元)' || $(v).html() == '成立日资产池未偿本金余额') {
                        $('.input-group-addon').eq(i).next().removeAttr("disabled");
                    }
                })
                $("#next-step").html('提交');
            } else {
                $('select').removeAttr("disabled");
                $('input').removeAttr("disabled");
                $('.btn.btn-link').removeAttr("disabled");
                $("#next-step").html('下一步');
            }
            if (trustId == "0") {
                $("#trustcodeinput").removeAttr("disabled");
                //$editTrustCodeBtn.get(0).style.display = "none";
            } else {
                $("#trustcodeinput").attr("disabled", "disabled");
                //$editTrustCodeBtn.get(0).style.display = "block";
                $editTrustCodeBtn.toggle(function () {
                    $("#trustcodeinput").removeAttr("disabled");
                    $editTrustCodeBtn.html(lang.Cancle);
                }, function () {
                    $("#trustcodeinput").attr("disabled", "disabled");
                    $editTrustCodeBtn.html(lang.Edit);
                });
            }
            var organsiationManager = new OrgansiationManager();
            organsiationManager.init();
        }

        function dateSetType() {
            $("#TrustItemDiv").find('.date-plugins').date_input();
        }

        String.prototype.endWith = function (endStr) {
            var d = this.length - endStr.length;
            return (d >= 0 && this.lastIndexOf(endStr) == d)
        }

        //function ShowIndex(index) {
        //    return parseInt(index) + 1;
        //}

        function ReturnviewModel() {
            return viewModel;
        }


        //金额格式化显示
        function fmoney(obj, s, n) {
            if (s == "") {
                $(obj).val("0.00");
                setCursorPosition(obj, 1);
                return;
            }
            n = n > 0 && n <= 20 ? n : 2;
            s = s.replace(",", "");
            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
            var l = s.split(".")[0].split("").reverse(),
            r = s.split(".")[1];
            t = "";
            for (i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
            }


            $(obj).val(t.split("").reverse().join("") + "." + r);

            setCursorPosition(obj, 1);

        }

        /*
     * 设置输入域(input/textarea)光标的位置
     * @param {HTMLInputElement/HTMLTextAreaElement} elem
     * @param {Number} index
     */
        function setCursorPosition(elem, index) {
            var val = elem.value
            var len = val.length

            // 超过文本长度直接返回
            if (len < index) return
            setTimeout(function () {
                elem.focus()

                if (elem.setSelectionRange) { // 标准浏览器
                    elem.setSelectionRange(len - 3, len - 3)
                } else { // IE9-
                    var index1 = range.selectionStart;
                    GSDialog.HintWindow(index1)
                    var range = elem.createTextRange()
                    range.moveStart("character", -len)
                    range.moveEnd("character", -len)
                    range.moveStart("character", len - 3)
                    range.moveEnd("character", 0)
                    range.select()
                }
            }, 10)
        }

        //金额格式化还原
        function rmoney(s) {
            return parseFloat(s.replace(/[^\d\.-]/g, ""));
        }

        function flexbtn(roleObj) {
            if ($(roleObj).text() == "显示删除按钮") {
                $(".icon.icon-remove").css("display", "inline-block")
                $(roleObj).text("隐藏删除按钮")
            } else {
                $(".icon.icon-remove").css("display", "none")
                $(roleObj).text("显示删除按钮")
            }
        }

        return {
            initArgs: initArgs,
            viwModelBinding: viwModelBinding,
            AddItem: addNew,
            RemoveItem: removeLi,
            AddBond: addBond,
            RemoveBond: removeBond,
            ReturnviewModel: ReturnviewModel,
            fmoney: fmoney,
            dateSetType: dateSetType,
            addZXItem: addZXItem,
            removeZXItem: removeZXItem,
            Flexbtn: flexbtn,
        };
    })();

    function OrgansiationManager() {
        var lang = getLangvti();
        var self = this;
        self.$organisationSelect = null;
        self.isInit = false;

        function OrganisationViewModel() {
            var that = this;
            this.organisationData = {
                code: ko.observable('').extend({ required: { params: true, message: langx.info1 } })
                    .extend({ pattern: { params: '^[a-zA-Z0-9_-]*$', message: langx.info2 } }),
                name: ko.observable('').extend({ required: { params: true, message: langx.info3 } })
            };

            this.saveOrganisation = function (source, event) {
                var messages = that.organisationData.isValid();
                if (messages.length === 0) {
                    createOrganisation(that.organisationData, false);
                } else {
                    GSDialog.HintWindow(messages.join('，'), "", false);
                }
            }

            // 保持资产来源
            function createOrganisation(organisationData, override) {
                createWcfOrganisation(that.organisationData, override).done(function (response) {
                    var data = JSON.parse(response);
                    if (data.length > 0) {
                        if (data[0].Result === 'OK') {
                            setOrganisationSelect(that.organisationData.code(), that.organisationData.name());
                            $('#modal-close').trigger('click');
                        } else if (data[0].Result === 'CODEEXIST') {
                            GSDialog.HintWindowTF(langx.codeFirst + data[0].OrganisationCode + ', ' + data[0].OrganisationDesc + langx.codeEnd, function () {
                                createOrganisation(organisationData, true);
                            }, "", false)
                        } else if (data[0].Result === 'NAMEEXIST') {
                            GSDialog.HintWindow(langx.nameFirst + data[0].OrganisationCode + ', ' + data[0].OrganisationDesc + langx.nameEnd, "", false);
                        }
                    }
                }).fail(function (reason) {
                    GSDialog.HintWindow('error' + reason);
                });
            }
        };

        self.init = function () {
            // 打开新增资产窗口
            $('#createOrgisationBtn').on('click', function (event) {
                self.$organisationSelect = $(event.target).parent().parent('.autoLayout-plugins').find('select');
                console.log(self.$organisationSelect);
                if (self.$organisationSelect.length === 0) {
                    console.log('ERROR to get organisation selector!!');
                    console.log(self.$organisationSelect + "enter if");
                }

                if (!self.isInit) {
                    var knockoutValidationSettings = {
                        insertMessages: false,
                        decorateElement: true,
                        errorMessageClass: 'red-border',
                        errorElementClass: 'red-border',
                        errorClass: 'red-border',
                        decorateInputElement: true
                    };

                    var orgViewModel = new OrganisationViewModel();
                    ko.applyBindingsWithValidation(orgViewModel, document.getElementById('addOrganisation'), knockoutValidationSettings);
                    orgViewModel.organisationData.isValid = ko.validation.group(orgViewModel.organisationData);
                    self.isInit = true;
                }

                self.dialog = $.anyDialog({
                    width: 450,
                    height: 200,
                    title: lang.AddOrganisation,
                    html: $('#addOrganisation').show(),
                    onClose: function () {
                    }
                });
            });
        }

        // Updaget organsition select controller
        function setOrganisationSelect(code, name) {
            var $option = self.$organisationSelect.find('option[value=' + code + ']');
            if ($option.length > 0) {
                $option.html(name);
            } else {
                var $newOption = $("<option>").val(code).text(name);
                self.$organisationSelect.append($newOption);
            }

            self.$organisationSelect.val(code);
        }

        function getWcfCommon(param) {
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?appDomain=TrustManagement&resultType=commom&executeParams=" + encodeURIComponent(JSON.stringify(param));
            return $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "jsonp",
                crossDomain: true,
                contentType: "application/json;charset=utf-8"
            });
        }

        function createWcfOrganisation(orgData, override) {
            var sequenceNo = self.$organisationSelect.children().length;
            var itemXml = '<item>'
                            + '<CategoryCode>OrganisationName</CategoryCode>'
	                        + '<CodeDictionaryCode>' + orgData.code() + '</CodeDictionaryCode>'
	                        + '<Value>' + orgData.name() + '</Value>'
                            + '<SequenceNo>' + sequenceNo + '</SequenceNo>'
                        + '</item>';
            var orgParam = {
                "SPName": "usp_InsertDimOrganisation",
                "SQLParams": [
                    {
                        "Name": "Item",
                        "value": itemXml,
                        "DBType": "xml"
                    },
                    {
                        "Name": "Override",
                        "value": override,
                        "DBType": "bool"
                    }
                ]
            };

            return getWcfCommon(orgParam);
        }
    }

    function TrustItem() {
    };
    TrustItem.prototype = {
        // init 和 update 为必须
        init: function () {
            // 初始化绑定数据
            var data = this.getCategoryData('TrustItem');


            var data1 = this.getCategoryData('TrustInfoExtensionItem');



            Array.prototype.push.apply(data, data1);

            // 这里用于绑定数据后赋值给全局变量

            //$.each(data, function (i,n) {
            //    if (n.ItemCode == 'EstablishmentDatePoolBalance') {
            //        n.IsCompulsory = "True";
            //        n.ItemValue = 0.0;
            //    }
            //})
            TrustItemModule.initArgs(data);
            TrustItemModule.viwModelBinding();
            TrustItemModule.dateSetType();
            //this.registControlsValueChange(':input');

            //金额输入框和提示框以及所在div
            var tipDivObj = $('.field1')[0];
            var inputObj = $('.mminput')[0];
            common.tipCHNums($(inputObj), $(tipDivObj));
            var fieldtipClass = $(".field1")[1];
            var mminputClass = $(".mminput")[1];
            console.log(mminputClass)
            common.tipCHNums($(mminputClass), $(fieldtipClass));
            var fieldtipClass2 = $(".field1")[2];
            var mminputClass2 = $(".mminput")[2];
            common.tipCHNums($(mminputClass2), $(fieldtipClass2));


            var Orgheight = $(document).height();
            var Orgwidth = $(document).width();
            function showMask(Orgheight, Orgwidth) {
                $("#mask").css("height", Orgheight);
                $("#mask").css("width", Orgwidth);
                $("#mask").show();
            }
            //隐藏遮罩层  
            function hideMask() {
                $("#mask").hide();
            }
            productPermissionState = common.getQueryString('productPermissionState');
            if (productPermissionState == 2) {
                showMask(Orgheight, Orgwidth);
                $(window).resize(function () {
                    var height = $(document).height();
                    var width = $(document).width();
                    showMask(height, width);
                    //hideMask();
                })

            } else {
                hideMask();

                $("[data-toggle='tooltip']").tooltip({});
            }
        },
        // 上传数据 
        update: function () {
            // 将数据转换成字符串并拼接

            var self = this;
            var mm = TrustItemModule.ReturnviewModel();
            var jsontemp = ko.mapping.toJSON(mm);

            var obj = eval('(' + jsontemp + ')');
            var tpl = [];
            var datastring = "";
            var Category = "TrustInfoExtensionItem";
            var itemcode = "";
            var itemid = "";
            var spid = "";
            var spcode = "";
            var spritemcode = "";
            var TBId = "";
            var DataType = "";
            var UnitOfMeasure = "";
            var Precise = "";


            $.each(obj.displayFields, function (i, n) {
                // this指向问题
                //  tpl += self.template.format(n.Category, n.SPId, n.SPCode, n.SPRItemCode, n.TBId, n.ItemId, n.ItemCode, n.ItemValue);
                var objtemp = viewTrustWizard.api.getTemplate(n.Category, n.SPId, n.SPCode, n.SPRItemCode, n.TBId, n.ItemId, n.ItemCode, n.ItemValue, n.DataType, n.UnitOfMeasure, n.Precise);
                tpl.push(objtemp);
            })

            $.each(obj.BondFields, function (i, n) {
                // this指向问题
                //  tpl += self.template.format(n.Category, n.SPId, n.SPCode, n.SPRItemCode, n.TBId, n.ItemId, n.ItemCode, n.ItemValue);
                var objtemp = viewTrustWizard.api.getTemplate(n.Category, n.SPId, n.SPCode, n.SPRItemCode, n.TBId, n.ItemId, n.ItemCode, n.ItemValue, n.DataType, n.UnitOfMeasure, n.Precise);
                tpl.push(objtemp);
            })

            var datastring = '';
            $.each(obj.ZXFields, function (i, n) {
                // this指向问题
                //  tpl += self.template.format(n.Category, n.SPId, n.SPCode, n.SPRItemCode, n.TBId, n.ItemId, n.ItemCode, n.ItemValue);

                Category = n.Category;
                itemcode = n.ItemCode;
                itemid = n.ItemId;
                spid = n.SPId;
                spcode = n.SPCode;
                spritemcode = n.SPRItemCode;
                TBId = n.TBId;
                DataType = n.DataType;
                UnitOfMeasure = n.UnitOfMeasure;
                Precise = n.Precise;
                datastring += n.ItemValue + "|";
            })
            var objtemp = viewTrustWizard.api.getTemplate(Category, spid, spcode, spritemcode, TBId, itemid, itemcode, datastring.substring(0, datastring.length - 1), DataType, UnitOfMeasure, Precise);
            tpl.push(objtemp);

            return tpl;
        },
        validation: function () {
            // return this.validControls('#TrustItemDiv');
            return this.validControls('#TrustItemDiv input[data-valid]');
        }
    }


    $(function () {
        var webStorage = require('gs/webStorage');
        $('#selectLanguageDropdown_vti').localizationTool({
            'defaultLanguage': 'zh_CN', // this is the language that the server is sending anyway
            'ignoreUnmatchedSelectors': true,
            'showFlag': true,
            'showCountry': false,
            'showLanguage': true,
            'onLanguageSelected': function (languageCode) {
                /*
                 * When the user translates we set the cookie
                 */
                webStorage.setItem('userLanguage', languageCode);
                return true;
            },

            /* 
             * Translate the strings that appear in all the pages below
             */
            'strings': {

                'class:vti_ProductInformation': {
                    'en_GB': 'Product Information'
                },
                'class:vti_Edit': {
                    'en_GB': 'Edit'
                },
                'class:vti_ProductCode': {
                    'en_GB': 'Product Code'
                },
                'class:vti_Add': {
                    'en_GB': 'Add'
                },
                'class:vti_Next': {
                    'en_GB': 'Next'
                },
                'class:vti_OrganisationCode': {
                    'en_GB': 'Code of Organisation'
                },
                'class:vti_OrganisationName': {
                    'en_GB': 'Name of Organisation'
                },
                'class:vti_Confirm': {
                    'en_GB': 'Confirm'
                }

            }
        });


        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_vti').localizationTool('translate', userLanguage);
        }
        $('body').show();
    });

    var trustItemObj = new TrustItem();
    viewTrustWizard.registerMethods(trustItemObj);

    viewTrustWizard.init();

    return trustItemObj

});

