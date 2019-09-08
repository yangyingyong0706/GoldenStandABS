package com.boot.util;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.boot.baseTest.SpringTestCase;
import com.boot.entity.req.CommonExecuteReq;

public class FastJsonUtilsTest  extends SpringTestCase{
	Logger logger = LoggerFactory.getLogger(this.getClass());
	@Test  
	public void selectUserByIdTest() {
		String json = "{\"appDomain\":\" TrustManagement\",\"executeParams\":{\"SPName\":\"usp_GetTrustFee\",\"SQLParams\":[{\"Name\":\"TrustId\",\"Value\":\"1\",\"DBType\":\"int\"},{\"Name\":\"TransactionDate\",\"Value\":\"2016-01-25\",\"DBType\":\"string\"}]}}";
		// json 转 实体
		CommonExecuteReq ce = FastJsonUtils.getJsonToBean(json,
				CommonExecuteReq.class);

		logger.info("------------------------start----------------------------------------------------------");
		logger.info("查找结果" + ce.getAppDomain());
		// 实体 转 json
		String jsonStr = FastJsonUtils.getBeanToJson(ce);
		logger.info("-------------" + jsonStr);
		logger.info("----------------------end------------------------------------------------------------");
	}
}
