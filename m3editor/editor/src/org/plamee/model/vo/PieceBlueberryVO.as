package org.plamee.model.vo
{
	import mx.collections.ArrayCollection;

	public class PieceBlueberryVO extends PieceVO
	{
		public function PieceBlueberryVO()
		{
			super();
		}
		
		override public function clone():PieceVO
		{
			var toReturn:PieceBlueberryVO = new PieceBlueberryVO();
			return toReturn;
		}	
		
		override public function getSource():String
		{
			var str:String = "../assets/PieceIngredient_1.png";
			return str;
		}		
		override public function isIngredient():Boolean{
			return true;
		}
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"3_9_1", source:"../assets/PieceIngredient_1.png", number:"0", frequency:"0"}
				]
			);
		}			
	}
}