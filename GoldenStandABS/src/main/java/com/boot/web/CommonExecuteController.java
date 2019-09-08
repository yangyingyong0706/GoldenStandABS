package com.boot.web;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.boot.entity.req.CommonExecuteReq;
import com.boot.entity.req.ExecuteParamsReq;
import com.boot.service.TrustManagementService;
import com.boot.util.FastJsonUtils;

/**
 * 
 * @author yangyingyong
 *@Date 2019-09-01
 *	公共的相关数据获取
 */
@Controller
@RequestMapping("/GoldenStandABS")
public class CommonExecuteController {
	private Logger logger=Logger.getLogger(this.getClass());
	
	@Autowired 
	private TrustManagementService trustManagementService;  
	
	/**
     * 公共调用方法
     * @return
     */
	@ResponseBody
	@RequestMapping(value = "/service/DataProcessService.svc/jsAccessEP/CommonExecuteGet", method = RequestMethod.GET)
	public String CommonExecuteGet(
			@RequestParam(name = "appDomain") String appDomain,
			@RequestParam(name = "executeParams") String executeParams) {
		
		logger.info("-----进入/service/DataProcessService.svc/jsAccessEP/CommonExecuteGet方法--");
		logger.info("跳转到公共调用方法----参数信息--appDomain:" + appDomain
				+ "-----executeParams:" + executeParams);
		
		CommonExecuteReq executeReq=new CommonExecuteReq();
		executeReq.setAppDomain(appDomain);
		executeReq.setExecuteParams(FastJsonUtils.getJsonToBean(executeParams, ExecuteParamsReq.class));
		List<Map<String, Object>> list = trustManagementService
				.CommonExecuteGet(executeReq);
		String json = FastJsonUtils.getBeanToJson(list);
		return json;
	}
	
}
