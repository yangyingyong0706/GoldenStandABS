package com.boot.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.entity.Trust;
import com.boot.entity.TrustInfo;
import com.boot.entity.req.TrustListDataReq;

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
	
	/**
	 * 查询产品管理列表
	 * @param trustListData 传入的条件信息
	 * @return 返回列表信息
	 */
	List<Map<String,Object>> GetTrustListData(TrustListDataReq trustListData);
	/**
	 * 公共方法调用存储过程
	 * @param params 参数信息
	 * @return
	 */
	List<Map<String,Object>>  GetCommon(/*@Param("applicationDomain")String applicationDomain,@Param("SPName")String SPName,*/@Param("params") Map<String, Object> params);
	
	/**
	 * 公共方法调用存储过程
	 * @param applicationDomain 数据库
	 * @param SPName 哪个文件下
	 * @param params 参数信息
	 * @return
	 */
	List<Map<String,Object>>  CommonExecuteGet(@Param("applicationDomain")String applicationDomain,@Param("SPName")String SPName,@Param("params") Map<String, Object> params);
	
	List<Trust>  GetTrust();
}
