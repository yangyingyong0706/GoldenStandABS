package com.boot.service;

import java.util.List;
import com.boot.entity.User;

public interface UserService {
	com.boot.domain.User selectUserById(Integer userId);
	
	//sqlserver方式
	public List<User> getAllUsers();
	
	public int addUser(User user);
	
	public int deleteUser(User user);
	
	
}
