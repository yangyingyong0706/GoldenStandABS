package com.boot.serviceTest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.boot.baseTest.SpringTestCase;
import com.boot.dao.TrustManagementMapper;
import com.boot.entity.Dictionary;
import com.boot.entity.Trust;
import com.boot.entity.TrustInfo;
import com.boot.entity.req.CommonExecuteReq;
import com.boot.entity.req.TrustListDataReq;
import com.boot.service.DistrictService;
import com.boot.service.TrustManagementService;
import com.boot.util.FastJsonUtils;

public class TrustManagementServiceTest extends SpringTestCase{
	Logger logger = LoggerFactory.getLogger(this.getClass());
	@Autowired
    private DistrictService districtService;
	
	@Autowired
	private TrustManagementService trustManagementService; 
	@Autowired
	private TrustManagementMapper trustManagementMapper; 
	
	@Test  
    public void GetTrustInfoFromWizardTest(){  
//		Map<String, Object> map = trustManagementService.GetTrustInfoFromWizard("9");  
	logger.info("--------------------start--GetTrustInfoFromWizardTest---------------------------------------------------------------------------------------------------");
//   	List<District>  list=districtService.GetCityListByProvinceCode("110000");
	List<TrustInfo>  list=trustManagementService.GetTrustInfoFromWizard("9");
	for (TrustInfo trustInfo : list) {
		logger.info("查找结果getItemValue:" + trustInfo.getItemValue());  
		logger.info("查找结果getItemAliasValue:" + trustInfo.getItemAliasValue());  
	}
    logger.info("--------------------end----GetTrustInfoFromWizardTest-------------------------------------------------------------------------------------------------");
    }  
	@Test  
	public void GetTrustTest(){  
//		Map<String, Object> map = trustManagementService.GetTrustInfoFromWizard("9");  
		logger.info("--------------------start---GetTrustTest--------------------------------------------------------------------------------------------------");
		List<Trust>  list=trustManagementService.GetTrust();
		for (Trust trust : list) {
			logger.info("查找结果" + trust.getTrustName());  
		}
		

		logger.info("--------------------end---GetTrustTest--------------------------------------------------------------------------------------------------");
	}  
	
	@Test  
	public void getABSversionTest(){  
//		Map<String, Object> map = trustManagementService.GetTrustInfoFromWizard("9");  
		logger.info("--------------------start---getABSversionTest--------------------------------------------------------------------------------------------------");
		Map<String,Object>  map=trustManagementService.getABSversion();
		Set<String> set=map.keySet();
		for (String string : set) {
			logger.info("查找结果getABSversionTest -----map--set----键key:("+string+")     值value:" +map.get(string) );  
		}
		
		logger.info("--------------------end---getABSversionTest--------------------------------------------------------------------------------------------------");
	}  
	@Test  
	public void GetAllCodeDictionaryTest(){  
//		Map<String, Object> map = trustManagementService.GetTrustInfoFromWizard("9");  
		logger.info("--------------------start---GetAllCodeDictionaryTest--------------------------------------------------------------------------------------------------");
		List<com.boot.entity.Dictionary> list=trustManagementService.GetAllCodeDictionary("zh-CN");
		for (Dictionary trust : list) {
			logger.info("查找结果" + trust.getSequenceNo());  
		}
		
		
		
		/*for (Map<String, Object> map : list) {
			Set<String> set=map.keySet();
			for (String string : set) {
				logger.info("查找结果getItemValue-----map--set----键key:("+string+")     值value:" +map.get(string) );  
				
			}

		}
*/
		
		logger.info("--------------------end---GetAllCodeDictionaryTest--------------------------------------------------------------------------------------------------");
	}  
	
	
	
	@Test  
    public void GetTrustInfoFromWizardTest1(){  
	logger.info("--------------------start--GetTrustInfoFromWizardTest---------------------------------------------------------------------------------------------------");
	List<TrustInfo>  list=trustManagementService.GetTrustInfoFromWizard("9");
		for (TrustInfo trustInfo : list) {
			logger.info("查找结果getItemValue-----map--set----键key:("+trustInfo.getCategory()+")     值value:" +trustInfo.getItemId() );  
		}

    logger.info("--------------------end----GetTrustInfoFromWizardTest-------------------------------------------------------------------------------------------------");
    } 
	
	
	@Test  
    public void GetTrustInfoFromWizardMapTest(){  
	logger.info("--------------------start--GetTrustInfoFromWizardMapTest---------------------------------------------------------------------------------------------------");
	List<Map<String,Object>>  list=trustManagementService.GetTrustInfoFromWizardMap("9");
	for (Map<String, Object> map : list) {
		Set<String> set=map.keySet();
		for (String string : set) {
			logger.info("查找结果getItemValue-----map--set----键key:("+string+")     值value:" +map.get(string) );  
			
		}
//		logger.info("查找结果getItemValue:" + map.);  
//		logger.info("查找结果getItemAliasValue:" + trustInfo.getItemAliasValue()); 
	}

    logger.info("--------------------end----GetTrustInfoFromWizardMapTest-------------------------------------------------------------------------------------------------");
    } 
	
	@Test  
	public void GetTrustListDataTest(){  
		logger.info("--------------------start--GetTrustListDataTest---------------------------------------------------------------------------------------------------");
		TrustListDataReq tl=new TrustListDataReq();
		tl.setStart(1);
		tl.setEnd(20);
		tl.setOrderby("TrustId");
		tl.setDirection("desc");
		tl.setUserName("goldenstand");		
		List<Map<String,Object>>  list=trustManagementService.GetTrustListData(tl);
		for (Map<String, Object> map : list) {
			Set<String> set=map.keySet();
			for (String string : set) {
				logger.info("查找结果getItemValue-----map--set----键key:("+string+")     值value:" +map.get(string) );  
				
			}
//		logger.info("查找结果getItemValue:" + map.);  
//		logger.info("查找结果getItemAliasValue:" + trustInfo.getItemAliasValue()); 
		}
		
		logger.info("--------------------end----GetTrustListDataTest-------------------------------------------------------------------------------------------------");
	} 
	
	@Test  
	public void GetCommonTest(){  
		logger.info("--------------------start--GetCommonTest---------------------------------------------------------------------------------------------------");
		
		/*Map<String, Object> mapValue=new HashMap<String, Object>();
		String applicationDomain="TrustManagement";
		String SPName="usp_GetTrustListData";
		mapValue.put("start", "1");
		mapValue.put("end", "20");
		mapValue.put("orderby", "TrustId");
		mapValue.put("direction", "desc");
		mapValue.put("where", null);
		mapValue.put("UserName", "goldenstand");
		*/
		String jsonStr = "{\"appDomain\":\" TrustManagement\",\"executeParams\":{\"SPName\":\"usp_GetTrustPeriod\",\"SQLParams\":[{\"Name\":\"TrustPeriodType\",\"Value\":\"PaymentDate_CF\",\"DBType\":\"string\"},{\"Name\":\"TrustId\",\"Value\":\"3612\",\"DBType\":\"int\"}]}}";
		// json 转 实体
		CommonExecuteReq executeReq = FastJsonUtils.getJsonToBean(jsonStr,
				CommonExecuteReq.class);
		
		List<Map<String,Object>>  list=trustManagementService.CommonExecuteGet(executeReq);
//		List<Map<String,Object>>  list=trustManagementMapper.CommonExecuteGet(applicationDomain,SPName,mapValue);
		logger.info("公共方法----trustManagementMapper.CommonExecuteGet-----size:("+list.size()+")");  
		String json =FastJsonUtils.getBeanToJson(list);
		logger.info("--------------------json----json-------------------------------------"+json);
		logger.info("--------------------end----GetCommonTest-------------------------------------------------------------------------------------------------");
	} 
	
	
}
