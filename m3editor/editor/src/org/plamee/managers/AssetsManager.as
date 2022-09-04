package org.plamee.managers 
{
	import flash.display.Bitmap;
	import flash.display.DisplayObject;
	
	import mx.controls.Alert;
	import mx.controls.Image;
	import mx.managers.CursorManager;
	import mx.managers.CursorManagerPriority;
	
	import org.plamee.ApplicationFacade;
	import org.plamee.controller.ApplicationStartupCommand;
	import org.plamee.logic.Splash;
	import org.plamee.model.vo.CellVO;
	
	public final class AssetsManager {
		
		private var inited:Boolean = false; 
		private static var instance:AssetsManager = new AssetsManager();

		
		[Embed(source = "/../assets/buttons/errese_up.png")]
		private static var erraseB:Class;		
		
		[Embed(source = "/../assets/buttons/delete_up.png")]
		private static var deleteB:Class;	
		

		[Embed(source = "/../assets/back01.png")]
		private static var cursor:Class;		

		[Embed(source = "/../assets/blocker1.png")]
		private static var blocker1:Class;
		[Embed(source = "/../assets/blocker2.png")]
		private static var blocker2:Class;
		[Embed(source = "/../assets/blocker3.png")]
		private static var blocker3:Class;
		[Embed(source = "/../assets/blocker4.png")]
		private static var blocker4:Class;		
		[Embed(source = "/../assets/blocker5.png")]
		private static var blocker5:Class;		
		[Embed(source = "/../assets/blocker6.png")]
		private static var blocker6:Class;
		[Embed(source = "/../assets/blocker7.png")]
		private static var blocker7:Class;


		[Embed(source = "/../assets/buster1.png")]
		private static var buster1:Class;
		[Embed(source = "/../assets/buster2.png")]
		private static var buster2:Class;
		[Embed(source = "/../assets/buster3.png")]
		private static var buster3:Class;
		[Embed(source = "/../assets/buster4.png")]
		private static var buster4:Class;			
		[Embed(source = "/../assets/buster5.png")]
		private static var buster5:Class;
		[Embed(source = "/../assets/buster6.png")]
		private static var buster6:Class;
		[Embed(source = "/../assets/buster7.png")]
		private static var buster7:Class;
		[Embed(source = "/../assets/buster8.png")]
		private static var buster8:Class;			
		[Embed(source = "/../assets/buster9.png")]
		private static var buster9:Class;		
		
		[Embed(source = "/../assets/arrow.png")]
		private static var arrow:Class;		
		[Embed(source = "/../assets/cellout.png")]
		private static var cellout:Class;		
		
		
		[Embed(source = "/../assets/back0.png")]
		private static var back0:Class;	
		[Embed(source = "/../assets/back000.png")]
		private static var back000:Class;	
		[Embed(source = "/../assets/back1.png")]
		private static var back1:Class;	
		[Embed(source = "/../assets/back_portal_in.png")]
		private static var back2:Class;	
		[Embed(source = "/../assets/back_portal_out.png")]
		private static var back3:Class;	

		[Embed(source = "/../assets/jelly_1.png")]
		private static var jelly1:Class;	
		[Embed(source = "/../assets/jelly_2.png")]
		private static var jelly2:Class;
		
		[Embed(source = "/../assets/PieceIngredient_1.png")]
		private static var ingredient1:Class;		
		[Embed(source = "/../assets/PieceIngredient_2.png")]
		private static var ingredient2:Class;
		[Embed(source = "/../assets/PieceIngredient_3.png")]
		private static var ingredient3:Class;		
		[Embed(source = "/../assets/PieceIngredient_4.png")]
		private static var ingredient4:Class;		

		[Embed(source = "/../assets/PieceSpecial_1.png")]
		private static var special1:Class;	
		[Embed(source = "/../assets/PieceSpecial_2.png")]
		private static var special2:Class;	
		[Embed(source = "/../assets/PieceSpecial_3.png")]
		private static var special3:Class;	
		[Embed(source = "/../assets/PieceRandom.png")]
		private static var specialRandom:Class;			
		
		[Embed(source = "/../assets/PieceColor_1_1.png")]
		private static var piece11:Class;	
		[Embed(source = "/../assets/PieceColor_1_2.png")]
		private static var piece12:Class;	
		[Embed(source = "/../assets/PieceColor_1_3.png")]
		private static var piece13:Class;	
		[Embed(source = "/../assets/PieceColor_1_4.png")]
		private static var piece14:Class;	
		[Embed(source = "/../assets/PieceColor_1_5.png")]
		private static var piece15:Class;

		[Embed(source = "/../assets/PieceColor_2_1.png")]
		private static var piece21:Class;	
		[Embed(source = "/../assets/PieceColor_2_2.png")]
		private static var piece22:Class;	
		[Embed(source = "/../assets/PieceColor_2_3.png")]
		private static var piece23:Class;	
		[Embed(source = "/../assets/PieceColor_2_4.png")]
		private static var piece24:Class;	
		[Embed(source = "/../assets/PieceColor_2_5.png")]
		private static var piece25:Class;

		[Embed(source = "/../assets/PieceColor_3_1.png")]
		private static var piece31:Class;	
		[Embed(source = "/../assets/PieceColor_3_2.png")]
		private static var piece32:Class;	
		[Embed(source = "/../assets/PieceColor_3_3.png")]
		private static var piece33:Class;	
		[Embed(source = "/../assets/PieceColor_3_4.png")]
		private static var piece34:Class;		
		[Embed(source = "/../assets/PieceColor_3_5.png")]
		private static var piece35:Class;

		[Embed(source = "/../assets/PieceColor_4_1.png")]
		private static var piece41:Class;	
		[Embed(source = "/../assets/PieceColor_4_2.png")]
		private static var piece42:Class;	
		[Embed(source = "/../assets/PieceColor_4_3.png")]
		private static var piece43:Class;	
		[Embed(source = "/../assets/PieceColor_4_4.png")]
		private static var piece44:Class;		
		[Embed(source = "/../assets/PieceColor_4_5.png")]
		private static var piece45:Class;

		
		[Embed(source = "/../assets/PieceColor_5_1.png")]
		private static var piece51:Class;	
		[Embed(source = "/../assets/PieceColor_5_2.png")]
		private static var piece52:Class;	
		[Embed(source = "/../assets/PieceColor_5_3.png")]
		private static var piece53:Class;	
		[Embed(source = "/../assets/PieceColor_5_4.png")]
		private static var piece54:Class;			
		[Embed(source = "/../assets/PieceColor_5_5.png")]
		private static var piece55:Class;

		
		[Embed(source = "/../assets/PieceColor_6_1.png")]
		private static var piece61:Class;	
		[Embed(source = "/../assets/PieceColor_6_2.png")]
		private static var piece62:Class;	
		[Embed(source = "/../assets/PieceColor_6_3.png")]
		private static var piece63:Class;	
		[Embed(source = "/../assets/PieceColor_6_4.png")]
		private static var piece64:Class;	
		[Embed(source = "/../assets/PieceColor_6_5.png")]
		private static var piece65:Class;

        [Embed(source = "/../assets/plate_plus_plate.png")]
        private static var plate_plus_plate:Class;
        [Embed(source = "/../assets/plate_plus_rainbow.png")]
        private static var plate_plus_rainbow:Class;
        [Embed(source = "/../assets/rainbow_plus_rainbow.png")]
        private static var rainbow_plus_rainbow:Class;
        [Embed(source = "/../assets/striped_plus_plate.png")]
        private static var striped_plus_plate:Class;
        [Embed(source = "/../assets/striped_plus_rainbow.png")]
        private static var striped_plus_rainbow:Class;
        [Embed(source = "/../assets/striped_plus_striped.png")]
        private static var striped_plus_striped:Class;
		
		[Embed(source = "/../assets/bear_1.png")]
		private static var bear1:Class;	
		[Embed(source = "/../assets/bear_2.png")]
		private static var bear2:Class;	

		private static var bear:Class;	
		
		private var assetsArray:Array;
		

		
		public function AssetsManager() {
			
			if( instance ) throw new Error( "AssetsManager singleton and can only be accessed through LevelManager.getInstance()" ); 
		}
		
		private function init():void
		{
			assetsArray = new Array();
			
			assetsArray["../assets/buttons/errese_up.png"] = erraseB;
			assetsArray["../assets/buttons/delete_up.png"] = deleteB;
			
			assetsArray["../assets/back01.png"] = cursor;

			assetsArray["../assets/blocker1.png"] = blocker1;
			assetsArray["../assets/blocker2.png"] = blocker2;
			assetsArray["../assets/blocker3.png"] = blocker3;
			assetsArray["../assets/blocker4.png"] = blocker4;
			
			assetsArray["../assets/buster1.png"] = buster1;
			assetsArray["../assets/buster2.png"] = buster2;
			assetsArray["../assets/buster3.png"] = buster3;
			assetsArray["../assets/buster4.png"] = buster4;
			assetsArray["../assets/buster5.png"] = buster5;
			assetsArray["../assets/buster6.png"] = buster6;
			assetsArray["../assets/buster7.png"] = buster7;
			assetsArray["../assets/buster8.png"] = buster8;			
			assetsArray["../assets/buster9.png"] = buster9;
				
			assetsArray["../assets/arrow.png"] = arrow;
			assetsArray["../assets/cellout.png"] = cellout;
			
			assetsArray["../assets/back000.png"] = back000;
			assetsArray["../assets/back0.png"] = back0;
			assetsArray["../assets/back1.png"] = back1;
			assetsArray["../assets/back_portal_in.png"] = back2;
			assetsArray["../assets/back_portal_out.png"] = back3;
			
			assetsArray["../assets/jelly_1.png"] = jelly1;
			assetsArray["../assets/jelly_2.png"] = jelly2;
			
			assetsArray["../assets/PieceIngredient_1.png"] = ingredient1;
			assetsArray["../assets/PieceIngredient_2.png"] = ingredient2;
			assetsArray["../assets/PieceIngredient_3.png"] = ingredient3;
			assetsArray["../assets/PieceIngredient_4.png"] = ingredient4;
			
			assetsArray["../assets/PieceSpecial_1.png"] = special1;
			assetsArray["../assets/PieceSpecial_2.png"] = special2;
			assetsArray["../assets/PieceSpecial_3.png"] = special3;
			assetsArray["../assets/PieceRandom.png"] = specialRandom;			
			
			assetsArray["../assets/PieceColor_1_1.png"] = piece11;
			assetsArray["../assets/PieceColor_1_2.png"] = piece12;
			assetsArray["../assets/PieceColor_1_3.png"] = piece13;
			assetsArray["../assets/PieceColor_1_4.png"] = piece14;
			assetsArray["../assets/PieceColor_1_5.png"] = piece15;

			assetsArray["../assets/PieceColor_2_1.png"] = piece21;
			assetsArray["../assets/PieceColor_2_2.png"] = piece22;
			assetsArray["../assets/PieceColor_2_3.png"] = piece23;
			assetsArray["../assets/PieceColor_2_4.png"] = piece24;
			assetsArray["../assets/PieceColor_2_5.png"] = piece25;

			assetsArray["../assets/PieceColor_3_1.png"] = piece31;
			assetsArray["../assets/PieceColor_3_2.png"] = piece32;
			assetsArray["../assets/PieceColor_3_3.png"] = piece33;
			assetsArray["../assets/PieceColor_3_4.png"] = piece34;
			assetsArray["../assets/PieceColor_3_5.png"] = piece35;

			assetsArray["../assets/PieceColor_4_1.png"] = piece41;
			assetsArray["../assets/PieceColor_4_2.png"] = piece42;
			assetsArray["../assets/PieceColor_4_3.png"] = piece43;
			assetsArray["../assets/PieceColor_4_4.png"] = piece44;
			assetsArray["../assets/PieceColor_4_5.png"] = piece45;

			assetsArray["../assets/PieceColor_5_1.png"] = piece51;
			assetsArray["../assets/PieceColor_5_2.png"] = piece52;
			assetsArray["../assets/PieceColor_5_3.png"] = piece53;
			assetsArray["../assets/PieceColor_5_4.png"] = piece54;
			assetsArray["../assets/PieceColor_5_5.png"] = piece55;

			assetsArray["../assets/PieceColor_6_1.png"] = piece61;
			assetsArray["../assets/PieceColor_6_2.png"] = piece62;
			assetsArray["../assets/PieceColor_6_3.png"] = piece63;
			assetsArray["../assets/PieceColor_6_4.png"] = piece64;
			assetsArray["../assets/PieceColor_6_5.png"] = piece65;

            assetsArray["../assets/plate_plus_plate.png"] = plate_plus_plate;
            assetsArray["../assets/plate_plus_rainbow.png"] = plate_plus_rainbow;
            assetsArray["../assets/rainbow_plus_rainbow.png"] = rainbow_plus_rainbow;
            assetsArray["../assets/striped_plus_plate.png"] = striped_plus_plate;
            assetsArray["../assets/striped_plus_rainbow.png"] = striped_plus_rainbow;
            assetsArray["../assets/striped_plus_striped.png"] = striped_plus_striped;

			assetsArray["../assets/bear_1.png"] = bear1;
			assetsArray["../assets/bear_2.png"] = bear2;
			
			for(var aStr:String in assetsArray){
				assetsArray[aStr] = (new assetsArray[aStr]() as Bitmap).bitmapData;
			}
		}
		
		public static function getInstance():AssetsManager {
			
			if(instance.inited == false)
			{
				instance.init();
				instance.inited = true;
			}
			return instance;
			
		}
		
		public function getImageClass(source:String):*
		{
			if(assetsArray != null && assetsArray[source] != null){
				return new Bitmap(assetsArray[source]);
			}
			
			trace("non chached file:"+source);
			
			return source;
		}
		
		
	}	
	
}

