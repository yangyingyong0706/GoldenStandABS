package com.boot.service;

import java.util.List;
import java.util.Map;

import com.boot.entity.Trust;
import com.boot.entity.TrustInfo;

public interface TrustManagementService {
	
//	Map<String, Object> GetTrustInfoFromWizard(String TrustId);
	List<TrustInfo>  GetTrustInfoFromWizard(String TrustId);
	
	
	List<Map<String,Object>>  GetTrustInfoFromWizardMap(String TrustId);
	
	List<Trust>  GetTrust();
	
	Map<String,Object> getABSversion();
	
    List<Map<String,Object>> GetAllCodeDictionaryMap(String aliasSetName);
   
	List<com.boot.entity.Dictionary> GetAllCodeDictionary(String aliasSetName);	
}
