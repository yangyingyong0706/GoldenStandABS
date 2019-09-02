var TrustAttatchedFileModel;
define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var ko = require('knockout');
    var komapping = require('knockout.mapping');
    ko.mapping = komapping;
    var GSDialog = require("gsAdminPages");
    var GlobalVariable = require('globalVariable');
    var viewTrustWizard = require('app/productManage/TrustManagement/ViewTrustAttatchedFiles/viewTrustWizard');
    var toast = require('toast');
    var frequency = 0;
    var frequencys = 0;
    $(function () {
        require('jquery.localizationTool');
        var webStorage = require('gs/webStorage');
        $('#selectLanguageDropdown_vtaf').localizationTool({
            'defaultLanguage': 'zh_CN', // this is the language that the server is sending anyway
            'ignoreUnmatchedSelectors': true,
            'showFlag': true,
            'showCountry': false,
            'showLanguage': true,
            'onLanguageSelected': function (languageCode) {
                /*
                 * When the user translates we set the cookie
                 */
                webStorage.setItem('userLanguage', languageCode);
                return true;
            },
            /* 
             * Translate the strings that appear in all the pages below
             */
            'strings': {

                'class:vtaf_TransactionDocuments': {
                    'en_GB': 'Transaction Documents'
                },
                'class:vtaf_finished': {
                    'en_GB': 'Finished'
                },
                'class:vtaf_DocumentsError': {
                    'en_GB': 'You need to create the product first , and then maintain the relevant documents'
                }
            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_vtaf').localizationTool('translate', userLanguage);
        }
        $('body').show();
        var Orgheight = $(document).height();
        var Orgwidth = $(document).width();
        function showMask(Orgheight, Orgwidth) {
            $("#mask").css("height", Orgheight);
            $("#mask").css("width", Orgwidth);
            $("#mask").show();
        }
        //隐藏遮罩层  
        function hideMask() {
            $("#mask").hide();
        }
        productPermissionState = common.getQueryString('productPermissionState');
        if (productPermissionState == 2) {
            //showMask(Orgheight, Orgwidth);
            setTimeout(function () {
                var c = document.body.scrollHeight;
                $("#mask").css("height", c);
                $("#mask").css("width", $(document).width());
                $("#mask").show();
            }, 700)
            $(window).resize(function () {
                var height = $(document).height();
                var width = $(document).width();
                showMask(height, width);
                //hideMask();
            })

        } else {
            hideMask();
        }
    })
    function getCheight() {
        var h = $("body", window.parent.document).height();
        $(".main").css({ "height": (h - 30) + "px" });
    }
    getCheight()
    function myBrowser() {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isOpera = userAgent.indexOf("Opera") > -1;
        if (isOpera) {
            return "Opera"
        }; //判断是否Opera浏览器
        if (userAgent.indexOf("Firefox") > -1) {
            return "FF";
        } //判断是否Firefox浏览器
        if (userAgent.indexOf("Chrome") > -1) {
            return "Chrome";
        }
        if (userAgent.indexOf("Safari") > -1) {
            return "Safari";
        } //判断是否Safari浏览器
        if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
            return "IE";
        }; //判断是否IE浏览器
    }
    TrustAttatchedFileModel = (function () {
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
            //获得用户名
            var RoleOperate = require('gs/uiFrame/js/roleOperate');
            var userName = RoleOperate.cookieName();
            var argTemplate = 'appDomain=TrustManagement&TrustDocumentId={0}&TrustId={1}'
                + '&fileName={2}&fileType={3}&isCompulsory={4}';
            var id = 0;
            var items = ko.mapping.toJS(viewModel.TrustAttatchedFiles);
            var flag = true;
            $.each(items, function (i, item) {
                if (!item.DoPost) {
                    return;
                }
                debugger
                id = 'newAddedFileToUpload_' + i;
                $(id).attr('disabled', true);
                if (!(/\.(gif|jpg|jpeg|png|xlsx|docx|txt|pptx|pdf|csv)$/i).test(item.DoPost)) {
                    if (item.DoPost === true) return false;
                    $("#" + id).parent().prev().addClass("red-border");
                    flag = false;
                    // frequency--
                    // return false;
                } else {
                    if (document.getElementById(id) != null) {
                        frequency += 1;
                    }
                }

            });
            if (!flag) {
                frequency = 0;
                GSDialog.HintWindow("上传的文件格式错误！支持（jpg、xlsx、docx、png、txt、pptx、pdf、csv）");
                flag = true;
                return;
            }
            var idarray = new Array();
            var argsaray = new Array();
            $.each(items, function (i, item) {
                if (!item.DoPost) {
                    return;
                }
                if (item.DoPost === true) return false;
                id = 'newAddedFileToUpload_' + i;
                var trustId;
                i == 0 ? trustId = item.TrustId : "";
                var args = argTemplate.format(encodeURIComponent(item.TrustDocumentId),
                    encodeURIComponent(item.TrustId),
                    encodeURIComponent(item.FileName),
                    encodeURIComponent(item.FileType),
                    encodeURIComponent(item.IsCompulsory ? 1 : 0));
                uploadedNewFiles += 1;
                idarray.push(id);
                argsaray.push(args);
            });
            if (idarray.length > 0) {
                uploadFile(idarray, argsaray, trustId, userName, 0);
            }
            //            添加执行相应的存储过程
            if (flag && frequency == 0) {
                ajaxParamSave(trustId, userName);
                //window.location.reload(true);
            }
        };

        var ajaxParamSave = function (trustId, userName) {
            var executeParam = {
                SPName: 'usp_moveTrustDocument2ProjectDocInfo', SQLParams:
                [{ Name: 'TrustId', Value: trustId, DBType: 'int' },
                    { Name: 'InputPerson', Value: userName, DBType: 'string' }]

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
                    $.toast({ type: 'success', message: '保存成功' });
                    //GSDialog.HintWindow('保存成功!');
                },
                error: function (response) { alert("error:" + response); }
            });
        }

        var uploadFile = function (id, args, trustId, userName, i) {
            if (document.getElementById(id[i]) == null) {
                return;
            }
            var fileData = document.getElementById(id[i]).files[0];
            $('.progress').css('display', 'block');
            // var fileData = document.getElementById(id).files[0];
            $.ajax({
                url: postFileUploadSvcUrl + '?' + args[i],
                type: 'POST',
                data: fileData,
                cache: false,
                async: true,
                dataType: 'json',
                processData: false, // Don't process the files
                contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                crossDomain: true,
                xhr: function () {//获取上传进度
                    //alert(1);
                    myXhr = $.ajaxSettings.xhr();
                    if (myXhr.upload) {
                        myXhr.upload.addEventListener('progress', function (e) {//监听progress事件
                            var loaded = e.loaded;//已上传
                            var total = e.total;//总大小
                            var percent = Math.floor(100 * loaded / total);//百分比
                            //$('.processNum').text(percent+"%");//数显进度
                            //$('.processBar').css("width",percent+"px");//图显进度}, false);
                            $('.progress-bar').css('width', '' + percent + '%');
                            $('#spanprogress').text('' + percent + '%');
                        });
                        return myXhr;
                    }
                },
                success: function (data) {
                    frequencys += 1;
                    if (frequencys == frequency) {
                        ajaxParamSave(trustId, userName);
                        window.location.reload(true);
                    } else {
                        uploadFile(id, args, trustId, userName, i + 1)
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
            var value = $obj[0].value;
            var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串;
            if (userAgent.indexOf("Chrome") > -1 && $obj.next()[0]) {
                if (value != "") {
                    value = value.substring(value.lastIndexOf('\\') + 1);
                    if ($obj.parent()[0].className == "file-updateexited-input") {
                        $obj.next()[0].innerHTML = "点击右侧图标确定选择";
                    } else {
                        $obj.next()[0].innerHTML = "浏览"
                        $obj.parent().parent().children('.file_name').html(value);
                    }
                } else {
                    if ($obj.parent()[0].className == "file-updateexited-input") {
                        $obj.next()[0].innerHTML = "点击此处更换文件,点击右侧图标确定选择"
                    } else {
                        $obj.next()[0].innerHTML = "选择文件"
                        $obj.parent().parent().children('.file_name').html('');
                    }

                }
            }
            if (userAgent.indexOf("rv:11.0") > 0 && $obj.next()[0]) {
                $obj.parents("label").next().css("width", "calc(100% - 150px)");
                $obj.parents("label").next().next().show();
                if (value != "") {
                    value = value.substring(value.lastIndexOf('\\') + 1);
                    $obj.next()[0].innerHTML = "浏览"
                    $obj.parent().parent().children('.file_name').html(value);
                } else {
                    $obj.next()[0].innerHTML = "选择文件"
                    $obj.parent().parent().children('.file_name').html('');
                }
                if ($obj.val() == "") {
                    $obj.parents("label").next().css("width", "calc(100% - 80px)");
                    $obj.parents("label").next().next().hide();
                }
            };

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
                    error: function (response) {
                        alert("error:" + response);
                    }
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
                $.toast({ type: 'success', message: '删除成功' });
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
            var $folder = $obj.children('.caret');
            var goingHide = $folder.hasClass('color-caret');
            if (goingHide) {
                $folder.removeClass('color-caret');
                $obj.parents('.fileCateNameDiv').find('.cateFilesDiv').show();
            } else {
                $folder.addClass('color-caret');
                $obj.parents('.fileCateNameDiv').find('.cateFilesDiv').hide();
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
            } else {//update
                $obj.parent('div').children('.btnDel, .btnUpd').show();
                $obj.parent().parent('.file-item').find('.file-linkname-label').show();
                $obj.parent().parent('.file-item').find('.file-updateexited-input').hide();

                //var index = $obj.attr('itemIndex');
                //var fileItem = viewModel.TrustAttatchedFiles()[index];
                //var FilePath = fileItem.FilePath();
                //var fileName = FilePath.substring(FilePath.lastIndexOf('\\') + 1);
                //var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
                //fileItem.DoPost(false);
                //fileItem.FileName(fileName);
                //fileItem.FileType(fileType);
            }
        };
        var inputFileClick = function (obj) {
            var $obj = $(obj);
            $obj.prev().prev().find("input").val("");
        }
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
            DeleteUploadedFiel: deleteUploadedFile,
            InputFileClick: inputFileClick
        };
    })();

    var TrustDocumentFile = {
        init: function () {
            if (!trustId || trustId <= 0) {
                $('#TrustAttatchedFileNoTrustDiv').show();
            } else {

                var data1 = GlobalVariable.DataProcessServiceUrl + 'GetTrustFiles/TrustManagement/';
                var data2 = GlobalVariable.DataProcessServiceUrl + 'UploadFile';
                TrustAttatchedFileModel.InitArgs('TrustAttatchedFilesDiv', data1, data2);

                TrustAttatchedFileModel.DataBinding();
            }
        }
    };
    viewTrustWizard.registerMethods(TrustDocumentFile);
    viewTrustWizard.init();
    return TrustDocumentFile;

});

