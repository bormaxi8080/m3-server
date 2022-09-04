package org.plamee.model.vo
{
	import mx.collections.ArrayCollection;

	public class PieceRainbowCupcakeVO extends PieceVO
	{
		public function PieceRainbowCupcakeVO()
		{
			super();
		}
		override public function getBuildScore():int{
			return 225;
		}

		override public function clone():PieceVO
		{
			var toReturn:PieceRainbowCupcakeVO = new PieceRainbowCupcakeVO();
			return toReturn;
		}	
		
		override public function getSource():String
		{
			var str:String = "../assets/PieceSpecial_2.png";
			return str;
		}		
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"3_8_1", source:"../assets/PieceSpecial_2.png"}
				]
			);
		}		
	}
}