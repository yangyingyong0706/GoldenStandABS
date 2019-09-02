requirejs(['../../../../asset/lib/config'], function (config) {
    require(['Vue', 'kendo.all.min', 'kendomessagescn',
        'common',
        'anyDialog',
        'app/assetFilter/creditfactory/js/core',
        'globalVariable',
        'jquery',
        'callApi',
        //'linq',
        //'taskProcessIndicator',
        'goldenstand/taskProcessIndicator',
        'goldenstand/sVariableBuilder',
        'goldenstand/webProxy',
        'gs/webStorage',
        'gsAdminPages'
    ],
    function (Vue, kendo, kendoMessage, common, anyDialog, core, globalVariable, $, CallApi, taskProcessIndicator, sVariableBuilder, webProxy, webStorage, GSDialog) {
        //window.globalVariable = globalVariable;
        poolDistributionModel = new Vue({
            el: '#poolDistributionView',
            data: {
                PoolDBName: '',
                DBName: 'CreditFactory',
                PoolName: 'CreditFactory',
                ConnectionString: '',
                PoolId: 0,
                PoolDistributionList: [],
                SqlScript: '',
                renderData: [],
                globalVariable: globalVariable,
                taskProcessIndicator: taskProcessIndicator,
                sVariableBuilder: sVariableBuilder,
                webProxy: webProxy,
                AddDistributionTypeCodeDataTmp: [],
                AddDistributionTypeCodeData: [],
                webStorage: webStorage,
                webStorageDistributionTypeCode: []
            },
            ready: function () {
                var PoolId = common.getQueryString("PoolId");
                if (PoolId) {
                    this.getPoolConfig(PoolId);
                }
                else {
                    this.renderGrid();
                }
                this.hideShow();
            },
            methods: {
                getPoolConfig: function (poolId) {
                    var that = this;
                    that.PoolId = poolId;
                    var callApi = new CallApi('DAL_SEC_PoolConfig', 'dbo.[usp_GetPoolHeader]', true);
                    callApi.AddParam({ Name: 'PoolId', Value: poolId, DBType: 'int' });
                    callApi.ExecuteDataSet(function (response) {
                        var configInfo = response[0];
                        if (configInfo) {
                            that.DBName = configInfo.PoolDBName;
                            that.PoolName = configInfo.PoolName;
                            that.PoolDBName = configInfo.PoolDBName;
                        }
                        that.renderGrid();
                        that.GetAddibleConfig();
                    });
                },
                renderGrid: function () {
                    //如果需要从数据库获取grid的数据，在此处编写
                    var that = this;
                    var callApi = new CallApi('CreditFactory', 'dbo.usp_GetDimDistributionConfig', true);
                    var svcUrl = that.globalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?poolname=' + that.DBName + '&appDomain=dbo&executeParams=';
                    var params;
                    var result = [];
                    var promise = callApi.comGetData(params, svcUrl, 'usp_GetDimDistributionConfig');
                    promise().then(function (response) {
                        if (typeof response === 'string') {
                            that.PoolDistributionList = JSON.parse(response);
                        }
                        else {
                        }
                    });
                },
           
            GetAddibleConfig: function() {
                var that = this;
                var executeParam = {
                    'SPName': "dbo.usp_GetAddibleConfig",
                    'SQLParams': [
                        { Name: 'type', Value: 'dim', DBType: 'string' }
                    ]
                };
                var serviceUrl = globalVariable.DataProcessServiceUrl + "CommonGetExecuteForPool?";//appDomain=TrustManagement&executeParams=" + context;
                    
                common.ExecuteGetData(true, serviceUrl, that.DBName, executeParam, function (data) {
                    that.AddDistributionTypeCodeDataTmp = data;
                });

            },
                addItem: function () {
                    var p = new Object();
                    p.DistributionTypeCode = ''; //字段英文
                    p.DistributionTypeName = '';//字段汉字
                    this.PoolDistributionList.push(p);
                    console.log(this.PoolDistributionList)
                    this.AddDistributionTypeCodeData = this.AddCodeAry(this.PoolDistributionList);
                },
                //输入值千分位表示
                CodingVerification: function (obj) {
                    var data = $(obj.srcElement).val()
                    var res = common.ReturnNumFormt(data);
                    $(obj.srcElement).val(res)
                },
                //数据静态渲染千分位
                numFormt: function (obj) {
                    var res = common.numFormt(obj);
                    console.log(res);
                    return res;
                },
                AddCodeAry: function (ary) {
                    var NewAarry = this.AddDistributionTypeCodeDataTmp;
                    $.each(ary, function (AryI, Aryv) {
                        $.each(NewAarry, function (OldAddaryi, OldAddaryv) {
                            if (OldAddaryv) {
                                if (Aryv.DistributionTypeCode == OldAddaryv.DistributionTypeCode) {
                                    NewAarry.remove(NewAarry[OldAddaryi])
                                }
                            }

                        })
                    })
                    return NewAarry
                },
                IsintoAddDistributionTypeCodeData: function (CurrentCode) {
                    var IstrueOrfalse;
                    var self = this;
                    if (self.AddDistributionTypeCodeData > 0) {
                        $.each(self.AddDistributionTypeCodeData, function (i, v) {
                            if (CurrentCode == v.DistributionTypeCode) {
                                IstrueOrfalse = false;
                            } else {
                                IstrueOrfalse = true;
                            }
                        })
                    } else {
                        IstrueOrfalse = true;
                    }
                    return IstrueOrfalse

                },
                removeItem: function (index) {
                    var object = this.PoolDistributionList[index];
                    var self = this;
                    var IsTrue = this.IsintoAddDistributionTypeCodeData(object.DistributionTypeCode);
                    if (object.DistributionTypeCode != '' && IsTrue) {
                        self.AddDistributionTypeCodeDataTmp.push(object);
                    }
                    this.PoolDistributionList.remove(object);
                },

                loadConfig: function () {
                    this.renderGrid();
                    var self = this;
                    self.AddDistributionTypeCodeData = this.AddCodeAry(this.PoolDistributionList);
                },

                saveConfig: function () {  //页面脚本编辑完毕后，调用此方法，执行Task
                    if (this.PoolDistributionList == false) {
                        GSDialog.HintWindow('请添加分布信息')
                    } else if (false == this.verifyData()) {
                        GSDialog.HintWindow('请检查数据填写')
                    } else {
                        this.buildSql();
                        this.runTask();
                    }
                },
                verifyData: function () {
                    var rtn = true;
                    $.each(this.PoolDistributionList, function (i, p) {
                        if (p.DistributionTypeName == '' || p.DistributionTypeName == null) {
                            rtn = false
                        }
                    });
                    return rtn;
                },

                buildSql: function () { //在Grid里输入完毕后，点击按钮调用此方法生成脚本
                    var sql = 'truncate table [dbo].[DimDistributionConfig] \ninsert into [dbo].[DimDistributionConfig] values \n';
                    $.each(this.PoolDistributionList, function (i, p) {
                        sql += "(" + (i + 1) + ",'" + p.DistributionTypeCode
                            + "',N'" + p.DistributionTypeName + "'),\n";
                    })
                    sql = sql.slice(0, -2);
                    this.SqlScript = sql;
                },

                runTask: function () {  //页面脚本编辑完毕后，调用此方法，执行Task
                    var self = this;
                    //require([],function (taskIndicator, sVariableBuilder, webProxy, common) {
                    self.sVariableBuilder.ClearVariableItem();
                    self.ConnectionString = 'Data Source=MSSQL;Initial Catalog=' + self.PoolDBName + ';Integrated Security=SSPI';
                    self.sVariableBuilder.AddVariableItem('ConnectionString', self.ConnectionString, 'String', 0, 0, 0);
                    self.sVariableBuilder.AddVariableItem('SqlScript', self.SqlScript, 'String', 0, 0, 0);
                    self.sVariableBuilder.AddVariableItem('PoolID', self.PoolId, 'Int', 1, 0, 0);
                    var sVariable = self.sVariableBuilder.BuildVariables();
                    var tIndicator = new self.taskProcessIndicator({
                        width: 600,
                        height: 550,
                        clientName: 'CashFlowProcess',
                        appDomain: 'Task',
                        taskCode: 'PoolDimDistributionConfig',
                        sContext: sVariable,
                        callback: function () {
                            //alert('done');
                        }
                    });
                    tIndicator.show();
                },
                show: function (text) { //
                    this.close();
                    var html = '<div id="div_task_loading" class="task-loadpage">' +
                         '<div class="loading-wraper">' +
                         ' <i class="iconfont icon-shezhi bigicon am-rotate pa"></i>' +
                         ' <i class="iconfont icon-shezhi smicon am-rotate pa"></i>' +
                         ' <p class="text pa">' + text + '</p>' +
                         '</div>' +
                         '</div>'

                    var div = document.createElement("div");
                    div.innerHTML = html;
                    document.body.appendChild(div);
                },
                close: function () {
                    var _element = document.getElementById('div_task_loading');
                    if (_element) {
                        var _parentElement = _element.parentNode;
                        if (_parentElement) {
                            _parentElement.removeChild(_element);
                        }
                    }
                },
                hideShow: function () {
                    $(".textareaBox").toggle()
                },
                ready: function () {
                    this.renderGrid();
                    this.hideShow();
                },
                selectVal: function (event, index) {
                    var self = this;
                    var CurrentObj = event.target.value//获取当前触发对象
                    $.each(self.AddDistributionTypeCodeDataTmp, function (ix, vx) {
                        if (vx != undefined) {
                            if (vx.DistributionTypeName == CurrentObj) {
                                self.PoolDistributionList[index].DistributionTypeName = CurrentObj;
                                self.PoolDistributionList[index].DistributionTypeCode = vx.DistributionTypeCode;
                            }
                        }
                    })
                    self.AddDistributionTypeCodeData = this.AddCodeAry(self.PoolDistributionList);
                }
            }

        });

    })

});
