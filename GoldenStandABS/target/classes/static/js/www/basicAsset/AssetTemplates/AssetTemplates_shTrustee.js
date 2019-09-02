define(function (require) {
    var $ = require('jquery');
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    $(function () {
        $('#selectLanguageDropdown').localizationTool({
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
                'element:title': {
                    'en_GB': 'DownLoad Template'

                },
                'element:td.a1': {
                    'en_GB': 'Check Here'

                },
                'element:a.a1': {
                    'en_GB': 'DownLoad'

                },

                'class:no': {
                    'en_GB': 'Series No'

                },
                'class:templateName': {
                    'en_GB': 'File Name'

                },

                'id:assetTemplate': {
                    'en_GB': 'Asset-Data'

                },

                'id:repaymentTemplate': {
                    'en_GB': 'Repayment'

                },

                'id:plannedCashFlow': {
                    'en_GB': 'Scheduled Cashflow'

                },
                'id:accountAssets': {
                    'en_GB': 'Asset-Data By Account'

                },
                'id:statistics': {
                    'en_GB': 'Statistics Info'

                },
                'id:ino': {
                    'en_GB': 'Asset entry and exit pool'

                },




                'id:creditCard': {
                    'en_GB': 'Credit Card'

                },
                'id:publicLoan': {
                    'en_GB': 'Collagenized Loan Obligation'

                },
                'id:consumerLoan': {
                    'en_GB': 'Consumer Loan'

                }, 'id:consumerLoanCSV': {
                    'en_GB': 'Consumer Loan csv template'

                },
                'id:asset-backedCommercialPaper': {
                    'en_GB': 'Asset Backed Medium-term Notes'

                },
                'id:carLoan': {
                    'en_GB': 'Automobile Loan'

                },
                'id:personalHousingLoan': {
                    'en_GB': 'Residential Mortgage-Backed Security'

                },
                'id:Receivable': {
                    'en_GB': 'Receivable'

                },
                'id:MarginTrading': {
                    'en_GB': 'Margin financing'

                },


                'id:repaymentClassificationTemplate': {
                    'en_GB': 'Classification Template'

                },
                'id:groupTemplate': {
                    'en_GB': 'Details Template'

                },
                'id:housingLoanRepaymentDetailTemplate': {
                    'en_GB': 'Classification+Details'

                },

                'id:historyPaymentDetailTemplate': {
                    'en_GB': 'Details History'

                },

                'id:plannedCashFlowImportTemplate': {
                    'en_GB': 'Scheduled Cashflow Template'

                },
                'id:plannedCashFlowImportTemplate2': {
                    'en_GB': 'Cash flow plan collection import template'

                },


                'id:accountAssetsTemplate': {
                    'en_GB': 'Asset-Data By Account Template'

                },

                'id:durationPoolStatistic_housingLoan_consumerLoan': {
                    'en_GB': 'Duration Assets RMBS&ConsumerLoan'

                },
                'id:durationPoolStatistic_carLoan': {
                    'en_GB': 'Duration Assets AUTO'

                },
                'id:cyclePoolStatistic_housingLoan_consumerLoan': {
                    'en_GB': 'Top Up Assets RMBS&ConsumerLoan'

                },
                'id:cyclePoolStatistic_carLoan': {
                    'en_GB': 'Top Up Assets _ AUTO'

                },
                'id:assetPoolReturn': {
                    'en_GB': 'Repayment Statistics Information'

                },
                'id:AssetIno': {
                    'en_GB': 'Asset entry pool template'

                },
                'id:cashFlowManagement': {
                    'en_GB': 'Cash Flow Manager'
                },
                'id:CashFlowCollectionSchedule': {
                    'en_GB': 'Template of cash fLow collection schedule'
                },
                'id:CashFlowOAPaymentSchedule': {
                    'en_GB': 'Template of cash fLow OA payment schedule'
                },
                'id:CashFlowOAPaymentDetails': {
                    'en_GB': 'Template of cash fLow OA payment paid'
                }

            }
        });

        var userLanguage = webStorage.getItem('userLanguage');

        if (userLanguage) {
            $('#selectLanguageDropdown').localizationTool('translate', userLanguage);

        }
        $('body').show();


        $("#title ul>li").bind("click", function () {
            var titleText = this.innerText.replace("\n", "");
            var $cd = $("#contentdiv");
            $("#title li").removeClass("act");
            $(this).addClass("act");
            if ($cd.is(":animated"))
                stop(true, true);
            if (titleText == "还款模板" || titleText == "Repayment") {
                $cd.find("div").fadeOut(30);
                $cd.find("div").eq(1).fadeIn(40);
            }
            else if (titleText == "计划现金流" || titleText == "Scheduled Cashflow") {
                $cd.find("div").fadeOut(30);
                $cd.find("div").eq(2).fadeIn(40);
            }
            else if (titleText == "账户资产" || titleText == "Asset-Data By Account") {
                $cd.find("div").fadeOut(30);
                $cd.find("div").eq(3).fadeIn(40);
            }
            else if (titleText == "统计信息" || titleText == "Statistics Info") {
                $cd.find("div").fadeOut(30);
                $cd.find("div").eq(4).fadeIn(40);
            } else if (titleText == "资产出入池" || titleText == "Asset entry and exit pool") {
                $cd.find("div").fadeOut(30);
                $cd.find("div").eq(5).fadeIn(40);
            } else if (titleText == "回款现金流管理" || titleText == "Cash Flow Manager") {
                $cd.find('div').fadeOut(30);
                $cd.find("div").eq(6).fadeIn(40);
            }
            else {
                $cd.find("div").fadeOut(30);
                $cd.find("div").eq(0).fadeIn(40);
            }
        });


        //下载还款分类+还款明细模板
        //console.log($('#downLoadTem'))
        $("body").on("click", "#downLoadTem", function () {
            downLoadExcelNow('/PoolCut/Files/AssetTypeTemplates/AssetPaymentFiles/还款明细模板.xlsx', '下载', '还款明细模板.xlsx', 'downLoadTem');
        })


        //下载来源添加 ,资产模板  
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_信用卡.xlsx', '下载', '资产导入模板_信用卡.xlsx', 'downLoadCard');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_CLO.xlsx', '下载', '资产导入模板_CLO.xlsx', 'downLoadPLoan');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_消费.xlsx', '下载', '资产导入模板_消费.xlsx', 'downLoadCLoan');
        //downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_ABN.xlsx', '下载', '资产导入模板_ABN.xlsx', 'downLoadPaper');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_车贷.xlsx', '下载', '资产导入模板_车贷.xlsx', 'downLoadCarLoan');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_房贷.xlsx', '下载', '资产导入模板_房贷.xlsx', 'downLoadHLoan');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_融资租赁.xlsx', '下载', '资产导入模板_融资租赁.xlsx', 'downLoadRcv');
        //downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_融资融券.xlsx', '下载', '资产导入模板_融资融券.xlsx', 'downLoadMT');
        //downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/资产导入模板_消费.csv', '下载', '资产导入模板_消费.csv', 'downLoadCLoanCSV');

        //还款模板
        downLoadTwoExcel('/PoolCut/Files/AssetTypeTemplates/AssetPaymentFiles/还款分类模板.xlsx', '下载', '还款分类模板.xlsx', 'downLoadGT', 'downLoadTem');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/AssetPaymentFiles/房贷还款明细模板.xlsx', '下载', '房贷还款明细模板.xlsx', 'downLoadHLRDT');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/AssetPaymentFiles/历史还款明细模板.xlsx', '下载', '历史还款明细模板.xlsx', 'downLoadHPDT');
        //计划现金流
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/PaymentScheduleFiles/计划现金流导入模板.xlsx', '下载', '计划现金流导入模板.xlsx', 'downLoadPCFIT');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/PaymentScheduleFiles/计划归集现金流导入模板.xlsx', '下载', '计划归集现金流导入模板.xlsx', 'downLoadPCFIT2');
        //账户资产
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/AssetbyAccountFiles/账户资产模板.xlsx', '下载', '账户资产模板.xlsx', 'downLoadAT');
        //统计信息
        downLoadExcelForSyn('/PoolCut/Files/AssetStatistic/存续池统计信息_房贷消费贷.xlsx', '下载', '存续池统计信息_房贷消费贷.xlsx', 'downLoadHC');
        downLoadExcelForSyn('/PoolCut/Files/AssetStatistic/存续池统计信息_车贷.xlsx', '下载', '存续池统计信息_车贷.xlsx', 'downLoadDPC');
        downLoadExcelForSyn('/PoolCut/Files/AssetStatistic/循环池统计信息_房贷消费贷.xlsx', '下载', '循环池统计信息_房贷消费贷.xlsx', 'downLoadCSHC');
        downLoadExcelForSyn('/PoolCut/Files/AssetStatistic/循环池统计信息_车贷.xlsx', '下载', '循环池统计信息_车贷.xlsx', 'downLoadCSC');
        downLoadExcelForSyn('/PoolCut/Files/AssetStatistic/资产池回款信息.xlsx', '下载', '资产池回款信息.xlsx', 'downLoadAPR');
        downLoadExcelForSyn('/PoolCut/Files/AssetStatistic/贷款服务报告导入模板(非持续购买).xlsx', '下载', '贷款服务报告导入模板(非持续购买).xlsx', 'downLoadAP');
        //资产出入池
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/Assetino/资产出入池模板.xlsx', '下载', '资产出入池模板.xlsx', 'downLoadAI');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/CashFlowOA/现金流归集计划模板.xlsx', '下载', '现金流归集计划模板.xlsx', 'downLoadCFCS');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/CashFlowOA/现金流详细回款计划模板.xlsx', '下载', '现金流详细回款计划模板.xlsx', 'downLoadCFOAPS');
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/CashFlowOA/现金流实际回款明细模板.xlsx', '下载', '现金流实际回款明细模板.xlsx', 'downLoadCFOAPD');
    })
    //字节流下载,对IE浏览器不工作的部分进行了调整
    function downLoadExcelForSyn(filePath, innerText, desName, id) {
        var oReq = new XMLHttpRequest();
        //var desPath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_信用卡.xlsx";
        var uriHostInfo = location.protocol + "//" + location.host;
        var url = encodeURI(uriHostInfo + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/" + "getStream?" + 'filePath=' + filePath);
        oReq.open("POST", url, true);
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var content = oReq.response;

            var elink = document.createElement('a');
            elink.innerHTML = innerText;
            elink.download = desName;
            //elink.style.display = 'none';

            var blob = new Blob([content]);
            elink.onload = function (e) {
                window.URL.revokeObjectURL(e.href); // 清除释放

            };
            if (window.navigator && window.navigator.msSaveOrOpenBlob) { //判断是否为IE浏览器
                document.getElementById(id).appendChild(elink);

                $('body').on('click', '#' + id, function () {
                    downLoanExcelInIE(blob, desName);

                })
            }
            else {
                elink.href = URL.createObjectURL(blob);
                document.getElementById(id).appendChild(elink);
            }
            //elink.click();
            //document.body.removeChild(elink);
        };
        oReq.send();
    }
    //重写字节流文件下载，用于实现一个A标签下载两个文件
    function downLoadTwoExcel(filePath1, innerText, desName1, id1, id2) {
        var oReq = new XMLHttpRequest();
        //var desPath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_信用卡.xlsx";
        var url = encodeURI(GlobalVariable.DataProcessServiceUrl + "getStream?" + 'filePath=' + filePath1);
        oReq.open("POST", url, true);
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var content = oReq.response;

            var elink = document.createElement('a');
            elink.innerHTML = innerText;
            elink.download = desName1;
            elink.id = id2;

            var blob = new Blob([content]);


            elink.onload = function (e) {
                window.URL.revokeObjectURL(e.href); // 清除释放

            };
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                document.getElementById(id1).appendChild(elink);

                $('body').on('click', '#' + id2, function () {
                    downLoanExcelInIE(blob, desName1);
                })
                //elink.onclick = 
                //var html = "<a onclick = 'downLoanExcelInIE('"+blob+", "+desName1+"')'>下载</a>";
                // document.getElementById(id1).appendChild(elink);

                //window.navigator.msSaveOrOpenBlob(blob, desName1);
            }
            else {
                elink.href = URL.createObjectURL(blob);
                document.getElementById(id1).appendChild(elink);
            }
        };
        oReq.send();
    }
    function downLoadExcelNow(filePath, innerText, desName, id) {
        var oReq = new XMLHttpRequest();
        //var desPath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_信用卡.xlsx";
        var url = encodeURI(GlobalVariable.DataProcessServiceUrl + "getStream?" + 'filePath=' + filePath);
        oReq.open("POST", url, true);
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var content = oReq.response;

            var elink = document.createElement('a');
            elink.innerHTML = innerText;
            elink.download = desName;

            var blob = new Blob([content], { type: "application/vnd.ms-excel" });
            elink.onload = function (e) {
                window.URL.revokeObjectURL(e.href); // 清除释放

            };
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(blob, desName);

            }
            else {
                elink.href = URL.createObjectURL(blob);
                document.body.appendChild(elink);
                elink.click();

                document.body.removeChild(elink);
            }
        };
        oReq.send();
    }
    function downLoanExcelInIE(blob, desName) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, desName);

        }
    }
})