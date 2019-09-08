package com.boot.web;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
/**
 * 页面跳转使用
 * @author yangyingyong
 * @Date 2019-09-03
 *
 */
@Controller
@RequestMapping("/GoldenStandABS")
public class MainController {
	private Logger logger=Logger.getLogger(this.getClass());
	
	
    @RequestMapping(value = "/")
    String home() {
    return "Hello World!";
    }

	/**
	 * 跳转到产品管理-详情版
	 * @return
	 */
	@ResponseBody
	@RequestMapping(value = "/www/productManage/TrustManagement/ViewTrustItem/viewTrustItem.html", method = RequestMethod.GET)
    public ModelAndView viewTrustItem() {
    	 String str="www/productManage/TrustManagement/ViewTrustItem/viewTrustItem";
    	 logger.info("html跳转到:"+str);
    	 ModelAndView mv=new ModelAndView(str);
    	 
        return mv;
    }
    /**
     * 跳转到产品管理列表页
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "/www/components/trustList/TrustList.html", method = RequestMethod.GET)
    public ModelAndView TrustList() {
    	 String str="www/components/trustList/TrustList";
    	 logger.info("跳转到产品管理列表页----html跳转到:"+str);
    	 ModelAndView mv=new ModelAndView(str);
        return mv;
    }
    /**
     * 跳转到产品管理-分层信息
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "/www/components/Layered/Layered.html", method = RequestMethod.GET)
    public ModelAndView Layered() {
    	String str="www/components/Layered/Layered";
    	logger.info("跳转到产品管理-分层信息----html跳转到:"+str);
    	ModelAndView mv=new ModelAndView(str);
    	return mv;
    }
    /**
     * 跳转到产品管理-时间设置页
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "/www/components/viewDateSet/viewDateSet.html", method = RequestMethod.GET)
    public ModelAndView viewDateSet() {
    	String str="www/components/viewDateSet/viewDateSet";
    	logger.info("跳转到产品管理-分层信息----html跳转到:"+str);
    	ModelAndView mv=new ModelAndView(str);
    	return mv;
    }
    /**
     * 跳转到产品管理-费用信息
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "www/components/FeeSettings/FeeSettingsNew.html", method = RequestMethod.GET)
    public ModelAndView FeeSettingsNew() {
    	String str="www/components/FeeSettings/FeeSettingsNew";
    	logger.info("跳转到产品管理-费用信息----html跳转到:"+str);
    	ModelAndView mv=new ModelAndView(str);
    	return mv;
    }
    
    /**
     * 跳转到产品管理-偿付顺序
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "www/components/PaymentSequence/PaymentSequenceSetting.html", method = RequestMethod.GET)
    public ModelAndView PaymentSequenceSetting() {
    	String str="www/components/PaymentSequence/PaymentSequenceSetting";
    	logger.info("跳转到产品管理-偿付顺序----html跳转到:"+str);
    	ModelAndView mv=new ModelAndView(str);
    	return mv;
    }
    
    /**
     * 跳转到产品管理-结构化工具
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "www/ProductDesignTools/index.html", method = RequestMethod.GET)
    public ModelAndView ProductDesignTools() {
    	String str="/www/ProductDesignTools/index";
    	logger.info("跳转到产品管理-结构化工具----html跳转到:"+str);
    	ModelAndView mv=new ModelAndView(str);
    	return mv;
    }
    /**
     * 跳转到产品管理-事件处理
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "www/productManage/TrustManagement/PaymentSetWizard/EventManagement.html", method = RequestMethod.GET)
    public ModelAndView EventManagement() {
    	String str="/www/productManage/TrustManagement/PaymentSetWizard/EventManagement";
    	logger.info("跳转到产品管理-结构化工具---EventManagement----html跳转到:"+str);
    	ModelAndView mv=new ModelAndView(str);
    	return mv;
    }
    /**
     * 跳转到产品管理-刷新现金流模型
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "/www/productManage/TrustManagement/RefreshCashflowModel/RefreshCashflowModel.html", method = RequestMethod.GET)
    public ModelAndView RefreshCashflowModel() {
    	String str="/www/productManage/TrustManagement/RefreshCashflowModel/RefreshCashflowModel";
    	logger.info("跳转到产品管理-刷新现金流模型---RefreshCashflowModel----html跳转到:"+str);
    	ModelAndView mv=new ModelAndView(str);
    	return mv;
    }
    /**
     * 跳转到产品管理-账户信息
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "/www/components/AccountInformation/AccountInformationPortfolio.html", method = RequestMethod.GET)
    public ModelAndView AccountInformationPortfolio() {
//    	String str="/www/components/AccountInformation/AccountInformationPortfolio";
    	String str="www/components/AccountInformation/AccountInformationPortfolio";
    	logger.info("跳转到产品管理-账户信息---AccountInformationPortfolio----html跳转到:"+str);
    	ModelAndView mv=new ModelAndView(str);
    	return mv;
    }
    /**
     * 跳转到产品管理-账户信息
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "/www/components/AccountInformation/AccountInformation.html", method = RequestMethod.GET)
    public ModelAndView AccountInformation() {
//    	String str="/www/components/AccountInformation/AccountInformationPortfolio";
    	String str="www/components/AccountInformation/AccountInformation";
    	logger.info("跳转到产品管理-账户信息---AccountInformation----html跳转到:"+str);
    	ModelAndView mv=new ModelAndView(str);
    	return mv;
    }
    
    /**
     * 跳转到产品管理-账户信息
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "/www/components/PaymentSequence/PayoffOrderFormula.html", method = RequestMethod.GET)
    public ModelAndView PayoffOrderFormula() {
//    	String str="/www/components/AccountInformation/AccountInformationPortfolio";
    	String str="www/components/PaymentSequence/PayoffOrderFormula";
    	logger.info("跳转到产品管理-账户信息---AccountInformation----html跳转到:"+str);
    	ModelAndView mv=new ModelAndView(str);
    	return mv;
    }
}