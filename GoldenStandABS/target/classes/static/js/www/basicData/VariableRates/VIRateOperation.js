define(function (require) {
    var $ = require('jquery');
    var anydialog = require('anyDialog');
    require('date_input');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var GSDialog = require("gsAdminPages")
    var operation = common.getQueryString('operation');
    var subCategoryCode = common.getQueryString('subcategorycode');
    var subCategory = decodeURI(common.getQueryString('subcategory'));
    var pubDate=common.getQueryString('pubdate');
    if (pubDate != '') {
        pubDate = /\//g.test(pubDate) ? common.getStringDate(pubDate).dateFormat('yyyy-MM-dd') : pubDate;
    }

    var baserate = common.getQueryString('baserate');
    var type = common.getQueryString('type');
    var id = common.getQueryString('id');
    var category = common.getQueryString('category');

    function date_input_func() {
        $('.date-plugins').date_input();//.attr('readonly', true);
    }



    $(function () {
        date_input_func();

        $('#InterestType').change(function () {
            if ($(this).val() == 'loan') {
                $('#loan').show();
                $('#deposit').hide();
            }
            else {
                $('#loan').hide();
                $('#deposit').show();
            }
        });

        if (operation == 'new') {
            $('#editVI').hide();
        }
        else {
            $('#newVISet').hide();
            $('#editVI #VIDate2').text(pubDate);
            $('#viEditingRate').val(baserate);
            $('#viEditingSubCategory').text(subCategory);
        }

        $('#btnSubmit').click(function () {
            if (operation == 'new') {
                var vitype = $('#InterestType').val();

                var date = $('#VIPubDate').val();
                if (!date) {
                    GSDialog.HintWindow('公布时间不得为空');
                    if (!$('#VIPubDate').hasClass('empty')) {
                        $('#VIPubDate').addClass('empty');
                    }
                    return false;
                }
                var rate1;
                var rate2;
                var rate3;
                var rate4;
                var rate5;
                var rate6;

                if (vitype == 'loan') {
                    var rate1 = $('#lrate1').val();
                    var rate2 = $('#lrate2').val();
                    var rate3 = $('#lrate3').val();
                    var rate4 = $('#lrate4').val();
                    var rate5 = $('#lrate5').val();
                    //mengjingui 增加判断所添加的数据是否已存在（同一日期、类型、子类型） .fail()
                    $.when(
                        addVIR('短期贷款', 'within6months', '不满6个月(含)', date, 'loan', rate1),
                        addVIR('短期贷款', '6MonthsTo1Years', '六个月至一年（含）', date, 'loan', rate2),
                        addVIR('中长期贷款', '1YearsTo3Years', '一至三年（含)', date, 'loan', rate3),
                        addVIR('中长期贷款', '3YearsTo5Years', '三至五年（含)', date, 'loan', rate4),
                        addVIR('中长期贷款', 'MoreThan5Years', '五年以上', date, 'loan', rate5)
                        )
                        //.then(GSDialog.HintWindow('添加成功', function () {
                        //    $('#modal-close', parent.document).trigger('click');
                       // }));

                }
                else {
                    var rate1 = $('#drate1').val();
                    var rate2 = $('#drate2').val();
                    var rate3 = $('#drate3').val();
                    var rate4 = $('#drate4').val();
                    var rate5 = $('#drate5').val();
                    var rate6 = $('#drate6').val();

                    $.when(
                        addVIR('短期存款', '3months', '三个月', date, 'deposit', rate1),
                        addVIR('短期存款', '6months', '六个月', date, 'deposit', rate2),
                        addVIR('短期存款', '1Year', '一年', date, 'deposit', rate3),
                        addVIR('中期存款', '2Years', '两年', date, 'deposit', rate4),
                        addVIR('中长期存款', '3Years', '三年', date, 'deposit', rate5),
                        addVIR('长期存款', '5Years', '五年', date, 'deposit', rate6)
                        )
                        //.then(GSDialog.HintWindow('添加成功', function () {
                        //    $('#modal-close', parent.document).trigger('click');
                        //}));
                    
                }
            }
            else {
                baserate = $('#viEditingRate').val();
                updateVIR(id, category, subCategoryCode, subCategory, pubDate, type, baserate);
            }
        });
        $('#VIPubDate').focus(function () {
            if ($(this).hasClass('empty')) {
                $(this).removeClass('empty');
            }
        });
    });

    function addVIR(category, subCategoryCode, subCategory, date, type, rate) {
        var executeParam = {
            SPName: 'usp_addtblPBCRates', SQLParams: [
                { Name: 'Category', value: category, DBType: 'string' },
                { Name: 'subCategoryCode', value: subCategoryCode, DBType: 'string' },
                { Name: 'subCategory', value: subCategory, DBType: 'string' },
                { Name: 'rate', value: rate, DBType: 'string' },
                { Name: 'type', value: type, DBType: 'string' },
                { Name: 'pubdate', value: date, DBType: 'date' },
            ]
        };
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecutePost?";
        var result = common.ExecutePostData(false, svcUrl, 'TrustManagement', executeParam);
        //mengjingui 判断添加数据是否已存在
        if (result.CommonExecutePostResult == false) {
            GSDialog.HintWindow('已存在同日期同类型利率，若要修改请直接页面选中编辑', function () {
                $('#modal-close', parent.document).trigger('click');
            });
        }
        else if (result.CommonExecutePostResult == true) {
            GSDialog.HintWindow('添加成功', function () {
                $('#modal-close', parent.document).trigger('click');
            });
        }
    }


    function updateVIR(id, category, subCategoryCode, subCategory, date, type, rate) {
        var executeParam = {
            SPName: 'usp_updatetblPBCRates', SQLParams: [
                { Name: 'id', value: id, DBType: 'int' },
                { Name: 'Category', value: category, DBType: 'string' },
                { Name: 'subCategoryCode', value: subCategoryCode, DBType: 'string' },
                { Name: 'subCategory', value: subCategory, DBType: 'string' },
                { Name: 'rate', value: rate, DBType: 'string' },
                { Name: 'type', value: type, DBType: 'string' },
                { Name: 'pubdate', value: date, DBType: 'date' },
            ]
        };
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecutePost?";
        var result = common.ExecutePostData(false, svcUrl, 'TrustManagement', executeParam);

        if (result.CommonExecutePostResult == true) {
            //GSDialog.HintWindow('更新成功');
            GSDialog.HintWindow('添加成功', function () {
                $('#modal-close', parent.document).trigger('click');
            });
        }
    }
});