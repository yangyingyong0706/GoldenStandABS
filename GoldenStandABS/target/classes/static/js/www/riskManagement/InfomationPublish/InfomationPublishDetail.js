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

var xhrOnProgress = function (fun) {
    xhrOnProgress.onprogress = fun;
    return function () {
        var xhr = $.ajaxSettings.xhr();
        if (typeof xhrOnProgress.onprogress !== 'function')
            return xhr
        if (xhrOnProgress.onprogress && xhr.upload) {
            xhr.upload.onprogress = xhrOnProgress.onprogress;
        }
        return xhr
    }
}

define(function (require) {
    var $ = require('jquery');
    common = require('common');
    require('date_input');
    var Vue = require('Vue2');
    var GSDialog = require("gsAdminPages")
    var number = require('app/productManage/TrustManagement/Common/Scripts/format.number');
    var GlobalVariable = require('globalVariable');
 
    $(function () {
        var tid = common.getQueryString('tid');
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var formhight = $(document.body).height() - 35;
        $('#app').height(formhight);
        app = new Vue({
            el: '#app',
            data: {
                loading:true,
                InfoPublish: {
                    Id:tid, 
                    TrustId:-1 ,//专项计划Id
                    TrustName: '',//专项计划名
                    TrustBondCode: '',//专项计划债券代码段
                    OriginalEquityHolder: '',//原始权益人
                    PublishObject:'',
                    PublishType: '',//披露方式
                    PublishDate: '',//披露时间
                    PublishDescription: '',//披露概况
                    CurrentStatus: '待披露',
                    Remark: '',//备注 
                    RiskType:'',
                },
                isCreate:true,
                ReadyFileList: [],
                FileList:[],
                TrustList:[],//专项计划列表   
            },
            mounted: function () {
                var self = this;
                if (self.InfoPublish.Id != 0) {
                    self.isCreate = false;
                }
                self.getTrustList();
                self.getPublishInfoDetail();
                self.getPublishInfoDocument();
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
                getPublishInfoDetail: function () {
                    var self = this;
                    var executeParaminfo = {
                        SPName: 'usp_GetInfoPublishById',
                        SQLParams: [
                              { Name: 'Id', value: self.InfoPublish.Id, DBType: 'int' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'RiskManagement', executeParaminfo, function (data) {
                        self.loading = false;
                        if (data.length == 0) {
                            return
                        } else {
                            if (!!data[0].PublishDate != 0)
                                data[0].PublishDate=common.getStringDate(data[0].PublishDate).dateFormat("yyyy-MM-dd")
                            self.InfoPublish = data[0];
                        }
                      
                    })
                },
                savePublishInfoDetail: function () {
                    var self = this;
                    var items = '<Items>'
                    items += '<Id>'+self.InfoPublish.Id+'</Id>'
                    items += '<TrustId>'+self.InfoPublish.TrustId+'</TrustId>'
                    items += '<TrustName>' + self.InfoPublish.TrustName + '</TrustName>'
                    items += '<TrustBondCode>' + self.InfoPublish.TrustBondCode + '</TrustBondCode>'
                    items += '<OriginalEquityHolder>' + self.InfoPublish.OriginalEquityHolder + '</OriginalEquityHolder>'
                    items += '<PublishObject>' + self.InfoPublish.PublishObject + '</PublishObject>';
                    items += '<PublishType>' + self.InfoPublish.PublishType + '</PublishType>'
                    items += '<PublishDate>'+self.InfoPublish.PublishDate+'</PublishDate>'
                    items += '<PublishDescription>' + self.InfoPublish.PublishDescription + '</PublishDescription>';
                    items += '<CurrentStatus>' + self.InfoPublish.CurrentStatus + '</CurrentStatus>';
                    items += '<Remark>'+self.InfoPublish.Remark+'</Remark>';
                    items += '</Items>';

                    executeParam = {
                        SPName: 'usp_SaveInfoPublish', SQLParams: [
                            { Name: 'Items', value: items, DBType: 'string' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'RiskManagement', executeParam, function (data) {
                        if (data[0].result > 0) {
                            if (self.InfoPublish.Id == 0) {
                                self.InfoPublish.Id = data[0].result;
                                var flag = 0;
                                var arrayLength = self.ReadyFileList.length;
                                $.each(self.ReadyFileList, function (index,dom) {
                                    self.UploadFile(dom.FileData, dom.DocumentName, self.InfoPublish.Id, function (data) {
                                        dom.FilePath = data.replace("E:\\TSSWCFServices", "");
                                        flag++;
                                        if (flag == arrayLength) {
                                            self.saveUploadFile(self.ReadyFileList, function () {
                                                GSDialog.HintWindow('保存成功');
                                            });
                                        } 
                                    });
                                })
                            }
                            else {
                                self.InfoPublish.Id = data[0].result;
                                GSDialog.HintWindow('保存成功');
                            }
                        }else{
                            GSDialog.HintWindow('保存失败');
                        }
                    });
                },
                selectTrust:function(){
                    var self = this;
                    for(var i=0;i<self.TrustList.length;i++){
                        if (self.InfoPublish.TrustId == self.TrustList[i].TrustId) {
                            self.InfoPublish.TrustName = self.TrustList[i].TrustName;
                            self.InfoPublish.TrustBondCode = self.TrustList[i].TrustBondCode;
                            self.InfoPublish.OriginalEquityHolder = self.TrustList[i].OriginalEquityHolder;
                            break;
                        }
                    }
                },
                uploadFileReady: function () {
                    var self = this;
                    var value = $('#fileUploadFileU').val();
                    var fileName = value.substring(value.lastIndexOf('\\') + 1);
                    var fileData = document.getElementById("fileUploadFileU").files[0];
                    if (self.InfoPublish.Id == 0) {
                        var json = {};
                        json['DocumentName'] = fileName;
                        json['Id'] = 0;
                        json['FileData'] = fileData;
                        json['FilePath'] = '';
                        json['isCreate'] = true;
                        json['CreateUser'] = sessionStorage.getItem("gs_UserName");
                        json['CreateDate'] = (new Date()).dateFormat("yyyy-MM-dd");
                        self.ReadyFileList.push(json);
                        self.FileList.push(json)
                    } else {
                        self.UploadFile(fileData, fileName, self.InfoPublish.Id, function (data) {
                            var fileArray = [];
                            var json = {};
                            json['DocumentName'] = fileName;
                            json['Id'] = 0;
                            json['FileData'] = '';
                            json['FilePath'] = data.replace("E:\\TSSWCFServices","");
                            json['isCreate'] = false;
                            json['CreateUser'] = sessionStorage.getItem("gs_UserName");
                            json['CreateDate'] = (new Date()).dateFormat("yyyy-MM-dd");
                            fileArray.push(json);
                            self.saveUploadFile(fileArray, function (id) {
                                json['Id'] = id;
                                self.FileList.push(json)
                            });
                        });
                    }
                },
                getPublishInfoDocument: function () {
                    var self = this;
                    var executeParaminfo = {
                        SPName: 'usp_GetInfoPublishDocumentById',
                        SQLParams: [
                              { Name: 'Id', value: self.InfoPublish.Id, DBType: 'int' },
                              { Name: 'BelongTo', value: 'InfoPublish', DBType: 'string' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'RiskManagement', executeParaminfo, function (data) {
                        if (data.length != 0) {
                            $.each(data, function (index, dom) {
                                dom['CreateDate'] = common.getStringDate(dom['CreateDate']).dateFormat("yyyy-MM-dd");
                            })
                            self.FileList = data;
                        }

                    })
                },
                saveUploadFile: function (fileArray,callBack) {
                    var self = this;
                    var items = '<Items>'
                    $.each(fileArray, function (index,dom) {
                        items += '<Item>'
                        items += '<BelongToId>' + self.InfoPublish.Id + '</BelongToId>'
                        items += '<DocumentName>' + dom.DocumentName + '</DocumentName>'
                        items += '<FilePath>' + dom.FilePath + '</FilePath>'
                        items += '<CreateUser>' + sessionStorage.getItem("gs_UserName") + '</CreateUser>'
                        items += '<BelongTo>InfoPublish</BelongTo>'
                        items += '</Item>'
                    })
                    items += '</Items>';

                    executeParam = {
                        SPName: 'usp_SaveInfoPublishDocument', SQLParams: [
                            { Name: 'Items', value: items, DBType: 'string' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'RiskManagement', executeParam, function (data) {
                        if (!self.isCreate && data[0].result > 0) {
                            GSDialog.HintWindow('上传成功');
                            callBack(data[0].result);
                        }
                        else if (self.isCreate && data[0].result > 0) {
                            callBack(data[0].result);
                        }
                        else {
                            GSDialog.HintWindow('上传失败');
                        }
                    });
                },
                UploadFile: function (fileData, fileName, folder, fnCallback) {
                    var args = 'trustId=InfomationPublish&fileFolder=' + folder + '&fileName=' + encodeURIComponent(fileName);
                    $.ajax({
                        url: GlobalVariable.DataProcessServiceUrl + 'CopyFile?' + args,
                        type: 'POST',
                        data: fileData,
                        cache: false,
                        dataType: 'json',
                        processData: false, // Don't process the files
                        //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
                        xhr: xhrOnProgress(function (e) {
                            var percent = Math.floor(e.loaded / e.total * 100);
                            if (percent > 0) {
                                $("#uploadloading").css("display", "block");
                                $("#uploadloading").find("i").text(percent + "%");
                            }
                            if (percent == 100) {
                                $("#uploadloading").css("display", "none");
                            }
                        }),
                        success: function (data) {
                            var path = data.CopyFileResult;
                            fnCallback(path);
                        },
                        error: function (data) {
                            GSDialog.HintWindow('上传文件错误');;
                        }
                    })
                },
                DeleteFile: function (id, name) {
                    if (confirm("确认删除")) {
                        var self = this;
                        if (self.isCreate) {
                            $.each(self.FileList, function (index, dom) {
                                if (dom.DocumentName == name) {
                                    self.FileList.splice(index, 1);
                                    return false;
                                }
                            })
                        } else {
                            executeParam = {
                                SPName: 'usp_DeleteInfoPublishDocument', SQLParams: [
                                    { Name: 'Id', value: id, DBType: 'int' }
                                ]
                            };
                            common.ExecuteGetData(false, svcUrl, 'RiskManagement', executeParam, function (data) {
                                if (data[0].result > 0) {
                                    GSDialog.HintWindow('删除成功');
                                    $.each(self.FileList, function (index, dom) {
                                        if (dom.Id == id) {
                                            self.FileList.splice(index, 1);
                                        }
                                    })
                                } else {
                                    GSDialog.HintWindow('删除失败');
                                }
                            });
                        }
                    }
                }
            }
        });
    });
});

