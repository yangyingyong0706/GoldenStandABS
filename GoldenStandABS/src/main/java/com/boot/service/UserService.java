package com.boot.service;

import java.util.List;

import com.boot.domain.User;

public interface UserService {
	User selectUserById(Integer userId);
	
	//sqlserver方式
	public List<com.boot.entity.User> getAllUsers();
	
	public int addUser(com.boot.entity.User user);
	
	public int deleteUser(com.boot.entity.User user);
	
	
}
