package org.plamee.model.vo{
	import mx.collections.ArrayCollection;

	public class CellOutVO{
		public function CellOutVO(){
		}
		
		public function clone():CellOutVO{
			var toReturn:CellOutVO = new CellOutVO();
			return toReturn;
		}
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection([
				{id:"5_2", source:"../assets/cellout.png"}
				]);
		}
		
		public function getSource():String{
			var str:String = "../assets/cellout.png";
			return str;
		}		
		
		static public function createRespawnFromSourceId(id:String):CellOutVO{
			return new CellOutVO();
		}		
	}
}