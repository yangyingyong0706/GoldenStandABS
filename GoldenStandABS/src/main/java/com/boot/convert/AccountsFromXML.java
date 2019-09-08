package com.boot.convert;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.List;

import org.springframework.util.StringUtils;

import com.boot.util.AppendContentToFile;
import com.boot.util.FastJsonUtils;
import com.boot.util.Xml2JsonUtil;
import com.boot.xml.accountRule.Account;
import com.boot.xml.accountRule.Rule;
import com.boot.xml.accountRule.Tool;
import com.boot.xml.accountRule.VirtualAccount;


/**
 * 偿付顺序 XML处理
 * @author yagyingyong
 *@Date 2019-09-05
 */
public class AccountsFromXML {
	/**
	 * 去除数据空格，没有就返回""
	 * @param string
	 * @return
	 */
	public static String ConvertToTrimString(String string){
		return  !StringUtils.isEmpty(string)?string.trim() : "";
	}
	
	/**
	 * 去除数据空格，有就返回值，没有就返回0
	 * @param string
	 * @return
	 */
	public static String getConvertIsDisplayInfo(String string){
		if(StringUtils.isEmpty(string)){
			return "0";
		}else if(string==null|| "".equals(string)){
			return "0";
		}else if(StringUtils.isEmpty(string.trim())){
			return "0";
		}else{
			return string;
		}
	}
	
	/**
	 * 通过实体获取Accounts信息
	 * @param tool
	 */
	public  static String  getAccountsfromBean(Tool tool){
		StringBuilder sbAccounts = new StringBuilder();
		
		Account account=tool.getAccounts().getAccount();//用于获取
		if (account!=null)
        {
            sbAccounts.append("[");
           // for (Account account : AccountList) {
            	String Name = ConvertToTrimString(account.getName());
            	String Code = ConvertToTrimString(account.getCode());
                StringBuilder sbVirtual = new StringBuilder();
                
                List<VirtualAccount> virtualAccountList=account.getVirtualAccounts().getVirtualAccount();
                if(virtualAccountList.size()>0){
                	sbVirtual.append("[");
	                for (VirtualAccount virtualAccount : virtualAccountList) {
	                	String virtualName = ConvertToTrimString(virtualAccount.getName());
	                	 String virtualDisplayName =ConvertToTrimString(virtualAccount.getDisplayName());
	                	 String virtualCode =ConvertToTrimString(virtualAccount.getCode());
	                	 String virtualIsIndependent =ConvertToTrimString(virtualAccount.getIsIndependent());
	                	 
	                	 String virtualCategory = ConvertToTrimString(virtualAccount.getCategory());
	                	 String virtualRelatedAccounts = ConvertToTrimString(virtualAccount.getRelatedAccounts());
	                	 String virtualMutexAccounts = ConvertToTrimString(virtualAccount.getMutexAccounts());
	                	 sbVirtual.append("{");
	                	 new String();
						String sbVirtualStr=String.format("\"Name\":\"%s\",\"DisplayName\":\"%s\",\"Code\":\"%s\",\"IsIndependent\":\"%s\",\"Category\":\"%s\",\"RelatedAccounts\":\"%s\",\"MutexAccounts\":\"%s\""
	                             , virtualName, virtualDisplayName, virtualCode, virtualIsIndependent, virtualCategory, virtualRelatedAccounts, virtualMutexAccounts);
	                	 sbVirtual.append(sbVirtualStr);
	                         sbVirtual.append("},");
					}
                sbVirtual.deleteCharAt(sbVirtual.length() - 1); //移除最后一个逗号
                sbVirtual.append("]");
                }
            sbAccounts.append("{");
            String VirtualAccountStr=String.format("\"Name\":\"%s\",\"Code\":\"%s\",\"VirtualAccounts\":%s", Name, Code, sbVirtual.toString());
            sbAccounts.append(VirtualAccountStr);
            sbAccounts.append("},");
			//}
            sbAccounts.deleteCharAt(sbAccounts.length() - 1);//移除最后一个逗号
            sbAccounts.append("]");
        }
		return sbAccounts.toString();
	}
	
	/**
	 * 
	 */
	public static String getRulesfromBean(Tool tool){
		 StringBuilder sbRules = new StringBuilder();
		 List<Rule> ruleList =tool.getRules().getRule();
		 if (ruleList.size() > 0)
         {
			 sbRules.append("[");
			 for (Rule rule : ruleList) {
				 String Code = ConvertToTrimString(rule.getCode());
				 
				 
				 String Name = ConvertToTrimString(rule.getName());//rule.SelectSingleNode("").InnerText != String.Empty ? rule.SelectSingleNode("Name").InnerText.Trim() : String.Empty;
                 String ProcessorName = ConvertToTrimString(rule.getProcessorName());// rule.SelectSingleNode("ProcessorName").InnerText != String.Empty ? rule.SelectSingleNode("ProcessorName").InnerText.Trim() : String.Empty;
                 String DisplayName = ConvertToTrimString(rule.getDisplayName());// rule.SelectSingleNode("").InnerText != String.Empty ? rule.SelectSingleNode("DisplayName").InnerText.Trim() : String.Empty;
                 String Category = ConvertToTrimString(rule.getCategory());// rule.SelectSingleNode("").InnerText != String.Empty ? rule.SelectSingleNode("Category").InnerText.Trim() : String.Empty;
                 String Type =  ConvertToTrimString(rule.getType());//rule.SelectSingleNode("").InnerText != String.Empty ? rule.SelectSingleNode("Type").InnerText.Trim() : String.Empty;
                 String RuleType = ConvertToTrimString(rule.getRuleType()); //rule.SelectSingleNode("RuleType").InnerText != String.Empty ? rule.SelectSingleNode("RuleType").InnerText.Trim() : String.Empty;
                 String ClassType =  ConvertToTrimString(rule.getClassType());//rule.SelectSingleNode("ClassType").InnerText != String.Empty ? rule.SelectSingleNode("ClassType").InnerText.Trim() : String.Empty;
                 //需要注意是否正確
                 String Amount =  ConvertToTrimString(rule.getAmount().getValue());//rule.SelectSingleNode("Amount").InnerText != String.Empty ? rule.SelectSingleNode("Amount").InnerText.Trim() : String.Empty;
                 String Percentage =  ConvertToTrimString(rule.getPercentage().getValue());//rule.SelectSingleNode("Percentage").InnerText != String.Empty ? rule.SelectSingleNode("Percentage").InnerText.Trim() : String.Empty;
                 String AllocationRuleOfSameLevel =  ConvertToTrimString(rule.getAllocationRuleOfSameLevel().getValue());//rule.SelectSingleNode("AllocationRuleOfSameLevel").InnerText != String.Empty ? rule.SelectSingleNode("AllocationRuleOfSameLevel").InnerText.Trim() : String.Empty;
                 String Source =  ConvertToTrimString(rule.getSource().getValue());//rule.SelectSingleNode("Source").InnerText != String.Empty ? rule.SelectSingleNode("Source").InnerText.Trim() : String.Empty;
                 String Target =  ConvertToTrimString(rule.getTarget().getValue());//rule.SelectSingleNode("Target").InnerText != String.Empty ? rule.SelectSingleNode("Target").InnerText.Trim() : String.Empty;
                 String ElementNames =  ConvertToTrimString(rule.getElementNames().getValue());    //rule.SelectSingleNode("ElementNames").InnerText != String.Empty ? rule.SelectSingleNode("ElementNames").InnerText.Trim() : String.Empty;
                 String ElementRange =   ConvertToTrimString(rule.getElementRange());    //rule.SelectSingleNode("ElementRange").InnerText != String.Empty ? rule.SelectSingleNode("ElementRange").InnerText.Trim() : String.Empty;
                 
                 //判断 IsDisplay 值并判断 是否需要返回0
                 String isAmount =   getConvertIsDisplayInfo(rule.getAmount().getIsDisplay());//    rule.SelectSingleNode("Amount").Attributes["IsDisplay"].Value != String.Empty ? rule.SelectSingleNode("Amount").Attributes["IsDisplay"].Value : "0";
                 String isPercentage =   getConvertIsDisplayInfo(rule.getPercentage().getIsDisplay());   //rule.SelectSingleNode("Percentage").Attributes["IsDisplay"].Value != String.Empty ? rule.SelectSingleNode("Percentage").Attributes["IsDisplay"].Value : "0";
                 String isAllocationRuleOfSameLevel =  getConvertIsDisplayInfo(rule.getAllocationRuleOfSameLevel().getIsDisplay());    //    rule.SelectSingleNode("AllocationRuleOfSameLevel").Attributes["IsDisplay"].Value != String.Empty ? rule.SelectSingleNode("AllocationRuleOfSameLevel").Attributes["IsDisplay"].Value : "0";
                 String isSource =   getConvertIsDisplayInfo(rule.getSource().getIsDisplay());  //  rule.SelectSingleNode("Source").Attributes["IsDisplay"].Value != String.Empty ? rule.SelectSingleNode("Source").Attributes["IsDisplay"].Value : "0";
                 String isTarget =   getConvertIsDisplayInfo(rule.getTarget().getIsDisplay());   // rule.SelectSingleNode("Target").Attributes["IsDisplay"].Value != String.Empty ? rule.SelectSingleNode("Target").Attributes["IsDisplay"].Value : "0";
                 String isElementNames =   getConvertIsDisplayInfo(rule.getElementNames().getIsDisplay()); //   rule.SelectSingleNode("ElementNames").Attributes["IsDisplay"].Value != String.Empty ? rule.SelectSingleNode("ElementNames").Attributes["IsDisplay"].Value : "0";
                
                 
                 String Branch =   ConvertToTrimString(rule.getBranch()); //   rule.SelectSingleNode("Branch").InnerText != String.Empty ? rule.SelectSingleNode("Branch").InnerText.Trim() : String.Empty;
                 String IsRepeat =   ConvertToTrimString(rule.getIsRepeat());  //    rule.SelectSingleNode("IsRepeat").InnerText != String.Empty ? rule.SelectSingleNode("IsRepeat").InnerText.Trim() : String.Empty;
                 String RelatedAccounts =   ConvertToTrimString(rule.getRelatedAccounts()); //    rule.SelectSingleNode("RelatedAccounts").InnerText != String.Empty ? rule.SelectSingleNode("RelatedAccounts").InnerText.Trim() : String.Empty;
                 
                 
                 
                 String isSupplement =getConvertIsDisplayInfo(rule.getSupplement().getIsDisplay());// rule.SelectSingleNode("supplement").Attributes["IsDisplay"].Value != String.Empty ? rule.SelectSingleNode("supplement").Attributes["IsDisplay"].Value : "0";
                 String Supplement =ConvertToTrimString(rule.getSupplement().getValue());//  rule.SelectSingleNode("supplement").InnerText != String.Empty ? rule.SelectSingleNode("supplement").InnerText.Trim() : String.Empty;
                 
                 String isRoudRule = getConvertIsDisplayInfo(rule.getRoudRule().getIsDisplay());// rule.SelectSingleNode("RoudRule").Attributes["IsDisplay"].Value != String.Empty ? rule.SelectSingleNode("RoudRule").Attributes["IsDisplay"].Value : "0";
                 String RoudRule =ConvertToTrimString(rule.getRoudRule().getValue());//  rule.SelectSingleNode("RoudRule").InnerText != String.Empty ? rule.SelectSingleNode("RoudRule").InnerText.Trim() : String.Empty;
                 
                 
               //新增两个元素 Genre TransferAmount TriggerCondition 
                 String isGenre =ConvertToTrimString(rule.getGenre().getIsDisplay());//  rule.SelectSingleNode("Genre").Attributes["IsDisplay"].Value != String.Empty ? rule.SelectSingleNode("Genre").Attributes["IsDisplay"].Value : "";
                 String Genre = ConvertToTrimString(rule.getGenre().getValue());//rule.SelectSingleNode("Genre").InnerText != String.Empty ? rule.SelectSingleNode("Genre").InnerText.Trim() : String.Empty;
                 
                 String isTransferAmount = ConvertToTrimString(rule.getTransferAmount().getIsDisplay());//rule.SelectSingleNode("TransferAmount").Attributes["IsDisplay"].Value != String.Empty ? rule.SelectSingleNode("TransferAmount").Attributes["IsDisplay"].Value : "";
                 String TransferAmount = ConvertToTrimString(rule.getTransferAmount().getValue());//rule.SelectSingleNode("TransferAmount").InnerText != String.Empty ? rule.SelectSingleNode("TransferAmount").InnerText.Trim() : String.Empty;
                 
                 String isTriggerCondition = ConvertToTrimString(rule.getTriggerCondition().getIsDisplay());//rule.SelectSingleNode("TriggerCondition").Attributes["IsDisplay"].Value != String.Empty ? rule.SelectSingleNode("TriggerCondition").Attributes["IsDisplay"].Value : "";
                 String TriggerCondition  =  ConvertToTrimString(rule.getTriggerCondition().getValue());//rule.SelectSingleNode("TriggerCondition").InnerText != String.Empty ? rule.SelectSingleNode("TriggerCondition").InnerText.Trim() : String.Empty;

                //add displayname attributes
                 String AmountDisplayname =  ConvertToTrimString(rule.getAmount().getDisplayname());//rule.SelectSingleNode("Amount").Attributes["Displayname"].Value != String.Empty ? rule.SelectSingleNode("Amount").Attributes["Displayname"].Value : "";
                 String PercentageDisplayname = ConvertToTrimString(rule.getPercentage().getDisplayname());// rule.SelectSingleNode("Percentage").Attributes["Displayname"].Value != String.Empty ? rule.SelectSingleNode("Percentage").Attributes["Displayname"].Value : "";
                 String AllROSDisplayname = ConvertToTrimString(rule.getAllocationRuleOfSameLevel().getDisplayname());// rule.SelectSingleNode("AllocationRuleOfSameLevel").Attributes["Displayname"].Value != String.Empty ? rule.SelectSingleNode("AllocationRuleOfSameLevel").Attributes["Displayname"].Value : "";
                 String SourceDisplayname = ConvertToTrimString(rule.getSource().getDisplayname());//rule.SelectSingleNode("Source").Attributes["Displayname"].Value != String.Empty ? rule.SelectSingleNode("Source").Attributes["Displayname"].Value : "";
                 String TargetDisplayname = ConvertToTrimString(rule.getTarget().getDisplayname());//rule.SelectSingleNode("Target").Attributes["Displayname"].Value != String.Empty ? rule.SelectSingleNode("Target").Attributes["Displayname"].Value : "";
                 String SupplementDisplayname =ConvertToTrimString(rule.getSupplement().getDisplayname()); //rule.SelectSingleNode("supplement").Attributes["Displayname"].Value != String.Empty ? rule.SelectSingleNode("supplement").Attributes["Displayname"].Value : "";
                 String RoudRuleDisplayname = ConvertToTrimString(rule.getRoudRule().getDisplayname());//rule.SelectSingleNode("RoudRule").Attributes["Displayname"].Value != String.Empty ? rule.SelectSingleNode("RoudRule").Attributes["Displayname"].Value : "";

               //新增两个元素 Genre TransferAmount TriggerCondition
                 String GenreDisplayname = ConvertToTrimString(rule.getGenre().getDisplayname());//rule.SelectSingleNode("Genre").Attributes["Displayname"].Value != String.Empty ? rule.SelectSingleNode("Genre").Attributes["Displayname"].Value : "";
                 String TransferAmountDisplayname =ConvertToTrimString(rule.getTransferAmount().getDisplayname());// rule.SelectSingleNode("TransferAmount").Attributes["Displayname"].Value != String.Empty ? rule.SelectSingleNode("TransferAmount").Attributes["Displayname"].Value : "";
                 String TriggerConditionDisplayname = ConvertToTrimString(rule.getTriggerCondition().getDisplayname());// rule.SelectSingleNode("TriggerCondition").Attributes["Displayname"].Value != String.Empty ? rule.SelectSingleNode("TriggerCondition").Attributes["Displayname"].Value : "";
                 
                 //String ElementNamesDisplayname = rule.SelectSingleNode("ElementNames").Attributes["Displayname"].Value != String.Empty ? rule.SelectSingleNode("ElementNames").Attributes["Displayname"].Value : "暂无";
                 
                 
                 
               //新增两个元素 Genre TransferAmount TriggerCondition
                 sbRules.append("{");
                 
                 sbRules.append(String.format("\"Code\":\"%s\",\"Name\":\"%s\",\"ProcessorName\":\"%s\",\"DisplayName\":\"%s\",\"Category\":\"%s\",\"Type\":\"%s\",\"RuleType\":\"%s\",\"ClassType\":\"%s\"" +
                 ",\"Amount\":\"%s\",\"Percentage\":\"%s\",\"AllocationRuleOfSameLevel\":\"%s\",\"Source\":\"%s\",\"Target\":\"%s\",\"ElementNames\":\"%s\",\"ElementRange\":\"%s\"" +
                 ",\"IsAmount\":\"%s\",\"IsPercentage\":\"%s\",\"IsAllocationRuleOfSameLevel\":\"%s\",\"IsSource\":\"%s\",\"IsTarget\":\"%s\",\"IsElementNames\":\"%s\"" +
                 ",\"Branch\":\"%s\",\"IsRepeat\":\"%s\",\"RelatedAccounts\":\"%s\",\"AmountDisplayname\":\"%s\",\"PercentageDisplayname\":\"%s\",\"AllROSDisplayname\":\"%s\"" +
                 ",\"SourceDisplayname\":\"%s\",\"TargetDisplayname\":\"%s\",\"Supplement\":\"%s\",\"isSupplement\":\"%s\",\"SupplementDisplayname\":\"%s\""+
                 ",\"RoudRule\":\"%s\",\"isRoudRule\":\"%s\",\"RoudRuleDisplayname\":\"%s\"" +
                 ",\"Genre\":\"%s\",\"isGenre\":\"%s\",\"GenreDisplayname\":\"%s\"" +
                 ",\"TransferAmount\":\"%s\",\"isTransferAmount\":\"%s\",\"TransferAmountDisplayname\":\"%s\"" +
                 ",\"TriggerCondition\":\"%s\",\"isTriggerCondition\":\"%s\",\"TriggerConditionDisplayname\":\"%s\"" 
                 , Code, Name, ProcessorName, DisplayName, Category, Type, RuleType, ClassType, Amount
                 , Percentage, AllocationRuleOfSameLevel, Source, Target, ElementNames, ElementRange
                 , isAmount, isPercentage, isAllocationRuleOfSameLevel, isSource, isTarget, isElementNames
                 , Branch, IsRepeat, RelatedAccounts, AmountDisplayname, PercentageDisplayname, AllROSDisplayname,
                 SourceDisplayname, TargetDisplayname, Supplement, isSupplement, SupplementDisplayname,
                 RoudRule, isRoudRule, RoudRuleDisplayname,
                 Genre,isGenre,GenreDisplayname,
                 TransferAmount,isTransferAmount,TransferAmountDisplayname,
                 TriggerCondition,isTriggerCondition,TriggerConditionDisplayname)
                 );
                 
                 sbRules.append("},");
			 }
			   sbRules.deleteCharAt(sbRules.length() - 1);//移除最后一个逗号
               sbRules.append("]");
         }
		 return sbRules.toString();
	}
	
	/**
	 * 获取xml信息转换成json字符串，经过加工
	 * @param filePath xml存放路径
	 * @return
	 */
    public static String GetRulesAndAccountsFromXMLFile(String filePath)
    {
    	try {
    		
    		
    		File file = new File(filePath);
			InputStream inputStream = new FileInputStream(file);
			String jsonData=Xml2JsonUtil.xml2JSON(inputStream);
			if(!StringUtils.isEmpty(jsonData)){
				//获取对象信息
				Tool tool=FastJsonUtils.getJsonToBean(jsonData, Tool.class);
				String accounts=getAccountsfromBean(tool);
				System.out.println("Accounts:"+accounts);
				String rules=getRulesfromBean(tool);
				System.out.println("Rules:"+rules);
				
				StringBuilder sbJson = new StringBuilder();
	            sbJson.append("{\"Json\":{");
	            new String();
				sbJson.append(String.format("\"Accounts\":%s,\"Rules\":%s", accounts, rules));
	            sbJson.append("}}");
	            
	            System.out.println("--------"+sbJson.toString());
	            return sbJson.toString();
			}
		} catch (Exception e) {
			
			System.out.println("GetRulesAndAccountsFromXMLFile ----error:"+e);
		}
		return filePath;
    }
	
	/**
	 * 获取xml信息转换成json字符串，经过加工
	 * @param filePath xml存放路径
	 * @return
	 */
    public static String GetRulesAndAccountsFromXMLFile(File file)
    {
    	try {
    		
    		
    		/*File file = new File(filePath);*/
			InputStream inputStream = new FileInputStream(file);
			String jsonData=Xml2JsonUtil.xml2JSON(inputStream);
			if(!StringUtils.isEmpty(jsonData)){
				//获取对象信息
				Tool tool=FastJsonUtils.getJsonToBean(jsonData, Tool.class);
				String accounts=getAccountsfromBean(tool);
				System.out.println("Accounts:"+accounts);
				String rules=getRulesfromBean(tool);
				System.out.println("Rules:"+rules);
				
				StringBuilder sbJson = new StringBuilder();
	            sbJson.append("{\"Json\":{");
	            new String();
				sbJson.append(String.format("\"Accounts\":%s,\"Rules\":%s", accounts, rules));
	            sbJson.append("}}");
	            
	            System.out.println("--------"+sbJson.toString());
	            return sbJson.toString();
			}
		} catch (Exception e) {
			
			System.out.println("GetRulesAndAccountsFromXMLFile ----error:"+e);
			return "";
		}
		return "";
    }
	
    
    
	public static void main(String[] args) {
		// 调用
		String  filePath ="E:\\test\\test1.xml";
		String json=GetRulesAndAccountsFromXMLFile(filePath);
		AppendContentToFile.writeFile("E:\\test\\test-json1.txt", json);
	}
	
	
}
