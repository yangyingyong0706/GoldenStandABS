package com.boot.serviceTest;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.boot.baseTest.SpringTestCase;
import com.boot.entity.Trust;
import com.boot.entity.TrustInfo;
import com.boot.service.DistrictService;
import com.boot.service.TrustManagementService;

public class TrustManagementServiceTest extends SpringTestCase{
	Logger logger = LoggerFactory.getLogger(this.getClass());
	@Autowired
    private DistrictService districtService;
	
	@Autowired
	private TrustManagementService trustManagementService; 
	
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
	
	
}
