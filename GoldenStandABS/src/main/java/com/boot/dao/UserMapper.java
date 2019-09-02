package com.boot.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.boot.entity.District;
import com.boot.entity.User;

//----sqlserver-----
@Mapper
public interface UserMapper {
	
    List<User> getAllUsers();
    int addUser( User user );
    int deleteUser( User user );
    
    List<District> GetCityListByProvinceCode(String provinceCode);
}

