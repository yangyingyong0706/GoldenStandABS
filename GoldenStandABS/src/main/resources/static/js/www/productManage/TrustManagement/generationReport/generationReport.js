define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var moment = require('moment');
    var Vue = require('Vue2');
    require('anyDialog');
    require('vMessage')
    var webProxy= require('webProxyTask')
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var trustId = common.getQueryString('trustId');
  	var GlobalVariable = require('globalVariable');
  	var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
  	var prg = 0
	var timer = 0
  	var TABLE_HEAD = ['报告类型', '报告时间(兑付时间)', '报告任务单', '任务进度', '报告状态', '报告操作'];
  	
  	var reportCodeMap={
  		1:'006',
  		2:'005',
  		3: '007',
        4:'008'
  	}

  	var workflowType = {
  	    '005': {
	        workflowDisplayName: '兑付兑息流程',
            taskCode:'ApprovalModelFileGeneration',
  	        monitorAppDomain: 'Monitor',
  	        sourceTaskAppDomain: 'Task'
  	    },
  	    '006': {
	        workflowDisplayName: '信托报告流程',
            taskCode:'TrustReportApprovalModelFileGeneration',
  	        monitorAppDomain: 'Monitor',
  	        sourceTaskAppDomain: 'Task'
  	    },
  	    '007': {
	        workflowDisplayName: '分配指令流程',
            taskCode:'AssignmentCommandModelFileGeneration',
  	        monitorAppDomain: 'Monitor',
  	        sourceTaskAppDomain: 'Task'
  	    },
	      '008': {
	          workflowDisplayName: '收益分配公告流程',
	          taskCode: 'IncomeDistributionAnnouncementModelFileGeneration',
	          monitorAppDomain: 'Monitor',
	          sourceTaskAppDomain: 'Task'
	      }
  	}
  	var  variableTemplate="<SessionVariable><Name>{0}</Name><Value>{1}</Value><DataType>String</DataType><IsConstant>1</IsConstant><IsKey>1</IsKey><KeyIndex>1</KeyIndex></SessionVariable>";
    var  variableMtemplate= "<SessionVariable><Name>{0}</Name><Value>{1}</Value><DataType>String</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>";
    new Vue({
    	el:'#catalog',
    	data:{
    		table_head:TABLE_HEAD,
    		TrustId: trustId,
    		periods:[],
    		reportTypeList:[],
    		reportDataTemp:[],
    		loading:true,
    		statusMap:{
		  		"0":'待审核',
		  		"-1":'待生成',
		  		"1":'已通过',
		  		"2":'已拒绝'
		  	}
    	},
    	mounted:function(){
    		var self =this
    		//获取期数
    		self.getPeriod();
    		Vue.nextTick(function(){

    		    $('.text').click(function () {
    		        $(this).siblings('.catalog-content').slideToggle();
                    $(this).toggleClass('active')
    		    })
    		  
    		})
         
    	},
    	methods:{
    		getPeriod:function(){
    			var self = this;
                var executeParaminfo = {
                    SPName: 'TrustManagement.usp_GetPaymentPeriods', SQLParams: [
                    { Name: 'trustId', value: trustId, DBType: 'int' }
                ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                	self.periods=data;
                	$.each(self.periods,function(i,v){
                		v.selectReportType = '';
                		v.reportData=[]
                	})
                	self.loading=false
                })
    		},
    		getReportTypeList:function(prieods,index){
    			
    			var self = this;
    			var prieodDataId= Number(prieods.split("--")[1].replace(/-/g,''))
    			var prieodData= prieods.split("--")[1]
    			var executeParaminfo = {
                    SPName: 'usp_GetReportType', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                        { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                        { Name: 'DimReportingDate', value: prieodData, DBType: 'string' }
                	]
                };
          common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
              
          	self.reportTypeList=data;
          })

          var executeParaminfo2 = {
                    SPName: 'usp_GetReportResultList', SQLParams: [
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                        { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                        { Name: 'DimReportingDate', value: prieodData, DBType: 'string' }
                  ]
                };
          common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo2, function (data2) {
                 
              var type1Temp = [], type2Temp = [], type3Temp = [], type4Temp = []
               $.each(data2,function(i,v){
                  if (v.ReportTypeId==1) {
                    type1Temp.selectedReportId=1
                    type1Temp.reportStatus=v.checkState
                    type1Temp.prieodData=prieodData;
                    type1Temp.selectedReportName=v.ReportTypeName;
                    type1Temp.push(v)
                  }else if(v.ReportTypeId==2){
                    type2Temp.selectedReportId=2;
                    type2Temp.reportStatus=v.checkState;
                    type2Temp.prieodData=prieodData;
                     type2Temp.selectedReportName=v.ReportTypeName;
                    type2Temp.push(v)
                  }
                  else if(v.ReportTypeId==3){
                     type3Temp.selectedReportId=3
                     type3Temp.reportStatus=v.checkState;
                     type3Temp.prieodData=prieodData;
                      type3Temp.selectedReportName=v.ReportTypeName;
                    type3Temp.push(v)
                  }
                  else if (v.ReportTypeId == 4) {
                      type4Temp.selectedReportId = 4
                      type4Temp.reportStatus = v.checkState;
                      type4Temp.prieodData = prieodData;
                      type4Temp.selectedReportName = v.ReportTypeName;
                      type4Temp.push(v)
                  }
               })
                self.$forceUpdate();
                 self.periods[index].reportData=[]
               if (type1Temp.length>0)   self.periods[index].reportData.push(type1Temp);
               if (type2Temp.length>0)   self.periods[index].reportData.push(type2Temp);
               if (type3Temp.length > 0) self.periods[index].reportData.push(type3Temp);
              if (type4Temp.length > 0) self.periods[index].reportData.push(type4Temp);

             
       

          })
    		},
    		getReportStatus:function(trustId,dimReportingDateId,reportTypeId){
    		    var self = this;
			     var status=null;
			  		//获取报告的状态
	        	  var executeParaminfo = {
	                    SPName: 'usp_GetReportStatus', SQLParams: [
	                        { Name: 'TrustId', value: trustId, DBType: 'int' },
	                        { Name: 'DimReportingDateId', value: dimReportingDateId, DBType: 'int' },
	                        { Name: 'ReportTypeId', value: reportTypeId, DBType: 'int' }
	                	]
	                };
	                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
	                    if(data[0] && data[0].CurrentStatus){
	                    	status=data[0].CurrentStatus
	                    }else{
	                    	//self.$message.error('获取报告状态错误！')
	                    }
	                	
	                })
	            return status

    		},
    		addReport:function(index,type){
    			var flag=true;
    			if(type===""){
    				 this.$message.warning('请选择需要更的报告选项')
    				 //GSDialog.HintWindow('请选择需要更的报告选项');
    				 return
    			}else{

    				$.each(this.periods[index].reportData,function(i,v){
    					if(v.selectedReportId == type){
    						flag=false;
    					}
    				})
    				if(!flag){
    					 this.$message.warning('该类型的报告已经被选择');
    					 return
    				}
    			}
    			var self = this;

    			var prieodDataId= Number(self.periods[index].periods.split("--")[1].replace(/-/g,''))
    			var prieodData= self.periods[index].periods.split("--")[1];
    		
			    var executeParaminfo = {
                    SPName: 'usp_GetReportAndDataSourceState', SQLParams: [
                        { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                        { Name: 'DimReportingDate', value: prieodData, DBType: 'string' },
                        { Name: 'TrustId', value: trustId, DBType: 'int' },
                        { Name: 'ReportTypeId', value: Number(type), DBType: 'string' }
                	]
                };
            common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
            	 var status=self.getReportStatus(trustId,prieodDataId,Number(type))
            	   $.each(self.reportTypeList,function(i,v){
            	   	if(v.reportTypeId==type){
            	   		data.selectedReportName=v.reporterName;
            	   		data.selectedReportId=v.reportTypeId;
            	   		data.prieodData=prieodData;
            	   		data.reportStatus=status
            	   	}
            })
                        self.$forceUpdate();
						self.periods[index].reportData.push(data)
						
            })

    		},
    		taskDetail:function(stateList){

    			var self = this;
    			self.reportDataTemp = stateList;
    			self.$forceUpdate();
    			 anyDialog({
                    title: "任务完成详情",
                    width:450,
                    height:'auto',
                    changeallow: true,
                    html: $("#task-dialog")
                })
    		},
    		pullReportData:function(stateItem, selectReportId ,prieodData){
    			var self=this;

    			//if(stateItem.state=="1"){
    			//	self.$message('数据已经拉取完成！');
    			//	return;
    			//}

    			var spName="usp_DataSource{0}ToReportData".format(stateItem.DataSourceCode)
    			var prieodDataId= Number(prieodData.replace(/-/g,''))
    			
    			var executeParaminfo = {
                    SPName: spName, SQLParams: [
                        { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                        { Name: 'DimReportingDate', value: prieodData, DBType: 'string' },
                        { Name: 'trustId', value: trustId, DBType: 'int' },
                        { Name: 'ReportTypeId', value: selectReportId, DBType: 'int' },
                        { Name: 'DataSourceId', value: stateItem.DataSourceId, DBType: 'int' }
                	]
                };
                
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                   if (data.length>0) {
                   	 	self.$message.success('数据获取成功！');
						stateItem.state='1'
                   }else{
                   		 self.$message.error('数据还未准备好或数据获取失败！');
                   }

                })
    		},
    		pullAllData:function(){
    			var self =this;
    			$.each(self.reportDataTemp,function(i, v){
    				self.pullReportData(v, self.reportDataTemp.selectedReportId ,self.reportDataTemp.prieodData )
    			})
    		},
    		generationReport:function(prieods,stateList){
    		    var self = this;
    		    $("#loading").show();
    		    self.progress([85,98],[0.8,2],100)
    		    var objType = reportCodeMap[stateList.selectedReportId];
    		    var prieodData = prieods.split("--")[1].replace(/-/g, '');
    		    var prieodDataString=prieods.split("--")[1];
    		    var reportTypeId=stateList.selectedReportId
    		    var objId = trustId + "_" + prieodData;
    		    var reporterName = stateList.selectedReportName
    		    if (stateList.selectedReportName ==="受托报告") {
    		    	reporterName="资产管理"
    		    }else if(stateList.selectedReportName ==="划款指令") {
                	reporterName="分配指令"
                }
                var downLoadLink="/TrustManagementService/TrustFiles/"+trustId+"/TaskReportFiles//CMS_"+reporterName+'_'+objId+'.docx'

	    		                var sContext = {
	    		                    appDomain: workflowType[objType].sourceTaskAppDomain,
	    		                    sessionVariables: self.getSourceTaskSessionVarible(objId,objType,prieodDataString,reportTypeId),
	    		                    taskCode: workflowType[objType].taskCode

	    		                };
	    		                webProxy.createSessionByTaskCode(sContext, function (taskSession) {
	    		                    webProxy.runTask(workflowType[objType].sourceTaskAppDomain,taskSession,function(res){
	    		                        if (res) {
	    		                            self.progress(100,[1,5], 10, function(){
	    		                            	setTimeout(function(){
	    		                            	    $("#loading").hide();
                                                     prg=0
												                  $('.progress').html('')  
			    									              $('#loading .bar').width(0)
												                  self.$message.success('报告生成！请下载！');	 	
	    		                            	},800)
											                 
											                 })
	    		                            self.$forceUpdate();
	    		                            stateList[0].downLoadUrl=downLoadLink;
	    		                            stateList.isGenerated='1';
	    		                            self.saveDownLoadLink(downLoadLink,prieodData,trustId,reportTypeId)
	    		                            if(stateList.reportStatus==-1){
		    		                            self.changeReportStatus(stateList.reportStatus,'generate',prieodData,reportTypeId,'',function(data){
		    		                                    self.$forceUpdate();
		    		                                    stateList.reportStatus = data[0].result
		    		                            })  
	    		                            } else if (stateList.reportStatus !=0) {
	    		                                self.changeReportStatus(stateList.reportStatus, 'reset', prieodData, reportTypeId, '', function (data) {
	    		                                    self.$forceUpdate();
	    		                                    stateList.reportStatus = data[0].result
	    		                                })
	    		                            }
	    		                                     		
	    		                        }

	    		                    });		
	    		                })    		        	
    		},
    		saveApprovalOpinionLog: function (appDomain, objId, objType, currentState, reason, approvalOpinion, createdUser, callback) {
    		    var sContent = "{'SPName':'[usp_SaveApprovalOpinionLog]'," +
                              "'objId':'" + objId + "'," +
                                "'objType':'" + objType + "'," +
                                "'CurrentState':'" + currentState + "'," +
                                "'Reason':'" + reason + "'," +
                                "'ApprovalOpinion':'" + encodeURIComponent(approvalOpinion) + "'," +
                                "'CreatedUser':'" + createdUser + "'" +
                              "}";
    		    this.getNonQueryStoredProcedureProxy(appDomain, sContent, callback);
    		},
    		downLoadReport:function(link){
    			var self =this;
    			if(link==''){
    				self.$message.info('报告还未生成！');
    				return;
    			}else{
    				location.href=link;
    			}
    		},
    		checkReport:function(stateList){
    			var self = this;
    			 self.reportDataTemp = stateList;
    			self.$forceUpdate();
    			anyDialog({
                    title: "审核报告",
                    width:450,
                    height:'auto',
                    changeallow: true,
                    html: $("#status-dialog")
                })
    		},
    		addCheckReport:function(operate){
    			var  self=this;
    			var currentStatus=self.reportDataTemp.reportStatus;
    			if(currentStatus ==1  || currentStatus ==2 ){
    				self.$message.warning('文档须从新生成后才能改变审核状态！');
    				return
    			}
    			var prieodDataId=self.reportDataTemp.prieodData.replace(/-/g, '');
    			var selectReportId=self.reportDataTemp.selectedReportId;
    			var reason=$("#reason_input").val();
    		    self.changeReportStatus(currentStatus,operate,prieodDataId,selectReportId,reason,function(data){
    		    	if (data[0].result) {
    		    		$('#modal-close').trigger('click');
    		    		self.$message.info('审核完成！');
    		    		self.$forceUpdate()
    		    		 self.reportDataTemp.reportStatus=data[0].result;
    		    	}
    		    })
    		},
    		changeReportStatus: function (currentStatus,operate,prieodDataId,selectReportId,reason,callback) { 
    		    if (currentStatus == -1 && operate != 'generate') {
    		        this.$message.warning('文档还未生成！');
    		        return;
    		    }
     			var executeParaminfo = {
                     SPName: "usp_DocStatusConfirm", SQLParams: [
                         { Name: 'CurrentStatus', value: currentStatus, DBType: 'int' },
                         { Name: 'Operate', value: operate, DBType: 'string' },
                         { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
                         { Name: 'TrustId', value: trustId, DBType: 'int' },
                         { Name: 'ReportTypeId', value: selectReportId, DBType: 'int' },
                         { Name: 'Reason', value:reason, DBType: 'string' }
                 	]
                 };
                 
                 common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                 	callback && callback(data)
                 })

    		},
    		saveDownLoadLink:function(link,prieodDataId,trustId,selectReportId,callback){
				var executeParaminfo = {
				    SPName: "usp_SaveReportDownloadLink", SQLParams: [
	                    { Name: 'DownloadLink', value: link, DBType: 'string' },
	                    { Name: 'DimReportingDateId', value: prieodDataId, DBType: 'int' },
	                    { Name: 'TrustId', value: trustId, DBType: 'int' },
	                    { Name: 'ReportTypeId', value: selectReportId, DBType: 'int' },
	            	]
	            };
	            
	            common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
	            	callback && callback(data)
	            })
    		},
    		getTaskDoneNum:function(sateList){
				var num = 0;
    			var self = this;
    			$.each(sateList,function(i ,v){
    				if (v.state == '1') {num ++}
    			})
    			return num
    		},
    		getSourceTaskSessionVarible: function (objId, objType,prieodDataString,reportTypeId) {
    		    var self = this;
    		    var sReturn = "";
    		    sReturn += variableMtemplate.format('TrustId',objId.split('_')[0]);
    		    sReturn += variableMtemplate.format('DimReportingDate',prieodDataString);
    		    sReturn += variableMtemplate.format('ReportTypeId',reportTypeId);
    		    sReturn += variableMtemplate.format('DimReportingDateId', objId.split('_')[1]);
    		    sReturn += variableMtemplate.format('MonitorSessionName', objId + "_WFTPM" + objType);
    		    sReturn += variableMtemplate.format('ControlSessionName', objId + "_WFTPC" + objType);
    		    //todo
    		    sReturn += self.getOpenerSessionVariables();
    		    //end
    		    //sReturn += variableMtemplate.format('Transition', reason);
    		    //Return += variableMtemplate.format('CurrentSessionProcessStatusId', currentSessionProcessStatusId);
    		    sReturn = '<SessionVariables>{0}</SessionVariables>'.format(sReturn);
    		    return sReturn;
    		},
    		 getOpenerSessionVariables: function () {
		        var self = this;
		        var sReturn = '';
		        try {
		            
		            var thisopener = self.getOpenerInWorkflowApproval();

		            var svs = thisopener.WorkFlowSessionVariables;
		            svs = typeof svs == 'function' ? svs(self.objId, self.objType) : svs;
		            for (var sv in svs || []) {
		                sReturn += this.variableMtemplate.format(sv, svs[sv]);
		            }
		        } catch (e) {

		        }
		        return sReturn;
		    },
		     getOpenerInWorkflowApproval: function () {
		        var thisopener = null;
		        try {
		            if (window.opener.location.pathname.toLocaleLowerCase() == '/workflowengine/pages/workflowrun.html')
		                thisopener = window.opener.parent;
		            else if (window.opener.location.pathname.toLocaleLowerCase() == '/workflowengine/pages/workflowrecord.html')
		                thisopener = window.opener.opener.parent;
		        }
		        catch (e) {

		        }
		        return thisopener;
		    },
		 	    
		    progress: function (dist, speed, delay, callback) {
		       var self = this;
			  var _dist = this.random(dist)
			  var _delay = this.random(delay)
			  var _speed = this.random(speed)
			  window.clearTimeout(timer)
			  timer = window.setTimeout(function(){
			    if (prg + _speed >= _dist) {
			      window.clearTimeout(timer)
			      prg = _dist
			      callback && callback()
			    } else {
			      prg += _speed
			      self.progress (_dist, speed, delay, callback)
			    }

			    $('.progress').html(parseInt(prg) + '%')  
			    $('#loading .bar').width(parseInt(prg) + '%')
			  }, _delay)
			},
			random:function(n) {
			  if (typeof n === 'object') {
			    var times = n[1] - n[0]
			    var offset = n[0]
			    return Math.random() * times + offset
			  } else {
			    return n
			  }
			}
    	},
    	computed:{
    		// dataDoneNum:function(){
    		// 	var num = 0;
    		// 	var self = this;
    		// 	$.each(self.periods.reportData.dataSouerceState,function(i ,v){
    		// 		if (v.state == '1') {num ++}
    		// 	})
    		// 	return num
    		// }
    	}
    })
});
