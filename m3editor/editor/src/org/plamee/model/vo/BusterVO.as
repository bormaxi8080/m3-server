package org.plamee.model.vo
{
	import mx.collections.ArrayCollection;
	
	import org.plamee.model.inums.BoosterType;

	
	public class BusterVO{
		
		public var type:int;
		private static var mListName:Object;
		
		public function BusterVO(aType:int)
		{
			this.type = aType;
		}
		
		static private function get listName():Object
		{
			if (!mListName)
			{
				mListName = new Object();
				mListName[BoosterType.PASTRY_TONGS] 			= BoosterType.ID_PASTRY_TONGS,
				mListName[BoosterType.GINGERBREAD_MAN] 			= BoosterType.ID_GINGERBREAD_MAN,
				mListName[BoosterType.CONFECTIONERY_BLADE] 		= BoosterType.ID_CONFECTIONERY_BLADE,
				mListName[BoosterType.RAINBOW_CAKE] 			= BoosterType.ID_RAINBOW_CAKE,
				mListName[BoosterType.PASTRY_BAG] 				= BoosterType.ID_PASTRY_BAG,
				mListName[BoosterType.REVERSE_MOVE] 			= BoosterType.ID_REVERSE_MOVE,
				mListName[BoosterType.CHANGE_CAKES_PLACES] 		= BoosterType.ID_CHANGE_CAKES_PLACES,
				mListName[BoosterType.EXTRA_TIME] 				= BoosterType.ID_EXTRA_TIME,
				mListName[BoosterType.STRIPED_CAKE_ON_PLATE]	= BoosterType.ID_STRIPED_CAKE_ON_PLATE,
				mListName[BoosterType.CAFETIERE] 				= BoosterType.ID_CAFETIERE,
				mListName[BoosterType.BOSS_PROTECTION] 			= BoosterType.ID_BOSS_PROTECTION,
				mListName[BoosterType.EXTRA_MOVES] 				= BoosterType.ID_EXTRA_MOVES
			}	
			return mListName;
		}
		
		static public function getTypeByName(inName:String):int
		{
			return listName[inName];
		}
		
		public function getName():String{
			for(var aName:String in listName)
				if(listName[aName]==type)
					return aName;
			return "";
		}
		
		public function clone():BusterVO
		{
			var toReturn:BusterVO = new BusterVO(this.type);
			return toReturn;
		}
		
		static public function createBoosterFromSourceId(id:String):BusterVO{
			if(!id)
				return null;
			
			var results:Array = id.split(/_/);
			for(var i:int = 0; i<results.length; i++)
				results[i] = int(results[i]);
			
			if(results[0] != 6)
				return null;
			if(results[1]>0&&results[1]<10)
				return new BusterVO(results[1]);
			
			return null;
		}
		
		public function getSource():String
		{
			var str:String = "../assets/buster"+String(this.type)+".png";
			return str;
		}
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"6_1", source:"../assets/buster1.png", label:""},
					{id:"6_2", source:"../assets/buster2.png", label:""},
					{id:"6_3", source:"../assets/buster3.png", label:""},
					{id:"6_4", source:"../assets/buster4.png", label:""},
					{id:"6_5", source:"../assets/buster5.png", label:""},
					{id:"6_6", source:"../assets/buster6.png", label:""},
					{id:"6_7", source:"../assets/buster7.png", label:""},
					{id:"6_8", source:"../assets/buster8.png", label:""},
					{id:"6_9", source:"../assets/buster9.png", label:""},
					{id:"6_10", source:"../assets/buster10.png", label:""},
					{id:"6_11", source:"../assets/buster11.png", label:""},
					{id:"6_12", source:"../assets/buster12.png", label:""}
				]
			);
		}	
	}
}