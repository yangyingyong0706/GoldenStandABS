define(function(require) {
    var $ = require('jquery');
    var toast = require('toast');
	var common = require('gs/uiFrame/js/common');
	var CallApi = require("callApi")
	var GlobalVariable = require('globalVariable');
	var taskIndicator = require('gs/taskProcessIndicator');
	var sVariableBuilder = require('gs/sVariableBuilder');
	var GSDialog = require("gsAdminPages");
	var Vue = require('Vue2');
	require('date_input');
	var widthOx = 5;
	var app = new Vue({
		el: '#mainDiv',
		data: {
            SliceDateArr: [],
			PoolId: common.getQueryString('PoolId'),
			PoolDBName: '',
			PoolName: '',
			PoolConnection: '',
			pointerEventsBoolean: true, //遮罩
			basicsAllocationBoolean: true, //基础配置显示隐藏
			basicsAllocationForm: [{
				"Style": false,
				"Category": "TrustExtensionItem",
				"SPId": "",
				"SPCode": "",
				"SPRItemCode": "",
				"TBId": "",
				"ItemId": "",
				"ItemCode": "B_CollectionDate_FirstDate",
				"ItemValue": ""
			}, {
				"Style": false,
				"Category": "TrustExtensionItem",
				"SPId": "",
				"SPCode": "",
				"SPRItemCode": "",
				"TBId": "",
				"ItemId": "",
				"ItemCode": "B_CollectionDate_Frequency",
				"ItemValue": ""
			}, {
				"Style": false,
				"Category": "TrustExtensionItem",
				"SPId": "",
				"SPCode": "",
				"SPRItemCode": "",
				"TBId": "",
				"ItemId": "",
				"ItemCode": "ClosureDate",
				"ItemValue": ""
			}, {
				"Style": false,
				"Category": "TrustExtensionItem",
				"SPId": "",
				"SPCode": "",
				"SPRItemCode": "",
				"TBId": "",
				"ItemId": "",
				"ItemCode": "B_CollectionDate_WorkingDateAdjustment",
				"ItemValue": ""
			}, {
				"Style": false,
				"Category": "TrustExtensionItem",
				"SPId": "",
				"SPCode": "",
				"SPRItemCode": "",
				"TBId": "",
				"ItemId": "",
				"ItemCode": "B_CollectionDate_Calendar",
				"ItemValue": ""
			}, {
				"Style": false,
				"Category": "TrustExtensionItem",
				"SPId": "",
				"SPCode": "",
				"SPRItemCode": "",
				"TBId": "",
				"ItemId": "",
				"ItemCode": "B_CollectionDate_Condition",
				"ItemValue": false
			}, {
				"Style": false,
				"Category": "TrustExtensionItem",
				"SPId": "",
				"SPCode": "",
				"SPRItemCode": "",
				"TBId": "",
				"ItemId": "",
				"ItemCode": "B_CollectionDate_ConditionTarget",
				"ItemValue": ""
			}, {
				"Style": false,
				"Category": "TrustExtensionItem",
				"SPId": "",
				"SPCode": "",
				"SPRItemCode": "",
				"TBId": "",
				"ItemId": "",
				"ItemCode": "B_CollectionDate_ConditionDay",
				"ItemValue": ""
			}, {
				"Style": false,
				"Category": "TrustExtensionItem",
				"SPId": "",
				"SPCode": "",
				"SPRItemCode": "",
				"TBId": "",
				"ItemId": "",
				"ItemCode": "B_CollectionDate_ConditionCalendar",
				"ItemValue": ""
			}, {
				"Style": false,
				"Category": "TrustExtensionItem",
				"SPId": "",
				"SPCode": "",
				"SPRItemCode": "",
				"TBId": "",
				"ItemId": "",
				"ItemCode": "TrustStartDate",
				"ItemValue": ""
			}],
			timeShowList: [],
			startDateArr: [],
			allDateArr: [],
			timeLastJson: []
		},
		watch: {
		    PoolDBName: function (now) {
		        this.getSliceDate()
		    }
		},
		methods: {
		    getSliceDate: function () {
		        var _this = this;
		        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?';
		        var appDomain = _this.PoolDBName;
					executeParam = {
					    'SPName': "TrustManagement.usp_GetPaymentDates",
					    'SQLParams': []
					};
		        common.ExecuteGetData(false, svcUrl, appDomain, executeParam, function (data) {
		            console.log(data)
		            _this.SliceDateArr = data[0];
		        })
		    },
		    //验证是否有可供操作的归集现金流
		    isCashFlow: function () {
		        var _this = this;
		        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
					appDomain = _this.PoolDBName,
					executeParam = {
					    'SPName': "TrustManagement.usp_GetHasCashFlow",
					    'SQLParams': [{
					        'Name': 'PoolId',
					        'Value': _this.PoolId,
					        'DBType': 'int'
					    }]
					};
		        var myData = false;
		        common.ExecuteGetData(false, svcUrl, appDomain, executeParam, function (data) {
		            if (data[0].Result) {
		                if (data[0].Result == 1) {
		                    myData = true
		                } else {
		                    myData = false
		                }
		            }
		        });
		        return myData
		    },
		    //获取所有开始日期，所有日期（每天）
		    InitTimeAxis: function () {
		        var self = this;
		        self.startDateArr = []
		        self.allDateArr = []
		        self.timeLastJson = []
		        $.each(self.timeShowList, function (i, v) {
		            self.startDateArr.push(v.StartDate);
		        })
		        self.startDateArr.push(self.timeShowList[self.timeShowList.length - 1].EndDate);
		        self.allDateArr = getBetweenDateStr(self.timeShowList[0].StartDate, self.timeShowList[self.timeShowList.length - 1].EndDate)
		        var timeLength = self.allDateArr.length;
		        var lineWidth = timeLength * widthOx;
		        $('.timeLine').width(lineWidth + 16);
		        var timeIndex = [];
		        $.each(self.allDateArr, function (i, v) {
		            $.each(self.startDateArr, function (j, n) {
		                if (v == n) {
		                    timeIndex.push(i);
		                }
		            })
		        });
		        $.each(self.startDateArr, function (i, v) {
		            self.timeLastJson.push({ 'index': i, 'date': v, 'leftIndex': timeIndex[i], 'widthOx': widthOx })
		        });
		        this.$nextTick(function () {
		            self.moveDot()
		        })
		    },
		    //获取PoolName、PoolDBName、PoolConnection
			getPoolConfig: function() {
				var that = this;
				var callApi = new CallApi('DAL_SEC_PoolConfig', 'dbo.[usp_GetPoolHeader]', true);
				callApi.AddParam({
					Name: 'PoolId',
					Value: that.PoolId,
					DBType: 'int'
				});
				callApi.ExecuteDataSet(function(response) {
					var configInfo = response[0];
					if(configInfo) {
						that.PoolName = configInfo.PoolName;
						that.PoolDBName = configInfo.PoolDBName;
						that.PoolConnection = configInfo.TargetSqlConnection;
					};
					that.getTimeLineList() 
					that.getBasic()
				});
			},
			//获取上次基础配置
			getBasic: function () {
				var _this = this;
				var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
					appDomain = this.PoolDBName,
					executeParam = {
						'SPName': "TrustManagement.usp_GetPoolDateConfig",
						'SQLParams': [{
							'Name': 'PoolId',
							'Value': this.PoolId,
							'DBType': 'int'
						}]
					};
			    common.ExecuteGetData(true, svcUrl, appDomain, executeParam, function (data) {
			        for (var i = 0; i < _this.basicsAllocationForm.length; i++) {
			            for (var j = 0; j < data.length; j++) {
			                if (_this.basicsAllocationForm[i].ItemCode == data[j].ItemCode) {
								_this.basicsAllocationForm[i].ItemValue = data[j].ItemValue
			                    if (data[j].ItemCode == 'B_CollectionDate_FirstDate') {
									$('#FirstDate').val(data[j].ItemValue);
								}
			                    if (data[j].ItemCode == 'ClosureDate') {
									$('#ClosureDate').val(data[j].ItemValue);
								}
			                    if (data[j].ItemCode == 'B_CollectionDate_Condition' && data[j].ItemValue == "False") {
									_this.basicsAllocationForm[i].ItemValue = false
			                    } else if (data[j].ItemCode == 'B_CollectionDate_Condition' && data[j].ItemValue == "True") {
									_this.basicsAllocationForm[i].ItemValue = true
								}
							}
						}
			            _this.pointerEventsBoolean = false;
			        }
			        _this.init()
				});
			},
			//时间选择器初始化
			init: function() {
			    $('.basicsAllocation .date-plugins').date_input()
			},
			//基础配置显示隐藏
			ShowHide: function() {
				var _this = this;
				this.basicsAllocationBoolean = !this.basicsAllocationBoolean;
				if(this.basicsAllocationBoolean) {
					setTimeout(function() {
						_this.init();
					}, 500);

				}
			},
			//添加时间列表
			addTimeShow: function() {
				var addObject = {
					EndDate: "",
					IsContainsEnd: 1,
					IsCurrent: false,
					IsManualModified: false,
					StartDate: "",
					TrustId: 11,
					TrustPeriodDesc: "",
					TrustPeriodType: "CollectionDate_NW"
				}
				this.timeShowList.splice(0,0,addObject)
				setTimeout(function() {
					$('.timeList-content').find('.date-plugins').date_input()
				}, 500);
			},
			//删除时间列表
			removeTimeShow: function(index) {
				var _this = this;
				GSDialog.HintWindowTF("确认删除该条数据？", function() {
				    _this.timeShowList.splice(index, 1);
				    _this.InitTimeAxis()
				})
			},
			basicChange: function(valueBoolean) {
				if(!valueBoolean) {
					this.basicsAllocationForm[6].ItemValue = '';
					this.basicsAllocationForm[7].ItemValue = '';
					this.basicsAllocationForm[8].ItemValue = '';
				}
			},
			haha: function() {
                console.log(666)
			},
			//生成时间轴
			submitDate: function () {
			    var isCashFlow = this.isCashFlow();
			    var _this = this;
			    //if (isCashFlow) {
			        this.basicsAllocationForm[0].ItemValue = $('#FirstDate').val();
			        this.basicsAllocationForm[9].ItemValue = $('#FirstDate').val();
			        this.basicsAllocationForm[2].ItemValue = $('#ClosureDate').val();
			        //表单验证--不能为空
			        var B_CollectionDate_Condition = '',
                        isPass = true
			        for (var i = 0; i < this.basicsAllocationForm.length; i++) {
			            if (this.basicsAllocationForm[i].ItemCode == 'B_CollectionDate_Condition') {
			                B_CollectionDate_Condition = this.basicsAllocationForm[i].ItemValue
			                break;
			            }
			        }
			        for (var i = 0; i < this.basicsAllocationForm.length; i++) {
			            if (B_CollectionDate_Condition) {
			                if (this.basicsAllocationForm[i].ItemValue == '' || this.basicsAllocationForm[i].ItemValue == undefined) {
			                    this.basicsAllocationForm[i].Style = true
			                    isPass = false
			                }
			            } else {
			                if (this.basicsAllocationForm[i].ItemValue == '' && this.basicsAllocationForm[i].ItemCode != 'B_CollectionDate_Condition' && this.basicsAllocationForm[i].ItemCode != 'B_CollectionDate_ConditionTarget' && this.basicsAllocationForm[i].ItemCode != 'B_CollectionDate_ConditionDay' && this.basicsAllocationForm[i].ItemCode != 'B_CollectionDate_ConditionCalendar') {
			                    this.basicsAllocationForm[i].Style = true
			                    isPass = false
			                }
			            }
			        }
			        if (!isPass) {
			            $.toast({ type: 'warning', message: '数据不能为空' })
			            return false;
			        }
			        
			        var FirstDate = $('#FirstDate').val(), endDate = $('#ClosureDate').val();
			        FirstDate = Number(FirstDate.replace(/-/g, ''));
			        endDate = Number(endDate.replace(/-/g, ''));
			        var reg = new RegExp("^[0-9]*$");
			        //表单验证--必须为合法日期
			        if (!reg.test(FirstDate) || !reg.test(endDate)) {
			            $.toast({ type: 'warning', message: '请输入合法日期' })
			            return false;
			        }
			        //表单验证--归集结束日不能小于首次日期
			        if (FirstDate > endDate) {
			            $.toast({ type: 'warning', message: '首次日期不能大于归集结束日' })
			            return false;
			        }
			        for (var i = 0; i < this.basicsAllocationForm.length; i++) {
			            if (!B_CollectionDate_Condition) {
			                if (this.basicsAllocationForm[i].ItemCode == 'B_CollectionDate_ConditionTarget') {
			                    this.basicsAllocationForm[i].ItemValue = ''
			                }
			                if (this.basicsAllocationForm[i].ItemCode == 'B_CollectionDate_ConditionCalendar') {
			                    this.basicsAllocationForm[i].ItemValue = ''
			                }
			            }
			            delete this.basicsAllocationForm[i].Style
			        }
			        var sessionContext = "<root><SessionContext>" + JSON.stringify(this.basicsAllocationForm) + "</SessionContext><poolName>" + _this.PoolDBName + "</poolName></root>";
			        this.saveWorkingSessionContext(sessionContext, function (sessionId) {
			            sVariableBuilder.AddVariableItem('WorkSessionId', sessionId, 'String', 0, 0, 0);
			            sVariableBuilder.AddVariableItem('PoolId', _this.PoolId, 'Int', 0, 0, 0);
			            sVariableBuilder.AddVariableItem('PoolDBConnectionStr', _this.PoolConnection, 'String', 0, 0, 0);
			            var sVariable = sVariableBuilder.BuildVariables();
			            var tIndicator = new taskIndicator({
			                width: 500,
			                height: 550,
			                clientName: 'TaskProcess',
			                appDomain: 'Task',
			                taskCode: 'PoolDateInfoWizard', //'DateInfoWizard',
			                sContext: sVariable,
			                callback: function () {
			                    //window.location.href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
			                    window.location.href = window.location.href;
			                    sVariableBuilder.ClearVariableItem();
			                    //保存完的跳转
			                    if (parent.location.href.indexOf('ModelRefreshIndex') > 0) {
			                        if (parent.qwFrame) {
			                            parent.qwFrame.GotoStep(stepCode);
			                        }
			                    }
			                }
			            });
			            tIndicator.show();
			        })
			    //} else {
			    //    GSDialog.HintWindow("没有可供归集的现金流")
			    //    return false;
			    //}
			},
			saveWorkingSessionContext: function(sessionContext, callback) {
				var that = this;
				var serviceUrl = GlobalVariable.DataProcessServiceUrl + "SaveWorkingSessionContextPlusForPool";
				$.ajax({
					type: "POST",
					url: serviceUrl,
					dataType: "json",
					contentType: "application/xml;charset=utf-8",
					data: sessionContext,
					success: function(response) {
						callback(response);
					},
					error: function(response) {
						GSDialog.HintWindow("error is :" + response);
					}
				});
			},
			//获取时间轴列表
			getTimeLineList: function() {
				var _this = this;
				var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
					appDomain = this.PoolDBName,
					executeParam = {
						'SPName': "TrustManagement.usp_GetTrustPeriod",
						'SQLParams': [{
							'Name': 'TrustPeriodType',
							'Value': 'CollectionDate_NW',
							'DBType': 'string'
						}, {
							'Name': 'PoolId',
							'Value': this.PoolId,
							'DBType': 'int'
						}]
					};
				common.ExecuteGetData(true, svcUrl, appDomain, executeParam, function(data) {
					for(var i = 0; i < data.length; i++) {
						data[i].StyleOne = false;
						data[i].StyleTwo = false;
						if(data[i].StartDate) {
							data[i].StartDate = common.getStringDate(data[i].StartDate).dateFormat("yyyy-MM-dd")
						}
						if(data[i].EndDate) {
							data[i].EndDate = common.getStringDate(data[i].EndDate).dateFormat("yyyy-MM-dd")
						}
					}
					_this.timeShowList = data;
                    _this.startDateArr =[];
					if (_this.timeShowList.length > 0) {
					    _this.InitTimeAxis()
					}
					setTimeout(function() {
						$('.timeList-content').find('.date-plugins').date_input()
					}, 500);
					
					console.log('data')
					console.log(data)
				});
			},
			//保存时间轴
			saveTimeLine: function() {
			    var _this = this;
			    var isCashFlow = this.isCashFlow();
			    //if (isCashFlow) {
			        var StartDate = $('.StartDate'), EndDate = $('.EndDate'), isPass = true;
			        for (var i = 0; i < StartDate.length; i++) {
			            this.timeShowList[i].StartDate = StartDate.eq(i).val()
			            this.timeShowList[i].EndDate = EndDate.eq(i).val()
			            if (this.timeShowList[i].StartDate == '') {
			                this.timeShowList[i].StyleOne = true
			                isPass = false
			            }
			            if (this.timeShowList[i].EndDate == '') {
			                this.timeShowList[i].StyleTwo = true
			                isPass = false
			            }
			        }
			        console.log('我是startDate')
			        console.log(this.timeShowList[0])
			        if (!isPass) {
			            $.toast({ type: 'warning', message: '数据不能为空' })
			            return false;
			        };

			        console.log(this.timeShowList)
			        var items = '<items>';
			        for (let i = 0; i < this.timeShowList.length; i++) {
			            items += '<item>';
			            items += '<TrustId>' + this.PoolId + '</TrustId>';
			            items += '<TrustPeriodDesc>' + this.PoolId + '(' + common.stringToDate(this.timeShowList[i].StartDate).dateFormat("dd/MM/yyyy") + ' - ' + common.stringToDate(this.timeShowList[i].EndDate).dateFormat("dd/MM/yyyy") + ')' + '</TrustPeriodDesc>';
			            items += '<TrustPeriodType>' + this.timeShowList[i].TrustPeriodType + '</TrustPeriodType>';
			            items += '<StartDate>' + this.timeShowList[i].StartDate + '</StartDate>';
			            items += '<EndDate>' + this.timeShowList[i].EndDate + '</EndDate>';
			            items += '<IsCurrent>' + this.timeShowList[i].IsCurrent + '</IsCurrent>';
			            items += '<IsContainsEnd>' + this.timeShowList[i].IsContainsEnd + '</IsContainsEnd>';
			            items += '<IsManualModified>' + this.timeShowList[i].IsManualModified + '</IsManualModified>';
			            items += '</item>';
			        };
			        items += '</items>';
			        var executeParam = {
			            SPName: 'usp_UpdateTrustPeriod',
			            SQLParams: [{
			                Name: 'PoolId',
			                value: this.PoolId,
			                DBType: 'int'
			            },
                            {
                                Name: 'trustPeriodType',
                                value: 'CollectionDate_NW',
                                DBType: 'string'
                            },
                            {
                                Name: 'items',
                                value: items,
                                DBType: 'xml'
                            }
			            ]
			        };
			        this.PostRemoteData(executeParam, function (data) {
			            if (data) {
			                for (var i = 0; i < _this.timeShowList.length; i++) {
			                    _this.timeShowList[i].StyleOne = false
			                    _this.timeShowList[i].StyleTwo = false
			                }
			                $.toast({ type: 'success', message: '保存成功' })
			            } else {
			                $.toast({ type: 'error', message: '保存失败' })
			            }
			        })
			    //} else {
			    //    GSDialog.HintWindow("没有可供归集的现金流")
			    //    return false;
			    //}
			},
			PostRemoteData: function(executeParam, callback) {
				var executeParams = JSON.stringify(executeParam);
				var params = '';
				params += '<root appDomain="TrustManagement" postType="" connString="' + this.PoolConnection + '">'; // appDomain="TrustManagement"
				params += executeParams;
				params += '</root>';
				var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonPostExecute";
				$.ajax({
					type: "POST",
					url: serviceUrl,
					dataType: "json",
					contentType: "application/xml;charset=utf-8",
					data: params,
					processData: false,
					success: function(response) {
						if(callback)
							callback(response);
					},
					error: function(response) {
						alert("error is :" + response);
					}
				});
			},
            //时间轴移动微调日期
			moveDot: function () {
                var self = this;
                var dotIndex = 0;
                var endDotTag = false, endDotOx = 0, endDotLeft, moveOx = 0, arrIndex = 0, oringeLeft;

                $('.prev-dot').mousedown(function (e) {
                    dotIndex = $(this).attr('index');
                    dotIndex = Number(dotIndex);
                    endDotLeft = $(this).position().left;
                    oringeLeft = $(this).position().left;
                    endDotOx = e.pageX - endDotLeft - 30;
                    endDotTag = true;
                });
                $(document).mouseup(function () {
                    endDotTag = false;
                });
                $('.ul').mousemove(function (e) {//鼠标移动
                    if (endDotTag) {
                        endDotLeft = e.pageX - endDotOx - 30;
                        if (dotIndex === 0) {
                            if (endDotLeft > (self.timeLastJson[dotIndex +1].leftIndex - 1) * widthOx) {
                                endDotLeft = (self.timeLastJson[dotIndex +1].leftIndex -1) * widthOx;
                            }
                            if (endDotLeft <= 0) {
                                endDotLeft = 0;
                            }
                        } else if (dotIndex === self.timeLastJson.length -1) {
                            if (endDotLeft > (self.timeLastJson[dotIndex].leftIndex) * widthOx) {
                                endDotLeft = (self.timeLastJson[dotIndex].leftIndex) * widthOx;
                            }
                            if (endDotLeft <= (self.timeLastJson[dotIndex -1].leftIndex +1) * widthOx) {
                                endDotLeft = (self.timeLastJson[dotIndex -1].leftIndex +1) * widthOx;
                            }
                        } else {
                            if (endDotLeft > (self.timeLastJson[dotIndex +1].leftIndex -1) * widthOx) {
                                endDotLeft = (self.timeLastJson[dotIndex +1].leftIndex -1) * widthOx;
                            }
                            if (endDotLeft <= (self.timeLastJson[dotIndex - 1].leftIndex + 1) * widthOx) {
                                endDotLeft = (self.timeLastJson[dotIndex - 1].leftIndex + 1) * widthOx;
                            }
                        }
                        moveOx = endDotLeft - oringeLeft;
                        if (moveOx < 0) {
                            arrIndex = parseInt(Math.abs(moveOx) / widthOx);
                            $('.dotTime').eq(dotIndex).html(self.allDateArr[self.timeLastJson[dotIndex].leftIndex -arrIndex]);
                            $('.prev-dot').eq(dotIndex).css('left', endDotLeft);
                            $('.dotTime').eq(dotIndex).css('left', endDotLeft);
                            if (dotIndex == (self.timeLastJson.length -1)) {
                                self.timeShowList[dotIndex-1].EndDate = self.allDateArr[self.timeLastJson[dotIndex].leftIndex - arrIndex];
                            } else{
                                self.timeShowList[dotIndex].StartDate = self.allDateArr[self.timeLastJson[dotIndex].leftIndex - arrIndex];
                                self.timeShowList[dotIndex - 1].EndDate = self.allDateArr[self.timeLastJson[dotIndex].leftIndex - arrIndex - 1];
                            }
                        } else {
                            arrIndex = parseInt(moveOx / widthOx);
                            $('.dotTime').eq(dotIndex).html(self.allDateArr[arrIndex + self.timeLastJson[dotIndex].leftIndex]);
                            $('.prev-dot').eq(dotIndex).css('left', endDotLeft);
                            $('.dotTime').eq(dotIndex).css('left', endDotLeft);
                            if (dotIndex == 0) {
                                self.timeShowList[dotIndex].StartDate = self.allDateArr[arrIndex + self.timeLastJson[dotIndex].leftIndex];
                            } else if (dotIndex == (self.timeLastJson.length - 1)) {
                                self.timeShowList[dotIndex - 1].EndDate = self.allDateArr[self.timeLastJson[dotIndex].leftIndex - arrIndex];
                            } else {
                                self.timeShowList[dotIndex].StartDate = self.allDateArr[arrIndex + self.timeLastJson[dotIndex].leftIndex];
                                self.timeShowList[dotIndex - 1].EndDate = self.allDateArr[arrIndex + self.timeLastJson[dotIndex].leftIndex - 1];
                            }
                        }
                    }
                });
            }
		},
		mounted: function () {
		    this.getPoolConfig();
		}
	})
	inputNull = common.inputNull
	formatData = common.formatData
    //获取两个端点日期间的所有日期
	function getBetweenDateStr(start, end) {
	    var result = [];
	    var beginDay = start.split("-");
	    var endDay = end.split("-");
	    var diffDay = new Date();
	    var dateList = new Array;
	    var i = 0;
	    diffDay.setDate(beginDay[2]);
	    diffDay.setMonth(beginDay[1] - 1);
	    diffDay.setFullYear(beginDay[0]);
	    result.push(start);
	    while (i == 0) {
	        var countDay = diffDay.getTime() + 24 * 60 * 60 * 1000;
	        diffDay.setTime(countDay);
	        dateList[2] = diffDay.getDate();
	        dateList[1] = diffDay.getMonth() + 1;
	        dateList[0] = diffDay.getFullYear();
	        if (String(dateList[1]).length == 1) { dateList[1] = "0" + dateList[1] }
	        if (String(dateList[2]).length == 1) { dateList[2] = "0" + dateList[2] }
	        result.push(dateList[0] + "-" + dateList[1] + "-" + dateList[2]);
	        if (dateList[0] == endDay[0] && dateList[1] == endDay[1] && dateList[2] == endDay[2]) {
	            i = 1;
	        }
	    }
	    return result;
	}

})