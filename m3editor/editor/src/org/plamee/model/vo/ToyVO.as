package org.plamee.model.vo{
	import flash.geom.Point;
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;

	public class ToyVO{
		public var id:String = "8_1";
		private var mRotation:int = 0;
		static private var mSizes:Object = {
			"8_1":new Point(1,2),
			"8_2":new Point(2,3)
		};
		static private var mNames:Object = {
			"8_1":"Bear1",
			"8_2":"Bear2"
		};
		public function ToyVO(inId:String, inRotation:int=0){
			id = inId;
			mRotation = inRotation;
		}
		public function clone():ToyVO{
			var toReturn:ToyVO = new ToyVO(id, mRotation);
			return toReturn;
		}
		public function get point():Point{
			return mSizes[id];
		}
		public function set rotation(inRotation:int):void{
			mRotation = inRotation;
			if(mRotation>3)mRotation=0;
			if(mRotation<0)mRotation=3;
		}
		public function get rotation():int{
			return mRotation;
		}
		public function get name():String{
			return mNames[id];
		}
		
		public static function getAllSource():ArrayCollection{
			return new ArrayCollection([
				{id:"8_1", source:"../assets/bear_1.png"},
				{id:"8_2", source:"../assets/bear_2.png"}
			]);
		}
		
		public function getSource():String{
			for each(var aObj:Object in getAllSource().source)
				if(aObj["id"]==id) 
					return aObj["source"];
				
			return "../assets/bear_1.png";
		}	
		
		static public function createToyFromSourceName(inName:String):ToyVO{
			for(var aId:String in mNames){
				if(mNames[aId]==inName){
					return createToyFromSourceId(aId);
				}
			}
			return createToyFromSourceId("1");
		}
		static public function createToyFromSourceId(inId:String):ToyVO{
			if(!inId)
				return null;
			var results:Array = inId.split(/_/);
			for(var i:int = 0; i<results.length; i++)
				results[i] = int(results[i]);
			
			if(results[0] != 8)
				return null;
			
			return new ToyVO(inId);
		}
	}
}