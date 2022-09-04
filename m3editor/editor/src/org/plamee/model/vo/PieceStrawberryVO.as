package org.plamee.model.vo
{
	import mx.collections.ArrayCollection;

	public class PieceStrawberryVO extends PieceVO
	{
		public function PieceStrawberryVO()
		{
			super();
		}
		
		override public function clone():PieceVO
		{
			var toReturn:PieceStrawberryVO = new PieceStrawberryVO();
			return toReturn;
		}	
		
		override public function getSource():String
		{
			var str:String = "../assets/PieceIngredient_3.png";
			return str;
		}	
		
		override public function isIngredient():Boolean{
			return true;
		}
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"3_11_1", source:"../assets/PieceIngredient_3.png", number:"0", frequency:"0"}
				]
			);
		}		
	}
}