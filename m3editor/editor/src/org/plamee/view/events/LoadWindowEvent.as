package org.plamee.view.events
{
	import flash.events.Event;
	
	public class LoadWindowEvent extends Event
	{
		public static const DELETE_LEVEL:String = "DeleteLevel";
		public static const LOAD_LEVEL:String = "LoadLevel";
		public static const EXPORT_LEVELS:String = "exportLevels";
		
		public var levelId:int;
		public var exportLevelsIds:Array;
		public var showJson:Boolean;
		
		public function LoadWindowEvent(type:String, levelId:int, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			
			this.levelId = levelId;
			this.showJson = showJson;
			
		}
	}
}