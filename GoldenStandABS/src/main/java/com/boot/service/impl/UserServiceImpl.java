package com.boot.service.impl;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.dao.UserDao;
import com.boot.dao.UserMapper;
import com.boot.domain.User;
import com.boot.service.UserService;
@Service
public class UserServiceImpl implements UserService{
	@Autowired  
	private UserDao userDao;  
	
	@Autowired
    private UserMapper userMapper;//sqlserver方式
	
	@Override
	public User selectUserById(Integer userId) {
		return userDao.selectUserById(userId);  
	}
 
    
	/**
	 * --------------sqlserver方式
	 */
    public List<com.boot.entity.User> getAllUsers() {
        return userMapper.getAllUsers();
    }
 
    
    public int addUser(com.boot.entity.User user) {
        SimpleDateFormat form = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        user.setCreatedTime( form.format(new Date()) );
        return userMapper.addUser( user );
    }
 
    
    public int deleteUser(com.boot.entity.User user) {
        return userMapper.deleteUser( user );
    }

}
