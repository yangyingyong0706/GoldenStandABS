package com.boot.service;

import java.util.List;
import java.util.Map;

import com.boot.entity.Trust;
import com.boot.entity.TrustInfo;
import com.boot.entity.req.CommonExecuteReq;
import com.boot.entity.req.TrustListDataReq;

public interface TrustManagementService {
	
//	Map<String, Object> GetTrustInfoFromWizard(String TrustId);
	List<TrustInfo>  GetTrustInfoFromWizard(String TrustId);
	
	
	List<Map<String,Object>>  GetTrustInfoFromWizardMap(String TrustId);
	
	List<Trust>  GetTrust();
	
	Map<String,Object> getABSversion();
	
    List<Map<String,Object>> GetAllCodeDictionaryMap(String aliasSetName);
   
	List<com.boot.entity.Dictionary> GetAllCodeDictionary(String aliasSetName);	
	
	
	List<Map<String,Object>> GetTrustListData(TrustListDataReq trustListData);
	
	List<Map<String,Object>>  GetCommon(/*String applicationDomain,String SPName,*/Map<String, Object> params);
	/**
	 *  调用公共的存错过程方法
	 * @param executeReq 参数信息
	 * @return
	 */
	List<Map<String,Object>>  CommonExecuteGet(CommonExecuteReq executeReq);
	
    List<Map<String, Object>> CommonExecuteGet(String applicationDomain, String SPName, Map<String, Object> params);
}
