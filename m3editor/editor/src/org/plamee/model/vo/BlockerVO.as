package org.plamee.model.vo
{
	import mx.collections.ArrayCollection;
	
	import org.plamee.model.inums.BlockerType;
	import org.plamee.view.components.GamePieceCanvas;

	
	public class BlockerVO{
	
		public var mGrounded:Boolean = true;
		public var mCanvas:GamePieceCanvas = null;
		
		public var type:int;
		public var mName:String = "";
		public var mPower:int = 1;
		
		public function getCrashScore():int{
			return 30;
		}
		
		static private var mListName:Object = {
				"jelly":BlockerType.JELLY, 
				"vienna_waffle":BlockerType.VIENNAWAFFLE, 
				"skylight":BlockerType.SKYLIGHT, 
				"honey":BlockerType.HONEY,
				"CHOCOLATE1":BlockerType.CHOCOLATE1, 
				"CHOCOLATE2":BlockerType.CHOCOLATE2,
				"CHOCOLATE3":BlockerType.CHOCOLATE3
		}; 
		
		static public function getTypeByName(inName:String):int
		{
			return mListName[inName];
		}
		
		static public function getNameByType(aType:int):String
		{
			for(var aName:String in mListName)
				if(mListName[aName]==aType)
					return aName;
			return "";
		}
		
		public function getInMatch():Boolean{//можно включать в матч
			return type==BlockerType.SKYLIGHT;
		}
		public function canMove():Boolean{//может падать
			return type==BlockerType.JELLY;
		}
		public function canDestroyMatch():Boolean{//возможно уничтожить соседним сплешем
			return type==BlockerType.VIENNAWAFFLE||type==BlockerType.HONEY;
		}
		public function canIncrease():Boolean{//может удваиваться
			return type==BlockerType.HONEY;
		}
		public function canDestroyOneinWall():Boolean{//возможно уничтожить только первую из очереди
			return type==BlockerType.JELLY;
		}
		public function canDrag():Boolean{//можем перемещать 
			return type==BlockerType.JELLY;
		}
		
		public function setName(inXMLId:String, inPower:int=1):void{
			mName = inXMLId;
			mPower = inPower;
			switch(mName){
				case "jelly":
					type = BlockerType.JELLY
					break;
				case "vienna_waffle":
					type = BlockerType.VIENNAWAFFLE
					break;
				case "skylight":
					type = BlockerType.SKYLIGHT
					break;
				case "honey":
					type = BlockerType.HONEY
					break;
				case "chocolate":
					type = BlockerType.CHOCOLATE1
					if(mPower==2){
						type = BlockerType.CHOCOLATE2
					}else if(mPower==3){
						type = BlockerType.CHOCOLATE3
					}
					break;
			}
		}
		
		public function getName():String{
			for(var aName:String in mListName)
				if(mListName[aName]==type)
					return aName;
			return "";
		}
		/*public function getJSON():Object{
			
		}*/
		
		public function BlockerVO(inType:int=BlockerType.JELLY)
		{
			type = inType;
			mName = getNameByType(type);
			mPower = 1;
			switch(type){
				case BlockerType.CHOCOLATE1:
					mName = "chocolate"
					break;
				case BlockerType.CHOCOLATE2:
					mName = "chocolate"
					mPower = 2;
					break;
				case BlockerType.CHOCOLATE3:
					mName = "chocolate"
					mPower = 3;
					break;
			}
		}
		
		public function clone():BlockerVO
		{
			var toReturn:BlockerVO = new BlockerVO(this.type);
			return toReturn;
		}		
		
		public function getSource():String
		{
			var str:String = "../assets/blocker"+String(this.type)+".png";
			return str;
		}	
		public function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"4_"+String(this.type), source:getSource()}
				]
			);
		}		
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"4_1", source:"../assets/blocker1.png", label:""},
					{id:"4_2", source:"../assets/blocker2.png", label:""},
					{id:"4_3", source:"../assets/blocker3.png", label:""},
					{id:"4_4", source:"../assets/blocker4.png", label:""},
					{id:"4_5", source:"../assets/blocker5.png", label:""},
					{id:"4_6", source:"../assets/blocker6.png", label:""},
					{id:"4_7", source:"../assets/blocker7.png", label:""}
				]
			);
		}	
		
		static public function getTypeById(id:String):int
		{
			if(!id)
				return -1;
			
			var results:Array = id.split(/_/);
			for(var i:int = 0; i<results.length; i++)
				results[i] = int(results[i]);
			
			if(results[0] != 4)
				return -1;
			if(results[1]>0&&results[1]<8)
				return results[1];
			
			return -1;
		}
		
		static public function createBlockerFromSourceId(id:String):BlockerVO
		{
			var lType:int = getTypeById(id);
			if(lType > -1)
			{
				return new BlockerVO(lType);
			}
			return null;
		}
		
		public static function createDataObjectByName(aName:String):Object
		{
			var lType:int = getTypeByName(aName);
			if (lType > 0)
			{
				return {id:"4_"+ lType, source:"../assets/blocker" + lType + ".png"};
			}
			return null;
		}
		
	}
}