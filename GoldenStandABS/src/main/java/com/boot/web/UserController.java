package com.boot.web;

import java.util.List;

//import org.apache.logging.log4j.Logger;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.boot.domain.User;
import com.boot.entity.District;
import com.boot.service.DistrictService;
import com.boot.service.UserService;


@Controller
@RequestMapping("/user")
public class UserController {
	
	private Logger logger=Logger.getLogger(this.getClass());
	
	@Autowired 
	private UserService userService;  
	
	@Autowired 
	private DistrictService districtService;  
	
	
	@RequestMapping(value = "/test")
	public String getIndex(Model model){      
		User user = userService.selectUserById(1);  
//		User user=new User();
//		user.setUserId(1);
//		user.setUserName("张三");
//		user.setUserPassword("PWD");
//		user.setUserEmail("123456@163.com");
//		
        model.addAttribute("user", user);   
        return "/index";    
    }
//	@Autowired
//    private IUserService userService;
	@ResponseBody
    @RequestMapping(value = "/getAllUser", method = RequestMethod.GET)
    public List<com.boot.entity.User> getAllUser() {
    	 List<com.boot.entity.User>  list=userService.getAllUsers();
    	 for (com.boot.entity.User user : list) {
			System.out.println(user.getUserName()+"-------------------------------");
		}
        return list;
    }
 
    @RequestMapping(value = "/addUser", method = RequestMethod.POST)
    public int addUser( @RequestBody com.boot.entity.User user ) {
        return userService.addUser( user );
    }
 
    @RequestMapping(value = "/deleteUser", method = RequestMethod.POST)
    public int deleteUser( @RequestBody com.boot.entity.User user ) {
        return userService.deleteUser( user );
    }
    
    @ResponseBody
    @RequestMapping(value = "/getProvince", method = RequestMethod.GET)
    public List<District> getProvince() {
    	 List<District>  list=districtService.GetCityListByProvinceCode("110000");
    	 for (District d : list) {
			System.out.println(d.getCityName()+"-------------------------------");
		}
//    	 String str=JSON.toJSON(list).toString();
    	 logger.info("启动获取省份信息:");
    	 
        return list;
    }
    
    @ResponseBody
    @RequestMapping(value = "/html", method = RequestMethod.GET)
    public ModelAndView html() {
    	 String str="www/productManage/TrustManagement/ViewTrustItem/viewTrustItem";
    	 logger.info("html跳转到:"+str);
    	 ModelAndView mv=new ModelAndView(str);
    	 
        return mv;
    }
    
    @ResponseBody
    @RequestMapping(value = "/html1", method = RequestMethod.GET)
    public String html1() {
    	 String str="www/productManage/TrustManagement/ViewTrustItem/viewTrustItem";
    	 logger.info("html11跳转到:"+str);
    	 
        return str;
    }
    
    @ResponseBody
    @RequestMapping(value = "/test", method = RequestMethod.GET)
    public List<District> test(@RequestParam(name = "name") String name,@RequestParam(name= "cont") String cont) {
    	 logger.info("test获取到的信息 密码:"+name);
    	 logger.info("test获取到的信息 内容:"+cont);
    	 List<District>  list=districtService.GetCityListByProvinceCode("110000");
    	 for (District d : list) {
			System.out.println(d.getCityName()+"-------------------------------");
		}
//    	 String str=JSON.toJSON(list).toString();
    	 logger.info("启动获取省份信息:");
    	 
        return list;
    }
	
}
