package org.plamee.model.vo{
	import mx.collections.ArrayCollection;

	public class RespawnVO{
		public function RespawnVO(){
		}
		
		public function clone():RespawnVO{
			var toReturn:RespawnVO = new RespawnVO();
			return toReturn;
		}
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection([
				{id:"5_1", source:"../assets/arrow.png"}
				]);
		}
		
		public function getSource():String{
			var str:String = "../assets/arrow.png";
			return str;
		}		
		
		static public function createRespawnFromSourceId(id:String):RespawnVO{
			return new RespawnVO();
		}		
	}
}