package com.boot.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.dao.UserMapper;
import com.boot.entity.District;
import com.boot.service.DistrictService;
@Service
public class DistrictServiceImpl implements DistrictService{
	
	
	@Autowired
    private UserMapper userMapper;//sqlserver方式
	
	/**
	 * --------------sqlserver方式
	 */
    
    public List<District> GetCityListByProvinceCode(String provinceCode) {
        return userMapper.GetCityListByProvinceCode(provinceCode);
    }

}
