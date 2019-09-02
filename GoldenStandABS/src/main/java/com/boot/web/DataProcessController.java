package com.boot.web;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.boot.service.TrustManagementService;

/**
 * 
 * @author yangyingyong
 *@Date 2019-08-31
 *信托管理
 */
@Controller
@RequestMapping("/service")
public class DataProcessController {
	private Logger logger=Logger.getLogger(this.getClass());
	
	@Autowired 
	private TrustManagementService trustManagementService;  
	/**
	 * 产品管理>基本信息>相关参与方
	 * @param applicationDomain 数据哪个数据库下
	 * @param contextInfo json参数信息
	 * @return
	 */
	@RequestMapping(value = "/DataProcessService.svc/jsAccessEP/GetTrustData")
	@ResponseBody
	public List<Map<String, Object>>  GetTrustData(@RequestParam(name= "applicationDomain") String applicationDomain,@RequestParam(name= "contextInfo") String contextInfo){      
		logger.info("applicationDomain："+applicationDomain+" contextInfo:"+contextInfo);
       
		List<Map<String, Object>>  list = trustManagementService.GetTrustInfoFromWizardMap("9");  
		logger.info("最新改造的获取到了多少个："+list.size());
        return list;    
    }
	
}
