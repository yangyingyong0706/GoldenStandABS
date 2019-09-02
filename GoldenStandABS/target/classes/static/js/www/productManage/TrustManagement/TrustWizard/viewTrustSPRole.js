/// <reference path="../Scripts/knockout-3.4.0.js" />
/// <reference path="../Scripts/knockout.mapping-latest.js" />
/// <reference path="../Scripts/jquery-1.7.2.min.js" />
/// <reference path="viewTrustWizard.js" />

var m_viewTrustSPRole = null;

function getViewTrustWizard()
{
    return require('app/productManage/TrustManagement/TrustWizard/viewTrustSPRole');
}

function InitSPRoleJson(sourceData) {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().InitSPRoleJson(sourceData);
}

function dataBinding(node) {
    if (m_viewTrustSPRole == null) {
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().dataBinding(node);
};
//先找到相应的INDEX 再对其进行添加
function addNew(obj) {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().addNew(obj);
}

function addNewEx(obj) {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().addNewEx();
}

function addNewRole() {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().addNewRole();
}

function addNewRoleEx() {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().addNewRoleEx();
}

function deleteField(fObj) {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().deleteField(fObj);
}

function deleteFieldEx(fObj) {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().deleteFieldEx(fObj);
}

function deleteSPRole(roleObj) {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().deleteSPRole(roleObj);

}

function deleteSPRoleEx(roleObj) {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().deleteSPRoleEx(roleObj);

}

function update() {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().update();

}

function showReturn() {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().showReturn();
}

function configSequence() {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().configSequence();
}

function preview() {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().preview();
}

function isMenuClick(b) {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().isMenuClick(b);
}

function titleOnClick(titleObj) {
    if(m_viewTrustSPRole == null){
        m_viewTrustSPRole = getViewTrustWizard();
    }
    m_viewTrustSPRole.trustSPRoleModule().titleOnClick(titleObj);
}


define(function (require) {
    var $ = require('jquery');
    //var ko = require('knockout-old');
    var common = require('common');
    var ko = require('knockout');
    var komapping = require('knockout.mapping');
    ko.mapping = komapping;
    var viewTrustWizard = require('app/productManage/TrustManagement/TrustWizard/viewTrustWizard');
    require('asyncbox');
    //viewTrustWizard.registerMethods(TrustSPElement);


    var TrustSPRoleModule = (function () {

        var dealStructureModel;
        var data = {};
        //暂停{7F3374F7-CE21-4033-99B9-D47FAAC89869}
        //var defaultSPTypeId = "";
        var accountItemCodeArray = [
            "TrusteeBank",
            "ScrutinyBank",
            "TrusteeRegistrationPaymentAgent",
            "ScrutinyAccount",
            "TrusteeAccount",
            "ManagementFeeAccount",
            "AssetProviderServiceFeeAccount",
            "TrusteeFeeAccount",
            "ScrutinyFeeAccount"
        ];

        var InitSPRoleJson = function (sourceData) {
            var sproles = viewTrustWizard.api.getCategoryData("ServiceProviderRoleType");
            var sproleitems = viewTrustWizard.api.getCategoryData("TrustServiceProviderItem");
            var optionalsproleitems = viewTrustWizard.api.getCategoryData("TrustServiceProviderItemDefault");

            var optionalsproleitemsEx1 = [
               "FirstContact",
               "Phone",
               "Fax",
               "Email",
               "OfficeAddress"
            ];
            var optionalsproleitemsEx2 = [
               "NameofAccount",
               "BankName",
               "AccountNo",
               "BigVolumeAccountNo",
               "Fee",
               "FeeBaseMethod",
               "InterestDaysPerYear",
               "InterestDaysCountRule"
            ];

            var sprolesArray = new Array();
            var optionalsprolesArray = new Array();

            $.each(sproles, function (n, sprole) {
                var role = new Object();
                role.Title = sprole.ItemAliasValue;
                role.SPRItemCode = sprole.SPRItemCode;
                role.SPCode = sprole.SPCode;
                //暂停{7F3374F7-CE21-4033-99B9-D47FAAC89869}
                //role.SPId = defaultSPTypeId;
                role.SPId = '';

                var optionalFields = [];
                var displayFields = [];
                var curLibiaryItemCodes = [];
                if ($.inArray(role.SPRItemCode, accountItemCodeArray) >= 0)
                    curLibiaryItemCodes = optionalsproleitemsEx2;
                else
                    curLibiaryItemCodes = optionalsproleitemsEx1;

                $.each(optionalsproleitems, function (a, roleItem) {
                    if ($.inArray(roleItem.ItemCode, curLibiaryItemCodes) >= 0) {
                        var hasroleItems = $.grep(sproleitems, function (item) {
                            return item.SPRItemCode == sprole.SPRItemCode && item.ItemCode == roleItem.ItemCode;
                        });
                        if (hasroleItems.length > 0) {
                            var sproleitem = new Object();

                            sproleitem.FieldTitle = hasroleItems[0].ItemAliasValue;
                            sproleitem.ItemValue = hasroleItems[0].ItemValue;
                            sproleitem.ItemCode = hasroleItems[0].ItemCode;
                            sproleitem.ItemId = hasroleItems[0].ItemId;

                            sproleitem.IsCompulsory = hasroleItems[0].IsCompulsory;
                            sproleitem.DataType = hasroleItems[0].DataType;
                            sproleitem.UnitOfMeasure = hasroleItems[0].UnitOfMeasure;
                            sproleitem.Precise = hasroleItems[0].Precise;

                            if (hasroleItems[0].ItemValue != null && hasroleItems[0].ItemValue != "") {
                                role.SPCode = hasroleItems[0].SPCode;
                                displayFields.push(sproleitem);
                            }
                            else if (hasroleItems[0].IsCompulsory == "True") {
                                displayFields.push(sproleitem);
                            }
                            else {
                                optionalFields.push(sproleitem);
                            }
                        }
                        else {
                            var defaultoption = new Object();
                            defaultoption.FieldTitle = roleItem.ItemAliasValue;
                            defaultoption.ItemValue = roleItem.ItemValue;
                            defaultoption.IsCompulsory = roleItem.IsCompulsory;
                            defaultoption.DataType = roleItem.DataType;
                            defaultoption.ItemCode = roleItem.ItemCode;
                            defaultoption.ItemId = roleItem.ItemId;
                            defaultoption.UnitOfMeasure = roleItem.UnitOfMeasure;
                            defaultoption.Precise = roleItem.Precise;
                            optionalFields.push(defaultoption);
                        }
                    }
                });
                role.OptionalFields = optionalFields;
                role.DisplayFields = displayFields;


                //var trustServiceProviderItems = TrustInfo['TrustServiceProviderItem'] || [];
                var trustServiceProviderItems = viewTrustWizard.api.getCategoryData("TrustServiceProviderItem");

                var sprolehasitems = $.grep(trustServiceProviderItems, function (item) {
                    return item.SPRItemCode == sprole.SPRItemCode && item.ItemValue != "";
                });
                if (sprole.IsCompulsory == "True") {
                    role.IsCompulsory = true;
                    sprolesArray.push(role);
                }
                else if (sprolehasitems.length > 0) {
                    role.IsCompulsory = false;
                    sprolesArray.push(role);
                }
                else {
                    role.IsCompulsory = false;
                    optionalsprolesArray.push(role);
                }
            });
            //暂停{7F3374F7-CE21-4033-99B9-D47FAAC89869}
            //data.ServiceProviders = spsArray;
            data.ServiceProviderRoles = sprolesArray;
            data.ServiceProviderRolesEx = [];
            data.OptionalServiceProviderRoles = optionalsprolesArray;
            data.OptionalServiceProviderRolesEx = [];


            //console.log("lllll");
            //console.log(data.OptionalServiceProviderRoles);
            //console.log(data.ServiceProviderRoles);

            data.OptionalServiceProviderRoles = filterTmp(data.OptionalServiceProviderRoles, data.OptionalServiceProviderRolesEx);
            //console.log(data.OptionalServiceProviderRoles);
            //console.log(data.OptionalServiceProviderRolesEx);

            data.ServiceProviderRoles = filterTmp(data.ServiceProviderRoles, data.ServiceProviderRolesEx);
            //console.log(data.ServiceProviderRoles);
            //console.log(data.ServiceProviderRolesEx);

            function filterTmp(sourceArray, array1) {
                var tmpArray = [];
                $.each(sourceArray, function (i, n) {
                    if ($.inArray(n.SPRItemCode, accountItemCodeArray) >= 0)
                        array1.push(n);
                    else
                        tmpArray.push(n);
                });
                return tmpArray;
            }
        }

        var dataBinding = function (node) {
            dealStructureModel = ko.mapping.fromJS(data);
            ko.applyBindings(dealStructureModel, node);
        };
        //先找到相应的INDEX 再对其进行添加
        var addNew = function (obj) {
            var pre = $(obj).parent().prev().find("#selOptionalFields").val();
            var sproleindex = obj.attributes['sproleindex'].value;
            if (dealStructureModel.ServiceProviderRoles()[sproleindex].OptionalFields().length > 0) {
                var oNew = dealStructureModel.ServiceProviderRoles()[sproleindex].OptionalFields()[pre];
                dealStructureModel.ServiceProviderRoles()[sproleindex].OptionalFields.remove(oNew);
                dealStructureModel.ServiceProviderRoles()[sproleindex].DisplayFields.push(oNew);
            }
            else {
                return false;
            }
        }

        var addNewEx = function (obj) {
            var pre = $(obj).parent().prev().find("#selOptionalFields").val();
            var sproleindex = obj.attributes['sproleindex'].value;
            if (dealStructureModel.ServiceProviderRolesEx()[sproleindex].OptionalFields().length > 0) {
                var oNew = dealStructureModel.ServiceProviderRolesEx()[sproleindex].OptionalFields()[pre];
                dealStructureModel.ServiceProviderRolesEx()[sproleindex].OptionalFields.remove(oNew);
                dealStructureModel.ServiceProviderRolesEx()[sproleindex].DisplayFields.push(oNew);
            }
            else {
                return false;
            }
        }

        var addNewRole = function () {
            var roleindex = $("#selSPRole").val();
            if (dealStructureModel.OptionalServiceProviderRoles().length > 0) {
                var optionRole = dealStructureModel.OptionalServiceProviderRoles()[roleindex];
                dealStructureModel.ServiceProviderRoles.push(optionRole);
                dealStructureModel.OptionalServiceProviderRoles.remove(optionRole);
            }
            else { return false; }
        }

        var addNewRoleEx = function () {
            var roleindex = $("#selSPRoleEx").val();
            if (dealStructureModel.OptionalServiceProviderRolesEx().length > 0) {
                var optionRole = dealStructureModel.OptionalServiceProviderRolesEx()[roleindex];
                dealStructureModel.ServiceProviderRolesEx.push(optionRole);
                dealStructureModel.OptionalServiceProviderRolesEx.remove(optionRole);
            }
            else { return false; }
        }

        var deleteField = function (fObj) {
            var fieldIndex = $(fObj).parent().parent().attr("fieldIndex");
            var roleind = $(fObj).parent().parent().parent().attr("roleIndex");
            var deletefield = dealStructureModel.ServiceProviderRoles()[roleind].DisplayFields()[fieldIndex];
            dealStructureModel.ServiceProviderRoles()[roleind].OptionalFields.push(deletefield);
            dealStructureModel.ServiceProviderRoles()[roleind].DisplayFields.remove(deletefield);
        }

        var deleteFieldEx = function (fObj) {
            var fieldIndex = $(fObj).parent().parent().attr("fieldIndex");
            var roleind = $(fObj).parent().parent().parent().attr("roleIndex");
            var deletefield = dealStructureModel.ServiceProviderRolesEx()[roleind].DisplayFields()[fieldIndex];
            dealStructureModel.ServiceProviderRolesEx()[roleind].OptionalFields.push(deletefield);
            dealStructureModel.ServiceProviderRolesEx()[roleind].DisplayFields.remove(deletefield);
        }

        var deleteSPRole = function (roleObj) {
            var delteRoleIndex = roleObj.attributes["roleIndex"].value;
            var deleteRoleItem = dealStructureModel.ServiceProviderRoles()[delteRoleIndex];
            dealStructureModel.OptionalServiceProviderRoles.push(deleteRoleItem);
            dealStructureModel.ServiceProviderRoles.remove(deleteRoleItem);

        };

        var deleteSPRoleEx = function (roleObj) {
            var delteRoleIndex = roleObj.attributes["roleIndex"].value;
            var deleteRoleItem = dealStructureModel.ServiceProviderRolesEx()[delteRoleIndex];
            dealStructureModel.OptionalServiceProviderRolesEx.push(deleteRoleItem);
            dealStructureModel.ServiceProviderRolesEx.remove(deleteRoleItem);

        };

        var update = function () {
            var returnArray = new Array();
            if (dealStructureModel.ServiceProviderRoles().length > 0) {

                var returnsproles = dealStructureModel.ServiceProviderRoles();
                getresult(returnsproles, returnArray);
            }
            if (dealStructureModel.ServiceProviderRolesEx().length > 0) {

                var returnsprolesEx = dealStructureModel.ServiceProviderRolesEx();
                getresult(returnsprolesEx, returnArray);
            }

            function getresult(returnsproles, returnArray) {
                $.each(returnsproles, function (m, singleRole) {
                    if (singleRole.DisplayFields().length > 0) {
                        $.each(singleRole.DisplayFields(), function (n, singleRoleItem) {
                            if (singleRoleItem.ItemValue() != "") {
                                var roleItem = { Category: '', SPId: '', SPCode: '', SPRItemCode: "", TBId: "", ItemId: "", ItemCode: "", ItemValue: "", DataType: "", UnitOfMeasure: "", Precise: "" };
                                roleItem.Category = "TrustServiceProviderItem";
                                roleItem.SPId = singleRole.SPId();
                                roleItem.SPCode = $.trim(singleRole.SPCode());
                                roleItem.SPRItemCode = singleRole.SPRItemCode();
                                roleItem.TBId = ""
                                roleItem.ItemId = singleRoleItem.ItemId();
                                roleItem.ItemCode = singleRoleItem.ItemCode();
                                roleItem.ItemValue = singleRoleItem.ItemValue();
                                roleItem.DataType = singleRoleItem.DataType();
                                roleItem.UnitOfMeasure = singleRoleItem.UnitOfMeasure();
                                roleItem.Precise = singleRoleItem.Precise();
                                returnArray.push(roleItem);
                            }
                        });
                    }
                });
            }

            //var json = ko.mapping.toJSON(returnArray);
            //json = json.replace("[", "").replace("]", "") + ",";
            //if (json == ",") {
            //    return "";
            //}
            //else {
            //    return json;
            //}
            return returnArray;//ko.mapping.toJS(returnArray);
        };

        var showReturn = function () {
            $('#divTrustSPRoleShow').html(preview());
        };
        var configSequence = function () {
            var url = GlobalVariable.SslHost + "productManage/TrustManagement/TrustWizard/FeeSequence.html?tid=" + trustId + "&random=" + Math.random();
            var rolesArrary = new Array();
            GetFee(dealStructureModel.ServiceProviderRoles(), rolesArrary);
            GetFee(dealStructureModel.ServiceProviderRolesEx(), rolesArrary);
            function GetFee(sourceArray, rolesArrary) {
                $.each(sourceArray, function (a, item) {
                    if (item.DisplayFields().length > 0) {
                        $.each(item.DisplayFields(), function (b, itemB) {
                            if (itemB.ItemCode() == "Fee" && itemB.ItemValue() != "") {
                                var roleObj = new Object();
                                roleObj.SPRItemCode = item.SPRItemCode();
                                roleObj.Title = item.Title();
                                roleObj.SequenceNo = "";
                                rolesArrary.push(roleObj);
                            }
                        });
                    }
                });
            }
            window.showModalDialog(url, rolesArrary, "dialogWidth=800px;dialogHeight=500px;scroll=no");
        };

        var preview = function () {
            var html = "";

            var print_tpl = '<div class="ItemBox"><h3 class="h3">{0}</h3><div class="ItemInner">{1}</div></div>';

            var strBegin = '<div class="ItemContent"><div class="ItemTitle">{0}：{1}</div>';

            var stringItem = '<div class="Item"><label>{0}</label><span>{1}</span></div>';

            var stringTail = '</div>';

            var formulaVisible = true;

            function nameChange(itemValue) {
                switch (itemValue) {
                    case 'BasedOnTotalInterestAmount':
                        return '利息总收入';
                    case 'BasedOnBondBalance':
                        return '债券总剩余本金基准';
                    case 'BasedOnFirstClassBalance':
                        return '优先级总剩余本金基准';
                    case 'BasedOnIssueAmount':
                        return '债券总发行规模基准';
                    case 'CalculationPeriod':
                        return '计算日期间';
                    case 'PaymentPeriod':
                        return '兑付日期间';
                    default:
                        return itemValue;
                }
            }

            function getitemhtml(objArray) {
                var result = "";
                $.each(objArray, function (a, item) {
                    var needAdd = false;
                    var serviceprovider = "";
                    var itemTitle = "";
                    var itemString = "";
                    var count = 0;
                    var sumArray = new Array("FeeBaseMethod", "Fee", "InterestDaysCountRule", "InterestDaysPerYear");
                    if (item.DisplayFields().length > 0) {
                        $.each(item.DisplayFields(), function (b, itemB) {
                            if (itemB.ItemValue() != "") {
                                if (itemB.ItemCode() == sumArray[0] || itemB.ItemCode() == sumArray[1] || itemB.ItemCode() == sumArray[2] || itemB.ItemCode() == sumArray[3]) {
                                    switch (itemB.ItemCode()) {
                                        case sumArray[0]:
                                            sumArray[0] = nameChange(itemB.ItemValue());
                                            count++;
                                            break
                                        case sumArray[1]:
                                            sumArray[1] = " x " + itemB.ItemValue();
                                            count++;
                                            break;
                                        case sumArray[2]:
                                            sumArray[2] = " x " + nameChange(itemB.ItemValue());
                                            count++;
                                            break;
                                        case sumArray[3]:
                                            sumArray[3] = " / " + itemB.ItemValue();
                                            count++;
                                        default:
                                            return;
                                    }
                                }
                                else {
                                    itemString += stringItem.format(itemB.FieldTitle(), itemB.ItemValue());
                                    needAdd = true;
                                }
                            }

                        });
                    }
                    if (needAdd) {
                        //serviceprovider = getSPTypeById(item.SPId());
                        //itemTitle = strBegin.format(item.Title(), serviceprovider);                   
                        if (item.Title() == "托管银行" && count == 4) {
                            itemString += "<div class='Item'><p>托管费 = " + sumArray[0] + sumArray[1] + "%" + sumArray[2] + sumArray[3] + "</p></div>";
                        }
                        itemTitle = strBegin.format(item.Title(), item.SPCode());
                        result += itemTitle + itemString + stringTail;
                        console.log("header:" + item.Title() + " " + item.SPCode());
                    }
                });
                console.log("result:" + result);
                return result;
            }

            //html += getitemhtml(dealStructureModel.ServiceProviderRoles())
            html += getitemhtml(dealStructureModel.ServiceProviderRolesEx())


            html = print_tpl.format('相关参与方', html);
            return html;
        };
        var isMenuclick = false;
        var isMenuClick = function (b) {
            if (b == true || b == false)
                isMenuclick = b;
            return isMenuclick;
        }
        //改了这里！
        var titleOnClick = function (titleObj) {
            var _index = $(titleObj).attr("labelIndex");
            _obj = $('.form-box-index').eq(_index);
            $(".catalog-title").removeClass('active');
            $(titleObj).addClass('active');
            isMenuclick = true;
            $("html,body").animate({
                //这里原来是30，现在改成100 在右边导航栏点击后刚好和谐的显示
                scrollTop: _obj.offset().top - 100
            }, 0);
        }
        //暂停{7F3374F7-CE21-4033-99B9-D47FAAC89869}
        //var getSPTypeById = function (spId) {
        //    var spTypes = $.grep(dealStructureModel.ServiceProviders(), function (item) {
        //        return item.SPId() == spId;
        //    });
        //    if (spTypes.length > 0) {
        //        return spTypes[0].SPTitle();
        //    }
        //};

        var arrarySort = function (arr) {
            return arr.sort(function (a, b) {
                return parseInt(a.SequenceNo) - parseInt(b.SequenceNo);
            });
        };
        return {
            addNew: addNew,
            addNewRole: addNewRole,
            deleteField: deleteField,
            InitSPRoleJson: InitSPRoleJson,
            dataBinding: dataBinding,
            update: update,
            showReturn: showReturn,
            deleteSPRole: deleteSPRole,
            configSequence: configSequence,
            preview: preview,
            titleOnClick: titleOnClick,
            addNewEx: addNewEx,
            addNewRoleEx: addNewRoleEx,
            deleteFieldEx: deleteFieldEx,
            deleteSPRoleEx: deleteSPRoleEx,
            isMenuClick: isMenuClick
        };

    })();

    var TrustSPElement = {

        init: function () {
            var dealNode = document.getElementById('TrustSPRoleDiv');
            TrustSPRoleModule.InitSPRoleJson();
            TrustSPRoleModule.dataBinding(dealNode);
            var $catalog = $('.catalog-scroll>.catalog-list>.catalog-title');
            var csector = '.catalog-scroll>.catalog-list>.catalog-title';
            $catalog.eq(0).addClass('active');

            $(window).scroll(function () {
                if (TrustSPRoleModule.isMenuClick() == true) {
                    TrustSPRoleModule.isMenuClick(false);
                    return;
                }

                var scrollHeight = $(document).height() - $(window).height();

                var _top = $(this).scrollTop();
                if (_top < scrollHeight) {
                    $(".form-box").each(function () {
                        var _this = $(this);
                        var _index = _this.attr("boxIndex");
                        var _offsetTop = _this.offset().top;
                        var _oph = _offsetTop + _this.height();
                        if (_top >= _offsetTop && _top < _oph) {
                            $(csector).removeClass('active');
                            $(csector).eq(_index).addClass('active');
                        }
                    });
                } else {
                    $(csector).removeClass('active').last().addClass('active');
                }
            });

        },

        update: function () {
            return TrustSPRoleModule.update();
        },

        preview: function () {
            return TrustSPRoleModule.preview();
        },

        validation: function () {
            //var stepDiv = document.getElementById('TrustSPRoleDiv');
            return this.validControls('#TrustSPRoleDiv input[data-valid]');
        },

        trustSPRoleModule: function () {
            return TrustSPRoleModule;
        }

    }

    return TrustSPElement;

});