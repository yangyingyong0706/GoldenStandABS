String.prototype.removeLineEnd = function ()
{
    return this.replace(/(<.+?\s+?)(?:\n\s*?(.+?=".*?"))/g, '$1 $2')
}
var dataProcess = {
    taskObject: function(arrayObj) {
        if (arrayObj == undefined) return [];
        $.each(arrayObj, function (i) {
            jQuery.extend(arrayObj[i], { IsCheck: false});
        })
        return arrayObj;
    },
    taskCodeList: function (response) {
        var taskCodeList = [];
        for (var i = 0; i < response.length; i++) {
            taskCodeList[i] = { label: response[i].CodeDictionaryCode };
        }
        return taskCodeList;
    },
    taskXmlToJson: function(taskXml) {
        if (taskXml == undefined) return [];
        //var taskModel = {DirectInput:[], Calculated: [], Export: []};
        var actionModel = []
        var groupName = '';
        $(taskXml).find("Action").each(function(i) {
            actionModel[i] = { GroupName: '', ActionCode: $(this).attr('ActionCode'), ActionDisplayName: $(this).attr('ActionDisplayName'), FunctionName: $(this).attr('FunctionName'), SequenceNo: $(this).attr('SequenceNo'), IsCheck: false, Describe: $(this).attr("Describe"), Parameter: [] };
            var params = $(this).find("Parameter");
            $(params).each(function () {
                if ($(this).attr("Name") == "InputType") {
                    actionModel[i].GroupName = $(this).attr("Value");
                }
                actionModel[i].Parameter.push({ Name: $(this).attr('Name'), SessionParameterName: $(this).attr('SessionParameterName'), Value: $(this).attr('Value'), DataType: $(this).attr('DataType'), Usage: $(this).attr('Usage'), IsConfigurable: eval($(this).attr('IsConfigurable')) });
            });
        });
        return actionModel;
    },
    singleActionToJson: function(singleXml) {
        //if (singleXml == undefined) return [];
        //return dataProcess.taskXmlToJson(singleXml);

        //模板分组 (DirectInput\Calculated\Export) 
        if (singleXml == undefined) return [];
        var actionGroupModel = [];
        $(singleXml).find("ActionGroup").each(function (key, value) {
            var templateTypeName = $(this).attr("Name");
            actionGroupModel.push({ GroupName: $(this).attr("Name"), CNGroupName: $(this).attr("CNName"), TaskActionIndex: key, Actions: dataProcess.taskXmlToJson($(this)), isOpen: true });
        });
        return actionGroupModel;

    },
    combinationActionToJson: function(combActionXml) {
        if (combActionXml == undefined) return [];
        var combActionModel = [];
        $(combActionXml).find("Tool").each(function(key, value) {
            var templateTypeName = $(this).attr("Name");
            combActionModel.push({ TemplateTypeName: $(this).attr("Name"), TaskActionIndex: key, Actions: dataProcess.taskXmlToJson($(this)) });
        });
        return combActionModel;
    },
    bankListToJson: function(bankModelXml) {
        if (bankModelXml == undefined) return [];
        var bankModel = [];
        $(bankModelXml).find("Bank").each(function(i) {
            var bankName = $(this).attr("Name");
            bankModel[i] = { BankName: bankName, Models: [], isOpen: false };
            $(this).find("Model").each(function(j, vallue) {
                bankModel[i].Models.push({ TemplateTypeName: $(this).attr("Name"), Descripation: $(this).attr("Descripation"), Path: $(this).attr("Path") });
            });
        });
        return bankModel;
    },
    bankCombinationActionToJson: function(combActionXml) {
        if (combActionXml == undefined) return [];
        var combActionModel = [],
            actions = [],
            models = [];
        combActionModel = { Actions: {}, Models: {} };
        combActionModel.Actions = dataProcess.taskXmlToJson($(combActionXml).find("Actions"));
        combActionModel.Models = dataProcess.ecXmlToJson($(combActionXml).find("Methods"));
        // combActionModel = dataProcess.taskXmlToJson(combActionXml);
        return combActionModel;
    },
    ecXmlToJson: function(ecXml) {
        if (ecXml == undefined) return [];
        var ecModel = [];
        $(ecXml).find("main").each(function(i) {
            ecModel[i] = { IsCheck: false, Query: { Name: $(this).find("Query").attr("name"), DisplayName: $(this).find("Query").attr("DisplayName"), Equation: $(this).find("Query").text() }, Parameters: [] };
            $(this).find("Parameter").each(function (key, value) {
                var fieldName = $(this).find("Field").attr("Name") == undefined ? "" : $(this).find("Field").attr("Name");
                var position = $(this).find("Position").text() == undefined ? "" : $(this).find("Position").text();
                var param = { Name: $(this).attr("Name"), SessionParameterName: $(this).attr("SessionParameterName"), Value: $(this).attr("Value"), DataType: $(this).attr("DataType"), Usage: $(this).attr("Usage"), IsEditing: false };
                jQuery.extend(param, { Field: { FieldName: fieldName, Position: position } });
                ecModel[i].Parameters.push(param);
            })
        })
        return ecModel;
    },
    variableXmlToJson: function (strVariableXml) {
        if (strVariableXml == '') return [];
        var variableModel = [];
        var variableXml = $.parseXML(strVariableXml);
        $(variableXml).find("SessionVariable").each(function (i) {
            variableModel[i] = {
                Name: $(this).find("Name").text(),
                Value: $(this).find("Value").text(),
                DataType: $(this).find("DataType").text(),
                IsConstant: $(this).find("IsConstant").text(),
                IsKey: $(this).find("IsKey").text(),
                KeyIndex: $(this).find("KeyIndex").text()
            }
        })
        return variableModel;
    },
    taskSessionContentXml: function(variableModel) {
        var strReturn = "";
        var vVariableTemplate = "<SessionVariable><Name>{0}</Name><Value>{1}</Value><DataType>{2}</DataType><IsConstant>{3}</IsConstant><IsKey>{4}</IsKey><KeyIndex>{5}</KeyIndex></SessionVariable>";
        $(variableModel).each(function () {
            strReturn += vVariableTemplate.format(this.Name, this.Value, this.DataType, this.IsConstant, this.IsKey, this.KeyIndex);
        })
        strReturn = "<SessionVariables>{0}</SessionVariables>".format(strReturn);
        return strReturn;
    },
    taskArrayObjectToXml: function (arrayObject) {
        var arrayXml ="";
        var arrayItem = "<ItemName>{0}</ItemName><ItemValue>{1}</ItemValue><PeriodsId>{2}</PeriodsId>";
        $(arrayObject).each(function (i) {
            var ItemName = this.ItemName;
            var ItemValue = this.ItemValue;
            $(ItemValue).each(function (j) {
                if (ItemValue[j] != null) {
                    arrayXml += "<ProcessTaskArray>{0}</ProcessTaskArray>".format(arrayItem.format(ItemName, ItemValue[j], j));
                }
            })
        })
        arrayXml = arrayXml == "" ? "<ProcessTaskArrays>Empty</ProcessTaskArrays>" : "<ProcessTaskArrays>{0}</ProcessTaskArrays>".format(arrayXml);
        return arrayXml;
    },
    taskModelToXml: function (taskModel) {
        if (taskModel == undefined) return "";
        var content = '',
            a_content = '';
        var actionTemp = "\n<Action ActionCode=\"{0}\" ActionDisplayName=\"{1}\" FunctionName=\"{2}\" SequenceNo=\"{3}\">{{param}}\n</Action>";
        var paramTemp = "\n<Parameter Name=\"{0}\" SessionParameterName=\"{1}\" Value=\"{2}\" DataType=\"{3}\" Usage=\"{4}\" IsConfigurable=\"{5}\"/>";
        $(taskModel).each(function (i) {
            a_content += actionTemp.format($(this)[0].ActionCode, $(this)[0].ActionDisplayName, $(this)[0].FunctionName, i + 1);
            var p_content = '';
            $($(this)[0].Parameter).each(function (key, value) {
                p_content += paramTemp.format($(this)[0].Name, $(this)[0].SessionParameterName, $(this)[0].Value, $(this)[0].DataType, $(this)[0].Usage, $(this)[0].IsConfigurable);
            })
            a_content = a_content.replace("{{param}}", p_content);
        })
        content = "<Task>{0}\n</Task>".format(a_content);
        return content;
    },
    ecModelToXml: function(ecModel) {
        if (ecModel == undefined) return "";
        var content = '';
        var parameter, query;
        var queryTemp = "<Query name=\"{0}\" DisplayName=\"{1}\">{{equation}}</Query><Presentation/>";
        var paramTemp = "<Parameter Name=\"{0}\" SessionParameterName=\"{1}\" Value=\"{2}\" DataType=\"{3}\" Usage=\"CashFlow\" >";
        var fieldTemp = "<Field Name=\"{0}\"><Position>{{position}}</Position></Field>";

        $(ecModel).each(function() {
            parameter = '', query = '';
            var paramModel = $(this)[0].Parameters;
            var queryModel = $(this)[0].Query;
            $(paramModel).each(function(i) {
                parameter += paramTemp.format(paramModel[i].Name, paramModel[i].SessionParameterName, paramModel[i].Value, paramModel[i].DataType, paramModel[i].Usage);
                if (paramModel[i].Field) {
                    if (paramModel[i].Field.FieldName != "") {
                        parameter += fieldTemp.format(paramModel[i].Field.FieldName).replace("{{position}}", paramModel[i].Field.Position);
                    }
                }
                parameter += "</Parameter>";
            });
            var disName = queryModel.DisplayName == ('' || null) ? '' : queryModel.DisplayName;
            query = queryTemp.format(queryModel.Name, disName).replace("{{equation}}", queryModel.Equation.replace(new RegExp("&&", "g"), "&amp;&amp;").replace(new RegExp("<", "g"), "&lt;").replace(new RegExp(">", "g"), "&gt;"));

            content += "<main><Parameters>{0}</Parameters>{1}</main>".format(parameter, query);
        })
        content = "<Methods>{0}</Methods>".format(content);
        return content;
    },
    metaDataModelByTaskModel: function(taskModel) {
        if (taskModel == null) return [];
        var metaDataModel = [{ Name: "NewParameterName", SessionParameterName: "NewParameterName", Value: "", DataType: "double", Usage: "CashFlow", Field: { FieldName: "", Position: "" } }];
        $(taskModel).each(function(key, value) {
            var parameterName = $(this)[0].ActionCode;
            var params = $(this)[0].Parameter;
            $(params).each(function(i) {
                if ($(this)[0].Name == "ActionType" && $(this)[0].Value == "CashFlow") {
                    metaDataModel.push({ Name: parameterName, SessionParameterName: "", Value: "", DataType: "double", Usage: "CashFlow", Field: { FieldName: parameterName, Position: "CurrentPosition" } });
                }
            })
        })
        return metaDataModel;
    },
    exitParameterModelByECModel: function (ecModel) {
        var metaDataModel = [];
        $(ecModel).each(function (key, value) {
            var params = $(this)[0].Parameters;
            $(params).each(function (i) {
                metaDataModel.push($.extend(true, {}, params[i]));
            })
        })
        metaDataModel = _.uniqBy(metaDataModel, 'Name');
        return metaDataModel;
    },
    variableParameterModelByVariableModel: function (variableModel) {
        var variableParameterModel = [];
        for (var i = 0; i < variableModel.length; i++) {
            variableParameterModel.push({ Name: variableModel[i].Name, SessionParameterName: variableModel[i].Name, Value: variableModel[i].Value, DataType: variableModel[i].DataType, Usage: "CashFlow", Field: { FieldName: "", Position: "" } });
        }
        return variableParameterModel;
    },
    functionXmlToJson: function(functionXml) {
        var functionModel = [];
        $(functionXml).find("Functiongruop").each(function(i, value) {
            functionModel[i] = { name: $(this).attr("Name"), functions: [] };
            $(this).find("Function").each(function(key, value) {
                functionModel[i].functions.push({ name: $(this).attr("name"), expression: $(this).find("Expression").text() });
            });
        });
        return functionModel;
    },
    writeFunctions: function() {
        var functionList = [];
        $.ajax({
            url: "./FunctionTemplates.xml",
            dataType: 'xml',
            type: 'GET',
            timeout: 2000,
            error: function() {
                alert("加载 FunctionTemplates.xml 文件出错！");
            },
            success: function(functionXML) {
                $(functionXML).find("Functiongruop").each(function(key, value) {
                    var items = [];
                    $(value).find('Function').each(function(key, value) {
                        items.push({Name:$(value).attr("name"),Expression:$(value).children("Expression").text()});
                    })
                    functionList.push({ Name: $(value).attr("Name"), CNName: $(value).attr("CNName"), list: items, isOpen: false })
                });
            }
        });
        return functionList;
    },
    variableGridDataToJson: function (data) {
        if (data == '') return null;
        var variableModel = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i][0] != null) {
                variableModel[i] = {
                    Name: data[i][0],
                    Value: data[i][1],
                    DataType: data[i][2] != null ? data[i][2] : "nvarchar",
                    IsConstant: data[i][3] != null ? data[i][3] : "0",
                    IsKey: data[i][4] != null ? data[i][4] : "0",
                    KeyIndex: data[i][5] != null ? data[i][5] : "0",
                    Field: { FieldName: '', Position: '' }
                }
            }

        }
        return variableModel;
    },
    rangeGridDataToJson: function (data) {
        if (data == '') return null;
        var arrReturn = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i][0] != null) {
                var itemName = data[i][0];
                var itemValue = [];
                for (var j = 1; j < data[i].length; j++) {
                    itemValue.push(data[i][j]);
                }
                arrReturn.push({ "ItemName": itemName, "ItemValue": itemValue });
            }

        }
        return arrReturn;
    },
    rangeJsonToArray: function (data) {
        if (data == '') return null;
        var arrReturn = [];
        for (var i = 0; i < data.length; i++) {
            arrReturn.push([]);
            arrReturn[i][0] = data[i].ItemName;
            for (var j = 0; j < data[i].ItemValue.length; j++) {
                //itemValue.push(data[i][j]);
                arrReturn[i][j + 1] = data[i].ItemValue[j];
            }
        }
        return arrReturn;
    },
    getRunTaskSessionVariables: function (variableModel, taskCode, ecCode) {
        var strReturn = "";
        var vVariableTemplate = "<SessionVariable><Name>{0}</Name><Value>{1}</Value><DataType>{2}</DataType><IsConstant>{3}</IsConstant><IsKey>{4}</IsKey><KeyIndex>{5}</KeyIndex></SessionVariable>";
        var vECSetTemplate = "<SessionVariable><Name>CashFlowECSet</Name><Value>{0}</Value><DataType>nvarchar</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>";
        var vTaskCodeTemplate = "<SessionVariable><Name>TaskCode</Name><Value>{0}</Value><DataType>nvarchar</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>";
        var vStartPeriodTemplate = "<SessionVariable><Name>StartPeriod</Name><Value>0</Value><DataType>nvarchar</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>";
        var vEndPeriodTemplate = "<SessionVariable><Name>EndPeriod</Name><Value>11</Value><DataType>nvarchar</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>";
        var startPeriodStr = "";
        var endPeriodStr = "";
        variableModel.filter(function (item) {
            if (item.Name == "StartPeriod") {
                startPeriodStr = vVariableTemplate.format(item.Name, item.Value, item.DataType, item.IsConstant, item.IsKey, item.KeyIndex);
            }
        });
        variableModel.filter(function (item) {
            if (item.Name == "EndPeriod") {
                endPeriodStr = vVariableTemplate.format(item.Name, item.Value, item.DataType, item.IsConstant, item.IsKey, item.KeyIndex);
            }
        });
        if (startPeriodStr == "") {
            startPeriodStr = vStartPeriodTemplate;
        }
        if (endPeriodStr == "") {
            endPeriodStr = vEndPeriodTemplate;
        }
        strReturn = "<SessionVariables>{0}</SessionVariables>".format(vECSetTemplate.format(ecCode) + vTaskCodeTemplate.format(taskCode) + startPeriodStr + endPeriodStr);
        return strReturn;
    },
    scriptOfTask: function (appDomain, strTaskScript, taskCode, criteriaCode, scriptTemplates, callback) {
        var self = this;
        strTaskScript = scriptTemplates.variableScript.format(appDomain);
        if (criteriaCode != null) {
            var sContent = "{'SPName':'[usp_GetECEntitiesBySetCode]'," +
                          "'ECSetCode':'" + criteriaCode + "'" +
                          "}";
            webProxy.getQueryStoredProcedureProxy(appDomain, sContent, function (response) {
                self.scriptForEC(appDomain, strTaskScript, taskCode, criteriaCode, response, scriptTemplates, callback);
            });
        } else {
            var sContent = "{'SPName':'usp_GetProcessTask'," +
                          "'ProcessTaskCode':'" + taskCode + "'" +
                          "}";
            webProxy.getQueryStoredProcedureProxy(appDomain, sContent, function (response) {
                self.scriptForTask(appDomain, strTaskScript, taskCode, response, scriptTemplates, callback);
            });
        }
    },
    scriptForEC: function (appDomain, strTaskScript, taskCode, criteriaCode, response, scriptTemplates, callback) {
        var self = this;
        if (response != undefined) {
            strTaskScript += scriptTemplates.ecScript.format(criteriaCode, response[0].XMLSqlQueryEC,appDomain);
        }        
        var sContent = "{'SPName':'usp_GetProcessTask'," +
                          "'ProcessTaskCode':'" + taskCode + "'" +
                          "}";
        webProxy.getQueryStoredProcedureProxy(appDomain, sContent, function (response) {
            self.scriptForTask(appDomain, strTaskScript, taskCode, response, scriptTemplates, callback);
        });
    },
    scriptForTask: function (appDomain, strTaskScript, taskCode, response, scriptTemplates, callback) {
        var self = this;
        if (response != undefined) {
            var taskObj = $.parseXML(response[0].XMLProcessTask);
            var strActionCodes = "";
            $(taskObj).find("Action").each(function (key, value) {
                strTaskScript += scriptTemplates.actionSctipt.format($(this).attr("ActionCode"),appDomain);
            });
            strTaskScript += scriptTemplates.taskScript.format(taskCode, response[0].XMLProcessTask,appDomain);
        }        
        var sContent = "{'SPName':'[usp_GetProcessTaskContextByTaskCode]'," +
                      "'TaskCode':'" + taskCode + "'" +
                      "}";
        webProxy.getQueryStoredProcedureProxy(appDomain, sContent, function (response) {
            self.scriptForSessionContext(appDomain, strTaskScript, taskCode, response, scriptTemplates, callback);
        });
    },
    scriptForSessionContext: function (appDomain, strTaskScript, taskCode, response, scriptTemplates, callback) {
        var self = this;
        if (response != undefined) {
            $.each(response, function (i) {
                strTaskScript += scriptTemplates.processTaskContextScript.format(response[i].VariableName, response[i].VariableValue, response[i].VariableDataType, response[i].IsConstant, response[i].IsKey, response[i].KeyIndex, appDomain);
            })
        }
        var sContent = "{'SPName':'usp_GetProcessTaskArrayByTaskCode'," +
                      "'TaskCode':'" + taskCode + "'" +
                      "}";
        webProxy.getQueryStoredProcedureProxy(appDomain, sContent, function (response) {
            self.scriptForSesseionContextArray(appDomain,strTaskScript, response, scriptTemplates, callback);
        });
    },
    scriptForSesseionContextArray: function (appDomain,strTaskScript, response, scriptTemplates, callback) {
        if (response != undefined) {
            $.each(response, function (i) {
                var itemName = response[i].ItemName;
                var j = 0;
                for (var p in response[i]) {
                    if (p != "ItemName") {
                        strTaskScript += scriptTemplates.processTaskArrayScript.format(itemName, response[i][p], j, appDomain);
                        j += 1;
                    }
                }
            })
        }
        callback(strTaskScript);
    },
    formatXml: function (text)
    {
        var self = this;
        //去掉多余的空格
        text = '\n' + text.replace(/(<\w+)(\s.*?>)/g, function ($0, name, props)
        {
            return name + ' ' + props.replace(/\s+(\w+=)/g, " $1");
        }).replace(/>\s*?</g, ">\n<");

        //把注释编码
        text = text.replace(/\n/g, '\r').replace(/<!--(.+?)-->/g, function ($0, text)
        {
            var ret = '<!--' + escape(text) + '-->';
            //alert(ret);
            return ret;
        }).replace(/\r/g, '\n');

        //调整格式
        var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/mg;
        var nodeStack = [];
        var output = text.replace(rgx, function ($0, all, name, isBegin, isCloseFull1, isCloseFull2, isFull1, isFull2)
        {
            var isClosed = (isCloseFull1 == '/') || (isCloseFull2 == '/') || (isFull1 == '/') || (isFull2 == '/');
            //alert([all,isClosed].join('='));
            var prefix = '';
            if (isBegin == '!')
            {
                prefix = self.getPrefix(nodeStack.length);
            }
            else
            {
                if (isBegin != '/')
                {
                    prefix = self.getPrefix(nodeStack.length);
                    if (!isClosed)
                    {
                        nodeStack.push(name);
                    }
                }
                else
                {
                    nodeStack.pop();
                    prefix = self.getPrefix(nodeStack.length);
                }

            }
            var ret = '\n' + prefix + all;
            return ret;
        });

        var prefixSpace = -1;
        var outputText = output.substring(1);
        //alert(outputText);

        //把注释还原并解码，调格式
        outputText = outputText.replace(/\n/g, '\r').replace(/(\s*)<!--(.+?)-->/g, function ($0, prefix, text)
        {
            //alert(['[',prefix,']=',prefix.length].join(''));
            if (prefix.charAt(0) == '\r')
                prefix = prefix.substring(1);
            text = unescape(text).replace(/\r/g, '\n');
            var ret = '\n' + prefix + '<!--' + text.replace(/^\s*/mg, prefix) + '-->';
            //alert(ret);
            return ret;
        });

        return outputText.replace(/\s+$/g, '').replace(/\r/g, '\r\n');
    },
    getPrefix: function (prefixIndex)
    {
        var span = '    ';
        var output = [];
        for (var i = 0 ; i < prefixIndex; ++i)
        {
            output.push(span);
        }

        return output.join('');
    }
}
