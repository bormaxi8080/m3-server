package org.plamee.model.vo
{
	import mx.collections.ArrayCollection;

	public class PieceRandomVO extends PieceVO
	{
		public function PieceRandomVO()
		{
			super();
		}
		
		override public function clone():PieceVO
		{
			var toReturn:PieceRandomVO = new PieceRandomVO();
			return toReturn;
		}	
		
		override public function getSource():String
		{
			var str:String = "../assets/PieceRandom.png";
			return str;
		}		
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"3_14_1", source:"../assets/PieceRandom.png", number:"0", frequency:"0"}
				]
			);
		}		
	}
}