/// <reference path="E:\TFS-Local\SFM\Products\PoolCut\PoolCut\Scripts/PoolCutCommon.js" />
//如果其他引用这个js文件在保存的时候没有提示成功信息，注意引入toast.css
define(function (require) {
    var $ = require('jquery');
    var toast = require('toast');
    var GlobalVariable = GlobalVariable = require('gs/globalVariable');
    var dataProcess = require('app/assetFilter/js/dataProcess');
    var common = require('gs/uiFrame/js/common');
    var gsUtil = require('gs/gsUtil');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var webStorage = require('gs/webStorage');
    var gsAdmin = require('gs/uiFrame/js/gs-admin-2.pages');
    var gsUtil = require('gsUtil');
    var GSDialog = require("gsAdminPages")
    require("bootstrap");
    require("ischeck");
    var poolId = common.getUrlParam("poolId") || '';
    var self;

    //if (webStorage.getItem("TargetSqlConnection")) {
    //    TargetSqlConnection = webStorage.getItem("TargetSqlConnection");
    //}
    var DimAssetTypeID = '';
    var AssetType = '';
    var SSISPackagePath = ''; //资产筛选导入数据SSIS路径
    var SSISPackagePathTarget = '';
    var ECPreviewControl = {
        el: "#main",
        data: {
            appDomain: 'config',
            ecModel: [],
            checkedSet: [],
            CriteriaTypeCodeSet: [],
            ecData: [],
            ecDataTitle: [],
            titleText: '', //头部标题文字
            getAddSelectData: '', //下拉列表数据
            getAddSelectValue: '', //下拉菜单选中value
            getAddSelectText: '', //下拉菜单选中text
            pointerEventsBoolean: false, //点击新增或者删除保存按钮后该按钮不可点击
            isMutualExclusion: false,   //是否Exclude互斥
            mutualExclusionValue: 0,
        },
        computed: {
            allChecked: {
                get: function () {
                    if (this.ecModel.length) {

                        return this.checkedCount == this.ecModel.length;
                    } else {
                        return false;
                    }
                },
                set: function (value) {
                    if (value) {
                        console.log(this.ecModel)
                        this.checkedSet = this.ecModel.map(function (v, i) {

                            return v.CriteriaId;
                        })
                        console.log(this.checkedSet)
                    } else {
                        this.checkedSet = [];
                    }
                }
            },
            checkedCount: {
                get: function () {
                    return this.checkedSet.length;
                }
            }
        },
        methods: {
            //对表格中时间格式做处理
            /*TimeShow(Type, CriteriaName) {
				if(Type == 'TextBox') {
					if(CriteriaName == 'EC08_LoanStartDate' || CriteriaName == 'EC09_LoanMaturityDate') {
						return true
					} else {
						return false
					}
				} else {
					return false
				}
			},*/
            //获取列表数据
            getListDate: function () {
                self = this;
                var executeParam = {
                    SPName: 'dbo.usp_GetECEntities',
                    SQLParams: []
                };
                executeParam.SQLParams.push({
                    Name: 'PoolId',
                    Value: PoolId,//186
                    DBType: 'int'
                });
                executeParam.SQLParams.push({
                    Name: 'PoolCutPurpose',
                    Value: PoolCutPurpose, //pool cut
                    DBType: 'string'
                });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL +
					'CommonGetWithConnStr?connStr={0}&exeParams={1}'.format(encodeURIComponent(TargetSqlConnection), executeParams);
                CallWCFSvc(serviceUrl, true, 'GET', function (response) {
                    dataProcess.getCriteriaListModel(self.appDomain, response, function (viewModel) {
                        var ecModel = dataProcess.getViewCriteriaListModel(viewModel);
                        for (let i = 0; i < ecModel.length; i++) {
                            if (ecModel[i].CriteriaDescription == '统计属性目标化') {
                                for (let j = 2; j < ecModel[i].XMLSqlQueryEC.Presentation.length; j++) {
                                    ecModel[i].XMLSqlQueryEC.Presentation[j].show = true;
                                };
                            };
                            if (ecModel[i].CriteriaDescription == '待销售资产池目标化') {
                                self.getHistorySetting(ecModel[i].XMLSqlQueryEC.Presentation);
                                break;
                            };
                        }
                        //self.ecModel = dataProcess.getViewCriteriaListModel(viewModel);
                        self.ecModel = ecModel;
                        self.getMutualExclusion();
                        console.log(self.ecModel)
                    })
                });
            },
            //目标化页面--获取下拉列表
            getAddSelect: function () {
                var _this = this,
					svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
					executeParam = {
					    'SPName': "dbo.usp_GetDistributionCode",
					    'SQLParams': [{
					        'Name': 'DimPoolId',
					        'Value': PoolId,
					        'DBType': 'int'
					    }, {
					        'Name': 'Filter',
					        'Value': "('Address','CreditRating','DivisionName','LoanGradeLevel')",
					        'DBType': 'string'
					    }]
					},
					appDomain = PoolHeader.PoolDBName;
                common.ExecuteGetData(false, svcUrl, appDomain, executeParam, function (data) {
                    _this.getAddSelectData = data
                    console.log(data)
                });
            },
            //获取互斥值
            getMutualExclusion: function () {
                var _this = this,
                    mutualExclusionValue = 0,
					svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
					executeParam = {
					    'SPName': "config.usp_getTargtingValue",
					    'SQLParams': [{
					        'Name': 'SourcePoolId',
					        'Value': PoolId,
					        'DBType': 'int'
					    }, {
					        'Name': 'JobDatabase',
					        'Value': PoolHeader.PoolDBName,
					        'DBType': 'string'
					    }]
					},
					appDomain = 'DAL_SEC_PoolConfig',
					ecModel = this.ecModel;
                for (var j = 0; j < ecModel.length; j++) {
                    if (ecModel[j].CriteriaDescription == '待销售资产池目标化') {
                        for (var i = 0; i < ecModel[j].XMLSqlQueryEC.Presentation.length; i++) {
                            if (ecModel[j].XMLSqlQueryEC.Presentation[i].RowText == '源资产池金额 ($):') {
                                mutualExclusionValue = ecModel[j].XMLSqlQueryEC.Presentation[i].Field[0].Value;
                                break;
                            }
                        }
                        break;
                    }
                }
                common.ExecuteGetData(true, svcUrl, appDomain, executeParam, function (data) {
                    if (data.length > 0) {
                        if (data[0].Column1 != '' && data[0].Column1 != null) {
                            _this.mutualExclusionValue = mutualExclusionValue - data[0].Column1
                        } else {
                            _this.mutualExclusionValue = mutualExclusionValue
                        }
                    }
                });
            },
            //获取上次设置的互斥值
            getHistorySetting: function (Presentation) {
                var _this = this,
                    mutualExclusionValue = 0,
					svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
					executeParam = {
					    'SPName': "dbo.usp_getOverLap",
					    'SQLParams': [{
					        'Name': 'PoolId',
					        'Value': PoolId,
					        'DBType': 'int'
					    }]
					},
					appDomain = 'DAL_SEC_PoolConfig';
                common.ExecuteGetData(false, svcUrl, appDomain, executeParam, function (data) {
                    console.log('我是互斥值')
                    console.log(data)
                    if (data.length > 0) {
                        _this.isMutualExclusion = data[0].Column1
                    }
                });
            },
            //额度调整页面保存
            limitChange: function (ecModel, $event, index0) {
                var _this = this;
                if (this.isMutualExclusion) {
                    GSDialog.HintWindowTF("你当前选择了互斥，是否确认保存？", function () {
                        _this.saveECEntities(ecModel, $event, index0);
                    })
                } else {
                    _this.saveECEntities(ecModel, $event, index0);
                }
            },
            //目标化页面--增加
            addItem: function (ec, event, index0) {
                if (this.getAddSelectValue) {
                    var TableName = '',
						myNumber = '';
                    if (this.getAddSelectText.TableName == "dbo.tblFactLoan") {
                        TableName = 'FL.';
                    } else if (this.getAddSelectText.TableName == "dbo.tblDimCustomer") {
                        TableName = 'DC.';
                    } else if (this.getAddSelectText.TableName == "dbo.tblFactLoanCustomer   ") {
                        TableName = 'FLC.';
                    } else if (this.getAddSelectText.TableName == "dbo.tblFactConsolidationCustomer") {
                        TableName = 'FCL.';
                    } else if (this.getAddSelectText.TableName == "dbo.tblDimLoan") {
                        TableName = 'DL.';
                    }
                    let ecModelItem = {
                        //添加到数据库
                        Parameters: {
                            FieldIndex: 0,
                            //Name: '$${this.getAddSelectValue}$',
                            Name: "$" + this.getAddSelectValue + "$",
                            RowIndex: ec.XMLSqlQueryEC.Presentation.length,
                            SelectedItems: [],
                            //TargetName: `${TableName}${this.getAddSelectValue}`,
                            TargetName: TableName + this.getAddSelectValue,
                            TargetType: "Bucketing",
                            Type: "TargetLookup",
                            isActiveList: false,
                            isEditing: false
                        },
                        //添加到视图
                        Presentation: {
                            Field: [{
                                DataSourceType: "Dynamic",
                                FieldIndex: 0,
                                //FieldText: `${this.getAddSelectValue}`,
                                FieldText: this.getAddSelectValue,
                                FieldType: "TargetLookup",
                                //LookupType: `${this.getAddSelectValue}Targeting`,
                                LookupType: this.getAddSelectValue + "Targeting",
                                //ParameterName: `$${this.getAddSelectValue}$`,
                                ParameterName: "$" + this.getAddSelectValue + "$",
                                SuggestedItems: [],
                                Value: ""
                            }],
                            RowIndex: ec.XMLSqlQueryEC.Presentation.length,
                            RowText: this.getAddSelectText.DistributionTypeName
                        }
                    };
                    this.ecModel[index0].XMLSqlQueryEC.Parameters.push(ecModelItem.Parameters);
                    this.ecModel[index0].XMLSqlQueryEC.Presentation.splice(3, 0, ecModelItem.Presentation);
                    this.saveECEntitiesAdd(ec, event, index0);
                    this.getAddSelectValue = '';
                    /*for(let i = 0; i < this.getAddSelectData.length; i++) {
					    if(this.getAddSelectData[i].DistributionTypeCode == this.getAddSelectValue) {
					        myNumber = i;
					        break;
					    }
					};
					this.getAddSelectData.splice(myNumber, 1);*/
                } else {
                    GSDialog.HintWindow('请选择!');
                }
            },
            //目标化页面--删除
            removeItem: function (index0, index, event) {
                let Number = '',
					AddSelectData = '',
					TableName = '';
                for (let i = 0; i < this.ecModel[index0].XMLSqlQueryEC.Parameters.length; i++) {
                    if (this.ecModel[index0].XMLSqlQueryEC.Parameters[i].RowIndex == this.ecModel[index0].XMLSqlQueryEC.Presentation[index].RowIndex) {
                        Number = i;
                        break;
                    }
                };
                for (let i = 0; i < this.ecModel[index0].XMLSqlQueryEC.Parameters.length; i++) {
                    if (this.ecModel[index0].XMLSqlQueryEC.Parameters[i].RowIndex == index) {
                        TableName = this.ecModel[index0].XMLSqlQueryEC.Parameters[i].TargetName;
                        TableName = TableName.substr(0, 3);
                    }
                };
                if (TableName == 'FL.') {
                    TableName = 'dbo.tblFactLoan'
                } else if (TableName == 'DC.') {
                    TableName = 'dbo.tblDimCustomer'
                } else if (TableName == 'FLC') {
                    TableName = 'dbo.tblFactLoanCustomer'
                } else if (TableName == 'FCL') {
                    TableName = 'dbo.tblFactConsolidationCustomer'
                } else if (TableName == 'DL.') {
                    TableName = 'dbo.tblDimLoan'
                };
                AddSelectData = {
                    DistributionTypeCode: this.ecModel[index0].XMLSqlQueryEC.Presentation[index].Field[0].FieldText,
                    DistributionTypeID: '',
                    DistributionTypeName: this.ecModel[index0].XMLSqlQueryEC.Presentation[index].RowText,
                    DistributionTypeName1: this.ecModel[index0].XMLSqlQueryEC.Presentation[index].RowText,
                    TableName: TableName
                };
                this.getAddSelectData.push(AddSelectData);
                this.ecModel[index0].XMLSqlQueryEC.Presentation.splice(index, 1);
                this.ecModel[index0].XMLSqlQueryEC.Parameters.splice(Number, 1);

            },
            //目标化页面--根据value值获取text
            valueChange: function (getAddSelectValue) {
                for (let i = 0; i < this.getAddSelectData.length; i++) {
                    if (this.getAddSelectData[i].DistributionTypeCode == getAddSelectValue) {
                        this.getAddSelectText = this.getAddSelectData[i]
                    }
                }
            },
            //中文数字显示金额
            getChinaNumber: function (value, index, isMutualExclusion, mutualExclusionValue) {
                var myValue = value;
                if (index == '0' && isMutualExclusion) {
                    myValue = mutualExclusionValue;
                }
                if (typeof (myValue) != "string") {
                    myValue = myValue.toString()
                };
                return gsUtil.getChineseNum(myValue)
            },
            //验证除了本分布外是否还有其他分布被选择
            isSelectedF: function (Presentation, IsCheck, index) {
                if (IsCheck) {
                    for (let i = 3; i < Presentation.length; i++) {
                        for (let j = 0; j < Presentation[i].Field[0].SuggestedItems.length; j++) {
                            if (Presentation[i].Field[0].SuggestedItems[j].IsCheck && i != index) {
                                GSDialog.HintWindow('不能同时选择多种分布进行目标化，请修改!');
                                return false
                            }
                        }
                    }
                }
            },
            redirectSelect: function (index) {
                ecModel[index].activeView = 'Verification';
                var query = this.ecModel[index].ECQeury;
                var sql = query.toLowerCase().replace(/select/g, "select top(150)").trim();
                var strArray = this.queryString.toLowerCase().split("from");
                var strcount = "select count(1) as count from" + strArray[1];
            },
            //增加保存
            saveECEntitiesAdd: function (ecModel, $event, index0) {
                this.pointerEventsBoolean = true
                let _this = this;

                var criteriaId = ecModel.CriteriaId;
                var ecSetType = "";
                var dimOrganisationID = PoolHeader.DimOrganisationID;
                var ecType = ecModel.CriteriaTypeCode;
                var criteriaName = ecModel.CriteriaName;
                var criteriaDesc = ecModel.CriteriaDescription;
                var isEnabled = ecModel.IsEnable;
                var ecPassNo = ecModel.ECPassNo;
                var xmlSqlQueryEC = dataProcess.ecModelToXml(ecModel);
                console.log(xmlSqlQueryEC)
                var xmlSqlQueryDrillThrough = dataProcess.ecModelToXmlSqlQueryDrill(ecModel.XMLSqlQueryDrillThrough);
                var criteriaTableTypeCode = ecModel.CriteriaTableTypeCode;
                var ecUpdateBy = "";
                var executeParam = {
                    SPName: 'dbo.usp_SaveECEntity',
                    SQLParams: []
                };
                //添加日期判断
                if (criteriaDesc == "排除借据到期日无效的贷款" || criteriaDesc == "排除借据起息日" || criteriaDesc == "排除合同起息日" || criteriaDesc == "排除合同到期日") {
                    var tsss = $event.currentTarget;
                    var tarG = $(tsss).parents('.btns-wraper').next().find('input[type="text"]');
                    var lenst = tarG.length;
                    for (var i = 0; i < lenst; i++) {
                        if (!common.checkdate(tarG[i], "number")) {
                            return false
                        }
                    }
                } else {
                    if (criteriaDesc == "待销售资产池目标化") {
                        let NumberOne = this.ecModel[index0].XMLSqlQueryEC.Presentation[0].Field[0].Value;
                        let NumberTwo = this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value;
                        var patternt = new RegExp("[^0-9\,\.]");
                        if (!NumberTwo || NumberTwo == '') {
                            this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value = '输入不能为空';
                            GSDialog.HintWindow('输入值有误，请修改!');
                            return false
                        }
                        if (NumberTwo && patternt.test(NumberTwo)) {
                            this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value = '输入不合法';
                            GSDialog.HintWindow('输入值有误，请修改!');
                            return false
                        }
                        if (NumberTwo && parseFloat(NumberTwo.replace(/,/g, "")) > parseFloat(NumberOne)) {
                            this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value = '不能超过源资产池金额';
                            GSDialog.HintWindow('输入值有误，请修改!');
                            return false
                        }
                        /*var targ = $event.currentTarget;
						var numberGG = $(targ).parents('.btns-wraper').next().find('input[type="text"]').eq(0);
						var numberMoney = numberGG.val().replace(/,/g, "");
						var tarGG = $(targ).parents('.btns-wraper').next().find('input[type="text"]').eq(2);
						var restgg = tarGG.val();
						var patternt = new RegExp("[^0-9\,\.]");
						if(patternt.test(restgg) && restgg) {
						    tarGG.val("输入不合法");
						    return false
						}
						if(restgg && parseFloat(restgg.replace(/,/g, "")) > parseFloat(numberMoney)) {
						    tarGG.val("不能超过源资产池金额");
						    return false
						}*/
                    } else if (criteriaDesc == "统计属性目标化") {
                        let patternt = new RegExp("[^0-9\,\.]");
                        let Presentation = _this.ecModel[index0].XMLSqlQueryEC.Presentation;
                        for (let i = 2; i < Presentation.length; i++) {
                            for (let j = 0; j < Presentation[i].Field[0].SuggestedItems.length; j++) {
                                if (Presentation[i].Field[0].SuggestedItems[j].IsCheck) {
                                    if (Presentation[i].Field[0].SuggestedItems[j].TargetValue && patternt.test(Presentation[i].Field[0].SuggestedItems[j].TargetValue)) {
                                        GSDialog.HintWindow('输入值有误，请修改!');
                                        Presentation[i].Field[0].SuggestedItems[j].TargetValue = "输入不合法";
                                        return false
                                    }
                                    if (Presentation[i].Field[0].SuggestedItems[j].Tolerance && patternt.test(Presentation[i].Field[0].SuggestedItems[j].Tolerance)) {
                                        GSDialog.HintWindow('输入值有误，请修改!');
                                        Presentation[i].Field[0].SuggestedItems[j].Tolerance = "输入不合法";
                                        return false
                                    }
                                }
                            }
                        }
                    } else {
                        var targ = $event.currentTarget;
                        var tarGG = $(targ).parents('.btns-wraper').next().find('input[type="text"]');
                        var restgg = tarGG.val();
                        var patternt = new RegExp("[^0-9\,\.]");
                        if (patternt.test(restgg) && restgg) {
                            tarGG.val("输入不合法");
                            return false
                        }
                    }
                }
                executeParam.SQLParams.push({
                    Name: 'PoolId',
                    Value: poolId,
                    DBType: 'int'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaId',
                    Value: criteriaId,
                    DBType: 'int'
                });
                executeParam.SQLParams.push({
                    Name: 'ECSetType',
                    Value: ecSetType,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'DimOrganisationID',
                    Value: dimOrganisationID,
                    DBType: 'int'
                });
                executeParam.SQLParams.push({
                    Name: 'ECType',
                    Value: ecType,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaName',
                    Value: criteriaName,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaDesc',
                    Value: criteriaDesc,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'IsEnabled',
                    Value: isEnabled,
                    DBType: 'bool'
                });
                executeParam.SQLParams.push({
                    Name: 'ECPassNo',
                    Value: ecPassNo,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'XmlSqlQueryEC',
                    Value: xmlSqlQueryEC,
                    DBType: 'xml'
                });
                executeParam.SQLParams.push({
                    Name: 'XMLSqlQueryDrillThrough',
                    Value: xmlSqlQueryDrillThrough,
                    DBType: 'xml'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaTableTypeCode',
                    Value: criteriaTableTypeCode,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'ECUpdateBy',
                    Value: ecUpdateBy,
                    DBType: 'string'
                });
                console.log(executeParam)
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL +
					'CommonGetWithConnStr?connStr={0}&exeParams={1}'.format(encodeURIComponent(TargetSqlConnection), executeParams);
                CallWCFSvc(serviceUrl, true, 'GET', function (response) {
                    _this.getListDate();
                    _this.getAddSelect();
                    _this.pointerEventsBoolean = false;
                });
            },
            //目标页面保存
            saveECEntitiesTarget: function (ecModel, $event, index0) {
                this.pointerEventsBoolean = true
                let _this = this;

                var criteriaId = ecModel.CriteriaId;
                var ecSetType = "";
                var dimOrganisationID = PoolHeader.DimOrganisationID;
                var ecType = ecModel.CriteriaTypeCode;
                var criteriaName = ecModel.CriteriaName;
                var criteriaDesc = ecModel.CriteriaDescription;
                var isEnabled = ecModel.IsEnable;
                var ecPassNo = ecModel.ECPassNo;
                var xmlSqlQueryEC = dataProcess.ecModelToXml(ecModel);
                console.log(xmlSqlQueryEC)
                var xmlSqlQueryDrillThrough = dataProcess.ecModelToXmlSqlQueryDrill(ecModel.XMLSqlQueryDrillThrough);
                var criteriaTableTypeCode = ecModel.CriteriaTableTypeCode;
                var ecUpdateBy = "";
                var executeParam = {
                    SPName: 'dbo.usp_SaveECEntity',
                    SQLParams: []
                };
                //添加日期判断
                if (criteriaDesc == "排除借据到期日无效的贷款" || criteriaDesc == "排除借据起息日" || criteriaDesc == "排除合同起息日" || criteriaDesc == "排除合同到期日") {
                    var tsss = $event.currentTarget;
                    var tarG = $(tsss).parents('.btns-wraper').next().find('input[type="text"]');
                    var lenst = tarG.length;
                    for (var i = 0; i < lenst; i++) {
                        if (!common.checkdate(tarG[i], "number")) {
                            return false
                        }
                    }
                } else {
                    if (criteriaDesc == "待销售资产池目标化") {
                        let NumberOne = this.ecModel[index0].XMLSqlQueryEC.Presentation[0].Field[0].Value;
                        let NumberTwo = this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value;
                        var patternt = new RegExp("[^0-9\,\.]");
                        if (!NumberTwo || NumberTwo == '') {
                            this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value = '输入不能为空';
                            GSDialog.HintWindow('输入值有误，请修改!');
                            return false
                        }
                        if (NumberTwo && patternt.test(NumberTwo)) {
                            this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value = '输入不合法';
                            GSDialog.HintWindow('输入值有误，请修改!');
                            return false
                        }
                        if (NumberTwo && parseFloat(NumberTwo.replace(/,/g, "")) > parseFloat(NumberOne)) {
                            this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value = '不能超过源资产池金额';
                            GSDialog.HintWindow('输入值有误，请修改!');
                            return false
                        }
                        /*var targ = $event.currentTarget;
						var numberGG = $(targ).parents('.btns-wraper').next().find('input[type="text"]').eq(0);
						var numberMoney = numberGG.val().replace(/,/g, "");
						var tarGG = $(targ).parents('.btns-wraper').next().find('input[type="text"]').eq(2);
						var restgg = tarGG.val();
						var patternt = new RegExp("[^0-9\,\.]");
						if(patternt.test(restgg) && restgg) {
						    tarGG.val("输入不合法");
						    return false
						}
						if(restgg && parseFloat(restgg.replace(/,/g, "")) > parseFloat(numberMoney)) {
						    tarGG.val("不能超过源资产池金额");
						    return false
						}*/
                    } else if (criteriaDesc == "统计属性目标化") {
                        let patternt = new RegExp("[^0-9\,\.]");
                        let isSelectedNumber = 0,
							sumTargetValue = 0,
							sumTolerance = 0;
                        let Presentation = _this.ecModel[index0].XMLSqlQueryEC.Presentation;
                        //输入是否为数字
                        for (let i = 2; i < Presentation.length; i++) {
                            for (let j = 0; j < Presentation[i].Field[0].SuggestedItems.length; j++) {
                                if (Presentation[i].Field[0].SuggestedItems[j].IsCheck) {
                                    if (Presentation[i].Field[0].SuggestedItems[j].TargetValue && patternt.test(Presentation[i].Field[0].SuggestedItems[j].TargetValue)) {
                                        GSDialog.HintWindow('输入值有误，请修改!');
                                        Presentation[i].Field[0].SuggestedItems[j].TargetValue = "输入不合法";
                                        _this.pointerEventsBoolean = false
                                        return false
                                    }
                                    if (Presentation[i].Field[0].SuggestedItems[j].Tolerance && patternt.test(Presentation[i].Field[0].SuggestedItems[j].Tolerance)) {
                                        GSDialog.HintWindow('输入值有误，请修改!');
                                        Presentation[i].Field[0].SuggestedItems[j].Tolerance = "输入不合法";
                                        _this.pointerEventsBoolean = false
                                        return false
                                    }
                                }
                            }
                        }
                        //是否同时勾选多种分布
                        for (let i = 3; i < Presentation.length; i++) {
                            for (let j = 0; j < Presentation[i].Field[0].SuggestedItems.length; j++) {
                                if (Presentation[i].Field[0].SuggestedItems[j].IsCheck) {
                                    isSelectedNumber += 1;
                                    break;
                                }
                            }
                        }
                        if (isSelectedNumber > 1) {
                            GSDialog.HintWindow('不能同时选择多种分布进行目标化，请修改!');
                            _this.pointerEventsBoolean = false
                            return false
                        }
                        //判断勾选的值是否为空
                        for (let i = 2; i < Presentation.length; i++) {
                            for (let j = 0; j < Presentation[i].Field[0].SuggestedItems.length; j++) {
                                if (Presentation[i].Field[0].SuggestedItems[j].IsCheck) {
                                    if (Presentation[i].Field[0].SuggestedItems[j].TargetValue == '' || Presentation[i].Field[0].SuggestedItems[j].TargetValue == null) {
                                        GSDialog.HintWindow('输入值有误，请修改!');
                                        Presentation[i].Field[0].SuggestedItems[j].TargetValue = "输入不能为空";
                                        _this.pointerEventsBoolean = false
                                        return false
                                    }
                                    if (Presentation[i].Field[0].SuggestedItems[j].Tolerance == '' || Presentation[i].Field[0].SuggestedItems[j].Tolerance == null) {
                                        GSDialog.HintWindow('输入值有误，请修改!');
                                        Presentation[i].Field[0].SuggestedItems[j].Tolerance = "输入不能为空";
                                        _this.pointerEventsBoolean = false
                                        return false
                                    }
                                }
                            }
                        }
                        //判断勾选的值是否大于1
                        for (let i = 3; i < Presentation.length; i++) {
                            for (let j = 0; j < Presentation[i].Field[0].SuggestedItems.length; j++) {
                                if (Presentation[i].Field[0].SuggestedItems[j].IsCheck && Presentation[i].Field[0].SuggestedItems[j].TargetValue != '') {
                                    sumTargetValue += Number(Presentation[i].Field[0].SuggestedItems[j].TargetValue);
                                    sumTolerance += Number(Presentation[i].Field[0].SuggestedItems[j].Tolerance);
                                }
                            }
                        }
                        if (sumTargetValue > 1 || sumTolerance > 1) {
                            GSDialog.HintWindow('TargetValue或者Tolerance的输入值大于1，请修改!');
                            _this.pointerEventsBoolean = false
                            return false
                        }
                    } else {
                        var targ = $event.currentTarget;
                        var tarGG = $(targ).parents('.btns-wraper').next().find('input[type="text"]');
                        var restgg = tarGG.val();
                        var patternt = new RegExp("[^0-9\,\.]");
                        if (patternt.test(restgg) && restgg) {
                            tarGG.val("输入不合法");
                            return false
                        }
                    }
                }
                executeParam.SQLParams.push({
                    Name: 'PoolId',
                    Value: poolId,
                    DBType: 'int'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaId',
                    Value: criteriaId,
                    DBType: 'int'
                });
                executeParam.SQLParams.push({
                    Name: 'ECSetType',
                    Value: ecSetType,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'DimOrganisationID',
                    Value: dimOrganisationID,
                    DBType: 'int'
                });
                executeParam.SQLParams.push({
                    Name: 'ECType',
                    Value: ecType,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaName',
                    Value: criteriaName,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaDesc',
                    Value: criteriaDesc,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'IsEnabled',
                    Value: isEnabled,
                    DBType: 'bool'
                });
                executeParam.SQLParams.push({
                    Name: 'ECPassNo',
                    Value: ecPassNo,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'XmlSqlQueryEC',
                    Value: xmlSqlQueryEC,
                    DBType: 'xml'
                });
                executeParam.SQLParams.push({
                    Name: 'XMLSqlQueryDrillThrough',
                    Value: xmlSqlQueryDrillThrough,
                    DBType: 'xml'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaTableTypeCode',
                    Value: criteriaTableTypeCode,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'ECUpdateBy',
                    Value: ecUpdateBy,
                    DBType: 'string'
                });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL +
					'CommonGetWithConnStr?connStr={0}&exeParams={1}'.format(encodeURIComponent(TargetSqlConnection), executeParams);
                CallWCFSvc(serviceUrl, true, 'GET', function (response) {
                    //如果其他引用这个js文件在保存的时候没有提示成功信息，注意引入toast.css
                    $.toast({ type: 'success', message: '保存成功!' })
                    _this.getListDate();
                    _this.getAddSelect();
                    _this.pointerEventsBoolean = false;
                });
            },
            //closePreview: function() {
            //    window.close();
            //},
            //统计属性目标化数值校验
            NumberCheck: function (p, $event) {
                var target = $event.currentTarget;
                var tex = new RegExp("[^.0-9]");
                if (tex.test(p)) {
                    $(target).val("")
                }
                if (parseFloat(p) != p) {
                    $(target).val("")
                }
            },
            getAssetTypeById: function (PoolId) {
                var executeParam = {
                    SPName: 'dbo.usp_GetPoolHeaderExtById',
                    SQLParams: []
                };
                executeParam.SQLParams.push({
                    Name: 'PoolId',
                    Value: PoolId,
                    DBType: 'int'
                });

                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=DAL_SEC_PoolConfig&exeParams=' + executeParams;
                CallWCFSvc(serviceUrl, false, 'GET', function (data) {
                    DimAssetTypeID = data[0].DimAssetTypeId;

                });

            },
            //根据资产类型选择不同的资产筛选导入数据ssis
            getAssetTypeBycode: function (PoolId) {
                var executeParam = {
                    SPName: 'dbo.usp_GetPoolHeaderExtByCode',
                    SQLParams: []
                };
                executeParam.SQLParams.push({
                    Name: 'PoolId',
                    Value: PoolId,
                    DBType: 'int'
                });

                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=DAL_SEC_PoolConfig&exeParams=' + executeParams;
                CallWCFSvc(serviceUrl, false, 'GET', function (data) {
                    AssetType = data[0].AssetType;

                });
                if (AssetType == 'FinanceLease') {
                    SSISPackagePath = 'E:\\TSSWCFServices\\PoolCut\\ConsumerLoan\\SSIS\\PoolCut.Load_FinanceLease.dtsx';
                    SSISPackagePathTarget = 'E:\\TSSWCFServices\\PoolCut\\ConsumerLoan\\SSIS\\ConsumerLoan.TargetPool.Load_Auto.dtsx'
                } else if (AssetType == 'CreditAccountAllAssets') {
                    SSISPackagePath = 'E:\\TSSWCFServices\\PoolCut\\ConsumerLoan\\SSIS\\PoolCut.Load_CreditAccount.dtsx';
                    SSISPackagePathTarget = 'E:\\TSSWCFServices\\PoolCut\\ConsumerLoan\\SSIS\\ConsumerLoan.TargetPool.Load_CreditAccount.dtsx'
                } else { 
                    SSISPackagePath = 'E:\\TSSWCFServices\\PoolCut\\ConsumerLoan\\SSIS\\PoolCut.Load_AUTO.dtsx';
                    SSISPackagePathTarget = 'E:\\TSSWCFServices\\PoolCut\\ConsumerLoan\\SSIS\\ConsumerLoan.TargetPool.Load_Auto.dtsx'
                }
                 
            },
            saveEnableEC: function () {
                // 2017.04.27
                var dimPoolId = parseInt(poolId);
                var ECs = dataProcess.ecListModelToEnabelDisableXml(this.ecModel);
                var executeParam = {
                    SPName: 'usp_EnableDisableECs',
                    SQLParams: [{
                        Name: 'DimPoolId',
                        value: dimPoolId,
                        DBType: 'int'
                    },
						{
						    Name: 'ECs',
						    value: ECs,
						    DBType: 'xml'
						}
                    ]
                };
                var executeParams = JSON.stringify(executeParam);
                var params = '';
                params += '<root appDomain="dbo" postType="" connString="' + TargetSqlConnection + '">'; // appDomain="TrustManagement"
                params += executeParams;
                params += '</root>';

                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonPostExecute";
                //console.log('process', TargetSqlConnection)
                //console.log('process', serviceUrl);
                self = this;
                $.ajax({
                    type: "POST",
                    url: serviceUrl,
                    dataType: "json",
                    contentType: "application/xml;charset=utf-8",
                    data: params,
                    processData: false,
                    success: function (response) {
                        //GSDialog.HintWindow('保存成功!');
                        
                        self.getAssetTypeById(PoolId);
                        self.getAssetTypeBycode(PoolId);
                        self.callTaskService(DimAssetTypeID);
                    },
                    error: function (response) {
                        GSDialog.HintWindow("error is :" + response);
                    }
                });
            },
            saveCriteria: function () {

                //var criteriaCode = self.$route.params.code;
                var criteriaTypeCode = this.ecModel[0].CriteriaSetTypeCode
                var criteriaSetXml = dataProcess.ecListModelToCriteriaSetXml(this.ecModel);

                //var executeParam = { SPName: 'config.usp_saveCriteriaSet', SQLParams: [] };
                var executeParam = {
                    SPName: 'usp_saveCriteriaSet',
                    SQLParams: []
                };
                executeParam.SQLParams.push({
                    Name: 'Operator',
                    Value: 'Update',
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaSetCode',
                    Value: criteriaTypeCode,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'OldCriteriaSetCode',
                    Value: criteriaTypeCode,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaSetXML',
                    Value: criteriaSetXml,
                    DBType: 'xml'
                });

                var executeParams = encodeURIComponent(JSON.stringify(executeParam));

                var params = '';
                params += '<root appDomain="dbo" postType="" connString="' + TargetSqlConnection + '">'; // appDomain="TrustManagement"
                params += executeParams;
                params += '</root>';

                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonPostExecute";
                console.log('targite', executeParam)
                console.log('targite', criteriaSetXml);
                $.ajax({
                    type: "POST",
                    url: serviceUrl,
                    dataType: "json",
                    contentType: "application/xml;charset=utf-8",
                    data: params,
                    processData: false,
                    success: function (response) {
                        $.toast({ type: 'success', message: '保存成功!' })
                    },
                    error: function (response) {
                        GSDialog.HintWindow("error is :" + response);
                    }
                });

                //var serviceUrl = GlobalVariable.PoolCutServiceURL
                //    + 'CommonGet?connName=' + TargetSqlConnection + '&exeParams={0}'.format(executeParams);
                //CallWCFSvc(serviceUrl, true, 'GET', function (response) {
                //    alert('保存成功!');
                //});

            },
            saveECEntities: function (ecModel, $event, index0) {
                var _this = this;

                var criteriaId = ecModel.CriteriaId;
                var ecSetType = "";
                var dimOrganisationID = PoolHeader.DimOrganisationID;
                var ecType = ecModel.CriteriaTypeCode;
                var criteriaName = ecModel.CriteriaName;
                var criteriaDesc = ecModel.CriteriaDescription;
                var isEnabled = ecModel.IsEnable;
                var ecPassNo = ecModel.ECPassNo;
                var xmlSqlQueryEC = dataProcess.ecModelToXml(ecModel);
                console.log(xmlSqlQueryEC)
                var xmlSqlQueryDrillThrough = dataProcess.ecModelToXmlSqlQueryDrill(ecModel.XMLSqlQueryDrillThrough);
                var criteriaTableTypeCode = ecModel.CriteriaTableTypeCode;
                var ecUpdateBy = "";
                var executeParam = {
                    SPName: 'dbo.usp_SaveECEntity',
                    SQLParams: []
                };
                //添加日期判断
                if (criteriaDesc == "排除借据到期日无效的贷款" || criteriaDesc == "排除借据起息日" || criteriaDesc == "排除合同起息日" || criteriaDesc == "排除合同到期日") {
                    var tsss = $event.currentTarget;
                    var tarG = $(tsss).parents('.btns-wraper').next().find('input[type="text"]');
                    var lenst = tarG.length;
                    for (var i = 0; i < lenst; i++) {
                        if (!common.checkdate(tarG[i], "number")) {
                            return false
                        }
                    }
                } else {
                    if (criteriaDesc == "待销售资产池目标化") {
                        var NumberOne = this.ecModel[index0].XMLSqlQueryEC.Presentation[0].Field[0].Value;
                        var NumberTwo = this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value;
                        var mutualExclusionValue = this.mutualExclusionValue;
                        var patternt = new RegExp("[^0-9\,\.]");
                        if (!NumberTwo || NumberTwo == '') {
                            this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value = '输入不能为空';
                            GSDialog.HintWindow('输入值有误，请修改!');
                            return false
                        }
                        if (NumberTwo && patternt.test(NumberTwo)) {
                            this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value = '输入不合法';
                            GSDialog.HintWindow('输入值有误，请修改!');
                            return false
                        }
                        if (_this.isMutualExclusion) {
                            if (NumberTwo && parseFloat(NumberTwo.replace(/,/g, "")) > parseFloat(mutualExclusionValue)) {
                                this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value = '不能超过源资产池金额';
                                GSDialog.HintWindow('输入值有误，请修改!');
                                return false
                            }
                        } else {
                            if (NumberTwo && parseFloat(NumberTwo.replace(/,/g, "")) > parseFloat(NumberOne)) {
                                this.ecModel[index0].XMLSqlQueryEC.Presentation[2].Field[0].Value = '不能超过源资产池金额';
                                GSDialog.HintWindow('输入值有误，请修改!');
                                return false
                            }
                        }
                        /*var targ = $event.currentTarget;
						var numberGG = $(targ).parents('.btns-wraper').next().find('input[type="text"]').eq(0);
						var numberMoney = numberGG.val().replace(/,/g, "");
						var tarGG = $(targ).parents('.btns-wraper').next().find('input[type="text"]').eq(2);
						var restgg = tarGG.val();
						var patternt = new RegExp("[^0-9\,\.]");
						if(patternt.test(restgg) && restgg) {
						    tarGG.val("输入不合法");
						    return false
						}
						if(restgg && parseFloat(restgg.replace(/,/g, "")) > parseFloat(numberMoney)) {
						    tarGG.val("不能超过源资产池金额");
						    return false
						}*/
                    } else if (criteriaDesc == "统计属性目标化") {
                        let patternt = new RegExp("[^0-9\,\.]");
                        let Presentation = _this.ecModel[index0].XMLSqlQueryEC.Presentation;
                        for (let i = 2; i < Presentation.length; i++) {
                            for (let j = 0; j < Presentation[i].Field[0].SuggestedItems.length; j++) {
                                if (Presentation[i].Field[0].SuggestedItems[j].IsCheck) {
                                    if (Presentation[i].Field[0].SuggestedItems[j].TargetValue && patternt.test(Presentation[i].Field[0].SuggestedItems[j].TargetValue)) {
                                        GSDialog.HintWindow('输入值有误，请修改!');
                                        Presentation[i].Field[0].SuggestedItems[j].TargetValue = "输入不合法";
                                        return false
                                    }
                                    if (Presentation[i].Field[0].SuggestedItems[j].Tolerance && patternt.test(Presentation[i].Field[0].SuggestedItems[j].Tolerance)) {
                                        GSDialog.HintWindow('输入值有误，请修改!');
                                        Presentation[i].Field[0].SuggestedItems[j].Tolerance = "输入不合法";
                                        return false
                                    }
                                }
                            }
                        }
                    } else {
                        var targ = $event.currentTarget;
                        var tarGG = $(targ).parents('.btns-wraper').next().find('input[type="text"]');
                        var restgg = tarGG.val();
                        var patternt = new RegExp("[^0-9\,\.]");
                        if (patternt.test(restgg) && restgg) {
                            tarGG.val("输入不合法");
                            return false
                        }
                    }
                }
                executeParam.SQLParams.push({
                    Name: 'PoolId',
                    Value: poolId,
                    DBType: 'int'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaId',
                    Value: criteriaId,
                    DBType: 'int'
                });
                executeParam.SQLParams.push({
                    Name: 'ECSetType',
                    Value: ecSetType,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'DimOrganisationID',
                    Value: dimOrganisationID,
                    DBType: 'int'
                });
                executeParam.SQLParams.push({
                    Name: 'ECType',
                    Value: ecType,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaName',
                    Value: criteriaName,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaDesc',
                    Value: criteriaDesc,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'IsEnabled',
                    Value: isEnabled,
                    DBType: 'bool'
                });
                executeParam.SQLParams.push({
                    Name: 'ECPassNo',
                    Value: ecPassNo,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'XmlSqlQueryEC',
                    Value: xmlSqlQueryEC,
                    DBType: 'xml'
                });
                executeParam.SQLParams.push({
                    Name: 'XMLSqlQueryDrillThrough',
                    Value: xmlSqlQueryDrillThrough,
                    DBType: 'xml'
                });
                executeParam.SQLParams.push({
                    Name: 'CriteriaTableTypeCode',
                    Value: criteriaTableTypeCode,
                    DBType: 'string'
                });
                executeParam.SQLParams.push({
                    Name: 'ECUpdateBy',
                    Value: ecUpdateBy,
                    DBType: 'string'
                });
                console.log(executeParam)
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL +
					'CommonGetWithConnStr?connStr={0}&exeParams={1}'.format(encodeURIComponent(TargetSqlConnection), executeParams);
                CallWCFSvc(serviceUrl, true, 'GET', function (response) {
                    $.toast({ type: 'success', message: '保存成功!' })
                });
            },
            refreshQuery: function (EC) {
                EC.activeView = 'Query';
                dataProcess.getQuery(EC);
            },
            callTaskService: function (DimAssetTypeID) {
                console.log("titleText: " + this.titleText)
                var isMutualExclusion = '';
                var Overlap = '';
                if (this.isMutualExclusion) {
                    isMutualExclusion = 1;
                    Overlap = 'true';
                } else {
                    isMutualExclusion = 0;
                    Overlap = 'false';
                };
                if (this.titleText == '目标化' || this.titleText == '额度调整' || this.titleText == 'PoolTargetParent' || this.titleText == 'PoolTargetChild') {
                    sVariableBuilder.AddVariableItem('PoolID', PoolId, 'Int', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('ParentPoolId', PoolHeader.ParentPoolId, 'Int', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('IsParent', PoolHeader.ParentPoolId == 0, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('ActionPoolType', '', 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('DimOrganisationId', PoolHeader.DimOrganisationID, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('DimAssetTypeID', DimAssetTypeID, 'String', 1);
                    sVariableBuilder.AddVariableItem('DimSourceTrustID', PoolHeader.DimSourceTrustID, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('isMutualExclusion', isMutualExclusion, 'Int', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('Overlap', Overlap, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('SSISPackagePathTarget', SSISPackagePathTarget, 'String', 0, 0, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'ConsumerLoan',
                        taskCode: TaskCodes[PoolHeader.PoolTypeId],
                        sContext: sVariable,
                        callback: function () {
                            var baseId = PoolHeader.PoolDBName.split('_')[PoolHeader.PoolDBName.split('_').length - 1];
                            var tabId = PoolHeader.ParentPoolId == 0 ? PoolId : PoolHeader.ParentPoolId
                            var basePoolWin = $('iframe[src*=basePoolContent][id={0}]'.format(baseId), parent.document)[0].contentWindow;
                            if (basePoolWin && basePoolWin.refreshKendouGrid && typeof (basePoolWin.refreshKendouGrid) == 'function') {
                                basePoolWin.refreshKendouGrid();
                            }
                            sVariableBuilder.ClearVariableItem();
                            //$('div.active i.fa-close', parent.document).click()
                            $('div.active div.chrome-tab-close', parent.document).click()
                        }
                    });
                    tIndicator.show();
                }
                else {
                    sVariableBuilder.AddVariableItem('PoolID', PoolId, 'Int', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('ParentPoolId', PoolHeader.ParentPoolId, 'Int', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('IsParent', PoolHeader.ParentPoolId == 0, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('ActionPoolType', '', 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('DimOrganisationId', PoolHeader.DimOrganisationID, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('DimAssetTypeID', DimAssetTypeID, 'String', 1);
                    sVariableBuilder.AddVariableItem('DimSourceTrustID', PoolHeader.DimSourceTrustID, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('isMutualExclusion', isMutualExclusion, 'Int', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('Overlap', Overlap, 'String', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('SSISPackagePath', SSISPackagePath, 'String', 0, 0, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'ConsumerLoan',
                        taskCode: TaskCodes[PoolHeader.PoolTypeId],
                        sContext: sVariable,
                        callback: function () {
                            var baseId = PoolHeader.PoolDBName.split('_')[PoolHeader.PoolDBName.split('_').length - 1];
                            var tabId = PoolHeader.ParentPoolId == 0 ? PoolId : PoolHeader.ParentPoolId
                            var basePoolWin = $('iframe[src*=basePoolContent][id={0}]'.format(baseId), parent.document)[0].contentWindow;
                            if (basePoolWin && basePoolWin.refreshKendouGrid && typeof (basePoolWin.refreshKendouGrid) == 'function') {
                                basePoolWin.refreshKendouGrid();
                            }
                            sVariableBuilder.ClearVariableItem();
                            //$('div.active i.fa-close', parent.document).click()
                            $('div.active div.chrome-tab-close', parent.document).click()


                        }
                    });
                    tIndicator.show();
                }
                //tpi.ShowIndicator('ConsumerLoan', TaskCodes[PoolHeader.PoolTypeId], element);
            },
            
            rerunTask: function () {
                self = this;
                self.getAssetTypeById(PoolId);
                self.getAssetTypeBycode(PoolId);
                self.callTaskService(DimAssetTypeID);
            },
            t_rerunTask: function () {
                self.getAssetTypeById(PoolId);
                self.getAssetTypeBycode(PoolId);
                var isMutualExclusion = '';
                var Overlap = '';
                if (this.isMutualExclusion) {
                    isMutualExclusion = 1;
                    Overlap = 'true';
                } else {
                    isMutualExclusion = 0;
                    Overlap = 'false';
                };
                if (this.titleText == '目标化' || this.titleText == '额度调整' || this.titleText == 'PoolTargetParent' || this.titleText == 'PoolTargetChild') {
                    sVariableBuilder.AddVariableItem('ParentPoolId', PoolHeader.PoolId, 'Int', 1, 0);
                    sVariableBuilder.AddVariableItem('IsParent', 0, 'String', 1, 0);
                    sVariableBuilder.AddVariableItem('ActionPoolType', common.getQueryString('ActionPoolType'), 'String', 1, 0);
                    sVariableBuilder.AddVariableItem('DimOrganisationId', PoolHeader.DimOrganisationID, 'String', 1, 0);
                    sVariableBuilder.AddVariableItem('DimAssetTypeId', DimAssetTypeID, 'String', 1, 0);
                    sVariableBuilder.AddVariableItem('isMutualExclusion', isMutualExclusion, 'Int', 1, 0);
                    sVariableBuilder.AddVariableItem('Overlap', Overlap, 'String', 1, 0);
                    sVariableBuilder.AddVariableItem('SSISPackagePathTarget', SSISPackagePathTarget, 'String', 0, 0, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    //tpi.ShowIndicator('ConsumerLoan', TaskCodes[PoolHeader.PoolTypeId], element);
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'ConsumerLoan',
                        taskCode: TaskCodes[common.getQueryString('ActionPoolType')],
                        sContext: sVariable,
                        callback: function () {
                            //window.location.href = '../basePoolContentKendo/basePoolContent.html?PoolId={0}&PoolName={1}'.format(PoolId, sessionStorage.PoolName);
                            //$('iframe[src*=basePoolContent]', parent.document)[0].contentWindow.location.reload(true);
                            var baseId = PoolHeader.PoolDBName.split('_')[PoolHeader.PoolDBName.split('_').length - 1];
                            var tabId = PoolHeader.ParentPoolId == 0 ? PoolId : PoolHeader.ParentPoolId
                            var basePoolWin = $('iframe[src*=basePoolContent][id={0}]'.format(baseId), parent.document)[0].contentWindow;
                            if (basePoolWin && basePoolWin.refreshKendouGrid && typeof (basePoolWin.refreshKendouGrid) == 'function') {
                                basePoolWin.refreshKendouGrid();
                            }
                            sVariableBuilder.ClearVariableItem();
                            //$('div.active i.fa-close', parent.document).click()
                            $('div.active div.chrome-tab-close', parent.document).click()
                        }
                    });
                    tIndicator.show();
                }
                else {
                    sVariableBuilder.AddVariableItem('PoolID', PoolId, 'Int', 0, 0, 0);
                    sVariableBuilder.AddVariableItem('ParentPoolId', PoolHeader.PoolId, 'Int', 0, 1, 0);
                    sVariableBuilder.AddVariableItem('IsParent', 0, 'String', 0, 1, 0);
                    sVariableBuilder.AddVariableItem('ActionPoolType', common.getQueryString('ActionPoolType'), 'String', 0, 1, 0);
                    sVariableBuilder.AddVariableItem('DimOrganisationId', PoolHeader.DimOrganisationID, 'String', 0, 1, 0);
                    sVariableBuilder.AddVariableItem('DimAssetTypeId', DimAssetTypeID, 'String', 0, 1, 0);
                    sVariableBuilder.AddVariableItem('isMutualExclusion', isMutualExclusion, 'Int', 0, 1, 0);
                    sVariableBuilder.AddVariableItem('Overlap', Overlap, 'String', 0, 1, 0);
                    var sVariable = sVariableBuilder.BuildVariables();
                    //tpi.ShowIndicator('ConsumerLoan', TaskCodes[PoolHeader.PoolTypeId], element);
                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'ConsumerLoan',
                        taskCode: TaskCodes[common.getQueryString('ActionPoolType')],
                        sContext: sVariable,
                        callback: function () {
                            //window.location.href = '../basePoolContentKendo/basePoolContent.html?PoolId={0}&PoolName={1}'.format(PoolId, sessionStorage.PoolName);
                            //$('iframe[src*=basePoolContent]', parent.document)[0].contentWindow.location.reload(true);
                            var baseId = PoolHeader.PoolDBName.split('_')[PoolHeader.PoolDBName.split('_').length - 1];
                            var tabId = PoolHeader.ParentPoolId == 0 ? PoolId : PoolHeader.ParentPoolId
                            var basePoolWin = $('iframe[src*=basePoolContent][id={0}]'.format(baseId), parent.document)[0].contentWindow;
                            if (basePoolWin && basePoolWin.refreshKendouGrid && typeof (basePoolWin.refreshKendouGrid) == 'function') {
                                basePoolWin.refreshKendouGrid();
                            }
                            sVariableBuilder.ClearVariableItem();
                            //$('div.active i.fa-close', parent.document).click()
                            $('div.active div.chrome-tab-close', parent.document).click()
                        }
                    });
                    tIndicator.show();
                }

            },

            target: function () {
                gsAdmin.open(
					'CurrentRate参考范围',
					GlobalVariable.TrustManagementServiceHostURL + 'assetFilter/poolProcess/CurrentRate.html?PoolId=' + PoolId,
					'',
					function () {


					},
					'750',
					'500', '', true, false)
            }, //
            term: function () {
                gsAdmin.open(
					'RemainingTerm参考范围',
					GlobalVariable.TrustManagementServiceHostURL + 'assetFilter/poolProcess/RemainingTerm.html?PoolId=' + PoolId,
					'',
					function () {

					},
					'750',
					'500', '', true, false)
            },
            inputChage: function (e) {
                /*
                 var inputObj = $(e.target);
                 var divObj = inputObj.next();
                 var tipObjs = $(divObj.children()[1]);
                 inputObj.val(ECPreviewControl.filters.format(inputObj.val()));
                 var formatValue = gsUtil.getChineseNum(inputObj.val());
                 tipObjs.text(formatValue);
                 tipObjs.show();
                 */
            },
            inputFocus: function (e) {
                var inputObj = $(e.target);
                var divObj = inputObj.next();
                var tipObjs = $(divObj.children()[1]);
                var formatValue = gsUtil.getChineseNum(inputObj.val());
                tipObjs.text(formatValue);
                tipObjs.show();
            },
            inputBlur: function (e) {
                var inputObj = $(e.target);
                var divObj = inputObj.next();
                var tipObjs = $(divObj.children()[1]);
                inputObj.val(ECPreviewControl.filters.format(inputObj.val()));
                inputObj.val(ECPreviewControl.filters.numFormt.write(inputObj.val()));
                var formatValue = gsUtil.getChineseNum(inputObj.val());
                tipObjs.text(formatValue);
                tipObjs.hide();

            },
            divMouseover: function (e) {
                e.preventDefault();
                e.cancelBubble = true;
                var divObj = $(e.target);
                var inputObj = divObj.prev();
                var tipObjs = $(divObj.children()[1]);
                //ECPreviewControl.filters.format(inputObj.val())
                inputObj.val();
                var formatValue = gsUtil.getChineseNum(inputObj.val());
                tipObjs.text(formatValue);
                tipObjs.show();
            },
            divMouseleave: function (e) {
                e.preventDefault();
                e.cancelBubble = true;
                var divObj = $(e.target);
                var inputObj = divObj.prev();
                var tipObjs = $(divObj.children()[1]);
                if (!$(inputObj).is(':focus'))
                    tipObjs.hide();
            },
            dataCheck: function (TargetValue, IsChecked, index, index1, event, type) {
                if (IsChecked) {
                    if (type == "TargetValue")
                        this.ecModel[0].XMLSqlQueryEC.Presentation[index].__ob__.value.Field[0].SuggestedItems[index1].TargetValue = this.check(TargetValue, event);
                    if (type == "Tolerance")
                        this.ecModel[0].XMLSqlQueryEC.Presentation[index].__ob__.value.Field[0].SuggestedItems[index1].Tolerance = this.check(TargetValue, event);
                }
            },
            check: function (TargetValue, event) {
                var patternt = new RegExp("[^0-9\,\.]");
                if (TargetValue == "") {
                    $(event.target).css("border-color", "red")
                    return "输入值不能为空"
                } else if (TargetValue && patternt.test(TargetValue)) {
                    $(event.target).css("border-color", "red")
                    return "输入不合法"
                } else {
                    $(event.target).css("border-color", "")
                    return TargetValue
                }
            },
            reWrite: function (TargetValue, IsChecked, event) {
                $(event.target).css("border-color", "")
                if (TargetValue == "输入值不能为空" | TargetValue == "输入不合法")
                    $(event.target)[0].value = ""

            },
        },
        filters: {
            format: function (num) {
                if (num) {
                    num = num.toString().replace(/\$|\,/g, '');
                    //if ('' == num || isNaN(num)) {
                    //    return 'Not a Number ! ';
                    //}
                    //var sign = num.indexOf("-") > 0 ? '-' : '';
                    //var cents = num.indexOf(".") > 0 ? num.substr(num.indexOf(".")) : '';
                    //cents = cents.length > 1 ? cents : '';
                    ////注意：这里如果是使用change方法不断的调用，小数是输入不了的
                    //num = num.indexOf(".") > 0 ? num.substring(0, (num.indexOf("."))) : num;
                    //if ('' == cents) {
                    //    if (num.length > 1 && '0' == num.substr(0, 1)) {
                    //        return 'Not a Number ! ';
                    //    }
                    //}
                    //else {
                    //    if (num.length > 1 && '0' == num.substr(0, 1)) {
                    //        return 'Not a Number ! ';
                    //    }
                    //}
                    //for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3) ; i++) {
                    //    num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
                    //}
                    //return (sign + num + cents);
                    return num;
                }

            },
            numFormt: {
                read: function (p) {
                    if (parseFloat(p) == p) {
                        var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                            return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                                return $1 + ",";
                            });
                        })
                        return res;
                    } else
                        return p;
                },
                write: function (p) {
                    console.log(p)
                    if (parseFloat(p) == p) {
                        var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                            return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                                return $1 + ",";
                            });
                        })
                        return res;
                    } else
                        return p;
                },
            }
        },
        created: function () {
            this.titleText = titleText;
            this.getAddSelect();
            this.getListDate();
        },
        watch: {
            ecModel: function (nv) {
                var self = this;
                var codeSet = [];
                nv.forEach(function (value, index) {
                    if (value.IsEnable) {
                        self.checkedSet.push(value.CriteriaId);
                    }
                    if (codeSet.indexOf(value.CriteriaTypeCode) == -1) {
                        codeSet.push(value.CriteriaTypeCode);
                    }
                });
                codeSet.forEach(function (v, i) {
                    self.CriteriaTypeCodeSet.push({
                        code: v,
                        isShow: true
                    })
                });
            },
            'checkedSet.length': function () {
                var self = this;
                self.ecModel.forEach(function (value, index) {
                    value.IsEnable = false;
                })
                self.checkedSet.forEach(function (value, index) {
                    self.ecModel.forEach(function (v, i) {
                        if (value == v.CriteriaId) {
                            v.IsEnable = true;
                        }
                    })
                })
            },
        }
    };
    return ECPreviewControl
})