define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('gs/globalVariable');
    var common = require('common');
    require('app/components/assetPoolList/js/PoolCut_Interface');
    var webStorage = require('gs/webStorage');
    //var PoolId = common.getUrlParam("poolId")
    var self;
    //if (webStorage.getItem("TargetSqlConnection")) {
    //    TargetSqlConnection = webStorage.getItem("TargetSqlConnection");
    //}
    var variableTemp = "DECLARE @{0} {1} = CONVERT({1},'{2}') \n";
    var lookupGroup;
    var targetTypeGroup;
    var dataProcess = {
        getViewCriteriaListModel: function (criteriaModel) {
            $.each(criteriaModel, function (i, criteria) {
                var variableString = "", variableDrillthroughString = "";
                var QueryString = criteria.XMLSqlQueryEC.Query.Text;
                var DrillthroughQueryString = criteria.XMLSqlQueryDrillThrough.Query.Text;
                /*XMLSqlQueryEC*/
                $.each(criteria.XMLSqlQueryEC.Parameters, function (i, parameter) {
                    if (parameter.Type == "SqlParameter") {

                        var value = parameter.Value;
                        variableString += variableTemp.format(parameter.Name, parameter.SqlDbType, value);
                    }

                    if (parameter.Type == "ReplaceLookup") {
                        QueryString = QueryString.replace("@" + parameter.Name, parameter.Value);
                    }
                })
                $.each(criteria.XMLSqlQueryEC.Presentation, function (i, present) {
                    $.each(present.Field, function (j, field) {
                        switch (field.FieldType) {
                            case "ReplaceLookup":
                                var strWhere = "";
                                if (field.SuggestedItems && field.SuggestedItems.length > 0) {
                                    var operator = field.Value;

                                    strWhere = operator + "(";
                                    $.each(field.SuggestedItems, function (j, item) {
                                        if (item.IsCheck) {
                                            strWhere += item.Value + ",";
                                        }
                                    });
                                    strWhere = strWhere.substring(0, strWhere.length - 1) + ")";
                                    QueryString = QueryString.replace(field.ParameterName, strWhere);
                                } else {
                                    QueryString = QueryString.replace(field.ParameterName, strWhere);
                                }
                                break;
                            case "ReplaceOperator":
                                var strWhere = "";
                                QueryString = QueryString.replace(field.ParameterName, field.Value);
                                break;
                        }
                    })
                })
                /*XMLSqlQueryDrillThrough*/
                $.each(criteria.XMLSqlQueryDrillThrough.Parameters, function (i, parameter) {
                    if (parameter.Type == "SqlParameter") {
                        variableDrillthroughString += variableTemp.format(parameter.Name, parameter.SqlDbType, parameter.Value);
                    }
                })
                //查询语句
                criteria.ECQeury = variableString + QueryString;
                //校验语句
                criteria.ECDrillthroughQuery = variableDrillthroughString + DrillthroughQueryString;
            })
            return criteriaModel;
        },
        //获取编辑的CriteriaModel
        getCriteriaListModel: function (appDomain, ecNameListJson, callback) {
            var that = this;
            var criteriaModel = [];
            lookupGroup = [];
            targetTypeGroup = [];
            for (var i = 0; i < ecNameListJson.length; i++) {
                var xmlSqlQueryEC = $.parseXML(ecNameListJson[i].XMLSqlQueryEC);
                var xmlSqlQueryDrillThrough = $.parseXML(ecNameListJson[i].XMLSqlQueryDrillThrough);

                var ecPassNO = "ECPass3";// ecNameListJson[i].ECPassNo;
                var criteria = {
                    CriteriaDescription: ecNameListJson[i].CriteriaDescription,
                    CriteriaId: ecNameListJson[i].CriteriaId,
                    CriteriaName: ecNameListJson[i].CriteriaName,
                    CriteriaTableTypeCode: ecNameListJson[i].CriteriaTableTypeCode,
                    CriteriaTypeCode: ecNameListJson[i].CriteriaTypeCode,
                    ECPassNo: ecNameListJson[i].ECPassNo,
                    IsEditable: ecNameListJson[i].IsEditable,
                    IsEnable: ecNameListJson[i].IsEnable,
                    CriteriaSetTypeCode:ecNameListJson[i].CriteriaSetTypeCode,
                    XMLSqlQueryDrillThrough: {
                        Parameters: [],
                        Query: {
                            Name: $(xmlSqlQueryDrillThrough).find("Query").attr("Name"),
                            Type: $(xmlSqlQueryDrillThrough).find("Query").attr("Type"),
                            Text: $(xmlSqlQueryDrillThrough).find("Query").text()
                        }
                    },
                    XMLSqlQueryEC: {
                        Parameters: [],
                        Presentation: [],
                        Query: {
                            Name: $(xmlSqlQueryEC).find("Query").attr("Name"),
                            Type: $(xmlSqlQueryEC).find("Query").attr("Type"),
                            Text: $(xmlSqlQueryEC).find("Query").text()
                        },

                    },
                    ECQeury: "",
                    ECDrillthroughQuery: "",
                    activeView: 'Form'
                };


                $(xmlSqlQueryEC).find("Parameter").each(function (key, value) {
                    var param = {};
                    var paramType = $(this).attr('Type');
                    switch (paramType) {
                        case "SqlParameter":
                            param = { Name: $(this).attr("Name"), Type: $(this).attr('Type'), Value: $(this).attr('Value'), SqlDbType: $(this).attr('SqlDbType'), TableName: $(this).attr('TableName'), RowIndex: -1, FieldIndex: -1 };
                            break;
                        case "ReplaceLookup":
                            param = { Name: $(this).attr("Name"), Type: $(this).attr('Type'), Value: $(this).attr('Value'), SqlDbType: $(this).attr('SqlDbType'), Operator: $(this).attr('Operator'), SelectedItems: {}, RowIndex: -1, FieldIndex: -1, isActiveList: false, isEditing: false };
                            var SelectedItems = [];
                            $(this).find("SelectedItems").each(function (key, value) {
                                $(this).find("Item").each(function (key, value) {
                                    var item = { Value: $(this).attr("Value") }
                                    SelectedItems.push(item);
                                });
                            });
                            param.SelectedItems = SelectedItems;
                            break;
                        case "ReplaceOperator":
                            param = { Name: $(this).attr("Name"), Type: $(this).attr('Type'), Operator: $(this).attr('Operator'), RowIndex: -1, FieldIndex: -1, isEditing: false };
                            break;
                        case "TargetLookup":
                            var SelectedItems = [];
                            param = { Name: $(this).attr('Name'), Type: $(this).attr('Type'), TargetType: $(this).attr('TargetType'), TargetName: $(this).attr('TargetName'), SelectedItems: {}, RowIndex: -1, FieldIndex: -1, isActiveList: false, isEditing: false };
                            $(this).find("SelectedItems").each(function (key, value) {
                                $(this).find("Item").each(function (key, value) {
                                    var item = { Name: $(this).attr("Name"), CurrentValue: $(this).attr("CurrentValue"), TargetValue: $(this).attr("Value"), Tolerance: $(this).attr("Tolerance") }
                                    SelectedItems.push(item);
                                });
                            });
                            param.SelectedItems = SelectedItems;
                            break;
                        default:
                            break;
                    }
                    criteria.XMLSqlQueryEC.Parameters.push(param);
                });
                $(xmlSqlQueryEC).find("Presentation").each(function (pIndex, present) {
                    var row, rowText;
                    $(this).find("Row").each(function (rIndex, row) {
                        rowText = $(this).attr("RowText");
                        row = { RowText: rowText, Field: [] };
                        $(this).find("Field").each(function (fIndex, field) {
                            var field = {};
                            var fieldType = $(this).attr("FieldType");
                            switch (fieldType) {
                                case "ReplaceOperator":
                                    field = { FieldText: $(this).attr("FieldText"), ParameterName: $(this).attr("ParameterName"), FieldType: $(this).attr("FieldType"), SuggestedOperators: [], Value: "" }
                                    $(this).find("SuggestedOperators").each(function (key, value) {
                                        $(this).find("Operator").each(function (key, value) {
                                            if ($(this) != null) {
                                                var opreator = { Name: $(this).attr("Name"), Value: $(this).attr("Value") }
                                                field.SuggestedOperators.push(opreator);
                                            }
                                        });
                                    });
                                    break;
                                case "ReplaceLookup":
                                    var SuggestedItems = [];
                                    if ($(this).attr("DataSourceType") == "Static") {
                                        field = { FieldText: $(this).attr("FieldText"), ParameterName: $(this).attr("ParameterName"), FieldType: $(this).attr("FieldType"), DataSourceType: $(this).attr("DataSourceType"), Value: "" };

                                        $(this).find("SuggestedItems").each(function (key, value) {
                                            $(this).find("Item").each(function (key, value) {
                                                var Item = { Name: $(this).attr("Name"), Value: $(this).attr("Value"), IsCheck: false }
                                                SuggestedItems.push(Item);
                                            });
                                        });
                                        field = $.extend(field, { "SuggestedItems": SuggestedItems });
                                    }
                                    else {
                                        field = { FieldText: $(this).attr("FieldText"), ParameterName: $(this).attr("ParameterName"), FieldType: $(this).attr("FieldType"), DataSourceType: $(this).attr("DataSourceType"), LookupType: $(this).attr("LookupType"), ConnectionStrings: $(this).attr("ConnectionStrings"), Query: $(this).attr("Query") };
                                        if ($(this).attr("FieldType") == "ReplaceLookup" && $(this).attr("DataSourceType") == "Dynamic") {
                                            lookupGroup.push({ ECIndex: i, PIndex: rIndex, FIndex: fIndex, LookupType: $(this).attr("LookupType") });
                                        }
                                    }
                                    break;
                                case "TargetLookup":
                                    var SuggestedItems = [];
                                    if ($(this).attr("DataSourceType") == "Static") {
                                        var parameterName = $(this).attr("ParameterName");
                                        field = { FieldText: $(this).attr("FieldText"), ParameterName: parameterName, FieldType: $(this).attr("FieldType"), DataSourceType: $(this).attr("DataSourceType"), LookupType: $(this).attr("LookupType"), Value: "" };

                                        $(this).find("SuggestedItems").each(function (key, value) {
                                            $(this).find("Item").each(function (key, value) {
                                                var Item = { Name: $(this).attr("Name"), CurrentValue: "", TargetValue: $(this).attr("Value"), Tolerance: $(this).attr("Tolerance"), IsCheck: false }
                                                SuggestedItems.push(Item);
                                            });
                                        });
                                        var currentParameter = criteria.XMLSqlQueryEC.Parameters.filter(function (param, index) {
                                            return param.Name == parameterName;
                                        });
                                        targetTypeGroup.push({ ECIndex: i, PIndex: rIndex, FIndex: fIndex, TargetType: currentParameter[0].TargetName });
                                        field = $.extend(field, { "SuggestedItems": SuggestedItems });
                                    }
                                    else {
                                        var parameterName = $(this).attr("ParameterName");
                                        field = { FieldText: $(this).attr("FieldText"), ParameterName: parameterName, FieldType: $(this).attr("FieldType"), DataSourceType: $(this).attr("DataSourceType"), LookupType: $(this).attr("LookupType"), Value: "" };

                                        var currentParameter = criteria.XMLSqlQueryEC.Parameters.filter(function (param, index) {
                                            return param.Name == parameterName;
                                        });
                                        targetTypeGroup.push({ ECIndex: i, PIndex: rIndex, FIndex: fIndex, TargetType: currentParameter[0].TargetName });

                                        var codeDictionaryCodes = '<items><item><code>' + field.LookupType + '</code></item></items>';
                                        var executeParam = { SPName: 'config.usp_GetECLookUpsByCodeDicCodes', SQLParams: [] };
                                        executeParam.SQLParams.push({ Name: 'DimTrustId', Value: PoolHeader.DimSourceTrustID ? PoolHeader.DimSourceTrustID : -2, DBType: 'int' });
                                        executeParam.SQLParams.push({ Name: 'CodeDictionaryCodes', Value: codeDictionaryCodes, DBType: 'xml' });
                                        executeParam.SQLParams.push({ Name: 'poolId', Value: PoolHeader.PoolId, DBType: 'int' });

                                        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                                        var serviceUrl = GlobalVariable.PoolCutServiceURL
                                            + 'CommonGet?connName=DAL_SEC_PoolConfig&exeParams={0}'.format(executeParams);
                                        CallWCFSvc(serviceUrl, true, 'GET', function (response) {
                                            $.each(response, function (i, n) {
                                                var item = { Name: n.LookupItemName, CurrentValue: "", TargetValue: n.LookupItemValue, Tolerance: '', IsCheck: false }
                                                SuggestedItems.push(item);
                                            })
                                            field = $.extend(field, { "SuggestedItems": SuggestedItems });
                                        });


                                    }

                                    break;
                                case "TextBox":
                                    field = { FieldText: $(this).attr("FieldText"), ParameterName: $(this).attr("ParameterName"), FieldType: $(this).attr("FieldType"), Value: '' };
                                    break;
                                case "CheckBox":
                                    field = { FieldText: $(this).attr("FieldText"), ParameterName: $(this).attr("ParameterName"), FieldType: $(this).attr("FieldType"), IsCheck: false };
                                    break;
                                case "DQueryDisplay":
                                    field = { FieldText: $(this).attr("FieldText"), FieldType: $(this).attr("FieldType"), Format: $(this).attr("Format"), Dquery: $(this).find("Dquery").text(), Value: '' };
                                    if (field.Dquery.indexOf("CurrentPrincipalBalance") != -1) {
                                        var ParentPoolId = 0;
                                        if (PoolHeader.PoolTypeId == 6)
                                            //ParentPoolId = PoolHeader.ParentPoolId;
                                            ParentPoolId = PoolHeader.PoolId;
                                        else
                                            ParentPoolId = PoolHeader.PoolId;
                                        field.Value = that.getPoolAmount(ParentPoolId, field.Dquery);
                                    }
                                    break;
                                default:
                                    break;
                            }
                            row.Field.push(field);
                        });
                        criteria.XMLSqlQueryEC.Presentation.push(row);
                    });
                })
                $(xmlSqlQueryDrillThrough).find("Parameter").each(function (key, value) {
                    var param = { Name: $(this).attr("Name"), Type: $(this).attr('Type'), Value: $(this).attr('Value'), SqlDbType: $(this).attr('SqlDbType'), TableName: $(this).attr('TableName') };
                    criteria.XMLSqlQueryDrillThrough.Parameters.push(param);
                });

                criteriaModel.push(criteria);
            }

            //设置动态LookupType数据
            this.setDynamicItems(0, criteriaModel, lookupGroup, appDomain, function (criteriaModel) {
                var newCriteriaModel = [];
                $.each(criteriaModel, function (index, criteria) {
                    //设置criteria的Parameter与Field关联
                    newCriteriaModel.push(this.setRelevance(criteria));
                }.bind(this));

                //targeting:设置currentValue
                this.setCurrentValueItems(0, newCriteriaModel, function (criteriaModel) {
                    callback(criteriaModel);
                })
                //callback(criteriaModel);

            }.bind(this));



        },
        getPoolAmount: function (ParentPoolId, sql) {
            var sqlStr = "declare @targetPoolId bigint = " + ParentPoolId + "  " + sql.replace(/\n|\t/g, " ");
            var serviceUrl = GlobalVariable.PoolCutServiceURL
                + 'ExecuteScalarWithConnStr?connStr={0}&sql={1}'.format(encodeURIComponent(TargetSqlConnection), encodeURIComponent(sqlStr));
            var value = CallWCFSvc(serviceUrl, false, "GET");
            if (value == '' || value == null) {
                value = 0;
            }
            return value;
        },
        setCurrentValueItems: function (i, criteriaModel, callback) {
            var self = this;
            if (i < targetTypeGroup.length) {
                self.getTargetLookupCurrentValue("ecpass3", targetTypeGroup[i].TargetType, function (response) {
                    if (response && response.length > 0) {
                        var targetFiled = criteriaModel[targetTypeGroup[i].ECIndex].XMLSqlQueryEC.Presentation[targetTypeGroup[i].PIndex].Field[targetTypeGroup[i].FIndex];
                        //先判断是否是数组
                        if (targetFiled.SuggestedItems && Array.isArray(targetFiled.SuggestedItems) && Array.isArray(response)) {
                            targetFiled.SuggestedItems.forEach(function (item, index) {
                                response.forEach(function (current, index) {
                                    if (item.Name == current.Name) {
                                        item.CurrentValue = current.Value;
                                    }
                                });
                            });
                        }
                    }
                    self.setCurrentValueItems(++i, criteriaModel, callback);
                });
            } else {
                callback(criteriaModel);
            }
        },
        //获取targetType下的CurrentValue值
        getTargetLookupCurrentValue: function (ecpassNo, targetType, callback) {
            //test
            //var response = [{ Name:"CurrentRate",Value:"20.110"},{Name:"Seasoning",Value: "1.05"}];
            //response为返回的数组。格式为[{ Name:"CurrentRate",Value:"20.110"},{Name:"Seasoning",Value: "1.05"}]

            var executeParam = { SPName: 'dbo.usp_GetAggregationData', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'DimPoolID', Value: PoolId, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'LTVPassNo', Value: ecpassNo, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'AggregationCategory', Value: targetType, DBType: 'string' });

            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.PoolCutServiceURL
                + 'CommonGetWithConnStr?connStr={0}&exeParams={1}'.format(encodeURIComponent(TargetSqlConnection), executeParams);
            CallWCFSvc(serviceUrl, true, 'GET', function (response) {
                var rtnAry = [];
                $.each(response, function (i, v) {//for modify the default object property name
                    var obj = { Name: v.AggregationItem, Value: v.Value };
                    rtnAry.push(obj);
                });
                callback(rtnAry);
            });
        },
        //设置criteria的Parameter与Field关联,返回criteria
        setRelevance: function (criteria) {
            if (criteria.XMLSqlQueryEC.Presentation && criteria.XMLSqlQueryEC.Presentation.length > 0) {
                //设置Parameters与Field关系,[RowIndex所在行索引，FieldIndex所在列索引]
                $.each(criteria.XMLSqlQueryEC.Parameters, function (n, p) {
                    $.each(criteria.XMLSqlQueryEC.Presentation, function (i, r) {
                        $.each(r.Field, function (j, f) {
                            $.extend(f, { FieldIndex: j });

                            if (f.ParameterName == p.Name) {
                                $.extend(p, { RowIndex: i, FieldIndex: j });
                                switch (f.FieldType) {
                                    case "ReplaceLookup":
                                        if (p.SelectedItems && p.SelectedItems.length > 0) {
                                            $.each(p.SelectedItems, function (index, paramItem) {
                                                $.each(f.SuggestedItems, function (index, fieldItem) {
                                                    if (paramItem.Value == fieldItem.Value) {
                                                        $.extend(fieldItem, { IsCheck: true });
                                                    }
                                                })
                                            })
                                        }
                                        $.extend(f, { Value: p.Operator });
                                        break;
                                    case "ReplaceOperator":
                                        $.extend(f, { Value: p.Operator });
                                        break;
                                    case "TargetLookup":
                                        if (p.SelectedItems && p.SelectedItems.length > 0) {
                                            $.each(p.SelectedItems, function (index, paramItem) {
                                                $.each(f.SuggestedItems, function (index, fieldItem) {
                                                    if (paramItem.Name == fieldItem.Name) {
                                                        $.extend(fieldItem, { IsCheck: true });
                                                        $.extend(fieldItem, { TargetValue: paramItem.TargetValue });
                                                        $.extend(fieldItem, { Tolerance: paramItem.Tolerance });
                                                    }
                                                })
                                            })
                                        }
                                        break;
                                    case "TextBox":
                                        $.extend(f, { Value: p.Value });
                                        break;
                                    case "CheckBox":
                                        if (p.Value.toLowerCase() == "1") {
                                            $.extend(f, { IsCheck: true });
                                        } else {
                                            $.extend(f, { IsCheck: false });
                                        }
                                        break;
                                }

                            }

                        })
                        $.extend(r, { RowIndex: i });
                    })
                })
            }
            return criteria;
        },
        //获取动态LookupType数据
        getECLookupListByLookupTypeCode: function (lookupGroup, callback) {
            //response为返回的数组。格式为[{LookupItemName:"",LookupItemValue:"", IsDisplayed:"", FlagIsNew:"" },.......]
            var codeDictionaryCodes = '<items>';
            $.each(lookupGroup, function (i, v) {
                codeDictionaryCodes += '<item><code>' + v.LookupType + '</code></item>';
            });
            codeDictionaryCodes += '</items>';
            var executeParam = { SPName: 'config.usp_GetECLookUpsByCodeDicCodes', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'DimTrustId', Value: PoolHeader.DimSourceTrustID ? PoolHeader.DimSourceTrustID : -2, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'CodeDictionaryCodes', Value: codeDictionaryCodes, DBType: 'xml' });
            executeParam.SQLParams.push({ Name: 'poolId', Value: PoolHeader.PoolId, DBType: 'int' });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.PoolCutServiceURL
                + 'CommonGet?connName=DAL_SEC_PoolConfig&exeParams={0}'.format(executeParams);
            CallWCFSvc(serviceUrl, true, 'GET', function (response) {
                callback(response);
            });
        },
        //设置动态LookupType数据，返回CriteriaModel对象
        setDynamicItems: function (i, criteriaModel, lookupGroup, appDomain, callback) {
            var self = this;
            if (i < lookupGroup.length) {
                self.getECLookupListByLookupTypeCode(lookupGroup, function (response) {
                    var Items = [];
                    $.each(response, function (index, item) {
                        if (item.LookupTypeCode == lookupGroup[i].LookupType) {
                            Items.push({ Name: item.LookupItemName, Value: item.LookupItemValue, Excluded: item.IsDisplayed, IsNew: item.FlagIsNew, IsCheck: false });
                        }
                    });
                    $.extend(true, criteriaModel[lookupGroup[i].ECIndex].XMLSqlQueryEC.Presentation[lookupGroup[i].PIndex].Field[lookupGroup[i].FIndex], { SuggestedItems: Items })//criteriaListModel[c].Presentation[p].Field[f]              

                    this.setDynamicItems(++i, criteriaModel, lookupGroup, appDomain, callback);
                }.bind(this));

            } else {
                callback(criteriaModel);
            }
        },
        //获取查询语句(当Field条件值发生改变时,传当前EC对象)。
        getQuery: function (criteria) {
            var variableString = "";
            var QueryString = criteria.XMLSqlQueryEC.Query.Text;

            /*重组变量字符串*/
            $.each(criteria.XMLSqlQueryEC.Parameters, function (i, parameter) {
                if (parameter.Type == "SqlParameter") {
                    var value = parameter.Value.replace(/,/g,"");
                    //if (parameter.SqlDbType.toLowerCase() == "bit") {
                    //    value = parameter.Value.toLowerCase() == "true" ? 1 : 0;
                    //}
                    variableString += variableTemp.format(parameter.Name, parameter.SqlDbType, value);
                }
            })

            /*替换DECLARE变量值与Select语句中的条件值*/
            $.each(criteria.XMLSqlQueryEC.Presentation, function (i, present) {
                var that = this;
                $.each(present.Field, function (j, field) {
                    var strArray = [], strType = [];
                    var matchStr = new RegExp("DECLARE @" + field.ParameterName + " (.+?) \n", 'g');

                    switch (field.FieldType) {
                        case "TextBox":
                            //找变量字符串，例如：DECLARE @count bigint= CONVERT('bigint','1000') \n
                            var sourceVariable = variableString.match(matchStr);
                            //取变量类型,例如:bigint
                            //var strType = sourceVariable[0].match(matchStr);
                            //strArray = sourceVariable[0].split('(');
                            //strType = strArray[1].split(',');
                            //组装新的变量字符串,例如：DECLARE @count bigint= CONVERT('bigint','2000') \n
                            //var replaceValue = variableTemp.format(field.ParameterName, strType, field.Value);
                            var replaceValue = sourceVariable[0].replace(/('[a-z0-9.]+')/gi, "'" + field.Value.replace(/,/g,"") + "'");
                            variableString = variableString.replace(matchStr, replaceValue);
                            break;
                        case "CheckBox":
                            var sourceVariable = variableString.match(matchStr);
                            strArray = sourceVariable[0].split('(');
                            strType = strArray[1].split(',');
                            var replaceValue = variableTemp.format(field.ParameterName, strType[0], (field.IsCheck == true ? 1 : 0));
                            variableString = variableString.replace(matchStr, replaceValue);
                            break;
                        case "ReplaceLookup":
                            var strWhere = "";
                            if (field.SuggestedItems && field.SuggestedItems.length > 0) {
                                var operator = field.Value.replace(/,/g, "");

                                strWhere = operator + "( ";
                                $.each(field.SuggestedItems, function (j, item) {
                                    if (item.IsCheck) {
                                        strWhere += "N'" + item.Value + "',";
                                    }
                                });
                                strWhere = strWhere.substring(0, strWhere.length - 1) + ")";
                                QueryString = QueryString.replace(field.ParameterName, strWhere);
                            } else {
                                QueryString = QueryString.replace(field.ParameterName, strWhere);
                            }
                            break;
                        case "ReplaceOperator":
                            var strWhere = "";
                            QueryString = QueryString.replace(field.ParameterName, field.Value.replace(/,/g, ""));
                            break;
                    }
                })
            })

            //组装成完整的查询语句
            criteria.ECQeury = variableString + QueryString;
        },
        //返回String类型的默认值,vp是Parameters对象
        getDefaultParameters: function (vp, ecModel) {
            var retValue = '';
            var field = null;
            ecModel.XMLSqlQueryEC.Presentation.forEach(function (row, pindex) {
                row.Field.forEach(function (value, index) {
                    if (vp.Name == value.ParameterName) {
                        field = value;
                    }

                });
            })
            if (field) {
                switch (field.FieldType) {
                    case "TextBox":
                        retValue = field.Value != null ? field.Value : vp.Value; break;
                    case "CheckBox":
                        retValue = field.IsCheck ? '1' : '0'; break;
                    case "TargetLookup":
                        if (field.SuggestedItems && field.SuggestedItems.length > 0) {
                            $(field.SuggestedItems).each(function (i, vi) {
                                if (vi.IsCheck) {
                                    var itemtemp = '<Item Name="{0}" Value="{1}" Tolerance="{2}"/>';
                                    itemtemp = itemtemp.format(vi.Name, vi.TargetValue, vi.Tolerance);
                                    retValue += itemtemp;

                                }

                            });
                        }
                        break;
                    case "ReplaceLookup":
                        if (field.SuggestedItems && field.SuggestedItems.length > 0) {
                            $(field.SuggestedItems).each(function (i, vi) {
                                if (vi.IsCheck) {
                                    var item = '<Item Name="{0}" Value="{1}"/>';
                                    item = item.format(vi.Name, vi.Value);
                                    retValue += item;
                                }
                            });
                        }
                        break;
                    case "ReplaceOperator":
                        retValue = field.Value != null ? field.Value : vp.Operator;
                        break;
                    default:
                        break;
                }
            } else {
                retValue = vp.Value;
            }
            return retValue;

        },
        //查看XML,根据ecModel组织成XML,返回给XMLSqlQueryEC属性
        ecModelToXml: function (ecModel) {
            var that = this;
            var t_XMLSqlQueryEC = '<main><Parameters>{0}</Parameters>{1}<Presentation>{2}</Presentation></main>';
            var t_Query = '<Query Name="{0}" Type="{1}">{2}</Query>';

            var retXMLSqlQueryEC = "", retQuery = "", retParameter = "", retPresentation = "";

            $(ecModel.XMLSqlQueryEC.Parameters).each(function (i, vp) {
                switch (vp.Type) {
                    case "SqlParameter":
                        vp.Value = that.getDefaultParameters(vp, ecModel).toString().replace(/,/g,"");
                        var paratemp = '<Parameter Name="{0}" Type="{1}" Value="{2}" SqlDbType="{3}" TableName="{4}" />';
                        paratemp = paratemp.format(vp.Name, vp.Type, vp.Value, vp.SqlDbType, vp.TableName);
                        retParameter += paratemp;
                        break;
                    case "ReplaceLookup":
                        var itemcontex = that.getDefaultParameters(vp, ecModel);
                        var paratemp = '<Parameter Name="{0}" Type="{1}" Value="{2}" SqlDbType="{3}" Operator="{4}" ><SelectedItems>{5}</SelectedItems></Parameter>';
                        retParameter += paratemp.format(vp.Name, vp.Type, vp.Value, vp.SqlDbType, vp.Operator, itemcontex);
                        break;
                    case "ReplaceOperator":
                        vp.Operator = that.getDefaultParameters(vp, ecModel);
                        var paratemp = '<Parameter Name="{0}" Type="{1}" Operator="{2}" />';
                        retParameter += paratemp.format(vp.Name, vp.Type, common.html2Escape(vp.Operator));
                        break;
                    case "TargetLookup":
                        var itemcontex = that.getDefaultParameters(vp, ecModel);
                        var paratemp = '<Parameter Name="{0}" Type="{1}" TargetType="{2}" TargetName="{3}"><SelectedItems>{4}</SelectedItems></Parameter>';
                        retParameter += paratemp.format(vp.Name, vp.Type, vp.TargetType, vp.TargetName, itemcontex);
                        break;
                    default:
                        break;
                }
            });

            $(ecModel.XMLSqlQueryEC.Presentation).each(function (i, vs) {
                var retRow = "";
                var t_Row = '<Row RowText="{0}">{1}</Row>';
                $(vs.Field).each(function (i, vf) {
                    switch (vf.FieldType) {
                        case "ReplaceOperator":
                            var field = '<Field FieldText="{0}" ParameterName="{1}" FieldType="{2}"><SuggestedOperators>{3}</SuggestedOperators></Field>';
                            if (vf.SuggestedOperators.length > 0) {
                                var operatorItems = "";
                                $(vf.SuggestedOperators).each(function (i, vo) {
                                    var operator = '<Operator Name="{0}" Value="{1}" />';
                                    operatorItems += operator.format(vo.Name, common.html2Escape(vo.Value));
                                });
                                field = field.format(common.html2Escape(vf.FieldText), vf.ParameterName, vf.FieldType, operatorItems);
                            } else {
                                field = field.format(vf.FieldText, vf.ParameterName, vf.FieldType, '<Operator Name="" Value="" />');
                            }
                            retRow += field;
                            break
                        case "ReplaceLookup":
                            if (vf.DataSourceType == "Static") {
                                var field = '<Field FieldText="{0}" ParameterName="{1}" FieldType="{2}" DataSourceType="{3}"><SuggestedItems>{4}</SuggestedItems></Field>';
                                if (vf.SuggestedItems && vf.SuggestedItems.length > 0) {
                                    var suggestedItems = "";
                                    $(vf.SuggestedItems).each(function (i, vi) {
                                        var item = '<Item Name="{0}" Value="{1}"/>';
                                        item = item.format(vi.Name, vi.Value);
                                        suggestedItems += item;
                                    });
                                    field = field.format(common.html2Escape(vf.FieldText), vf.ParameterName, vf.FieldType, vf.DataSourceType, suggestedItems);
                                } else {
                                    field = field.format(common.html2Escape(vf.FieldText), vf.ParameterName, vf.FieldType, vf.DataSourceType, '<Item Name="" Value="" Excluded="" IsNew=""/>');
                                }
                                retRow += field;
                            }
                            else if (vf.DataSourceType == "Dynamic") {
                                var field = '<Field FieldText="{0}" ParameterName="{1}" FieldType="{2}" DataSourceType="{3}" LookupType="{4}" ConnectionStrings="{5}"><Query>{6}</Query></Field>';
                                retRow += field.format(common.html2Escape(vf.FieldText), vf.ParameterName, vf.FieldType, vf.DataSourceType, (vf.LookupType == null ? "" : vf.LookupType), (vf.ConnectionStrings == null ? "" : vf.ConnectionStrings), (vf.Query == null ? "" : vf.Query));
                            }
                            break;
                        case "TargetLookup":
                            if (vf.DataSourceType == "Static") {
                                var field = '<Field FieldText="{0}" ParameterName="{1}" FieldType="{2}" DataSourceType="{3}" LookupType="{4}"><SuggestedItems>{5}</SuggestedItems></Field>';
                                if (vf.SuggestedItems && vf.SuggestedItems.length > 0) {
                                    var suggestedItems = "";
                                    $(vf.SuggestedItems).each(function (i, vi) {
                                        var item = '<Item Name="{0}" Value="{1}" Tolerance="{2}"/>';
                                        item = item.format(vi.Name, vi.TargetValue, vi.Tolerance);
                                        suggestedItems += item;
                                    });
                                    field = field.format(common.html2Escape(vf.FieldText), vf.ParameterName, vf.FieldType, vf.DataSourceType, (vf.LookupType == null ? "" : vf.LookupType), suggestedItems);
                                } else {
                                    field = field.format(common.html2Escape(vf.FieldText), vf.ParameterName, vf.FieldType, vf.DataSourceType, (vf.LookupType == null ? "" : vf.LookupType), '<Item Name="" Value="" Tolerance="" />');
                                }
                                retRow += field;
                            }
                            else if (vf.DataSourceType == "Dynamic") {
                                var field = '<Field FieldText="{0}" ParameterName="{1}" FieldType="{2}" DataSourceType="{3}" LookupType="{4}"></Field>';
                                retRow += field.format(common.html2Escape(vf.FieldText), vf.ParameterName, vf.FieldType, vf.DataSourceType, (vf.LookupType == null ? "" : vf.LookupType));
                            }
                            break;
                        case "CheckBox":
                            var field = '<Field FieldText="{0}" ParameterName="{1}" FieldType="{2}"/>';
                            retRow += field.format(common.html2Escape(vf.FieldText), vf.ParameterName, vf.FieldType);
                            break;
                        case "TextBox":
                            var field = '<Field FieldText="{0}" ParameterName="{1}" FieldType="{2}"/>';
                            retRow += field.format(common.html2Escape(vf.FieldText), vf.ParameterName, vf.FieldType);
                            break;
                        case "DQueryDisplay":
                            var field = '<Field FieldText="{0}" FieldType="{1}" Format="{2}"><Dquery>{3}</Dquery></Field>';
                            retRow += field.format(common.html2Escape(vf.FieldText), vf.FieldType, vf.Format, vf.Dquery);
                            break;
                        default:
                            break;
                    }
                });

                retPresentation += t_Row.format(common.html2Escape(vs.RowText), retRow);

            });

            retQuery = t_Query.format(ecModel.XMLSqlQueryEC.Query.Name == null ? "" : ecModel.XMLSqlQueryEC.Query.Name, ecModel.XMLSqlQueryEC.Query.Type == null ? "" : ecModel.XMLSqlQueryEC.Query.Type, ecModel.XMLSqlQueryEC.Query.Text == null ? "" : ecModel.XMLSqlQueryEC.Query.Text.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
            retXMLSqlQueryEC = t_XMLSqlQueryEC.format(retParameter, retQuery, retPresentation);
            return retXMLSqlQueryEC;
        },
        //查看XML,返回给XMLecModelToXmlSqlQueryDrill属性
        ecModelToXmlSqlQueryDrill: function (xmlSqlQueryDrillThrough) {

            var t_XMLSqlQueryEC = '<main><Parameters>{0}</Parameters>{1}</main>';
            var t_Query = '<Query Name="{0}" Type="{1}">{2}</Query>';

            var retXMLSqlQueryDrill = "", retQuery = "", retParameter = "";

            if (xmlSqlQueryDrillThrough) {
                $.each(xmlSqlQueryDrillThrough.Parameters, function (i, vp) {
                    var paratemp = '<Parameter Name="{0}" Type="{1}" Value="{2}" SqlDbType="{3}" TableName="{4}" />';
                    retParameter += paratemp.format(vp.Name, vp.Type, vp.Value, vp.SqlDbType, vp.TableName);
                });

                retQuery = t_Query.format(xmlSqlQueryDrillThrough.Query.Name == null ? "" : xmlSqlQueryDrillThrough.Query.Name, xmlSqlQueryDrillThrough.Query.Type == null ? "" : xmlSqlQueryDrillThrough.Query.Type, xmlSqlQueryDrillThrough.Query.Text == null ? "" : xmlSqlQueryDrillThrough.Query.Text.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                retXMLSqlQueryDrill = t_XMLSqlQueryEC.format(retParameter, retQuery);
            }
            return retXMLSqlQueryDrill;
        },
        //用于保存，根据所有ecListModel组织成XML
        ecListModelToCriteriaSetXml: function (ecListModel) {
            var that = this;
            if (ecListModel == undefined) return "";
            var ECXML = "<CriteriaSet>{0}</CriteriaSet>";
            var t_Criteria = "<Criteria>"
                + "<CriteriaName>{0}</CriteriaName>"
                + "<CriteriaDescription>{1}</CriteriaDescription>"
                + "<CriteriaSetId>{2}</CriteriaSetId>"
                + "<CriteriaTypeId>{3}</CriteriaTypeId>"
                + "<IsEnable>{4}</IsEnable>"
                + "<ECPassNo>{5}</ECPassNo>"
                + "<XMLSqlQueryEC>{6}</XMLSqlQueryEC>"
                + "<XMLSqlQueryDrillThrough>{7}</XMLSqlQueryDrillThrough>"
                + "<CriteriaTableTypeId>{8}</CriteriaTableTypeId>"
                + "<SequenceNo>{9}</SequenceNo>"
                + "<IsFunctionEnable>{10}</IsFunctionEnable>"
                + "<IsEditable>{11}</IsEditable>"
                + "</Criteria>";
            var retCriteria = "";
            $(ecListModel).each(function (i, v) {
                var criteriaName = v.CriteriaName == null ? "" : v.CriteriaName;
                var criteriaDescription = v.CriteriaDescription == null ? "" : v.CriteriaDescription;
                var criteriaSetId = v.CriteriaSetId == null ? 0 : v.CriteriaSetId;
                var criteriaTypeId = v.CriteriaTypeId == null ? 0 : v.CriteriaTypeId;
                var isEnable = v.IsEnable == null ? 1 : v.IsEnable;
                var ecPassNo = v.ECPassNo == null ? 0 : v.ECPassNo;
                var retXMLSqlQueryEC = that.ecModelToXml(v);
                var retXMLSqlQueryDrill = that.ecModelToXmlSqlQueryDrill(v.XMLSqlQueryDrillThrough);
                var criteriaTableTypeId = v.CriteriaTableTypeId == null ? 0 : v.CriteriaTableTypeId;
                var isFunctionEnable = v.IsFunctionEnable == null ? 0 : v.IsFunctionEnable;
                var isEditable = v.IsEditable == null ? 1 : v.IsEditable;

                retCriteria += t_Criteria.format(criteriaName, criteriaDescription, criteriaSetId, criteriaTypeId, isEnable, ecPassNo, retXMLSqlQueryEC, retXMLSqlQueryDrill, criteriaTableTypeId, i, isFunctionEnable, isEditable);
            });
            ECXML = ECXML.format(retCriteria);
            return ECXML;
        },
        ecListModelToEnabelDisableXml: function (ecListModel) {
            var that = this;
            if (ecListModel == undefined) return "";
            var ECXML = "<ECs>{0}</ECs>";
            var t_Criteria = "<EC>"
                + "<CriteriaName>{0}</CriteriaName>"
                + "<IsEnabled>{1}</IsEnabled>"
                + "</EC>";
            var retCriteria = "";
            $(ecListModel).each(function (i, v) {
                var criteriaName = v.CriteriaName == null ? "" : v.CriteriaName;
                var isEnable = v.IsEnable == null ? 1 : v.IsEnable;

                retCriteria += t_Criteria.format(criteriaName, isEnable);
            });
            ECXML = ECXML.format(retCriteria);
            return ECXML;
        },
        getBasePoolContent: function (poolId, callback) {
            var total=0;
            var executeParam = { SPName: 'config.usp_GetBasePoolContent', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'BasePoolId', Value: poolId, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'total', Value: total, DBType: 'int' });

            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.PoolCutServiceURL
                + 'CommonGetWithConnStr?connStr={0}&exeParams={1}'.format(encodeURIComponent(TargetSqlConnection), executeParams);
            CallWCFSvc(serviceUrl, true, 'GET', function (response) {
                var rtnAry = [];
                $.each(response, function (i, v) {//for modify the default object property name
                    var obj = { PoolId: v.PoolId, PoolName: v.PoolName };
                    rtnAry.push(obj);
                });
                callback(rtnAry);
            });
        }
    }
    return dataProcess;
})
