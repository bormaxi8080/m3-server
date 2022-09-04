package org.plamee.view.events
{
	import flash.events.Event;
	
	public class ChapterWindowEvent extends Event
	{

		public static const SAVE_CHAPTERS:String = "saveChapters";
		
		public var chaptersAr:Array;
		
		public function ChapterWindowEvent(type:String, chaptersAr:Array = null, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			
			this.chaptersAr = chaptersAr;
		}
	}
}