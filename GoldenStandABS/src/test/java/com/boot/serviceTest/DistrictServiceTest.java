package com.boot.serviceTest;

import java.util.List;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.boot.baseTest.SpringTestCase;
import com.boot.entity.TrustInfo;
import com.boot.service.TrustManagementService;

public class DistrictServiceTest  extends SpringTestCase{
	Logger logger = LoggerFactory.getLogger(this.getClass());
	@Autowired
    private TrustManagementService trustManagementService; 
	@Test  
    public void GetTrustInfoFromWizardTest(){  
		List<TrustInfo>   list= trustManagementService.GetTrustInfoFromWizard("9");  
        logger.info("查找结果" + list);  
    }  

}
