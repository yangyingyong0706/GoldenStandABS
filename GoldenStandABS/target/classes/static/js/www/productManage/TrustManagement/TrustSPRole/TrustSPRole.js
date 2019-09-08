define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var ExecuteGetData = common.ExecuteGetData;
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var GlobalVariable = require('globalVariable');
    var Vue = require('Vue2');
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
    new Vue({
        el: '#main',
        data: {
            trustId: common.getQueryString('tid'),
            tmsSessionServiceBase: GlobalVariable.TrustManagementServiceUrl,
            tmsDataProcessBase: GlobalVariable.DataProcessServiceUrl,
            TrustInfo: {},
            OptionSource: '',
            OptionalServiceProviderRoles: '', //通讯录option
            OptionalServiceProviderRolesValue: '',//通讯录Value
            ServiceProviderRoles: '',  //通讯录array
            OptionalServiceProviderRolesEx: '',//账户信息option
            OptionalServiceProviderRolesExValue: '', //账户信息Value
            ServiceProviderRolesEx: '', //账户信息array
            loading: true,
            closeAddressListB: true,  //通讯录消失、出现
            closeAddressListClass: 'fa fa-angle-down',
            closeAccountsB: true,  //账户信息消失、出现
            closeAccountsClass: 'fa fa-angle-down',
            addAddressListObject: {   //添加通讯录弹窗数据
                "Id": "", //区别是新增还是编辑(0新增，>0编辑)
                "SPCode": '' 
            },
            addAddressListArray: [],  //通讯录弹窗数据
            formVerify: {   //公司、联系人必填验证
                SPCode: false,
                FirstContact: false
            },
            FeeBaseMethod: [], //费率计算基准option
            FeeBaseMethodValue: '',
            InterestDaysCountRule: [], //计息期间option
            InterestDaysCountRuleValue: '',
            addAccountsObject: {   //添加账户信息弹窗数据
                "Id": "", //区别是新增还是编辑(0新增，>0编辑)
                "SPCode": ''
            },
            addAccountsArray: []   //账号信息录弹窗数据
        },
        methods: {
            //点击通讯录收缩按钮
            closeAddressList: function () {
                if (this.closeAddressListB) {
                    this.closeAddressListB = !this.closeAddressListB
                    this.closeAddressListClass = 'fa fa-angle-up'
                } else {
                    this.closeAddressListB = !this.closeAddressListB
                    this.closeAddressListClass = 'fa fa-angle-down'
                }
            },
            //点击账户信息收缩按钮
            closeAccounts: function () {
                if (this.closeAccountsB) {
                    this.closeAccountsB = !this.closeAccountsB
                    this.closeAccountsClass = 'fa fa-angle-up'
                } else {
                    this.closeAccountsB = !this.closeAccountsB
                    this.closeAccountsClass = 'fa fa-angle-down'
                }
            },
            //删除通讯录
            removeAddressList: function (item, index) {
                var _this = this;
                GSDialog.HintWindowTF("是否确认删除当前信息", function () {
                    var itemObject = JSON.parse(JSON.stringify(item));
                    var OptionalServiceProviderRoles = itemObject.DisplayFields[0];
                    OptionalServiceProviderRoles.ItemAliasValue = itemObject.Title;
                    OptionalServiceProviderRoles.ItemValue = "";
                    OptionalServiceProviderRoles.SPCode = "";
                    _this.ServiceProviderRoles.splice(index, 1)
                    _this.OptionalServiceProviderRoles.push(OptionalServiceProviderRoles)
                })
            },
            //删除账户信息
            removeAccounts: function (item, index) {
                var _this = this;
                GSDialog.HintWindowTF("是否确认删除当前信息", function () {
                    var itemObject = JSON.parse(JSON.stringify(item));
                    var OptionalServiceProviderRolesEx = itemObject.DisplayFields[0];
                    OptionalServiceProviderRolesEx.ItemAliasValue = itemObject.Title;
                    OptionalServiceProviderRolesEx.ItemValue = "";
                    OptionalServiceProviderRolesEx.SPCode = "";
                    _this.ServiceProviderRolesEx.splice(index, 1)
                    _this.OptionalServiceProviderRolesEx.push(OptionalServiceProviderRolesEx)
                })
            },
            //点击新增、编辑通讯录
            addAddressList: function (item, index) {
                var title, _this = this;
                if (item) {  //编辑
                    title = item.Title
                    this.addAddressListObject.Id = index + 1
                    this.addAddressListObject.SPCode = item.SPCode
                    for (var i = 0; i < item.DisplayFields.length; i++) {
                        for (var j = 0; j < this.addAddressListArray.length; j++) {
                            if (item.DisplayFields[i].ItemCode == this.addAddressListArray[j].ItemCode) {
                                if (this.addAddressListArray[j].DataType == "Select") {
                                    this.addAddressListArray[j].ItemValue = item.DisplayFields[i].TitleValue
                                } else {
                                    this.addAddressListArray[j].ItemValue = item.DisplayFields[i].ItemValue
                                }
                            }
                        }
                    }
                } else {  //新增
                    this.addAddressListObject.Id = 0;
                    for (var i = 0; i < this.OptionalServiceProviderRoles.length; i++) {
                        if (this.OptionalServiceProviderRoles[i].SPRItemCode == this.OptionalServiceProviderRolesValue) {
                            title = this.OptionalServiceProviderRoles[i].ItemAliasValue;
                            break;
                        }
                    }
                    for (var i = 0; i < this.addAddressListArray.length; i++) {
                        this.addAddressListArray[i].ItemValue = ''
                    }
                }
                //根据addAddressListArray(弹窗数据动态设置弹窗高度)
                var height = 320;
                if (this.addAddressListArray.length < 8) {
                    height = 320
                } else if (8 <= this.addAddressListArray.length && this.addAddressListArray.length < 10) {
                    height = 370
                } else if (10 <= this.addAddressListArray.length && this.addAddressListArray.length < 12) {
                    height = 420
                }
                $.anyDialog({
                    modal: true,
                    dialogClass: "TaskProcessDialogClass",
                    closeText: "",
                    html: $("#addAddressList").fadeIn(),
                    title: title,
                    height: height,
                    width: 800,
                    onClose: function (event, ui) {
                        for (var i in _this.addAddressListObject) {
                            _this.addAddressListObject[i] = ''
                        }
                        _this.formVerify.SPCode = false
                        _this.formVerify.FirstContact = false
                    },
                    onMaskClick: function (event, ui) {
                        //();
                    },
                });
            },
            SPCodeChange: function (value) {
                if (value == '') this.formVerify.SPCode = true
                else this.formVerify.SPCode = false
            },
            FirstContactChange: function (item) {
                if (item.ItemValue == '' && (item.ItemCode == "OfficeAddress" || item.ItemCode == "NameofAccount")) this.formVerify.FirstContact = true
                else this.formVerify.FirstContact = false
            },
            //保存通讯录
            saveAddressList: function () {
                //验证公司和联系人，为空不通过，不为空通过
                var pass = true
                if (this.addAddressListObject.SPCode == '') {
                    this.formVerify.SPCode = true
                    pass = false
                }
                for (var i = 0; i < this.addAddressListArray.length; i++) {
                    if (this.addAddressListArray[i].ItemCode == 'OfficeAddress' && this.addAddressListArray[i].ItemValue == '') {
                        this.formVerify.FirstContact = true
                        pass = false
                        break;
                    }
                }
                if (!pass) return false
                //编辑保存
                if (this.addAddressListObject.Id) {
                    var item = this.ServiceProviderRoles[this.addAddressListObject.Id - 1]
                    item.SPCode = this.addAddressListObject.SPCode
                    for (var i = 0; i < item.DisplayFields.length; i++) {
                        for (var j = 0; j < this.addAddressListArray.length; j++) {
                            if (item.DisplayFields[i].ItemCode == this.addAddressListArray[j].ItemCode) {
                                if (this.addAddressListArray[j].DataType == "Select") {
                                    item.DisplayFields[i].TitleValue = this.addAddressListArray[j].ItemValue
                                    item.DisplayFields[i].ItemValue = this.getOptionTile(this.addAddressListArray[j].selectData, this.addAddressListArray[j].ItemValue)
                                } else {
                                    item.DisplayFields[i].ItemValue = this.addAddressListArray[j].ItemValue
                                }
                            }
                        }
                    }
                    this.ServiceProviderRoles.splice(this.addAddressListObject.Id - 1, 1, item)
                    $("#modal-close").click()
                }
                //新增保存
                else {
                    //把弹窗表单的值赋值给ServiceProviderRoles，并删除已选择的option
                    var index, ServiceProviderRoles, ServiceProviderRolesObject = {}, DisplayFields = [];
                    for (var i = 0; i < this.OptionalServiceProviderRoles.length; i++) {
                        if (this.OptionalServiceProviderRoles[i].SPRItemCode == this.OptionalServiceProviderRolesValue) {
                            ServiceProviderRoles = this.OptionalServiceProviderRoles[i]
                            index = i
                            break;
                        }
                    }
                    for (var i = 0; i < this.addAddressListArray.length; i++) {
                        DisplayFields[i] = JSON.parse(JSON.stringify(ServiceProviderRoles))
                        DisplayFields[i].ItemAliasValue = this.addAddressListArray[i].ItemAliasValue
                        DisplayFields[i].ItemCode = this.addAddressListArray[i].ItemCode

                        if (this.addAddressListArray[i].DataType == "Select") {
                            DisplayFields[i].TitleValue = this.addAddressListArray[i].ItemValue
                            DisplayFields[i].DataType = "Select"
                            DisplayFields[i].ItemValue = this.getOptionTile(this.addAddressListArray[i].selectData, this.addAddressListArray[i].ItemValue)
                        } else {
                            DisplayFields[i].ItemValue = this.addAddressListArray[i].ItemValue
                        }
                    }
                    ServiceProviderRolesObject.SPCode = this.addAddressListObject.SPCode
                    ServiceProviderRolesObject.Title = ServiceProviderRoles.ItemAliasValue
                    ServiceProviderRolesObject.SPRItemCode = ServiceProviderRoles.SPRItemCode
                    ServiceProviderRolesObject.DisplayFields = DisplayFields
                    
                    this.ServiceProviderRoles.splice(0, 0, ServiceProviderRolesObject)
                    this.OptionalServiceProviderRoles.splice(index, 1)
                    if (this.OptionalServiceProviderRoles.length > 0) {
                        this.OptionalServiceProviderRolesValue = this.OptionalServiceProviderRoles[0].SPRItemCode
                    } else {
                        this.OptionalServiceProviderRolesValue = ''
                    }
                    $("#modal-close").click()
                }
            },
            //点击新增、编辑账户信息
            addAccounts: function (item, index) {
                var title, _this = this;
                if (item) {  //编辑
                    title = item.Title
                    this.addAccountsObject.Id = index + 1
                    this.addAccountsObject.SPCode = item.SPCode
                    for (var i = 0; i < item.DisplayFields.length; i++) {
                        for (var j = 0; j < this.addAccountsArray.length; j++) {
                            if (item.DisplayFields[i].ItemCode == this.addAccountsArray[j].ItemCode) {
                                if (this.addAccountsArray[j].DataType == "Select") {
                                    this.addAccountsArray[j].ItemValue = item.DisplayFields[i].TitleValue
                                } else {
                                    this.addAccountsArray[j].ItemValue = item.DisplayFields[i].ItemValue
                                }
                            }
                        }
                    }
                } else {  //新增
                    this.addAccountsObject.Id = 0; 
                    for (var i = 0; i < this.OptionalServiceProviderRolesEx.length; i++) {
                        if (this.OptionalServiceProviderRolesEx[i].SPRItemCode == this.OptionalServiceProviderRolesExValue) {
                            title = this.OptionalServiceProviderRolesEx[i].ItemAliasValue;
                            break;
                        }
                    }
                    for (var i = 0; i < this.addAccountsArray.length; i++) {
                        this.addAccountsArray[i].ItemValue = ''
                    }
                }
                //根据addAddressListArray(弹窗数据动态设置弹窗高度)
                var height = 370;
                if (this.addAccountsArray.length < 10) {
                    height = 370
                } else if (10 <= this.addAccountsArray.length && this.addAccountsArray.length < 12) {
                    height = 420
                } else if (12 <= this.addAccountsArray.length && this.addAccountsArray.length < 14) {
                    height = 470
                }
                $.anyDialog({
                    modal: true,
                    dialogClass: "TaskProcessDialogClass",
                    closeText: "",
                    html: $("#addAccounts").fadeIn(),
                    title: title,
                    height: height,
                    width: 800,
                    onClose: function (event, ui) {
                        for (var i in _this.addAccountsObject) {
                            _this.addAccountsObject[i] = ''
                        }
                        _this.formVerify.SPCode = false
                        _this.formVerify.FirstContact = false
                    },
                    onMaskClick: function (event, ui) {
                        //();
                    },
                });
            },
            //保存账户信息
            saveAccounts: function () {
                //验证公司和联系人，为空不通过，不为空通过
                var pass = true, _this = this;
                if (this.addAccountsObject.SPCode == '') {
                    this.formVerify.SPCode = true
                    pass = false
                }

                for (var i = 0; i < this.addAccountsArray.length; i++) {
                    if (this.addAccountsArray[i].ItemCode == 'NameofAccount' && this.addAccountsArray[i].ItemValue == '') {
                        this.formVerify.FirstContact = true
                        pass = false
                        break;
                    }
                }

                if (!pass) return false
                //编辑保存
                if (this.addAccountsObject.Id) {
                    var item = this.ServiceProviderRolesEx[this.addAccountsObject.Id - 1]
                    item.SPCode = this.addAccountsObject.SPCode
                    for (var i = 0; i < item.DisplayFields.length; i++) {
                        for (var j = 0; j < this.addAccountsArray.length; j++) {
                            if (item.DisplayFields[i].ItemCode == this.addAccountsArray[j].ItemCode) {
                                if (this.addAccountsArray[j].DataType == "Select") {
                                    item.DisplayFields[i].TitleValue = this.addAccountsArray[j].ItemValue
                                    item.DisplayFields[i].ItemValue = _this.getOptionTile(this.addAccountsArray[j].selectData, this.addAccountsArray[j].ItemValue)
                                } else {
                                    item.DisplayFields[i].ItemValue = this.addAccountsArray[j].ItemValue
                                }
                            }
                        }
                    }
                    this.ServiceProviderRolesEx.splice(this.addAccountsObject.Id - 1, 1, item)
                    $("#modal-close").click()
                }
                //新增保存
                else {
                    //把弹窗表单的值赋值给ServiceProviderRoles，并删除已选择的option
                    var index, ServiceProviderRolesEx, ServiceProviderRolesExObject = {}, DisplayFields = [];
                    for (var i = 0; i < this.OptionalServiceProviderRolesEx.length; i++) {
                        if (this.OptionalServiceProviderRolesEx[i].SPRItemCode == this.OptionalServiceProviderRolesExValue) {
                            ServiceProviderRolesEx = this.OptionalServiceProviderRolesEx[i]
                            index = i
                            break;
                        }
                    }
                    for (var i = 0; i < this.addAccountsArray.length; i++) {
                        DisplayFields[i] = JSON.parse(JSON.stringify(ServiceProviderRolesEx))
                        DisplayFields[i].ItemAliasValue = this.addAccountsArray[i].ItemAliasValue
                        DisplayFields[i].ItemCode = this.addAccountsArray[i].ItemCode

                        if (this.addAccountsArray[i].DataType == "Select") {
                            DisplayFields[i].TitleValue = this.addAccountsArray[i].ItemValue
                            DisplayFields[i].DataType = "Select"
                            DisplayFields[i].ItemValue = _this.getOptionTile(this.addAccountsArray[i].selectData, this.addAccountsArray[i].ItemValue)
                        } else {
                            DisplayFields[i].ItemValue = this.addAccountsArray[i].ItemValue 
                        }
                    }
                    ServiceProviderRolesExObject.SPCode = this.addAccountsObject.SPCode
                    ServiceProviderRolesExObject.Title = ServiceProviderRolesEx.ItemAliasValue
                    ServiceProviderRolesExObject.SPRItemCode = ServiceProviderRolesEx.SPRItemCode
                    ServiceProviderRolesExObject.DisplayFields = DisplayFields
                    this.ServiceProviderRolesEx.splice(0, 0, ServiceProviderRolesExObject)
                    this.OptionalServiceProviderRolesEx.splice(index, 1)

                    if (this.OptionalServiceProviderRolesEx.length > 0) {
                        this.OptionalServiceProviderRolesExValue = this.OptionalServiceProviderRolesEx[0].SPRItemCode
                    } else {
                        this.OptionalServiceProviderRolesExValue = ''
                    }
                    $("#modal-close").click()
                }
            },
            //根据option的value获取option的title
            getOptionTile: function (Source, value) {
                var title = '';
                for (var i = 0; i < Source.length; i++) {
                    if (Source[i].CodeDictionaryCode == value) {
                        title = Source[i].Value
                        break;
                    }
                }
                return title;
            },
            //获取后端数据
            getTrustInfoByTrustId: function () {
                var _this = this;
                var sContent = "{'SPName':'usp_GetTrustInfoFromWizard','Params':{" +
                                "'TrustId':'" + _this.trustId +
                                "'}}";
                //TODO YANGYINGYONG 需要的unicode转码信息
                sContent=encodeURIComponent(sContent);
                var serviceUrl = _this.tmsSessionServiceBase + "GetItemsPlus?applicationDomain=TrustManagement&contextInfo=" + sContent;
                $.ajax({
                    type: "GET",
                    url: serviceUrl,
                    dataType: "jsonp",
                    crossDomain: true,
                    contentType: "application/json;charset=utf-8",
                    complete: function () {
                        setTimeout(function () {
                            $('#loading').fadeOut();
                        }, 500)
                    },
                    success: function (response) {
                        _this.sortingSourceData(response);
                    },
                    error: function (response) { alert("error:" + response); }
                });
            },
            //后端数据分类
            sortingSourceData: function (sourceData) {
                var TrustInfo = {};
                $.each(sourceData, function (i, data) {
                    var cate = data.Category;
                    if (!TrustInfo[cate]) { TrustInfo[cate] = []; }
                    TrustInfo[cate].push(data);
                });
                for (var item in TrustInfo) {
                    TrustInfo[item] = TrustInfo[item].sort(function (a, b) {
                        return a.SequenceNo - b.SequenceNo;
                    });
                }
                this.TrustInfo = TrustInfo;
                this.getSelectionData()
            },
            //获取指定分类下的数据
            getCategoryData: function (name) {
                if (!this.TrustInfo || !name) return false;
                return this.TrustInfo[name] || [];
            },
            //筛选通讯录option，array，账户信息option、array
            getSelectionData: function () {
                var _this = this;
                var selectArray = this.getCategoryData('ServiceProviderRoleType')
                var addressList = this.getCategoryData("TrustServiceProviderContact");
                var Accounts = this.getCategoryData("TrustServiceProviderAccountInformation");
                var selectAddressList = []; //存放通讯录select
                var selectAccounts = [];   //存放账户信息select
                var addressListArray = _this.filterArray(addressList);  //存放通讯录信息
                var AccountsArray = _this.filterArray(Accounts);    //存放账户信息
                
                for (var i = 0; i < selectArray.length; i++){
                    if (selectArray[i].SPId) {
                        //存放通讯录信息
                        for (var j = 0; j < addressListArray.length; j++) {
                            if (selectArray[i].SPId == addressListArray[j].SPId) addressListArray[j].Title = selectArray[i].ItemAliasValue;
                        }
                        //存放账户信息
                        for (var j = 0; j < AccountsArray.length; j++) {
                            if (selectArray[i].SPId == AccountsArray[j].SPId) AccountsArray[j].Title = selectArray[i].ItemAliasValue;
                            }
                    } else {
                        //存放通讯录select
                        if (selectArray[i].SPRItemCode == "TrusteeBank" || selectArray[i].SPRItemCode == "ScrutinyBank" || selectArray[i].SPRItemCode == "TrusteeRegistrationPaymentAgent" || selectArray[i].SPRItemCode == "ScrutinyAccount" || selectArray[i].SPRItemCode == "TrusteeAccount" || selectArray[i].SPRItemCode == "ManagementFeeAccount" || selectArray[i].SPRItemCode == "AssetProviderServiceFeeAccount" || selectArray[i].SPRItemCode == "TrusteeFeeAccount" || selectArray[i].SPRItemCode == "ScrutinyFeeAccount") {
                            selectAccounts.push(selectArray[i])
                        }
                        //存放账户信息select
                        else {
                            selectAddressList.push(selectArray[i])
                        }
                        
                    }
                }
                _this.ServiceProviderRoles = addressListArray
                _this.ServiceProviderRolesEx = AccountsArray
                _this.OptionalServiceProviderRoles = selectAddressList
                if (selectAddressList.length > 0) {
                    _this.OptionalServiceProviderRolesValue = selectAddressList[0].SPRItemCode //下拉菜单默认显示第一个
                } else {
                    _this.OptionalServiceProviderRolesValue = ''
                }
                
                _this.OptionalServiceProviderRolesEx = selectAccounts

                if (selectAccounts.length > 0) {
                    _this.OptionalServiceProviderRolesExValue = selectAccounts[0].SPRItemCode //下拉菜单默认显示第一个
                } else {
                    _this.OptionalServiceProviderRolesExValue = ''
                }
                
                
                _this.getAllCodeDictionary() //获取费率计算基准，计息期间option
            },
            filterArray: function (array) {
                var moth = [],
                    flag = 0,
                    list = array;
                var wdy = {
                    SPId: '',
                    SPCode: '',
                    DisplayFields: ''
                }
                for (var i = 0; i < list.length; i++) {
                    var az = '';
                    for (var j = 0; j < moth.length; j++) {
                        if (moth[j].SPRItemCode == list[i]['SPRItemCode']) {
                            flag = 1;
                            az = j;
                            break;
                        }
                    }
                    if (flag == 1) {
                        var ab = moth[az];
                        ab.DisplayFields.push(list[i]);
                        flag = 0;

                    } else if (flag == 0) {
                        wdy = {};
                        wdy.SPId = list[i]['SPId'];
                        wdy.SPCode = list[i]['SPCode'];
                        wdy.SPRItemCode = list[i]['SPRItemCode'];
                        wdy.DisplayFields = new Array();
                        wdy.DisplayFields.push(list[i]);
                        moth.push(wdy);
                    }
                };
                return moth
            },
            //根据字符串长度计算宽度
            getWidth: function (value) {
                var Width;
                if (value.length == 3) {
                    Width = "width: 55px"
                } else if (value.length == 4) {
                    Width = "width: 68px"
                } else if (value.length == 5) {
                    Width = "width: 65px"
                } else if (value.length == 6) {
                    Width = "width: 98px"
                }
                return Width;
            },
            //根据字符串长度计算宽度
            getWidth2: function (value) {
                var Width;
                if (value.length == 3) {
                    Width = "width: calc(100% - 65px)"
                } else if (value.length == 4) {
                    Width = "width: calc(100% - 78px)"
                } else if (value.length == 5) {
                    Width = "width: calc(100% - 75px)"
                } else if (value.length == 6) {
                    Width = "width: calc(100% - 108px)"
                }
                return Width;
            },
            //获取后所有Select数据
            getAllCodeDictionary: function () {
                var _this = this;
                var sContent = "{'SPName':'usp_GetAllCodeDictionary','Params':{" +
                         "'AliasSetName':'zh-CN'" +
                         "},}";
                var serviceUrl = _this.tmsDataProcessBase + "GetTrustData?applicationDomain=TrustManagement&contextInfo=" + sContent;
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    crossDomain: true,
                    complete: function () {
                        setTimeout(function () {
                            $('#loading').fadeOut();
                        }, 500)
                    },
                    success: function (response) {
                        _this.OptionSource = jQuery.parseJSON(response);
                        _this.getDialogData() //获取弹窗数据
                    },
                    error: function (response) {
                        alert("error:" + response);
                    }
                });

            },
            //获取弹窗数据
            getDialogData: function () {
                var _this = this;
                var sContent = "{'SPName':'usp_GetTrustServiceProviderItemCode','Params':{}}";
                var serviceUrl = _this.tmsDataProcessBase + "GetTrustData?applicationDomain=TrustManagement&contextInfo=" + sContent;
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    crossDomain: true,
                    complete: function () {
                        setTimeout(function () {
                            $('#loading').fadeOut();
                        }, 500)
                    },
                    success: function (response) {
                        var addAddressListArray = JSON.parse(jQuery.parseJSON(response)[0].AddressList);
                        var addAccountsArray = JSON.parse(jQuery.parseJSON(response)[0].Accounts);
                        //前端添加ItemValue字段
                        for (var i = 0; i < addAddressListArray.length; i++) {
                            addAddressListArray[i].ItemValue = ''
                            addAddressListArray[i].selectData = []
                            if (addAddressListArray[i].DataType == "Select") {
                                addAddressListArray[i].selectData = _this.getOptionsSource(addAddressListArray[i].ItemCode)
                            }
                        }
                        for (var i = 0; i < addAccountsArray.length; i++) {
                            addAccountsArray[i].ItemValue = ''
                            addAccountsArray[i].selectData = []
                            if (addAccountsArray[i].DataType == "Select") {
                                addAccountsArray[i].selectData = _this.getOptionsSource(addAccountsArray[i].ItemCode)
                            }
                        }
                        //与通讯录做对比，addAddressListArray.length>ServiceProviderRoles.length,贼给ServiceProviderRoles添加多出来的object
                        _this.ServiceProviderRoles = _this.getCorrelationData(_this.ServiceProviderRoles, addAddressListArray)
                        _this.ServiceProviderRolesEx = _this.getCorrelationData(_this.ServiceProviderRolesEx, addAccountsArray)
                        //弹窗数据
                        _this.addAddressListArray = addAddressListArray
                        _this.addAccountsArray = addAccountsArray
                        console.log(addAddressListArray)
                        setTimeout(function () {
                            _this.loading = false
                        },1300)  
                    },
                    error: function (response) {
                        alert("error:" + response);
                    }
                });

            },
            getCorrelationData: function (dataOne, dataTwo) {
                var returnData = JSON.parse(JSON.stringify(dataOne));
                for (var h = 0; h < returnData.length; h++) {
                    if (dataTwo.length > returnData[h].DisplayFields.length) {
                        var DisplayFields = returnData[h].DisplayFields;
                        var NumberData = JSON.parse(JSON.stringify(dataTwo));
                        //去重
                        for (var i = 0; i < DisplayFields.length; i++) {
                            for (var j = 0; j < NumberData.length; j++) {
                                if (DisplayFields[i].ItemCode == NumberData[j].ItemCode) {
                                    NumberData.splice(j, 1);
                                    break;
                                }
                            }
                        }
                        //赋值
                        for (var i = 0; i < NumberData.length; i++) {
                            NumberData[i].Category = DisplayFields[0].Category
                            NumberData[i].EndDate = DisplayFields[0].EndDate
                            NumberData[i].IsCalculated = DisplayFields[0].IsCalculated
                            NumberData[i].IsCompulsory = DisplayFields[0].IsCompulsory
                            NumberData[i].IsPrimary = DisplayFields[0].IsPrimary
                            NumberData[i].ItemValue = ''
                            NumberData[i].SPCode = DisplayFields[0].SPCode
                            NumberData[i].SPId = DisplayFields[0].SPId
                            NumberData[i].SPRItemCode = DisplayFields[0].SPRItemCode
                            NumberData[i].SequenceNo = DisplayFields[0].SequenceNo
                            NumberData[i].StartDate = DisplayFields[0].StartDate
                            NumberData[i].TBId = DisplayFields[0].TBId
                            NumberData[i].UnitOfMeasure = DisplayFields[0].UnitOfMeasure
                        }
                        DisplayFields = DisplayFields.concat(NumberData)
                        returnData[h].DisplayFields = DisplayFields;
                    }
                }
                
                //var returnData = JSON.parse(JSON.stringify(dataOne));
                //if (returnData.length > 0 && dataTwo.length > returnData[0].DisplayFields.length) {
                //    var DisplayFields = returnData[0].DisplayFields
                //    var Number = dataTwo.length - DisplayFields.length
                //    var NumberData = dataTwo.slice(-Number)
                //    for (var i = 0; i < NumberData.length; i++) {
                //        for (var j = 0; j < returnData.length; j++) {
                //            var item = JSON.parse(JSON.stringify(returnData[j].DisplayFields[0]))
                //            item.ItemCode = NumberData[i].ItemCode
                //            item.ItemAliasValue = NumberData[i].ItemAliasValue
                //            item.DataType = NumberData[i].DataType
                //            item.ItemValue = ''
                //            returnData[j].DisplayFields.push(item)
                //        }
                //    }
                //}
                for (var i = 0; i < returnData.length; i++) {
                    for (var j = 0; j < returnData[i].DisplayFields.length; j++) {
                        if (returnData[i].DisplayFields[j].DataType == "Select") {
                            returnData[i].DisplayFields[j].TitleValue = returnData[i].DisplayFields[j].ItemValue
                            for (var h = 0; h < dataTwo.length; h++) {
                                if (returnData[i].DisplayFields[j].ItemCode == dataTwo[h].ItemCode) {
                                    returnData[i].DisplayFields[j].ItemValue = this.getOptionTile(dataTwo[h].selectData, returnData[i].DisplayFields[j].ItemValue)
                                }
                            }
                        }
                    }
                }
                console.log(returnData)
                return returnData;
            },
            //筛选Select数据
            getOptionsSource: function (categoryCode) {
                var _this = this;
                var items = $.grep(_this.OptionSource, function (item) {
                    return item.CategoryCode == categoryCode;
                });
                return items;
            },
            //保存数据到数据库
            saveData: function () {
                var _this = this;
                var svcUrl = _this.tmsDataProcessBase + "CommonExecuteGet?";
                var sessionContext = '', sessionContextArray = [], updateArray = _this.getUpdateArray();
                $.each(updateArray, function (i, n) {
                    if (!(n == "" || n == 'undifined' || n == null)) {
                        n.ItemValue = _this.ConvertDataByUtil("get", n.DataType, n.ItemValue, n.UnitOfMeasure, n.Precise);
                        sessionContextArray.push(_this.getShotTemplate(n));
                    }
                });
                sessionContext = JSON.stringify(sessionContextArray);
                sessionContext = "<SessionContext>{0}</SessionContext>".format(sessionContext);
                _this.saveWorkingSessionContext(sessionContext, function (sessionId) {
                    var executeParam = {
                        SPName: 'usp_SaveTrustInfoByStep4', SQLParams: [
                            { Name: 'StepId', value: 3, DBType: 'int' },
                            { Name: 'WorkSessionId', value: sessionId, DBType: 'string' },
                            { Name: 'TrustId', value: _this.trustId, DBType: 'int' }
                        ]
                    };
                    var temp = ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                        if (data && data.length > 0) {
                            var mainContentDisplayer = $("#mainContentDisplayer_0");
                            //动态改变Iframe里的URl
                            var ViewTrustAttatchedFilesUrl = location.protocol + '//' + location.host + '/GoldenStandABS/www/productManage/TrustManagement/ViewTrustAttatchedFiles/viewTrustAttatchedFiles.html?tid=' + _this.trustId;
                            mainContentDisplayer.context.location.href = ViewTrustAttatchedFilesUrl;
                            var stepListTustWizard = top.stepListTustWizard;
                            var stepListAddActive = parent.window.location.href.indexOf('trustWizard_New') < 0 ? stepList : stepListTustWizard;
                            $(stepListAddActive[2]).addClass("active").siblings().removeClass("active");
                        }
                        else {
                            //config.$next.text('下一步').prop("disabled", false);
                        }
                    });
                });
            },
            // 根据单位和精度，转化数据
            ConvertDataByUtil: function (GetOrSet, DataType, Value, UnitOfMeasure, Precise) {
                var self = this;
                if (parseFloat(Value) != Value || (DataType != "Decimal" && DataType != "Int"))
                    return Value;
                var mathtype = (GetOrSet == "get" ? "*" : (GetOrSet == "set" ? "/" : ""));
                if (mathtype == "")
                    return Value;

                var result, xs;
                var UnitOfMeasureArray = ["One", "Ten", "Hundred", "Thousands", "TenThousands", "HundredThousands", "Million", "TenMillion", "HundredMillion", "Billion", "TenBillion"];
                var index = $.inArray(UnitOfMeasure, UnitOfMeasureArray);

                if (index > 0) {
                    xs = Math.pow(10, index);
                    var result = self.GetMathResult(mathtype, parseFloat(Value), Number(xs));
                } else {
                    result = Value;
                }

                if (GetOrSet == "get" && DataType == "Decimal" && parseInt(Precise) == Precise && parseInt(Precise) >= 0)
                    return Number(result).toFixed(Precise);
                else
                    return result;
            },
            getShotTemplate: function (arr) {
                return { "Category": arr.Category, "SPId": arr.SPId, "SPCode": arr.SPCode, "SPRItemCode": arr.SPRItemCode, "TBId": arr.TBId, "ItemId": arr.ItemId, "ItemCode": arr.ItemCode, "ItemValue": arr.ItemValue };
            },
            //保存信息到working.SessionContext中
            saveWorkingSessionContext: function (sessionContext, callback) {
                var serviceUrl = this.tmsDataProcessBase + "SaveWorkingSessionContextPlus";
                $.ajax({
                    type: "POST",
                    url: serviceUrl,
                    dataType: "json",
                    contentType: "application/xml;charset=utf-8",
                    data: sessionContext,
                    success: function (response) {
                        callback(response);
                    },
                    error: function (response) { alert("error is :" + response); }
                });
            },
            submit: function () {
                $("#saveData").text('提交中...').prop("disabled", true);
                this.saveData()
            },
            //得到UpdateArray
            getUpdateArray: function () {
                var returnArray = new Array();
                if (this.ServiceProviderRoles.length > 0) {
                    var returnsproles = this.ServiceProviderRoles;
                    getresult(returnsproles, returnArray, "TrustServiceProviderContact");
                }
                if (this.ServiceProviderRolesEx.length > 0) {
                    var returnsprolesEx = this.ServiceProviderRolesEx;
                    getresult(returnsprolesEx, returnArray, "TrustServiceProviderAccountInformation");
                }
                function getresult(returnsproles, returnArray, TrustServiceProviderItem) {
                    $.each(returnsproles, function (m, singleRole) {
                        if (singleRole.DisplayFields.length > 0) {
                            $.each(singleRole.DisplayFields, function (n, singleRoleItem) {
                                var roleItem = { Category: '', SPId: '', SPCode: '', SPRItemCode: "", TBId: "", ItemId: "", ItemCode: "", ItemValue: "", DataType: "", UnitOfMeasure: "", Precise: "" };
                                roleItem.Category = TrustServiceProviderItem;
                                roleItem.SPId = singleRole.SPId;
                                roleItem.SPCode = $.trim(singleRole.SPCode);
                                roleItem.SPRItemCode = singleRole.SPRItemCode;
                                roleItem.TBId = ""
                                roleItem.ItemId = singleRoleItem.ItemId;
                                roleItem.ItemCode = singleRoleItem.ItemCode;
                                if (singleRoleItem.DataType == "Select") {
                                    roleItem.ItemValue = singleRoleItem.TitleValue
                                } else {
                                    roleItem.ItemValue = singleRoleItem.ItemValue;
                                };
                                roleItem.DataType = singleRoleItem.DataType;
                                roleItem.UnitOfMeasure = singleRoleItem.UnitOfMeasure;
                                roleItem.Precise = singleRoleItem.Precise;
                                
                                returnArray.push(roleItem);
                            });
                        }
                    });
                }
                return returnArray;
            }
        },
        mounted: function () {
            this.getTrustInfoByTrustId()
        }
    })
});












