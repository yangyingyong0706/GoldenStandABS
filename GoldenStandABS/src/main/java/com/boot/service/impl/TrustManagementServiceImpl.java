package com.boot.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.dao.TrustManagementMapper;
import com.boot.entity.Trust;
import com.boot.entity.TrustInfo;
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
	
}
