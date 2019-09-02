/// <reference path="../Scripts/knockout-3.4.0.js" />
/// <reference path="../Scripts/knockout.mapping-latest.js" />
/// <reference path="../Scripts/jquery-1.7.2.min.js" />
/// <reference path="viewTrustWizard.js" />

define(function (require) {
    var $ = require('jquery');
    //var ko = require('knockout');
    var common = require('common');
    ////viewTrustWizard.registerMethods(TrustDocumentFile);
    var ko = require('knockout');
    var komapping = require('knockout.mapping');
    ko.mapping = komapping;
    var GlobalVariable = require('globalVariable');
    var viewTrustWizard = require('app/productManage/TrustManagement/TrustWizard/viewTrustWizard');


    var TrustAttatchedFileModel = (function () {
        var domId;
        var dataModel = {
            TrustAttatchedFileCategories: [],
            TrustAttatchedFiles: []
        };
        var viewModel;
        var uploadedNewFiles = 0;
        var getTrustFilesSvcUrl;
        var postFileUploadSvcUrl;

        var initArgs = function (nodeId, getFileSvcUr, postFileSvcUrl) {
            domId = nodeId;
            getTrustFilesSvcUrl = getFileSvcUr;
            postFileUploadSvcUrl = postFileSvcUrl;
        };

        var dataBinding = function () {
            $.ajax({
                cache: false,
                type: "GET",
                url: getTrustFilesSvcUrl + trustId,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                cache: false,
                data: {},
                success: function (response) {
                    initSourceData(response);
                    var domNode = document.getElementById(domId);
                    viewModel = ko.mapping.fromJS(dataModel);
                    ko.applyBindings(viewModel, domNode);
                    domNode.style.display = '';
                },
                error: function (response) {
                    alert("error is :" + response);
                }
            });
        };
        var initSourceData = function (sourceData) {
            if (typeof sourceData === 'string') {
                sourceData = JSON.parse(sourceData);
            }


            sourceData.sort(function (a, b) {
                return a.Sequence - b.Sequence;
            });

            dataModel.TrustAttatchedFileCategories = $.grep(sourceData, function (data) {
                return data.IsMainCategory;
            });

            var mainCategories = {};
            $.each(sourceData, function (i, data) {
                if (!data.IsMainCategory) {
                    if (mainCategories[data.FileCategory]) mainCategories[data.FileCategory] += 1;
                    else mainCategories[data.FileCategory] = 1;

                    data['subCateIndex'] = mainCategories[data.FileCategory];
                    dataModel.TrustAttatchedFiles.push(data);
                }
            });

        };

        var addFileCategory = function () {
            var $input = $('#txtTrustAttatchedFileNewCate');
            var cateName = $input.val();

            if (!cateName) { alert('Please enter category name'); return; }
            if (isAlreadyExisitSameCategory(cateName)) { alert('Already contains an exist category with the same name'); return; }
            $input.val('');

            var obsCateNew = ko.mapping.fromJS({ Category: cateName });

            viewModel.TrustAttatchedFileCategories.push(obsCateNew);
        };
        var removeFileCategory = function (obj) {
            var $obj = $(obj);
            var cateName = $obj.attr('cateName');

            viewModel.TrustAttatchedFileCategories.remove(function (item) { return item.Category() === cateName; });
            viewModel.TrustAttatchedFiles.remove(function (item) { return (item.Category() === cateName && item.Operation() === 'Add'); });
            var jsFiles = ko.mapping.toJS(viewModel.TrustAttatchedFiles);
            $.each(jsFiles, function (i, v) {
                if (v.Category === cateName) {
                    viewModel.TrustAttatchedFiles()[i].Operation('Remove');
                }
            });
        };

        var uploadNewFiles = function () {
            var argTemplate = 'appDomain=TrustManagement&TrustDocumentId={0}&TrustId={1}'
                + '&fileName={2}&fileType={3}&isCompulsory={4}';
            var id = 0;

            var items = ko.mapping.toJS(viewModel.TrustAttatchedFiles);
            $.each(items, function (i, item) {
                if (!item.DoPost) { return; }

                id = 'newAddedFileToUpload_' + i;
                $(id).attr('disabled', true);

                var args = argTemplate.format(encodeURIComponent(item.TrustDocumentId),
                    encodeURIComponent(item.TrustId),
                    encodeURIComponent(item.FileName),
                    encodeURIComponent(item.FileType),
                    encodeURIComponent(item.IsCompulsory ? 1 : 0));

                uploadedNewFiles += 1;
                uploadFile(id, args);
            });
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
                        alert('All operations have been successfully completed.');
                        window.location.reload();
                    }
                },
                error: function (data) {
                    alert('Some error Occurred!');
                }
            });
        }

        var updateCategoryName = function (obj) {
            var $obj = $(obj);

            var cateIndex = $obj.attr('itemIndex');
            var $divCateName = $obj.parents('.fileCateNameDiv');

            var cateNewName = $divCateName.children('.cateNewInputName').find('.cateName').val();
            if (!cateNewName) { alert('Please enter category name'); return; }
            if (isAlreadyExisitSameCategory(cateNewName)) { alert('Already contains an exist category with the same name'); return; }

            toogleCateName(obj, false);
            var cateOldName = $divCateName.children('.cateOriginalName').find('.cateName').html();

            viewModel.TrustAttatchedFileCategories()[cateIndex].Category(cateNewName);
            viewModel.TrustAttatchedFiles.remove(function (item) { return (item.Category() === cateOldName && item.Operation() === 'Add'); });

            var jsFiles = ko.mapping.toJS(viewModel.TrustAttatchedFiles);
            $.each(jsFiles, function (i, v) {
                if (v.Category === cateOldName) {
                    viewModel.TrustAttatchedFiles()[i].Category(cateNewName);
                    viewModel.TrustAttatchedFiles()[i].Operation('update');
                }
            });
        };
        var isAlreadyExisitSameCategory = function (cateNewName) {
            var isExisit = false;
            var cates = ko.mapping.toJS(viewModel.TrustAttatchedFileCategories);
            $.each(cates, function (i, v) {
                if (v.Category === cateNewName) {
                    isExisit = true;
                    return false;
                }
            });

            return isExisit;
        };

        var addNewFile = function (obj) {
            var $obj = $(obj);
            var cate = $obj.attr('cateName');
            var jsonFile = { TrustId: trustId, Category: cate, FileName: 'Plese choice a file: ', FileType: '', FileSize: '', Path: '', FileIdentity: '', Operation: 'Add', SubCategory: '请输入类别名称', IsCompulsory: false };
            var obsFile = ko.mapping.fromJS(jsonFile);
            viewModel.TrustAttatchedFiles.push(obsFile);
        };
        var removeNewFile = function (obj) {
            var $this = $(obj);
            var index = $this.attr('itemIndex');

            var obsItem = viewModel.TrustAttatchedFiles()[index];
            viewModel.TrustAttatchedFiles.remove(obsItem);
        };

        var removeUploadedFile = function (obj) {
            var $obj = $(obj);
            var index = $obj.attr('itemIndex');
            viewModel.TrustAttatchedFiles()[index].Operation('Remove');
        };
        +78
        var modifyNewFileName = function (obj) {
            var $obj = $(obj);
            var filePath = $obj.val();//E:\Working\SQL\Test.sql
            var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
            //alert(fileName); return;

            var index = $obj.attr('itemIndex');
            var fileItem = viewModel.TrustAttatchedFiles()[index];
            fileItem.FileName(fileName);
            fileItem.FileType(fileType);

            var isDoPost = fileName || fileItem.FilePath();

            fileItem.DoPost(isDoPost);
        };

        var deleteUploadedFile = function (obj) {
            if (confirm("确定删除？")) {
                var $obj = $(obj);
                var index = $obj.attr('itemIndex');
                var fileItem = viewModel.TrustAttatchedFiles()[index];
                // 更新数据库记录，消除删除刷新后的再次出现
                var executeParam = {
                    SPName: 'usp_UpdateNullTrustDocument', SQLParams:
                        [{ Name: 'TrustDocumentId', Value: fileItem.TrustDocumentId(), DBType: 'int' }]
                };

                var sContent = JSON.stringify(executeParam);
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' +
                    sContent + "&resultType=com";
                $.ajax({
                    type: "GET",
                    cache: false,
                    url: serviceUrl,
                    dataType: "jsonp",
                    crossDomain: true,
                    contentType: "application/xml;charset=utf-8",
                    data: {},
                    success: function (response) {
                        if (typeof response == "string")
                            response = JSON.parse(response);
                    },
                    error: function (response) { alert("error:" + response); }
                });

                // 删除复制过来的文件
                /*
                function deleteFile(name){
                    var fso = new ActiveXObject("Scripting.FileSystemObject");
                    if (fso.FileExists(name))
                        fso.DeleteFile(name);
                    else return false;
                }
                var name = fileItem.FilePath() + fileItem.FileName() + fileItem.FileType();
                deleteFile(name);
                */
                // removeNewFile(obj);
                // alert('success');

                fileItem.FilePath('');
                fileItem.FileName('');
                fileItem.FileType('');
                fileItem.DoPost(true);

                // fileItem.Operation('Remove');
                // removeUploadedFile(obj);
            }

        };

        var toogleCateName = function (obj, goingModify) {
            $obj = $(obj);
            var $divCateName = $obj.parents('.fileCateNameDiv');
            if (goingModify) {
                $divCateName.children('.cateOriginalName').hide();
                $divCateName.children('.cateNewInputName').find('.cateName').val($obj.attr('cateName'));
                $divCateName.children('.cateNewInputName').show();
            } else {
                $divCateName.children('.cateOriginalName').show();
                $divCateName.children('.cateNewInputName').hide();
            }
        };

        var showJson = function () {
            var json = ko.mapping.toJSON(viewModel);
            $('#divTrustAttatchedFilesJS').html(json);
        };

        var toogleCateFiles = function (obj) {
            var $obj = $(obj);
            var $folder = $obj.children('.icon');
            var goingHide = $folder.hasClass('color-folder');
            if (goingHide) {
                $folder.removeClass('color-folder');
                $obj.parents('.fileCateNameDiv').find('.cateFilesDiv').hide();
            } else {
                $folder.addClass('color-folder');
                $obj.parents('.fileCateNameDiv').find('.cateFilesDiv').show();
            }
        };
        var toogleAddCate = function (obj) {
            var $obj = $(obj);
            var $icon = $obj.children('.icon');
            var goingShow = $icon.hasClass('icon-right');
            if (goingShow) {
                $icon.removeClass('icon-right').addClass('icon-back');
                $obj.parent('div').children('.defaulthide').show();
            } else {
                $icon.removeClass('icon-back').addClass('icon-right');
                $obj.parent('div').children('.defaulthide').hide();
            }
        };

        var gointUpdatedExitedFile = function (obj, gotoUpdated) {
            var $obj = $(obj);
            $obj.hide();
            if (gotoUpdated) {
                $obj.parent('div').children('.btnDel').hide();
                $obj.parent('div').children('.btnRev').show();
                $obj.parent().parent('.file-item').find('.file-linkname-label').hide();
                $obj.parent().parent('.file-item').find('.file-updateexited-input').show();
            } else {//give up update
                $obj.parent('div').children('.btnDel, .btnUpd').show();
                $obj.parent().parent('.file-item').find('.file-linkname-label').show();
                $obj.parent().parent('.file-item').find('.file-updateexited-input').hide();

                var index = $obj.attr('itemIndex');
                var fileItem = viewModel.TrustAttatchedFiles()[index];
                var FilePath = fileItem.FilePath();
                var fileName = FilePath.substring(FilePath.lastIndexOf('\\') + 1);
                var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);

                fileItem.DoPost(false);
                fileItem.FileName(fileName);
                fileItem.FileType(fileType);
            }
        };

        return {
            InitArgs: initArgs,
            DataBinding: dataBinding,
            AddFileCategory: addFileCategory,
            RemoveFileCategory: removeFileCategory,
            UploadNewFiles: uploadNewFiles,
            UpdateCategoryName: updateCategoryName,
            AddNewFile: addNewFile,
            RemoveNewFile: removeNewFile,
            RemoveUploadedFile: removeUploadedFile,
            ModifyNewFileName: modifyNewFileName,
            ToogleCateName: toogleCateName,
            showJson: showJson,
            ToogleCateFiles: toogleCateFiles,
            ToogleAddCate: toogleAddCate,
            GoingUpdateExitedFile: gointUpdatedExitedFile,
            DeleteUploadedFiel: deleteUploadedFile
        };
    })();

    var TrustDocumentFile = {
        init: function () {
            if (!trustId || trustId <= 0) {
                $('#TrustAttatchedFileNoTrustDiv').show();
            } else {
                TrustAttatchedFileModel.InitArgs('TrustAttatchedFilesDiv',
                    GlobalVariable.DataProcessServiceUrl + 'GetTrustFiles/TrustManagement/',
                    GlobalVariable.DataProcessServiceUrl + 'UploadFile');
                
                TrustAttatchedFileModel.DataBinding();
            }
        }
    };

    return TrustDocumentFile;


});

