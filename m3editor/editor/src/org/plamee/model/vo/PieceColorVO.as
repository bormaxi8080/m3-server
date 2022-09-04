package org.plamee.model.vo
{
	import flashx.textLayout.elements.BreakElement;
	
	import mx.collections.ArrayCollection;
	
	import org.plamee.model.inums.PieceColorProperty;

	public class PieceColorVO extends PieceVO
	{
		public var type:int;
		public var property:int;
		
		public override function setActive(inState:int):void{
			super.setActive(inState);
			mLive = 2;
		}
		public function PieceColorVO(type:int=1, property:int=PieceColorProperty.REGULAR)
		{
			super();
			this.type = type;
			this.property = property;
		}
		
		override public function getCrashScore():int{
			var aScore:int=75;
			switch(property){
				case PieceColorProperty.HORIZONTAL_STRIPES:
					//aScore+=400;
					break;
				case PieceColorProperty.VERTICAL_STRIPES:
					//aScore+=400;
					break;
				case PieceColorProperty.PACKED:
					//aScore+=400;
					break;
			}
			return aScore;
		}
		override public function getBuildScore():int{
			switch(property){
				case PieceColorProperty.HORIZONTAL_STRIPES:
					return 150;
					break;
				case PieceColorProperty.VERTICAL_STRIPES:
					return 150;
					break;
				case PieceColorProperty.PACKED:
					return 245;
					break;
			}
			return 0;
		}
		override public function clone():PieceVO
		{
			var toReturn:PieceColorVO = new PieceColorVO(this.type, this.property);
			return toReturn;
		}
		
		public function setType(inName:String):void
		{
			type = getTypeByName(inName);
		}
			
		static public function getTypeByName(inName:String):int
		{
			var aList:Object = {
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
				"1":"blue", 
				"2":"green", 
				"3":"red", 
				"4":"pink", 
				"5":"yellow", 
				"6":"orange"
			};
			return aList[type]; 
		}
		
		public function setPower(inXMLId:String):void{
			var aList:Object = {
				"NONE":1, 
				"BLAST_3X3":2, 
				"LINE_H":3, 
				"LINE_V":4, 
				"SPATULA":5, 
				"MULTICOLOR":6, 
				"EXTRATIME":7 
			};
			if(aList.hasOwnProperty(inXMLId)==false)
				property = 1;
			else
				property = aList[inXMLId]; 
		}
		
		public function getPower():String{
			var aList:Object = {
				"1":"NONE", 
				"2":"BLAST_3X3", 
				"3":"LINE_H", 
				"4":"LINE_V", 
				"5":"SPATULA", 
				"6":"MULTICOLOR",
				"7":"EXTRATIME"
			};
			return aList[property]; 
		}
		
		override public function getSource():String
		{
			if(this.property==7){
				return "../assets/"+getColorName()+"_plus5.png";
			}
			var str:String = "../assets/PieceColor_";
			str+=String(this.type)+"_"+String(this.property)+".png";
			return str;
		}			
		
		public static function getRandomType():int
		{
			var toReturn:int = int(Math.round(Math.random()*6)+1);
			return toReturn;
		}
		
		public static function getRegularSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"3_1_1", source:"../assets/PieceColor_1_1.png", label:""},
					{id:"3_2_1", source:"../assets/PieceColor_2_1.png", label:""},
					{id:"3_3_1", source:"../assets/PieceColor_3_1.png", label:""},
					{id:"3_4_1", source:"../assets/PieceColor_4_1.png", label:""},
					{id:"3_5_1", source:"../assets/PieceColor_5_1.png", label:""},
					{id:"3_6_1", source:"../assets/PieceColor_6_1.png", label:""}
				]
			);
		}		
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"3_1_1", source:"../assets/PieceColor_1_1.png", label:""},
					{id:"3_1_2", source:"../assets/PieceColor_1_2.png", label:""},
					{id:"3_1_3", source:"../assets/PieceColor_1_3.png", label:""},
					{id:"3_1_4", source:"../assets/PieceColor_1_4.png", label:""},						
					{id:"3_1_5", source:"../assets/PieceColor_1_5.png", label:""},						
					{id:"3_1_7", source:"../assets/blue_plus5.png", label:""},						
					{id:"3_2_1", source:"../assets/PieceColor_2_1.png", label:""},
					{id:"3_2_2", source:"../assets/PieceColor_2_2.png", label:""},
					{id:"3_2_3", source:"../assets/PieceColor_2_3.png", label:""},
					{id:"3_2_4", source:"../assets/PieceColor_2_4.png", label:""},												
					{id:"3_2_5", source:"../assets/PieceColor_2_5.png", label:""},						
					{id:"3_2_7", source:"../assets/green_plus5.png", label:""},						
					{id:"3_3_1", source:"../assets/PieceColor_3_1.png", label:""},
					{id:"3_3_2", source:"../assets/PieceColor_3_2.png", label:""},
					{id:"3_3_3", source:"../assets/PieceColor_3_3.png", label:""},
					{id:"3_3_4", source:"../assets/PieceColor_3_4.png", label:""},						
					{id:"3_3_5", source:"../assets/PieceColor_3_5.png", label:""},						
					{id:"3_3_7", source:"../assets/red_plus5.png", label:""},						
					{id:"3_4_1", source:"../assets/PieceColor_4_1.png", label:""},
					{id:"3_4_2", source:"../assets/PieceColor_4_2.png", label:""},
					{id:"3_4_3", source:"../assets/PieceColor_4_3.png", label:""},
					{id:"3_4_4", source:"../assets/PieceColor_4_4.png", label:""},												
					{id:"3_4_5", source:"../assets/PieceColor_4_5.png", label:""},						
					{id:"3_4_7", source:"../assets/pink_plus5.png", label:""},						
					{id:"3_5_1", source:"../assets/PieceColor_5_1.png", label:""},
					{id:"3_5_2", source:"../assets/PieceColor_5_2.png", label:""},
					{id:"3_5_3", source:"../assets/PieceColor_5_3.png", label:""},
					{id:"3_5_4", source:"../assets/PieceColor_5_4.png", label:""},												
					{id:"3_5_5", source:"../assets/PieceColor_5_5.png", label:""},						
					{id:"3_5_7", source:"../assets/yellow_plus5.png", label:""},						
					{id:"3_6_1", source:"../assets/PieceColor_6_1.png", label:""},
					{id:"3_6_2", source:"../assets/PieceColor_6_2.png", label:""},
					{id:"3_6_3", source:"../assets/PieceColor_6_3.png", label:""},
					{id:"3_6_4", source:"../assets/PieceColor_6_4.png", label:""},	
					{id:"3_6_5", source:"../assets/PieceColor_6_5.png", label:""},						
					{id:"3_6_7", source:"../assets/orange_plus5.png", label:""}						
				]
			);
		}
		
		public static function createDataObjectByName(aName:String):Object
		{
			var lType:int = getTypeByName(aName);
			if (lType > 0)
			{
				return {id:"3_" + lType + "_1", source:"../assets/PieceColor_" + lType + "_1.png", label:""};
			}
			return null;
		}
	}
}