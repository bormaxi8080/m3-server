package org.plamee.view.events
{
	import flash.events.Event;
	
	public class SaveWindowEvent extends Event
	{
		public static const DELETE_LEVEL:String = "DeleteLevel";
		public static const SAVE_LEVEL:String = "SaveNewLevel";
		public static const OVERWRITE_LEVEL:String = "overwriteLevel";
		public static const EXPORT_LEVELS:String = "exportLevels";
		
		public var levelId:int;
		public var levelName:String;
		public var levelPublic:Boolean;
		public var exportLevelsIds:Array;
		public var showJson:Boolean;
		
		
		public function SaveWindowEvent(type:String, levelId:int, levelName:String=null, levelPublic:Boolean=false, showJson:Boolean = false, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			
			this.levelId = levelId;
			this.levelName = levelName;
			this.levelPublic = levelPublic;
			this.showJson = showJson;
		}
	}
}