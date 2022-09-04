package org.plamee.model.language{
	import flash.system.Capabilities;

	public class Language{
		static private var _inst		:Language = null;
		
		private var mLanguage			:String = LanguageType.RUSSIAN;
		public function Language(){
			_inst = this;
		}
		public static function getInstance():Language{
			if(_inst==null) new Language();
			return _inst; 
		}
		
		public function get language():int{return mLanguage;}
		public function set language(inLanguage:String):void{
			
		}
	}
}