package org.plamee.view.events
{
	import flash.events.Event;
	
	public class SecretLevelWindowEvent extends Event
	{
		public static const ON_OK:String = "onOk";
		
		public var exportXML:XML;
		
		public function SecretLevelWindowEvent(type:String, exportXML:XML=null, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			
			this.exportXML = exportXML;
			
		}
	}
}