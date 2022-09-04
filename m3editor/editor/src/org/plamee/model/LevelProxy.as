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
	import flash.net.navigateToURL;
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
	public class LevelProxy extends Proxy implements IProxy
	{
		
		public static const NAME:String = 'LevelProxy';
		//
		// Notification name constants
		public static const GOT_LEVEL_LIST: String = "gotLevelList";
		public static const GET_LEVEL_LIST_FAULT: String = "getLevelListFault";
		
		public static const ADDED_NEW_LEVEL: String = "addedNewLevel";
		public static const ADD_NEW_LEVEL_FAULT: String = "addNewLevelFault";
		
		public static const GOT_LEVEL_BY_ID: String = "gotLevelById";
		public static const GET_LEVEL_BY_ID_FAULT: String = "getLevelByIdFault";
		
		public static const LEVEL_UPDATED: String = "levelUpdated";
		public static const UPDATE_LEVEL_BY_ID_FAULT: String = "updateLevelByIdFault";
		
		public static const LEVEL_DELETED: String = "levelDeleted";
		public static const DELETE_LEVEL_BY_ID_FAULT: String = "deleteLevelByIdFault";
		
		public static const LEVELS_EXPORTED: String = "levelsExported";
		public static const EXPORT_LEVELS_FAULT: String = "exportLevelsFault";		
		//
		// other part of the model
		private var _appProxy: ApplicationProxy;
		
		/**
		 * Constructor
		 * 
		 * @param Proxy's data if necessary
		 */		
		public function LevelProxy () 
		{
			super(NAME);
			
			_appProxy = facade.retrieveProxy( ApplicationProxy.NAME ) as ApplicationProxy;
		}
		
		private function createCall(method:String, resultFunction:Function=null, ioErrorFunction:Function=null, securityErrorFunction:Function=null, levelId:String=null, json:Object = null):void
		{
			var urlStr:String = ApplicationProxy.SERVER_URL+"/levels";
			
			if(levelId != null)
				urlStr+="/"+levelId;
			
			urlStr+="?token="+_appProxy.token+"&_method="+method;
			
			var urlRequest:URLRequest = new URLRequest(urlStr);
			urlRequest.method = URLRequestMethod.POST;
			
			if (!json)
			{
				json = new Object();
			}
			
			var hdr:URLRequestHeader = new URLRequestHeader("Content-type", "application/json");
			urlRequest.requestHeaders.push(hdr);
			urlRequest.data = JSON.stringify(json);
				
			var requestSender:URLLoader = new URLLoader();
			
			if(resultFunction != null)
				requestSender.addEventListener(Event.COMPLETE, resultFunction); 
			if(ioErrorFunction != null)
			requestSender.addEventListener(IOErrorEvent.IO_ERROR, ioErrorFunction);
			if(securityErrorFunction != null)
			requestSender.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorFunction);
			
			
			requestSender.load(urlRequest);
		}
		
		/***********************************************************************************/
		
		public function getLevelsList():void
		{
			CursorManager.setBusyCursor();
			createCall("GET", getLevelsListResult, getLevelsListFault, getLevelsListFault);
		}
		private function getLevelsListResult(event: Event):void
		{
			CursorManager.removeBusyCursor();
			var result:* = _appProxy.getResult(URLLoader(event.target).data);
			
			if(result is Error)
			{
				getLevelsListFault(null, Error(result).message);
			}
			else
			{
				sendNotification( GOT_LEVEL_LIST, result.levels);
			}
			
/*			var toReturn:Array = [{id:1, name:"Level1", publ:true, issuer:"Vasia", createDate:"20/06/2014", lastChangeDate:""},
								  {id:2, name:"Level2", publ:true, issuer:"Vasia", createDate:"21/06/2014", lastChangeDate:"22/06/2014"},
								  {id:3, name:"Level3", publ:false, issuer:"Petia", createDate:"20/06/2014", lastChangeDate:"21/06/2014"},
								  {id:4, name:"Level4", publ:false, issuer:"Petia", createDate:"20/06/2014", lastChangeDate:""},
								  {id:5, name:"Level5", publ:true, issuer:"Petia", createDate:"21/06/2014", lastChangeDate:""},
								  {id:6, name:"Level6", publ:true, issuer:"Petia", createDate:"22/06/2014", lastChangeDate:"23/06/2014"},
								  {id:7, name:"Level7", publ:true, issuer:"Jeka", createDate:"23/06/2014", lastChangeDate:""},
							      {id:8, name:"Level8", publ:true, issuer:"Jeka", createDate:"23/06/2014", lastChangeDate:"24/06/2014"},
								  {id:9, name:"Level9", publ:true, issuer:"Vasia", createDate:"23/06/2014", lastChangeDate:""},
								  {id:10, name:"Level10", publ:true, issuer:"Vasia", createDate:"24/06/2014", lastChangeDate:""}
								 ];
			sendNotification( GOT_LEVEL_LIST, toReturn);*/
		}	
		
		
		private function getLevelsListFault(event: Event, errorMessage:String = "Connection problem"):void
		{
			CursorManager.removeBusyCursor();
			sendNotification( GET_LEVEL_LIST_FAULT, errorMessage );
		}		

		/***********************************************************************************/
		
		
		/***********************************************************************************/
		
		public function addNewLevel(name:String, isPublic:Boolean, level:Object):void
		{
			CursorManager.setBusyCursor();
			
			createCall("POST", addNewLevelResult, addNewLevelFault, addNewLevelFault, null, level);
		}
		private function addNewLevelResult(event: Event):void
		{
			CursorManager.removeBusyCursor();
			
			var result:* = _appProxy.getResult(URLLoader(event.target).data);
			
			if(result is Error)
			{
				addNewLevelFault(null, Error(result).message);
			}
			else
			{
				sendNotification( ADDED_NEW_LEVEL , int(result.level_id));
			}
		}	
		
		private function addNewLevelFault(event: Event, errorMessage:String = "Connection problem"):void
		{
			CursorManager.removeBusyCursor();
			sendNotification( ADD_NEW_LEVEL_FAULT, errorMessage );
		}		
		
		/***********************************************************************************/
		
		/***********************************************************************************/
		
		public function getLevelById(id:int):void
		{
			CursorManager.setBusyCursor();
			createCall("GET", getLevelByIdResult, getLevelByIdFault, getLevelByIdFault, String(id));
		}
		private function getLevelByIdResult(event: Event):void
		{
			CursorManager.removeBusyCursor();
			
			var result:* = _appProxy.getResult(URLLoader(event.target).data);
			
			if(result is Error)
			{
				getLevelByIdFault(null, Error(result).message);
			}
			else
			{
				sendNotification( GOT_LEVEL_BY_ID, result );
			}
		}	
		private function getLevelByIdFault(event: Event, errorMessage:String = "Connection problem"):void
		{
			CursorManager.removeBusyCursor();
			sendNotification( GET_LEVEL_BY_ID_FAULT, errorMessage );
		}	
		
		
		/***********************************************************************************/		
		
		/***********************************************************************************/
		
		public function updateLevelById(id:int, isPublic:Boolean,  level:Object):void
		{
			CursorManager.setBusyCursor();
			
			createCall("PUT", updateLevelByIdResult, updateLevelByIdFault, updateLevelByIdFault, String(id), level);
		}
		private function updateLevelByIdResult(event: Event):void
		{
			CursorManager.removeBusyCursor();
			
			var result:* = _appProxy.getResult(URLLoader(event.target).data);
			
			if(result is Error)
			{
				updateLevelByIdFault(null, Error(result).message);
			}
			else
			{
				sendNotification( LEVEL_UPDATED );
			}
		}
		private function updateLevelByIdFault(event: Event, errorMessage:String = "Connection problem"):void
		{
			CursorManager.removeBusyCursor();
			sendNotification( UPDATE_LEVEL_BY_ID_FAULT, errorMessage );
		}	
		
		
		/***********************************************************************************/			
		
		/***********************************************************************************/
		
		public function deleteLevelById(id:int):void
		{
			CursorManager.setBusyCursor();
			
			createCall("DELETE", deleteLevelByIdResult, deleteLevelByIdFault, deleteLevelByIdFault, String(id));
			
		}
		private function deleteLevelByIdResult(event: Event):void
		{
			CursorManager.removeBusyCursor();
			
			var result:* = _appProxy.getResult(URLLoader(event.target).data);
			
			if(result is Error)
			{
				deleteLevelByIdFault(null, Error(result).message);
			}
			else
			{
				sendNotification( LEVEL_DELETED );
			}
			
			
		}
		private function deleteLevelByIdFault(event: Event, errorMessage:String = "Connection problem"):void
		{
			CursorManager.removeBusyCursor();
			sendNotification( DELETE_LEVEL_BY_ID_FAULT, errorMessage );
		}
		
		
		/***********************************************************************************/			
		
		/***********************************************************************************/
		
		public function exportLevels(ids:Array):void
		{
			//CursorManager.setBusyCursor();
			
			//var variables:URLVariables =new URLVariables();
			//variables.ids = ids.toString();
			
			//createCall("GET", exportLevelsResult, exportLevelsFault, exportLevelsFault, null, variables);
			var urlStr:String = ApplicationProxy.SERVER_URL+"/export/levels";

			urlStr+="?ids="+ids.toString();
			urlStr+="&token="+_appProxy.token;
			
			navigateToURL(new URLRequest(urlStr));
		}
		
		private function exportLevelsResult(event: Event):void
		{
			CursorManager.removeBusyCursor();
			
			var result:* = _appProxy.getResult(URLLoader(event.target).data);
			
			if(result is Error)
			{
				exportLevelsFault(null, Error(result).message);
			}
			else
			{
				sendNotification( LEVELS_EXPORTED );
			}
			
			
		}
		private function exportLevelsFault(event: Event, errorMessage:String = "Connection problem"):void
		{
			CursorManager.removeBusyCursor();
			sendNotification( EXPORT_LEVELS_FAULT, errorMessage );
		}
		
		
		/***********************************************************************************/					
		
	}
}