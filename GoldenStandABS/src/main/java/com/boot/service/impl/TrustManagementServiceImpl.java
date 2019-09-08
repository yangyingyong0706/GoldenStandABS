package com.boot.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.dao.TrustManagementMapper;
import com.boot.entity.Trust;
import com.boot.entity.TrustInfo;
import com.boot.entity.req.CommonExecuteReq;
import com.boot.entity.req.SQLParamsReq;
import com.boot.entity.req.TrustListDataReq;
import com.boot.service.TrustManagementService;

@Service
public class TrustManagementServiceImpl implements TrustManagementService{
	@Autowired  
	private TrustManagementMapper trustManagementMapper;
	//Map<String, Object> GetTrustInfoFromWizard(String TrustId){
	public List<TrustInfo>   GetTrustInfoFromWizard(String TrustId){
		return trustManagementMapper.GetTrustInfoFromWizard(TrustId);
	}
	
	
	public List<Map<String,Object>>  GetTrustInfoFromWizardMap(String TrustId){
		return trustManagementMapper.GetTrustInfoFromWizardMap(TrustId);
	}
	
	public Map<String,Object> getABSversion(){
		return trustManagementMapper.getABSversion();
	}
	
	public List<Trust>  GetTrust(){
		return trustManagementMapper.GetTrust();
	}
	
	public List<Map<String,Object>> GetAllCodeDictionaryMap(String aliasSetName){
		return trustManagementMapper.GetAllCodeDictionaryMap(aliasSetName);
	}
	
	public List<com.boot.entity.Dictionary> GetAllCodeDictionary(String aliasSetName){
		return trustManagementMapper.GetAllCodeDictionary(aliasSetName);
	}


	@Override
	public List<Map<String, Object>> GetTrustListData(
			TrustListDataReq trustListData) {
		return trustManagementMapper.GetTrustListData(trustListData);
	}


	@Override
	public List<Map<String, Object>> GetCommon(/*String applicationDomain,String SPName,*/Map<String, Object> params) {
		// TODO Auto-generated method stub
		return trustManagementMapper.GetCommon(/*applicationDomain,SPName,*/params);
	}


	@Override
	public List<Map<String, Object>> CommonExecuteGet(
			CommonExecuteReq executeReq) {
		//需要把数据取出，进行转换
		String applicationDomain=executeReq.getAppDomain();
		String SPName=executeReq.getExecuteParams().getSPName();
		List<SQLParamsReq> list=executeReq.getExecuteParams().getSQLParams();
		Map< String , Object> params=new HashMap<String, Object>();
		for (SQLParamsReq sqlParamsReq : list) {
			params.put(sqlParamsReq.getName(), sqlParamsReq.getValue());
		}
		
		return trustManagementMapper.CommonExecuteGet(applicationDomain, SPName, params);
	}
	
	public List<Map<String, Object>> CommonExecuteGet(String applicationDomain, String SPName, Map<String, Object> params) {
		return trustManagementMapper.CommonExecuteGet(applicationDomain, SPName, params);
	}
	
}
