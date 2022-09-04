package org.plamee.model.vo
{
	import mx.collections.ArrayCollection;
	import mx.containers.Canvas;
	
	import org.plamee.model.inums.JellyType;

	public class JellyVO
	{
		public var type:int;
		
		public var mCanvas:Canvas = null;
		
		public function JellyVO(type:int=JellyType.SINGLE)
		{
			this.type = type;
		}
		
		public function clone():JellyVO
		{
			var toReturn:JellyVO = new JellyVO();
			toReturn.type = type;
			return toReturn;
		}
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"2_1", source:"../assets/jelly_1.png"},
					{id:"2_2", source:"../assets/jelly_2.png"}
				]
			);
		}
		
		public function getSource():String
		{
			var str:String = "../assets/jelly_";
			str+=String(this.type)+".png";
			return str;
		}		
		
		static public function createJellyFromSourceId(id:String):JellyVO
		{
			if(!id)
				return null;
			
			
			var results:Array = id.split(/_/);
			for(var i:int = 0; i<results.length; i++)
				results[i] = int(results[i]);
			
			if(results[0] != 2)
				return null;
			
			switch (results[1])
			{
				case 1:
					return new JellyVO(1);
					break;
				case 2:
					return new JellyVO(2);
					break;
				default:
					return null;
			}
			
			return null;
		}		
	}
}