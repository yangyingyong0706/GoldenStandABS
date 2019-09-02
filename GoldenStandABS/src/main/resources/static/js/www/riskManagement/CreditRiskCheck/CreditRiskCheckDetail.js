var common;
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
define(function (require) {
    var $ = require('jquery');
    common = require('common');
    require('date_input');
    var Vue = require('Vue2');
    var GSDialog = require("gsAdminPages")
    var GlobalVariable = require('globalVariable');
 
    $(function () {
        var tid = common.getQueryString('tid');
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var formhight = $(document.body).height()-5;
        $('#app').height(formhight);
        app = new Vue({
            el: '#app',
            data: {
                loading:true,
                CreditRisk:{
                    Id:tid, 
                    TrustId:-1 ,//专项计划Id
                    TrustName:'' ,//专项计划名
                    TrustBondCode:''  ,//专项计划债券代码段
                    OriginalEquityHolder:''  ,//原始权益人
                    CheckType: '现场排查',//排查类型（现场排查，非现场排查）
                    CheckDate:''  ,//排查日期或频率
                    CheckContent:''  ,//排查方法、过程
                    Participant:''  ,//参与人(现场排查才有)
                    CheckResult:''  ,//排查结果
                    IsSubmitReport:''  ,//是否提交检查报告（是、否）
                    IsSubmitPlan:''  ,//是否提交预案（是、否）
                    DisposalContent:''  ,//处置过程
                    IsPreliminaryClassify: '',//是否初步分类（是、否）
                    CheckDate_fxc:'',   //查日期(非现场排查)
                    CheckContent_fxc:'', //排查方法、过程(非现场排查)
                    Remark: '',//备注 
                    RiskType:'',
                },
                TrustList:[],//专项计划列表   
            },
            mounted: function () {
                var self = this;
                self.getTrustList();
                self.getCreditCheckDetail();
                $('.date-plugins').date_input();
                $('.date-plugins').bind("change", function () {
                    this.dispatchEvent(new Event('input'));
                })
            },
            methods: {
                getTrustList: function () {
                    var self = this;
                    var executeParaminfo = {
                        SPName: 'usp_GetTrustIdNameList',
                        SQLParams: []
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                        if (data.length == 0) {
                            GSDialog.HintWindow('请录入该专项计划信息');
                            return
                        }
                        self.TrustList = data;
                    })
                },
                getCreditCheckDetail:function(){
                    var self = this;
                    var executeParaminfo = {
                        SPName: 'usp_GetCreditRiskCheckById',
                        SQLParams: [
                              { Name: 'Id', value: self.CreditRisk.Id, DBType: 'int' }
                            ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'RiskManagement', executeParaminfo, function (data) {
                        self.loading = false;
                        if (data.length == 0) {
                            return
                        }else{
                            self.CreditRisk = data[0];
                        }
                      
                    })
                },
                saveCreditCheckDetail:function(){
                    var self = this;
                    var items = '<Items><Id>{0}</Id><TrustId>{1}</TrustId><TrustName>{2}</TrustName>'
                    items += '<TrustBondCode>{3}</TrustBondCode><CheckDate_fxc>{4}</CheckDate_fxc><OriginalEquityHolder>{5}</OriginalEquityHolder>';
                    items +='<CheckType>{6}</CheckType><CheckDate>{7}</CheckDate><CheckContent>{8}</CheckContent>';
                    items +='<Participant>{9}</Participant><CheckResult>{10}</CheckResult><IsSubmitReport>{11}</IsSubmitReport>';
                    items += '<IsSubmitPlan>{12}</IsSubmitPlan><DisposalContent>{13}</DisposalContent>';
                    items +='<IsPreliminaryClassify>{14}</IsPreliminaryClassify><Remark>{15}</Remark>';
                    items += '<CheckContent_fxc>{16}</CheckContent_fxc><RiskType>{17}</RiskType></Items>';

                    //这里下面的数据
                    items = items.format(self.CreditRisk.Id, self.CreditRisk.TrustId, 
                        self.CreditRisk.TrustName, self.CreditRisk.TrustBondCode, self.CreditRisk.CheckDate_fxc, 
                        self.CreditRisk.OriginalEquityHolder,self.CreditRisk.CheckType,self.CreditRisk.CheckDate,
                        self.CreditRisk.CheckContent,self.CreditRisk.Participant,self.CreditRisk.CheckResult,
                        self.CreditRisk.IsSubmitReport,self.CreditRisk.IsSubmitPlan,self.CreditRisk.DisposalContent,
                        self.CreditRisk.IsPreliminaryClassify, self.CreditRisk.Remark, self.CreditRisk.CheckContent_fxc,
                        self.CreditRisk.RiskType
                        );
                    executeParam = {
                        SPName: 'usp_SaveCreditRiskCheck', SQLParams: [
                            { Name: 'Items', value: items, DBType: 'string' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'RiskManagement', executeParam, function (data) {
                        if (data[0].result > 0) {
                            self.CreditRisk.Id = data[0].result;
                            GSDialog.HintWindow('保存成功');
                        }else{
                            GSDialog.HintWindow('保存失败');
                        }
                    });

                },
                selectTrust:function(){
                    var self = this;
                    for(var i=0;i<self.TrustList.length;i++){
                        if(self.CreditRisk.TrustId==self.TrustList[i].TrustId){
                            self.CreditRisk.TrustName = self.TrustList[i].TrustName;
                            self.CreditRisk.TrustBondCode=self.TrustList[i].TrustBondCode;
                            self.CreditRisk.OriginalEquityHolder=self.TrustList[i].OriginalEquityHolder;
                            break;
                        }
                    }
                },
              
            }
        });
    });
});

