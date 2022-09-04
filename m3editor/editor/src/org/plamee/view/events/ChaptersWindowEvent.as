package org.plamee.view.events
{
	import flash.events.Event;
	
	public class ChaptersWindowEvent extends Event
	{
		public static const DELETE_CHAPTER_SETTINGS:String = "deleteChapterSettings";
		public static const OPEN_CHAPTER_SETTINGS:String = "loadChapterSettings";
		public static const ADD_CHAPTER_SETTINGS:String = "addChapterSettings";
		public static const GET_CHAPTER_SETTINGS:String = "getChapterSettings";

		
		public var chaptersSettingsId:int;
		
		public function ChaptersWindowEvent(type:String, chaptersSettingsId:int=0, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			
			this.chaptersSettingsId = chaptersSettingsId;
			
		}
	}
}