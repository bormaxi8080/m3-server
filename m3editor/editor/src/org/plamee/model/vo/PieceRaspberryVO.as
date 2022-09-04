package org.plamee.model.vo
{
	import mx.collections.ArrayCollection;

	public class PieceRaspberryVO extends PieceVO
	{
		public function PieceRaspberryVO()
		{
			super();
		}
		
		override public function clone():PieceVO
		{
			var toReturn:PieceRaspberryVO = new PieceRaspberryVO();
			return toReturn;
		}	
		
		override public function getSource():String
		{
			var str:String = "../assets/PieceIngredient_2.png";
			return str;
		}		
		override public function isIngredient():Boolean{
			return true;
		}
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"3_10_1", source:"../assets/PieceIngredient_2.png", number:"0", frequency:"0"}
				]
			);
		}		
	}
}