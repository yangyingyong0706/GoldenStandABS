var validControlValue;
var OriginalOwner;
var FilePathConfig
var formatData;
var MoveNumFormt;
var numFormt;
define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    require('date_input');
    FilePathConfig=require('gs/FilePathConfig');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    ko.mapping = mapping;
    require('knockout.rendercontrol');
    var followUpMain = require('app/productManage/TrustManagement/TrustFollowUp/viewFllowUpPageMain');
    var followUpData = require('app/productManage/TrustManagement/TrustFollowUp/viewFllowUpPageData');
    var GSDialog = require("gsAdminPages")
    validControlValue = followUpMain.validControlValue;
    formatData = common.formatData
    MoveNumFormt = common.MoveNumFormt
    numFormt = common.numFormt;
    OriginalOwner = (function () {
        var postFileUploadSvcUrl;
        var uploadedNewFiles = 0;

        var initArgs = function (pFileUploadSvcUrl) {
            postFileUploadSvcUrl = pFileUploadSvcUrl;
        }

        var gointUpdatedExitedFile = function (obj, gotoUpdated) {
            var $obj = $(obj);
            $obj.hide();
            if (gotoUpdated) {
                $obj.parent('div').children('.btnDel').hide();
                $obj.parent('div').children('.btnRev').show();
                $obj.parent().parent('.file-item').find('.file-linkname-label').hide();
                $obj.parent().parent('.file-item').find('.file-updateexited-input').show();
                if ($obj.parent().parent('.file-item').find('.file-updateexited-input input[type="file"]').val().length > 0)
                    modifyNewFileName($obj.parent().parent('.file-item').find('.file-updateexited-input input[type="file"]'));
            } else {//give up update
                $obj.parent('div').children('.btnDel, .btnUpd').show();
                $obj.parent().parent('.file-item').find('.file-linkname-label').show();
                $obj.parent().parent('.file-item').find('.file-updateexited-input').hide();

                var oldvalue = $obj.parent().parent('.file-item').find('.file-linkname-label input[name="oldvalue"]').val();

                var index = $obj.attr('itemIndex');
                //var fileItem = viewModel.TrustAttatchedFiles()[index];
                //var FilePath = fileItem.FilePath();
                //var fileName = FilePath.substring(FilePath.lastIndexOf('\\') + 1);
                //var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);

                //fileItem.DoPost(false);
                //fileItem.FileName(fileName);
                //fileItem.FileType(fileType);
                var fileitem = followUpData.TrustExtensionNameSpace.TrustExtensionData.DateSetList.BasicData()[index];
                fileitem.ItemValue(oldvalue);
            }
        };

        var deleteUploadedFile = function (obj) {
            var $obj = $(obj);
            var index = $obj.attr('itemIndex');
            var fileitem = followUpData.TrustExtensionNameSpace.TrustExtensionData.DateSetList.BasicData()[index];
            fileitem.ItemValue("");
        };

        var modifyNewFileName = function (obj) {
            var $obj = $(obj);
            var filePath = $obj.val();//E:\Working\SQL\Test.sql
            if (filePath != "") {
                $obj.next()[0].innerHTML = "浏览";
                filePath = filePath.substring(filePath.lastIndexOf('\\') + 1);
                $obj.parent().prev().html(filePath);
            } else {
                $obj.next()[0].innerHTML = "选择文件";
                $obj.parent().prev().html("");
            }
            var index = $obj.attr('itemIndex');
            var fileItem = followUpData.TrustExtensionNameSpace.TrustExtensionData.DateSetList.BasicData()[index];
            var fileName = filePath;
            fileItem.ItemValue(fileName);
        };

        var uploadNewFiles = function () {
            id = 'OriginalFileToUpload';
            if ($("#" + id).length > 0 && $("#" + id).val().length > 0) {
                $(id).attr('disabled', true);

                var argTemplate = 'appDomain=TrustManagement&TrustOriginatorId={0}&TrustId={1}'
                    + '&FolderName={2}&FileName={3}';

                //if (!item.DoPost) { return; }


                var oid = getItemValueByItemCode("OriginatorId");//AuditReport
                var tid = getItemValueByItemCode("TrustId");//AuditReport
                var FileName = getItemValueByItemCode("AuditReport");//AuditReport
                var args = argTemplate.format(encodeURIComponent(oid),
                    encodeURIComponent(tid),
                    encodeURIComponent("tblOriginator"),
                    encodeURIComponent(FileName));

                uploadedNewFiles += 1;
                uploadFile(id, args);
            }
            else {
                GSDialog.HintWindow("操作成功");
            }
        };
        var uploadFile = function (id, args) {
            var fileData = document.getElementById(id).files[0];
            $.ajax({
                url: postFileUploadSvcUrl + '?' + args,
                type: 'POST',
                data: fileData,
                cache: false,
                dataType: 'json',
                processData: false, // Don't process the files
                //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
                success: function (data) {
                    uploadedNewFiles -= 1;
                    if (uploadedNewFiles == 0) {
                        GSDialog.HintWindow('操作成功');
                        window.location.reload();
                    }
                },
                error: function (data) {
                    GSDialog.HintWindow('Some error Occurred!');
                }
            });
        }

        var getItemValueByItemCode = function (itemcode) {
            var result = "";
            if (itemcode) {
                console.log(itemcode, followUpData.TrustExtensionNameSpace.TrustExtensionData.DateSetList.BasicData())
                $.each(followUpData.TrustExtensionNameSpace.TrustExtensionData.DateSetList.BasicData(), function (i, n) {
                    if (n.ItemCode() == itemcode) {
                        result = n.ItemValue();
                        return false;
                    }
                });
            }
            return result;
        }

        return {
            InitArgs: initArgs,
            GointUpdatedExitedFile: gointUpdatedExitedFile,
            DeleteUploadedFile: deleteUploadedFile,
            ModifyNewFileName: modifyNewFileName,
            SaveCallBack: uploadNewFiles,
            GetItemValueByItemCode: getItemValueByItemCode
        }
    })();
    //sport update data then upload file
    var SaveCallBack = OriginalOwner.SaveCallBack;

    $(function () {
        //if (trustId <= 0) {
        //    $('#TrustAttatchedFileNoTrustDiv').show();
        //    return;
        //}
        followUpData.TrustExtensionNameSpace.TrustExtensionFunc.prototype.GetFilePath = function (filename) {
            var oid = OriginalOwner.GetItemValueByItemCode("OriginatorId");
            var tid = OriginalOwner.GetItemValueByItemCode("TrustId");
            console.log(oid,tid,filename)
            //var path = window.location.protocol + "//" + window.location.host + "/TrustFiles/{0}/tblOriginator/{1}/{2}";
            return FilePathConfig.GetFilePath(tid, "tblOriginator", oid, filename);
        };

        OriginalOwner.InitArgs(GlobalVariable.DataProcessServiceUrl + 'UploadOriginatorFile');
    });

    followUpMain.TrustFllowUp.init();
});
