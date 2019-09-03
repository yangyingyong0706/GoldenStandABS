package com.boot.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.boot.entity.Trust;
import com.boot.entity.TrustInfo;

/*import com.boot.entity.Trust;
import com.boot.entity.TrustInfo;*/

//----sqlserver-----
@Mapper
public interface TrustManagementMapper {
	/**
	 * 
	 * @param TrustId
	 * @return
	 */
//	Map<String, Object>  GetTrustInfoFromWizard(String TrustId);
	List<TrustInfo>  GetTrustInfoFromWizard(String TrustId);
	
	
	List<Map<String,Object>>  GetTrustInfoFromWizardMap(String trustId);
	
	Map<String,Object> getABSversion();
	
    List<Map<String,Object>> GetAllCodeDictionaryMap(String aliasSetName);
   
	List<com.boot.entity.Dictionary> GetAllCodeDictionary(String aliasSetName);
	
	List<Trust>  GetTrust();
}
