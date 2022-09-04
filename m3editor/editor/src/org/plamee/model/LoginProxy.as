/* 
 PureMVC Flex/WebORB Demo – Login 
 Copyright (c) 2007 Jens Krause <jens.krause@puremvc.org> <www.websector.de>
 Your reuse is governed by the Creative Commons Attribution 3.0 License
 */
package org.plamee.model
{
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestHeader;
	import flash.net.URLRequestMethod;
	import flash.utils.setTimeout;
	
	import mx.managers.CursorManager;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	import mx.rpc.remoting.RemoteObject;
	
	import org.plamee.model.vo.LoginVO;
	import org.puremvc.as3.interfaces.IProxy;
	import org.puremvc.as3.patterns.proxy.Proxy;
	
	/**
	 * A Proxy for storing users data and sending and retrieving data to/from its remoting service
	 * 
	 */
	public class LoginProxy extends Proxy implements IProxy
	{
		
		public static const NAME:String = 'loginProxy';
		//
		// Notification name constants
		public static const LOGIN_FAILED: String = "loginFailed";
		public static const LOGIN_SUCCESS: String = "loginSucces";	
		public static const LOGOUT_SUCCESS: String = "logoutSucces";	
		//
		// other part of the model
		private var _appProxy: ApplicationProxy;
		
		/**
		 * Constructor
		 * 
		 * @param Proxy's data if necessary
		 */		
		public function LoginProxy (data:Object=null) 
		{
			super(NAME, new LoginVO() );
			
			//
			// A local reference to another part of the model
			// Note: Be carefull that the ApplicationProxy has already registered within
			// the ModelPrepCommand before
			_appProxy = facade.retrieveProxy( ApplicationProxy.NAME ) as ApplicationProxy;
			//
		}
		
		/**
		 * Calls the remoting service passing users data
		 * 
		 * @param 	users data as LoginVO
		 */			
		public function loginUser( vo: LoginVO ):void
		{
			var lJson:Object = new Object();
			lJson.user =  vo.username;
			lJson.password =  vo.password;
			
			createCall(ApplicationProxy.SERVER_URL+"/login", loginUserResult, loginUserFailedOI, loginUserFailedSecurity, lJson);
		}

		/**
		 * Receives the remoting service result users data
		 * 
		 * @param 	result event object
		 */			
		private function loginUserResult(event: Event):void
		{
			CursorManager.removeBusyCursor();
			
			var result:* = _appProxy.getResult(URLLoader(event.target).data);
			
			if(result is Error)
			{
				sendNotification( LoginProxy.LOGIN_FAILED, Error(result).message );
			}
			else
			{
				_appProxy.token = result.token as String;
				_appProxy.viewState = ApplicationProxy.LOGGED_IN_STATE;
				sendNotification( LoginProxy.LOGIN_SUCCESS );
			}
		}

		/**
		 * Receives the remoting service fault event
		 * 
		 * @param 	fault event object
		 */	
		private function loginUserFailedOI(event: IOErrorEvent): void 
		{
			CursorManager.removeBusyCursor();
			//
			// change the view state	
			_appProxy.viewState = ApplicationProxy.LOGIN_ERROR_STATE;	
			//
			// notify all interested members			
			sendNotification( LoginProxy.LOGIN_FAILED, "Connection Error" );
		}
		
		private function loginUserFailedSecurity(event: SecurityErrorEvent): void 
		{
			CursorManager.removeBusyCursor();
			//
			// change the view state	
			_appProxy.viewState = ApplicationProxy.LOGIN_ERROR_STATE;	
			//
			// notify all interested members			
			sendNotification( LoginProxy.LOGIN_FAILED, "Security Error" );
		}		
		
		public function logoutUser():void
		{
			var lJson:Object = new Object();
			lJson.token = _appProxy.token;
			
			createCall(ApplicationProxy.SERVER_URL+"/logout", logoutUserResult, logoutUserResult, logoutUserResult, lJson);
			
			setTimeout(logoutUserResult, 1000, null);
		}
		
		private function logoutUserResult(event: Event):void
		{
			CursorManager.removeBusyCursor();
			
			_appProxy.token = "";
			//
			// change the view state
			_appProxy.viewState = ApplicationProxy.LOGIN_STATE;
			//
			// notify all interested members
			sendNotification( LoginProxy.LOGOUT_SUCCESS );
		}		
		
		/**
		 * Getter for its data object casted as LoginVO
		 * 
		 * @return 	LoginVO
		 */			
		public function get loginVO(): LoginVO
		{
			return data as LoginVO;
		}
		
		private function createCall(aUrl:String, resultFunction:Function=null, ioErrorFunction:Function=null, securityErrorFunction:Function=null, json:Object = null):void
		{
			var requestSender:URLLoader = new URLLoader();
			var urlRequest:URLRequest = new URLRequest(aUrl);
			urlRequest.method = URLRequestMethod.POST;
			urlRequest.requestHeaders.push(new URLRequestHeader("Content-type", "application/json"));
			urlRequest.data = JSON.stringify(json);
			
			requestSender.addEventListener(Event.COMPLETE, resultFunction); 
			requestSender.addEventListener(IOErrorEvent.IO_ERROR, ioErrorFunction);
			requestSender.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorFunction);
			requestSender.load(urlRequest);
			
			CursorManager.setBusyCursor();
		}
	}
}