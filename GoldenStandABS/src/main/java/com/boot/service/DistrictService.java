package com.boot.service;

import java.util.List;

import com.boot.entity.District;

public interface DistrictService {
	
	List<District> GetCityListByProvinceCode(String provinceCode);
}
