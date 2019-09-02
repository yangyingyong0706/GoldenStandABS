define(['jquery', 'common', 'globalVariable', 'app/basicAsset/js/PoolCutCommon_interface', 'gsAdminPages', 'gs/taskProcessIndicator', 'gs/sVariableBuilder', 'date_input'],
    function ($, common, GlobalVariable, PoolCutCommon, GSDialog, taskIndicator, sVariableBuilder) {
    var xhr = null; // 保存AJAX请求
    var total;
    var index = 1; // 记录当前页数
    var trustId = common.getQueryString('trustId');
    $(function () {

        var _assetType = '';
        $('.date-plugins').date_input();

        $('.AssetPoolCreationForm .form-control').change(function () {
            common.CommonValidation.ValidControlValue($(this));
        });

        

        $('#TrustId').change(function () {
            var trustId = $(this).val(),
                assetType = $(this).find('option:selected').attr('assetType');

            GetDateList(trustId, assetType, 'import', function (data) {
                var $txtRDate = $('#txtRDate');
                var options = '', dateTime;
                if (data.length === 0) {
                    options = '<option>没有数据</option>'
                } else {
                    $(data).each(function (k, v) {
                        dateTime = common.getStringDate(v.ReportingDate).dateFormat("yyyy-MM-dd");
                        options += '<option value="' + dateTime + '">' + dateTime + '</option>';
                    });
                }
                $txtRDate.html(options);
            });
        });

        $('#Tid').change(function () {
            var trustId = $(this).val(),
                assetType = $(this).find('option:selected').attr('assetType');

            GetDateList(trustId, assetType, 'view', function (data) {
                var $txtRDate = $('#Tdate');
                var options = '', dateTime;
                if (data.length === 0) {
                    options = '<option>没有数据</option>'
                } else {
                    $(data).each(function (k, v) {
                        dateTime = common.getStringDate(v.ReportingDate).dateFormat("yyyy-MM-dd");
                        options += '<option value="' + dateTime + '">' + dateTime + '</option>';
                    });
                }
                $txtRDate.html(options);
                var id = $('#Tid').val(), date = $('#Tdate').val();
                var filename = id + '_' + date + '_AssetMeasuring.xlsx',
                    file = '/PoolCut/Files/AssetMeasuring/' + id + '_AssetMeasuring/' + filename;
                if (!id || date === '') return;
                $('#download').attr('data-download', file);
                $.ajax({
                    url: file,
                    success: function () {
                        $('#download').prop('disabled', false);
                    },
                    error: function (XMLHttpRequest) {
                        if (XMLHttpRequest.status == '200') {
                            $('#download').prop('disabled', false);
                        } else {
                            $('#download').prop('disabled', true);
                        }
                    }
                });
            });
        });

        var executeParam = { SPName: 'TrustManagement.usp_GetTrusts', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'language', Value: 'zh-cn', DBType: 'string' });
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;

        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
            var $sel = $('.trustList')
            var options = '';
            $.each(data, function (i, v) {
                if (v.TrustId == trustId) {
                    _assetType = v.AssetType;
                }
                options += '<option value="{0}" assetType="{2}">{1}</options>'.format(v.TrustId, v.TrustName, v.AssetType);
            });
            $sel.append(options);
            $('#TrustId').val(trustId);
            $('#Tid').val(trustId);
            GetDateList(trustId, _assetType, 'import', function (data) {
                var $txtRDate = $('#txtRDate');
                var options = '', dateTime;
                if (data.length === 0) {
                    options = '<option>没有数据</option>'
                } else {
                    $(data).each(function (k, v) {
                        dateTime = common.getStringDate(v.ReportingDate).dateFormat("yyyy-MM-dd");
                        options += '<option value="' + dateTime + '">' + dateTime + '</option>';
                    });
                }
                $txtRDate.html(options);
            });
        });

       
        $(".tabs > li").click(function () {
            var _this = $(this), tab = _this.data('tab');
            _this.addClass('active').siblings().removeClass('active');
            $('#tab-body-' + tab).show().siblings().hide();
            if (tab == 2) {
                var math = $("#Tid").val();
                console.log(math);
                $.each($("#Tid>option"), function (i, v) {
                    if ($(v).val() == math) {
                        var assetType = $(v).attr('assetType');
                        var trustId = $(v).val();
                        console.log(assetType, trustId);
                        GetDateList(trustId, assetType, 'view', function (data) {
                            var $txtRDate = $('#Tdate');
                            var options = '', dateTime;
                            if (data.length === 0) {
                                options = '<option>没有数据</option>'
                            } else {
                                $(data).each(function (k, v) {
                                    dateTime = common.getStringDate(v.ReportingDate).dateFormat("yyyy-MM-dd");
                                    options += '<option value="' + dateTime + '">' + dateTime + '</option>';
                                });
                            }
                            $txtRDate.html(options);
                            //var id = $('#Tid').val(), date = $('#Tdate').val();
                            //var filename = id + '_' + date + '_AssetMeasuring.xlsx',
                            //    file = '/PoolCut/Files/AssetMeasuring/' + id + '_AssetMeasuring/' + filename;
                            //if (!id || date === '') return;
                            //$('#download').attr('data-download', file);
                            //$.ajax({
                            //    url: file,
                            //    success: function () {
                            //        $('#download').prop('disabled', false);
                            //    },
                            //    error: function (XMLHttpRequest) {
                            //        if (XMLHttpRequest.status == '200') {
                            //            $('#download').prop('disabled', false);
                            //        } else {
                            //            $('#download').prop('disabled', true);
                            //        }
                            //    }
                            //});
                        });
                        return false
                    }
                })
            }
        })

        $('#prev-page').click(function () {
            if (index > 1) {
                index--;
                ViewResults(index);
            }
        })

        $('#next-page').click(function () {
            if (index < total) {
                index++;
                ViewResults(index);
            }
        })

        $('#Tdate').change(function () {
            var id = $('#Tid').val(), date = $('#Tdate').val();
            var filename = id + '_' + date + '_AssetMeasuring.xlsx',
                file = '/PoolCut/Files/AssetMeasuring/' + id + '_AssetMeasuring/' + filename;
            if (!id || date === '') return;
            $('#download').attr('data-download', file);
            $.ajax({
                url: file,
                success: function () {
                    $('#download').prop('disabled', false);
                },
                error: function (XMLHttpRequest) {
                    if (XMLHttpRequest.status == '200') {
                        $('#download').prop('disabled', false);
                    } else {
                        $('#download').prop('disabled', true);
                    }
                }
            });
        });

        $('#download').click(function () {
            var file = $(this).attr('data-download');
            if (file) {
                window.open(file, '_blank');
            }
        })

        $('#convered').click(function () {
            var trustId = $('#Tid').val(), BusinessDate = $('#Tdate').val();

            var executeParam = { SPName: 'Asset.usp_ConveredAssetStaus', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'TrustId', Value: trustId, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'BusinessDate', Value: BusinessDate, DBType: 'string' });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;

            CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                console.log(data)
                GSDialog.HintWindow('覆盖成功!');
            });
        })

        $('#uploadBtn').click(function () {
            SubmitForm();
        })

        $('#cancelBtn').click(function () {
            Cancel();
        })

        $('#viewResults').click(function () {
            ViewResults(index);
        })
    })
    function inputFileClick() {
        $(".input_file_style").find("input").change(function () {
            var value = $(this)[0].value;
            if (value != "") {
                var tempfileinfo = value.split('\\')[value.split('\\').length - 1];
                $(this).next()[0].innerHTML = "浏览";
                $(this).parent().parent().children('.file_name').html(tempfileinfo).css("");
            } else {
                $(this).next()[0].innerHTML = '选择文件';
                $(this).parent().parent().children('.file_name').html('');
            }
        })
    }
    inputFileClick();
    $("#flex_box_control").click(function () {
        if ($(".form-panel.drop").is(":visible")) {
            $(".form-panel.drop").hide();
            $(this).html("点击显示")
            $(".buttons").css("marginTop","0px");
           
        } else {
            $(".form-panel.drop").show();
            $(this).html("点击隐藏");
        }
    })
    //$(".main>.tabs").on("click", "li", function () {
    //    var index = $(this).index();
    //    if (index == 0) {
    //        $("body", window.parent.document).find("#modal-wrap>div:first").css({ "width": 600 + "px", "height": 360 + "px" });
    //        $(".form-panel.drop").show();
    //    }
    //    if (index == 1 && $("#arrears-results").is(":visible")) {
    //        $("body", window.parent.document).find("#modal-wrap>div:first").css({ "width": 1050 + "px", "height": 560 + "px" });
    //    }
    //    if (index == 1 && $("#arrears-results").is(":hidden")) {
    //        $("body", window.parent.document).find("#modal-wrap>div:first").css({ "width": 850 + "px", "height":190 + "px" });
    //    }
    //})
    function SubmitForm() {
        var isFormFieldsAllValid = true;
        $('#tab-body-1 .form-control').each(function () {
            if (!common.CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
        });

        if (!isFormFieldsAllValid) {
            GSDialog.HintWindow("请选择文件")
            return false;
        }


        var filePath = $('#fileUploadFile').val();
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);

        xhr = UploadFile('fileUploadFile', fileName, 'StaticPool', function (sourceFilePath) {
            RunTask(sourceFilePath);
        }, function (percent) {
            $('#uploadBtn').prop('disabled', true).text('正在上传（' + percent + '%）');
        });
    }
    function Cancel() {
        if (xhr) {
            xhr.abort();
            xhr = null;
            $('#uploadBtn').prop('disabled', false).text('上传');
        } else {
            //GSDialog.Close(0);
            $('#modal-close', window.parent.document).trigger('click');
        }
    }
    function GetDateList(trustId, assetType, referer, callback) {

        var executeParam = { SPName: 'Asset.usp_GetDateLiastForAssetMeaduring', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TrustId', Value: trustId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'AssetType', Value: assetType, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'Referer', Value: referer, DBType: 'string' });
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;

        CallWCFSvc(serviceUrl, true, 'GET', callback);
    }
    function RunTask(sourceFilePath) {
        var trustId = $('#TrustId').val();
        var BusinessDate = $('#txtRDate').val();
        var assetType = $('#TrustId').find("option:selected").attr("assetType");
        var filePath = sourceFilePath.FileUploadResult;
        var sourceFileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
        var sourceFilePath = filePath;
        sVariableBuilder.AddVariableItem("TrustId", trustId, 'Int');
        sVariableBuilder.AddVariableItem("AssetType", assetType, 'NVarChar');
        sVariableBuilder.AddVariableItem("sourceFileName", sourceFileName, 'NVarChar');
        sVariableBuilder.AddVariableItem("sourceFilePath", sourceFilePath, 'NVarChar');
        sVariableBuilder.AddVariableItem("BusinessDate", BusinessDate, 'NVarChar');
        
        var sVariable = sVariableBuilder.BuildVariables();
        //tpi.ShowIndicator('ConsumerLoan', TaskCodes[PoolHeader.PoolTypeId], element);
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'ConsumerLoan',
            taskCode: 'AssetMeasuring',
            sContext: sVariable,
            callback: function () {
                //window.location.href = 'basePoolContent.html?PoolId={0}&PoolName={1}'.format(PoolId, sessionStorage.PoolName);
                //parent.location.href = parent.location.href;
                //$('#modal-close', window.parent.document).trigger('click');
                //sVariableBuilder.ClearVariableItem();
            }
        });
        tIndicator.show();
    }
    function ViewResults(index) {
        var trustId = $('#Tid').val();
        var BusinessDate = $('#Tdate').val();

        if (BusinessDate == "没有数据" || BusinessDate == "-" || BusinessDate == "" || BusinessDate == undefined) {
            GSDialog.HintWindow("没有日期数据无法查看结果。");
            return false;
        }

        console.log(BusinessDate, trustId);

        var executeParam = { SPName: 'Asset.usp_GetAssetMeasuring', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TrustId', Value: trustId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'BusinessDate', Value: BusinessDate, DBType: 'string' });
        //executeParam.SQLParams.push({ Name: 'OrderBy', Value: OrderBy, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'PageIndex', Value: index, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'PageSize', Value: 20, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'Total', Value: 0, DBType: 'int', IsOutput: true });
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;

        CallWCFSvc(serviceUrl, true, 'GET', function (data) {


            var tr = '', td, $table;

            total = data.Total;

            if (total == 0) {
                GSDialog.HintWindow('没有结果')
                return;
            }

            $('#view-arrear').hide();

            $table = $('#arrears-results');

            $(data.data).each(function (k, v) {
                td = '';
                td += '<td>' + v.AccountNo + '</td>';
                td += '<td' + (v.IsDiff_IsInArrears ? ' class="red"' : '') + '>' + v.IsInArrears_M + '</td>';
                td += '<td' + (v.IsDiff_IsInArrears ? ' class="red"' : '') + '>' + v.IsInArrears_P + '</td>';
                td += '<td' + (v.IsDiff_TermsInArrears ? ' class="red"' : '') + '>' + v.TermsInArrears_M + '</td>';
                td += '<td' + (v.IsDiff_TermsInArrears ? ' class="red"' : '') + '>' + v.TermsInArrears_P + '</td>';
                td += '<td' + (v.IsDiff_ArrearsIndicator ? ' class="red"' : '') + '>' + v.ArrearsIndicator_M + '</td>';
                td += '<td' + (v.IsDiff_ArrearsIndicator ? ' class="red"' : '') + '>' + v.ArrearsIndicator_P + '</td>';
                td += '<td' + (v.IsDiff_TotalDaysInArrears ? ' class="red"' : '') + '>' + v.TotalDaysInArrears_M + '</td>';
                td += '<td' + (v.IsDiff_TotalDaysInArrears ? ' class="red"' : '') + '>' + v.TotalDaysInArrears_P + '</td>';
                td += '<td' + (v.IsDiff_CPB ? ' class="red"' : '') + '>' + v.CPB_M + '</td>';
                td += '<td' + (v.IsDiff_CPB ? ' class="red"' : '') + '>' + v.CPB_P + '</td>';
                td += '<td' + (v.IsDiff_Seasoning ? ' class="red"' : '') + '>' + v.Seasoning_M + '</td>';
                td += '<td' + (v.IsDiff_Seasoning ? ' class="red"' : '') + '>' + v.Seasoning_P + '</td>';
                td += '<td' + (v.IsDiff_RemainingTerm ? ' class="red"' : '') + '>' + v.RemainingTerm_M + '</td>';
                td += '<td' + (v.IsDiff_RemainingTerm ? ' class="red"' : '') + '>' + v.RemainingTerm_P + '</td>';
                tr += '<tr>' + td + '</tr>';
            });
            $table.show().find('tbody').html(tr);
            if (total > 1) {
                $table.find('tfoot').css('display', 'table-footer-group');
                if (index > 1) {
                    $table.find('#prev-page').prop('disabled', false);
                } else {
                    $table.find('#prev-page').prop('disabled', true);
                }
                if (index < total) {
                    $table.find('#next-page').prop('disabled', false);
                } else {
                    $table.find('#next-page').prop('disabled', true);
                }
            }

        });
    }

});