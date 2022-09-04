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
	public class ChapterProxy extends Proxy implements IProxy
	{
		
		public static const NAME:String = 'ChapterProxy';
		//
		// Notification name constants
		
		public static const SAVED_CHAPTERS: String = "savedChapters";
		public static const SAVE_CHAPTERS_FAULT: String = "saveChaptersFault";
		
		
		public static const GOT_ALL_CHAPTERS_SETTIGNS: String = "gotAllChaptersSettings";
		public static const GET_ALL_CHAPTERS_SETTINGS_FAULT: String = "getAllChaptersSettingsFault";
		
			
		//
		// other part of the model
		private var _appProxy: ApplicationProxy;
		
		/**
		 * Constructor
		 * 
		 * @param Proxy's data if necessary
		 */		
		public function ChapterProxy () 
		{
			super(NAME);
			
			_appProxy = facade.retrieveProxy( ApplicationProxy.NAME ) as ApplicationProxy;
		}
		
		private function createCall(method:String, resultFunction:Function=null, ioErrorFunction:Function=null, securityErrorFunction:Function=null, json:Object=null):void
		{
			var urlStr:String = ApplicationProxy.SERVER_URL+"/chapters";
			
			urlStr+="?token="+_appProxy.token+"&_method="+method;
			
			var urlRequest:URLRequest = new URLRequest(urlStr);
			urlRequest.method = URLRequestMethod.POST;
			urlRequest.requestHeaders.push(new URLRequestHeader("Content-type", "application/json"));
			
			if(!json)
			{
				json = new Object();
			}
			
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
		
		public function getAllChaptersSettings():void
		{
			CursorManager.setBusyCursor();
			
			createCall("GET", getAllChaptersSettingsResult, getAllChaptersSettingsFault, getAllChaptersSettingsFault);
		}
		private function getAllChaptersSettingsResult(event: Event):void
		{
			CursorManager.removeBusyCursor();
			var result:* = _appProxy.getResult(URLLoader(event.target).data);
			
			if(result is Error)
			{
				getAllChaptersSettingsFault(null, Error(result).message);
			}
			else
			{
				sendNotification( GOT_ALL_CHAPTERS_SETTIGNS, result.chapters);
			}
			
			//sendNotification( GOT_ALL_CHAPTERS_SETTIGNS, [{id: 1, order: 1,	"levels": [{"default": 5, "A1": 11},{"default": 12,"A1": 58},{"default": 59,"A1": 62}],	"bonus_level": {"default": 56,"A1": 57}}]);
			
			//[{"bonus_level":{"A1":57,"default":56},"id":1,"levels":[{"A1":11,"default":5},{"A1":58,"default":12},{"A1":62,"default":59}],"order":1}]
		}	
		
		
		private function getAllChaptersSettingsFault(event: Event, errorMessage:String = "Connection problem"):void
		{
			CursorManager.removeBusyCursor();
			sendNotification( GET_ALL_CHAPTERS_SETTINGS_FAULT, errorMessage );
		}		
		
		/***********************************************************************************/
		
		/***********************************************************************************/
		
		public function saveChapters(chapters:Array):void
		{
			CursorManager.setBusyCursor();
			
			var json:Object = new Object();		
			json.chapters = chapters;		
			
			createCall("PUT", saveChaptersResult, saveChaptersFault, saveChaptersFault, json);
		}
		private function saveChaptersResult(event: Event):void
		{
			CursorManager.removeBusyCursor();
			
			var result:* = _appProxy.getResult(URLLoader(event.target).data);
			
			if(result is Error)
			{
				saveChaptersFault(null, Error(result).message);
			}
			else
			{
				sendNotification( SAVED_CHAPTERS , result.data);
			}
		}	
		
		private function saveChaptersFault(event: Event, errorMessage:String = "Connection problem"):void
		{
			CursorManager.removeBusyCursor();
			sendNotification( SAVE_CHAPTERS_FAULT, errorMessage );
		}		
		
		/***********************************************************************************/
		

		/***********************************************************************************/					
		
	}
}