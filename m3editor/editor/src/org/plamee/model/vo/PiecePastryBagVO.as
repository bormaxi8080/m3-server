package org.plamee.model.vo
{
	import mx.collections.ArrayCollection;

	public class PiecePastryBagVO extends PieceVO
	{
		public function PiecePastryBagVO()
		{
			super();
		}
		
		override public function clone():PieceVO
		{
			var toReturn:PiecePastryBagVO = new PiecePastryBagVO();
			return toReturn;
		}
		
		override public function getSource():String
		{
			var str:String = "../assets/PieceSpecial_1.png";
			return str;
		}		
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"3_7_1", source:"../assets/PieceSpecial_1.png"}
				]
			);
		}		
	}
}