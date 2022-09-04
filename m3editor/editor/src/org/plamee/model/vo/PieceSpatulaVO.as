package org.plamee.model.vo
{
	import mx.collections.ArrayCollection;

	public class PieceSpatulaVO extends PieceVO
	{
		public function PieceSpatulaVO()
		{
			super();
		}
		
		override public function clone():PieceVO
		{
			var toReturn:PieceSpatulaVO = new PieceSpatulaVO();
			return toReturn;
		}	
		
		override public function getSource():String
		{
			var str:String = "../assets/PieceSpecial_3.png";
			return str;
		}		
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"3_13_1", source:"../assets/PieceSpecial_3.png"}
				]
			);
		}		
	}
}