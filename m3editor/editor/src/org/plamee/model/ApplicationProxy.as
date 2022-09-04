/* 
 PureMVC Flex/WebORB Demo – Login 
 Copyright (c) 2007 Jens Krause <jens.krause@puremvc.org> <www.websector.de>
 Your reuse is governed by the Creative Commons Attribution 3.0 License
 */
package org.plamee.model
{
	import com.adobe.serialization.json.JSON;
	
	import org.puremvc.as3.interfaces.IProxy;
	import org.puremvc.as3.patterns.proxy.Proxy;
	

	public class ApplicationProxy extends Proxy implements IProxy
	{
		
		public static const NAME:String = 'ApplicationProxy';
		//public static var SERVER_URL:String = 'http://127.0.0.1:4000';
		public static var SERVER_URL:String = 'http://m3e.test.nsk.plamee.com';
		//
		// Notification name constant
		public static const VIEW_STATE_CHANGED: String = "viewStateChanged";		
		//
		// view state of the login app
		private var _viewState: uint;
		
		public var token:String;

		public static const LOGIN_STATE : uint = 1;
		public static const LOGGED_IN_STATE : uint = 2;
		public static const LOGIN_ERROR_STATE : uint = 3;		

		
		/**
		 * Constructor
		 * 
		 * @param Proxy's data if necessary
		 */		
		public function ApplicationProxy (data:Object = null) 
		{
			super(NAME, data);		
		}
		
		
		public function getResult(json:String):*
		{
			var errorMessage:String = null;
			var data:Object;
			
			if(json == null)
				errorMessage = "Error response";
			else
			{
				try 
				{ 
					data = com.adobe.serialization.json.JSON.decode(json);	
				} 
				catch (err:Error) 
				{ 
					errorMessage = "Response Parse Error";
				}				
			}
			
			if( data.error )
				errorMessage = data.error;
			
			if (data.details)
			{
				errorMessage += "\n ";
				for each (var lObject in data.details)
				{
					errorMessage += lObject + "\n ";
				}
			}
			
			if(errorMessage != null)
			{
				var e:Error = new Error(errorMessage);
				return e;
			}
			else
			{
				return data;
			}
		}
		
		/**
		 * Sets the state of the applications "workflow"
		 * 
		 * @param 	integer wich based on constants defined by ApplicationProxy
		 */
		public function set viewState(value: uint): void
		{
			_viewState = value;
			sendNotification( ApplicationProxy.VIEW_STATE_CHANGED );
		}
		/**
		 * Gets the state of the login application
		 * 
		 * @param 	uint	The state id of the app 
		 */				
		public function get viewState(): uint
		{	
			return _viewState;
		}						
	}
}