package org.plamee.model.vo
{
	import mx.collections.ArrayCollection;

	public class PiecePhysalisVO extends PieceVO
	{
		public function PiecePhysalisVO()
		{
			super();
		}
		
		override public function clone():PieceVO
		{
			var toReturn:PiecePhysalisVO = new PiecePhysalisVO();
			return toReturn;
		}	
		
		override public function getSource():String
		{
			var str:String = "../assets/PieceIngredient_4.png";
			return str;
		}		
		override public function isIngredient():Boolean{
			return true;
		}
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"3_12_1", source:"../assets/PieceIngredient_4.png", number:"0", frequency:"0"}
				]
			);
		}		
	}
}