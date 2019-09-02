define(['jquery', 'globalVariable', 'common'], function ($, globalVariable, common) {

    //调用WCF
    var CallApi = function (connName, spName, isAsync) {
        this.ConnName = connName;
        this.SPName = spName;
        this.Params = [];
        this.IsAsync = isAsync;

        this.AddParam = function (param) {
            if (!param.hasOwnProperty('Name') || !param.hasOwnProperty('Value') || !param.hasOwnProperty('DBType')) {
                throw 'Parameter Required Arg Error';
            }

            this.Params.push(param);
        }

        this.prepareParam = function () {
            if (!this.SPName || this.SPName.length < 1) {
                throw 'SPName: Procedure Name is Required';
            }
            if (!this.ConnName || this.ConnName.length < 1) {
                throw 'ConnName: DBConnection Name is Required';
            }

            var objParam = { SPName: this.SPName, SQLParams: this.Params };
            var strParam = encodeURIComponent(JSON.stringify(objParam));

            return strParam;
        }

        this.PostData = function () {
            return { connectionName: this.ConnName, param: this.prepareParam() };
        }

        this.ExecuteDataTable = function (callback) {
            var serviceUrl = globalVariable.CommonServicesUrl + 'ExecuteDataTable';
            this.DataCall(serviceUrl, this.PostData(), callback);
        }

        this.ExecuteDataSet = function (callback) {
            var serviceUrl = globalVariable.CommonServicesUrl + 'ExecuteDataSet';
            this.DataCall(serviceUrl, this.PostData(), callback);
        }

        //采用POST方式调用WCF 
        this.ExportDataToExcel = function (excelName) {
            var serviceUrl = globalVariable.CommonServicesUrl + 'ExportDataToExcel';
            var postData = this.PostData();
            postData.excelName = excelName;
            this.HttpCall(serviceUrl, postData);
        }
        //采用POST方式调用WCF 
        this.ExportDataPoolToExcel = function (excelName,sheetName) {
            var serviceUrl = globalVariable.CommonServicesUrl + 'ExportDataPoolToExcel';
            var postData = this.PostData();
            postData.excelName = excelName;
            postData.sheetName = sheetName;
            this.HttpCall(serviceUrl, postData);
        }

        //采用表单Submit Post调用WCF 
        this.HttpCall = function (serviceUrl, params, target) {
            var tempform = document.createElement("form");
            tempform.action = serviceUrl;
            tempform.method = "post";
            tempform.style.display = "none";
            if (target) {
                tempform.target = target;
            }

            for (var x in params) {
                var opt = document.createElement("input");
                opt.name = x;
                opt.value = params[x];
                tempform.appendChild(opt);
            }

            var opt = document.createElement("input");
            opt.type = "submit";
            tempform.appendChild(opt);
            document.body.appendChild(tempform);
            tempform.submit();
            document.body.removeChild(tempform);
        }


        this.ExecuteNoQuery = function (callback) {
            var serviceUrl = globalVariable.CommonServicesUrl + 'ExecuteNoQuery';
            this.DataCall(serviceUrl, this.PostData(), callback);
        }

        this.DataCall = function (serviceUrl, postData, callback) {
            self = this;
            $.ajax({
                url: serviceUrl,
                async: this.IsAsync,
                type: "POST",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(postData),
                success: function (res) {
                    if (callback && typeof callback === 'function') {
                        callback(JSON.parse(res));
                    }
                },
                error: function (msg) {
                    console.error(msg);
                }
            });
        }

        this.comGetData = function (params, url, SPName) {
            var deferred = $.Deferred();
            var urls;
            if (params) {
                if (params[0].length > 2) {
                    var executeParam = { SPName: SPName, SQLParams: [] };
                    for (var i = 0; i < params.length; i++) {
                        executeParam.SQLParams.push({ Name: params[i][0], Value: params[i][1], DBType: params[i][2] });
                    }
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    urls = url + executeParams;
                } else {
                    var requestParams = '{"Method":' + SPName + ',"Params":{#PARAMS#}}';
                    var urlParams;
                    for (var i = 0; i < params.length; i++) {
                        if (i == params.length - 1) {
                            urlParams += "'" + params[i][0] + "':'" + params[i][1] + "'";
                        } else {
                            urlParams += "'" + params[i][0] + "':'" + params[i][1] + "',";
                        }
                    }
                    requestParams = requestParams.replace('#PARAMS#', urlParams);
                    urls = url + encodeURIComponent(requestParams);
                }
            } else {
                var executeParam = { SPName: SPName, SQLParams: [] };
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                urls = url + executeParams;
            }

            $.ajax({
                cache: false,
                type: "GET",
                async: false,
                url: urls,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (data) {
                    deferred.resolve(data);
                },
                error: function (data) {
                    deferred.reject(data);
                    alert('Error occurred while requiring the remote source data!');
                }
            });
            return deferred.promise;
        }

    };

    return CallApi;
});