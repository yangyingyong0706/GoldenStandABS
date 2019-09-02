

define(function (require) {
    var $ = require('jquery');
    var template = require('app/productManage/TrustManagement/documentManagement/zTree/js/art-template');
    require('PagerList');
    var common = require('gs/uiFrame/js/common');
    var GlobalVariable = require('globalVariable');



    var lenFactor = 6.5;
    template.helper('iconShow', function (name) {
        var index1 = name.lastIndexOf(".");
        var index2 = name.length;
        var postf = name.substring(index1, index2);
        if (postf == '.doc' || postf == '.docx') {
            return 'word';
        } else if (postf == '.pdf') {
            return 'pdf'
        } else if (postf == '.ppt' || postf == '.pptx') {
            return 'ppt'
        } else if (postf == '.xls' || postf == '.xlsx') {
            return 'excel'
        }
        else {
            return 'file'
        }
    });

    template.helper('placeholder', function (placeholderLength) {
        return placeholderLength * lenFactor;
    });

    var indicatorImages = ["../documentManagement/zTree/img/foldered.png", "../documentManagement/zTree/img/unfolder.png"];
    var page_global_baseFolder = '';
    var trustId = common.getQueryString('tid');
    var trustName = "";
    $(function () {
        LoadFileCatalog();
        LoadPlanHistory(trustId);
    });

    function LoadFileCatalog() {
        var executeParam = { SPName: 'usp_GetTrustNameByTrustId', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'trustId', Value: trustId, DBType: 'int' });
        var sParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?appDomain=TrustManagement&executeParams='
            + sParams + '&resultType=Common';
        $.ajax({
            type: 'GET',
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response == 'string') {
                    trustName = JSON.parse(response)[0].TrustName;
                    GetReviewPath();
                }
            },
            error: function (response) {
                alert('获取数据失败');
            }
        });
    }

    function GetReviewPath() {
        var executeParam = { SPName: 'usp_GetReviewTrustRootPath', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'trustId', Value: trustId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'PathType', Value: 2, DBType: 'int' });
        var sParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?appDomain=TrustManagement&executeParams='
            + sParams + '&resultType=Common';
        callWCFSVC(serviceUrl, function (path) {
            if (path != "" && path != undefined) {
                $('#path').val(path[0].RootPath);
                refreshPath();
            }
        });
    }

    window.loadSpecFileCatalog =function (rootPath) {
        var _rootPath = decodeURIComponent(rootPath);
        if (_rootPath != "" && _rootPath != undefined) {
            $('#path').val(_rootPath);
            refreshPath();
        }
    }

    function getData(path) {
        document.getElementById('divDemo').innerHTML = '';
        var Service = GlobalVariable.DataProcessServiceUrl + 'GetDirectoryStructure?rootFolderPath=';
        var rootFolderPath = path;
        var serviceUrl = Service + rootFolderPath;
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: null,
            beforeSend: function () {

            },
            success: function (response) {
                sample = jQuery.parseJSON(response);
                sample.Name = trustName;
                $.each(sample.Children, function (i, o) {
                    num = getNumber(o.Name);
                    if (num && num.length > 0) {
                        num[0] = num[0].replace('.', '');
                        o.Index = num[0];
                        o.localIndex = parseInt(num[0]);
                    } else {
                        o.Index = '';
                        o.localIndex = Number.MAX_VALUE;
                    }
                    o['FileFullPath'] = (o.EntityType == 1) ? o.Path + '\\' + o.Name : '';
                    DFS(o.Index, o);
                });
                recurrentSort(sample);
                var html = template('tmplDirectoryInfo', sample);
                document.getElementById('divDemo').innerHTML = html;
                eventBind();
                alertMsg("刷新成功", 0);
            },
            error: function (response) {
                alertMsg("无效的路径", 0);
            }
        });
    }

    function eventBind() {
        $("input[type=checkbox]").bind("click", function () {
            var $obj = $(this);
            var isChecked = $obj.is(":checked");
            var $li = $obj.parent('li');
            $li.find('input[type=checkbox]').prop('checked', isChecked);

        });


        $("img.folderClass").bind("click", function () {
            var $obj = $(this);
            var $li = $obj.parent('li');
            var $indicatorIcon = $li.children('img:last');
            var $ul = $li.children('ul');
            if ($obj.attr("class").indexOf("foldered") > -1) {
                $obj.removeClass('foldered').addClass('unfolder');
                $obj.attr("src", indicatorImages[1]);
                $indicatorIcon.attr('src', '../documentManagement/zTree/img/folder-close.png');
                $ul.hide();
            } else {
                $obj.removeClass('unfolder').addClass('foldered');
                $obj.attr("src", indicatorImages[0]);
                $indicatorIcon.attr('src', '../documentManagement/zTree/img/folder-open.png');
                $ul.show();
            }
        });
    }

    function DFS(base, obj) {
        if (obj.Children.length == 0) {
            return;
        } else {
            var folderName = obj.Name;
            $.each(obj.Children, function (i, o) {
                num = getNumber(o.Name);
                if (num && num.length > 0) {
                    num[0] = num[0].replace('.', '');
                    if (base != '') {
                        o.Index = base + '-' + num[0];
                        o.localIndex = parseInt(num[0]);
                    } else {
                        o.Index = num[0];
                        o.localIndex = parseInt(num[0]);
                    }
                } else {
                    o.Index = '';
                    o.localIndex = Number.MAX_VALUE;
                }
                o['FileFullPath'] = (o.EntityType == 1) ? o.Path + '\\' + folderName + '\\' + o.Name : '';
                DFS(o.Index, o);
            });
        }
    }

    function compare(propertyName) {
        return function (object1, object2) {
            var value1 = object1[propertyName];
            var value2 = object2[propertyName];
            if (value2 < value1) {
                return 1;
            } else if (value2 > value1) {
                return -1;
            } else {
                return 0;
            }
        }
    }

    function recurrentSort(obj) {
        if (obj.Children.length > 0) {
            obj.Children.sort(compare("localIndex"));
            var len = obj.Children.length;
            while (1) {
                if (len >= 1 && obj.Children[len - 1].Index == '') {
                    len = len - 1;
                } else {
                    break;
                }
            }
            if (len != 0) {
                var placeholderLength = (obj.Children[len - 1].Index).length;
            } else {
                var placeholderLength = 1
            }
            $.each(obj.Children, function (i, o) {
                o.placeholderLength = placeholderLength;
                recurrentSort(o);
            });
        }
    }

    $("#refreshPath").click(function () { refreshPath() });
    $("#updatePath").click(function () { updatePath() });
    $("#exportExcel").click(function () { exportExcel() });
    $("#downLoadPackage").click(function () { downLoadPackage() });
    $("#ValidityCheck").click(function () {
        var filePath = $("#path").val();
        var serviceUrl = GlobalVariable.DocumentServiceUrl + "VlidaityCheck?rootFolderPath=" + encodeURI(filePath) + "&trustId=" + trustId + "";
        $.ajax({
            url: serviceUrl,
            dataType: "json",
            success: function (data) {
                if (data != null && data != undefined) {
                    if (data.Status == 0)
                        window.location.href = GlobalVariable.TrustManagementService + "/TrustFiles/" + data.Data + ".xlsx";
                    else
                        alertMsg(data.ErrorMessage, 1);
                }
            },
            error: function (response) {
                alertMsg(response.statusText, 1);
            }
        });
    });

    function refreshPath() {
        var path = $('#path').val();
        page_global_baseFolder = path;
        getData(encodeURI(path));
    }

    function updatePath() {
        var newPath = $('#path').val();
        var executeParam = { SPName: 'usp_UpdateRevewTrustRootPath', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TrustId', Value: trustId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'WordType', Value: 2, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'RootPath', Value: newPath, DBType: 'string' });
        var sParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?appDomain=TrustManagement&executeParams='
            + sParams + '&resultType=Common';
        callWCFSVC(serviceUrl, function (res) {
            var _res = res.length;
            if (_res == 1) {
                LoadFileCatalog();
                alertMsg('更新成功', 0);
            }
            else
                alertMsg('更新失败', 1)
        });

    }

    function alertMsg(text, status) {
        var alert_tip = $('#alert-tip'),
            icon = (status) ? 'icon-warning' : 'icon-roundcheck';
        if (!alert_tip[0]) {
            var $alert = $('<div id="alert-tip" class="alert_tip am-scale-up"/>');
            var $temp = $('<div class="alert_content">' +
                            '<i class="icon ' + icon + '"></i>' +
                            '<p>' + text + '</p>' +
                        '</div>');
            $temp.appendTo($alert);
            $alert.appendTo(document.body);
            setTimeout(function () {
                $('#alert-tip').fadeOut(function () {
                    $(this).remove();
                });
            }, 1000);
        }
    }

    function callWCFSVC(svcUrl, fnCallback) {
        $.ajax({
            type: 'GET',
            url: svcUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response == 'string')
                    response = JSON.parse(response);

                if (fnCallback) fnCallback(response);
            },
            error: function (response) {
                alert('获取数据失败');
            }
        });
    }

    function getNumber(str) {
        var re = /^[0-9]*[1-9][0-9]*[.]/;
        return re.exec(str);
    }

    function exportExcel() {
        var Service = GlobalVariable.DataProcessServiceUrl + 'ExportExcel?rootFolderPath={0}&excelPath={1}';
        var rootFolderPath = encodeURI($('#path').val());
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1 < 10 ? "0" + String(Number(date.getMonth() + 1)) : date.getMonth() + 1;
        var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        var minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        excelName = String(year) + String(month) + String(day) + String(hour) + String(minute) + String(second) + '.xlsx';
        var excelPath = encodeURI('E:\\TSSWCFServices\\TrustManagementService\\TrustFiles\\' + excelName);
        var serviceUrl = Service.replace('{0}', rootFolderPath).replace('{1}', excelPath);
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: null,
            beforeSend: function () {

            },
            success: function (response) {
                if (response == true) {
                    alertMsg("导出成功", 0);
                    window.location.href = GlobalVariable.TrustManagementService + "/TrustFiles/" + excelName;
                }
            },
            error: function (response) {
                alertMsg("导出失败", 1);
            }
        });
    }

    function downLoadPackage() {
        var filePath = $("#path").val();
        var serviceUrl = GlobalVariable.DocumentServiceUrl + "SimpleTrustZip?destFolder=" + encodeURI(filePath) + "&trustId=" + trustId + "";
        $.ajax({
            url: serviceUrl,
            dataType: "json",
            success: function (data) {
                if (data != null && data != "" && data != undefined) {
                    if (data.Status == 0) {
                        var zipPath = GlobalVariable.TrustManagementService + "/TrustFiles/Compress/" + data.Data + "";
                        window.location.href = zipPath;
                    } else {
                        alertMsg(data.ErrorMessage, 1);
                    }
                }
            },
            error: function (response) {
                alertMsg(response.statusText, 1);
            }
        });
    }

    function LoadPlanHistory(trustId) {
        //loading data
        PagerListModule.Init(listCategory.PlanHistory, 'usp_GetPlanHistoryWithPager', trustId, 2, 2,
            GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
            '#divDataList');
        PagerListModule.ReviewHistoryDataBind(function (haveData) {
            if (haveData > 0) {
                //loadingDefaultData(haveData);
            }

        });
    };



})