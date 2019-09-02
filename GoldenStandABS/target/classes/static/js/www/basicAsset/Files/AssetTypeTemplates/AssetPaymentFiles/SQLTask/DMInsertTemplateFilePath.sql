use SFM_DAL_ConsumerLoan
go
insert into AssetTemplates(Name,Description,FilePath)
values(N'还款分类模板',N'还款分类模板',N'../Files/AssetTypeTemplates/AssetPaymentFiles/还款分类模板.xlsx'),
(N'还款明细模板',N'还款明细模板',N'../Files/AssetTypeTemplates/AssetPaymentFiles/还款明细模板.xlsx'),
(N'房贷还款明细模板',N'房贷还款明细模板',N'../Files/AssetTypeTemplates/AssetPaymentFiles/房贷还款明细模板.xlsx')


