package com.boot.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.boot.domain.User;
@Mapper
public interface UserDao {
	// mysql使用
    public User selectUserById(Integer userId);  
    
    
    //sqlserver使用
    List<User> getAllUsers();
    int addUser( User user );
    int deleteUser( User user );

}  
