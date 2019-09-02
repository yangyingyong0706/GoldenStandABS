var openSessionTask, deleteSessionTask;
var formatData
define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var GlobalVariable = require('globalVariable');
    var common = require('app/productManage/TrustManagement/Common/Scripts/common');
    var validCommon = require('common');
    require('anyDialog');
    require('date_input');
    var GSDialog = require("gsAdminPages")
    var webProxy = require('webProxy');//require('app/productManage/TrustManagement/wcfProxy');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var r_trustId = null;
    var r_taskCode = null;
    var edit_assetId = null;
    formatData = validCommon.formatData
    var base = new Base64();

    //
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
        });
    };
 
    function loadAssetData(callback) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
        var objArgs = {
            SPName: 'usp_GetAssetInfo',
            SQLParams: [
                { Name: 'TrustId', Value: r_trustId, DBType: 'int' }
            ]
        };
        var executeParams = encodeURIComponent(JSON.stringify(objArgs));
        $.ajax({
            cache: false,
            type: "GET",
            url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                response = JSON.parse(response)
                callback(response)

            },
            error: function (response) { GSDialog.HintWindow('Error occursed when fetch the remote source data!'); }
        });

    }

    function assetIsExist(name, des, trustid) {
        var isExist = true;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
        var objArgs = {
            SPName: 'usp_QueryAssetInfoIsExsit',
            SQLParams: [
                { Name: 'TrustId', Value: r_trustId, DBType: 'int' },
                { Name: 'Name', Value: name, DBType: 'string' },
                { Name: 'Description', Value: des, DBType: 'string' }
            ]
        };
        var executeParams = encodeURIComponent(JSON.stringify(objArgs));
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                response = JSON.parse(response)
                if (response[0].Column1 == 0) {
                    isExist = false;
                }
            },
            error: function (response) { GSDialog.HintWindow('Error occursed when fetch the remote source data!'); }
        });

        return isExist;
    }


    function addAssetRecord(name, des, createDate) {
        if (assetIsExist(name, des, r_trustId)) {
            GSDialog.HintWindow('该记录已存在，请重新输入', function () {
                window.location.reload();
            });
            return;
        }

        sVariableBuilder.AddVariableItem('TrustId', r_trustId, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('Name', name, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('Description', des, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('CreateDate', createDate, 'String', 0, 0, 0);

        var sVariable = sVariableBuilder.BuildVariables();

        var tIndicator = new taskIndicator({
            width: 900,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'Task',
            taskCode: 'AddAssetInfo',
            sContext: sVariable,
            callback: function () {
                sVariableBuilder.ClearVariableItem();
                window.location.reload();
            }
        });
        tIndicator.show();



    }






    function renderListItem(source) {
        var gridRowTemplate = "<tr><td class='center'>{0}</td><td class='center'><div class='taskdesc'>{1}</div></td><td><div class='taskdesc'>{2}</div></td><td class='center'>{3}</td><td class='center'>{4}</td></tr>";
        var operatorTemplate = '<a href="javascript:openSessionTask(\'{0}\')">详细</a>&nbsp;&nbsp;&nbsp;{1}<a href="javascript:deleteAsset(\'{2}\')">删除</a>';
        var html = '';
        var ediitTemplate = '<a href="javascript:editAssetInfo(\'{0}\',\'{1}\',\'{2}\',\'{3}\',\'{4}\')">编辑</a>&nbsp;';
        $.each(source, function (i, v) {
            html += gridRowTemplate.format(v.RowNum, v.Name, v.Description, v.Date, operatorTemplate.format(v.Id, ediitTemplate.format(v.Id, v.RowNum, base.encode(v.Name), base.encode(v.Description), v.Date), v.Id));
        });

        $('#dataList').empty().append(html);
        createPage();
        $("#divLoading").fadeOut();
        $('.taskdesc').click(function () {
            $(this).toggleClass('autoHeight');
        });
    }
    openSessionTask = function openSessionTask(assetId) {

        var pageUrl = 'AssetManageNewRulesTaskList.html?appDomain=Task&TrustId={0};&TaskCode={1};&AssetId={2}';
        pageUrl = pageUrl.format(r_trustId, r_taskCode, assetId);
        showDialogPage(pageUrl, '任务列表', 960, 580);
    }
    deleteAsset = function deleteAsset(sId) {
        GSDialog.HintWindowTF("确定删除？", function () {
            var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
            var objArgs = {
                SPName: 'usp_DeleteAssetInfo',//'usp_DeleteSession',
                SQLParams: [{ Name: 'AssetId', Value: sId, DBType: 'int' }]
            };
            var executeParams = encodeURIComponent(JSON.stringify(objArgs));
            $.ajax({
                cache: false,
                type: "GET",
                url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    GSDialog.HintWindow('删除成功!', function () {
                        window.location.reload();
                    });

                },
                error: function (response) { GSDialog.HintWindow('删除失败!', function () { window.location.reload(); }); }
            });
        })
    }

    editAssetInfo = function editAssetInfo(AssetId, RowNum, Name, Description, Date) {
        var decodeName = base.decode(Name);
        var decodeDescription = base.decode(Description);
        edit_assetId = AssetId;
        $('#rowNum').val(RowNum)
        $('#rowNum').attr("disabled", true);
        $('#Name').val(decodeName);
        $('#AssetDescription').val(decodeDescription);
        $('#CrteDate').val(Date);
        $.anyDialog({
            width: 600,
            height: 'auto',
            title: "资产信息",
            html: $('#assetBound').show(),
            onClose: function () {
            }
        })
        $("#saveAssetTask").off();
        $("#saveAssetInfo").click(function () {

            var flag = true;
            $('#assetBound .form-control').each(function () {
                if (!validCommon.CommonValidation.ValidControlValue($(this))) {
                    flag = false;
                }

            })
            if (!flag) {
                return;
            }

            var AssetName = $('#Name').val();
            var AssetDescription = $('#AssetDescription').val();
            var CreateDate = $('#CrteDate').val();
            if (AssetName === decodeName && AssetDescription === decodeDescription && Date === CreateDate) {
                GSDialog.HintWindow('未进行任何有效编辑', function () {
                    window.location.reload();
                });
                return;
            }
            var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
            var objArgs = {
                SPName: 'usp_UpdateAssetInfo',
                SQLParams: [{ Name: 'AssetId', Value: edit_assetId, DBType: 'int' },
                            { Name: 'AssetName', Value: AssetName, DBType: 'string' },
                            { Name: 'AssetDescription', Value: AssetDescription, DBType: 'string' },
                            { Name: 'CreateDate', Value: CreateDate, DBType: 'string' }]
            };
            var executeParams = encodeURIComponent(JSON.stringify(objArgs));
            $.ajax({
                cache: false,
                type: "GET",
                url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    GSDialog.HintWindow('编辑成功!', function () {
                        var pageNum = parseInt($('#current_page').val());
                        var url = window.location.href;
                        var re = /currentPage=\d/;
                        if (url.match(re)) {
                            url = url.replace(re, 'currentPage=' + pageNum)
                        }
                        else {
                            url = url + '\&currentPage=' + pageNum;
                        }
                       
                        window.location.href = url;
                    });

                },
                error: function (response) { GSDialog.HintWindow('编辑失败!', function () { window.location.reload(); }); }
            });

        });
    }



    var sessionID, taskCode;
    var clientName = 'TaskProcess';
    var IndicatorAppDomain;
    var IsSilverlightInitialized = false;
    function InitParams() {
        if (!IsSilverlightInitialized) {
            IsSilverlightInitialized = true;
        }
        document.getElementById("TaskProcessCtl").Content.SL_Agent.InitParams(sessionID, IndicatorAppDomain, taskCode, clientName);
    }
    function popupTaskProcessIndicator(sContext, fnCallBack) {

        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: sContext.appDomain,
            taskCode: sContext.taskCode,
            sContext: sContext.sessionVariables,
            callback: function () {
                if (typeof fnCallBack === 'function') { fnCallBack(); }
            }
        });
        $("#divLoading").fadeOut();
        tIndicator.show();






        //$("#taskIndicatorArea").dialog({
        //    modal: true,
        //    dialogClass: "TaskProcessDialogClass",
        //    closeText: "",
        //    //closeOnEscape:false,
        //    height: 485,
        //    width: 470,
        //    close: function (event, ui) {
        //        if (typeof fnCallBack === 'function') { fnCallBack(); }
        //    },
        //    title: "任务处理"
        //});
    };

    function createPage() {
        //每页显示的数目
        var show_per_page = 9;
        //获取content对象里面，数据的数量
        var number_of_items = $('#dataList').children().size();
        //计算页面显示的数量
        var number_of_pages = Math.ceil(number_of_items / show_per_page);

        //隐藏域默认值

        $('#current_page').val(0);
        $('#show_per_page').val(show_per_page);

        var navigation_html = '<a class="previous_link">上一页</a>';
        var current_link = 0;
        while (number_of_pages > current_link) {
            navigation_html += '<a class="page_link"  longdesc="' + current_link + '">' + (current_link + 1) + '</a>';
            current_link++;
        }
        navigation_html += '<a class="next_link" onclick="">下一页</a>';

        $('#page_navigation').html(navigation_html);
        //add active_page class to the first page link
        $('#page_navigation .page_link:first').addClass('active_page');

        //隐藏该对象下面的所有子元素
        $('#dataList').children().hide();
        //显示第n（show_per_page）元素
        $('#dataList').children().slice(0, show_per_page).show();
        $('.next_link').click(function () {
            next();
        })
        $('.previous_link').click(function () {
            previous();
        })
        $('.page_link').click(function () {
            go_to_page($(this).attr('longdesc'));
        })

        var currentPage = getQueryString('currentPage');
        if (currentPage != null) {
            go_to_page(parseInt(currentPage));  
        }

    }

    //上一页
    function previous() {
        console.log('a')
        new_page = parseInt($('#current_page').val()) - 1;
        if ($('.active_page').prev('.page_link').length == true) {
            go_to_page(new_page);
        }
    }
    //下一页
    function next() {
        new_page = parseInt($('#current_page').val()) + 1;
        if ($('.active_page').next('.page_link').length == true) {
            go_to_page(new_page);
        }
    }
    //跳转某一页
    function go_to_page(page_num) {
        //修改URL
        var url = window.location.href;
        var re = /currentPage=\d/;
        if (url.match(re)) {
            url = url.replace(re, 'currentPage=' + page_num)
        }
        var stateObject = {};
        var title = "";
        history.pushState(stateObject, title, url);


        var show_per_page = parseInt($('#show_per_page').val());
        start_from = page_num * show_per_page;
        end_on = start_from + show_per_page;
        $('#dataList').children().hide().slice(start_from, end_on).show();
        $('.page_link[longdesc=' + page_num + ']').addClass('active_page').siblings('.active_page').removeClass('active_page');
        $('#current_page').val(page_num);
    }




    $(function () {
        r_trustId = getQueryString('trustId');
        r_taskCode = getQueryString('taskCode');
        if (!r_trustId || isNaN(r_trustId) || r_trustId == 0 || !r_taskCode) {
            return;
        }
        //日期校验
        //$("#CreateDate").change(function () {
        //    var that = $(this);
        //    formatData(that)
        //})
        loadAssetData(function (res) {
            renderListItem(res);
        });


        $('#btnGenerateNext').click(function () {
            $('#tfootNewSession').toggle();
            if ($("#tfootNewSession").is(":hidden")) {
                $("#btnGenerateNext").html('添加')
            }
            else {
                $("#btnGenerateNext").html('撤销')
            }
        });




        $('#confirm').click(function () {
            var name = $("#AssetName").val();
            var des = $("#AssetDes").val();
            var createDate = $("#CreateDate").val();
            var flag = true;
            $('#tfootNewSession .form-control').each(function () {
                if (!validCommon.CommonValidation.ValidControlValue($(this))) {
                    flag = false;
                }

            })
            if (flag) {
                addAssetRecord(name, des, createDate);
            }


        })
        $('.date-plugins').date_input();

    });

    function Base64() {

        // private property 
        _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        // public method for encoding 
        this.encode = function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = _utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
            }
            return output;
        }

        // public method for decoding 
        this.decode = function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = _keyStr.indexOf(input.charAt(i++));
                enc2 = _keyStr.indexOf(input.charAt(i++));
                enc3 = _keyStr.indexOf(input.charAt(i++));
                enc4 = _keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = _utf8_decode(output);
            return output;
        }
        // private method for UTF-8 encoding 
        _utf8_encode = function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }
            return utftext;
        }

        // private method for UTF-8 decoding 
        _utf8_decode = function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    }
})