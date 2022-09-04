package org.plamee.model.vo{
	import mx.collections.ArrayCollection;

	public class PieceTeapotVO extends PieceVO{
		public var type			:int=0;
		public var rotation		:int=0;

		public var count		:int=0;
		public var max			:int=0;
		
		public function PieceTeapotVO(inType:int=0, inRotation:int=0){
			super();
			type = inType;
			rotation = inRotation;
		}
		
		override public function clone():PieceVO{
			return new PieceTeapotVO(type, rotation);
		}
		
		public function setType(inName:String):void{
			type = getTypeByName(inName);
		}
		
		static public function getTypeByName(inName:String):int
		{
			var aList:Object = {
				"bw":0,
				"blue":1, 
				"green":2, 
				"red":3, 
				"pink":4, 
				"yellow":5, 
				"orange":6
			};
			return aList[inName];
		}
		
		public function getColorName():String{
			var aList:Object = {
				"0":"bw",
				"1":"blue", 
				"2":"green", 
				"3":"red", 
				"4":"pink", 
				"5":"yellow", 
				"6":"orange"
			};
			return aList[type]; 
		}
		
		override public function getSource():String{
			var str:String = "../assets/PieceTeapot_";
			str+=String(this.type)+".png";
			return str;
		}			
		
		public static function getAllSource():ArrayCollection{
			return new ArrayCollection(
				[
					{id:"7_0", source:"../assets/PieceTeapot_0.png"},
					{id:"7_1", source:"../assets/PieceTeapot_1.png"},
					{id:"7_2", source:"../assets/PieceTeapot_2.png"},
					{id:"7_3", source:"../assets/PieceTeapot_3.png"},
					{id:"7_4", source:"../assets/PieceTeapot_4.png"},
					{id:"7_5", source:"../assets/PieceTeapot_5.png"},
					{id:"7_6", source:"../assets/PieceTeapot_6.png"}
				]
			);
		}
		
		public static function createDataObjectByName(aName:String):Object{
			var lType:int = getTypeByName(aName);
			return {id:"7_" + lType, source:"../assets/PieceTeapot_" + lType + ".png", label:""};
		}
		static public function createPieceFromSourceId(id:String):PieceTeapotVO{
			if(!id)
				return null;
			
			var results:Array = id.split(/_/);
			for(var i:int = 0; i<results.length; i++)
				results[i] = int(results[i]);
			
			if(results[0] != 7)
				return null;
			
			return new PieceTeapotVO(results[1]);
		}

	}
}