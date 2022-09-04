package org.plamee.model.vo
{
	import mx.containers.Canvas;

import org.plamee.model.vo.PieceSpecialCombinationVO;

import org.plamee.view.components.GamePieceCanvas;

	public class PieceVO
	{
		public var mGrounded:Boolean = true;
		public var mCanvas:GamePieceCanvas = null;
		public var mCanSplash:Boolean = true;
		
		protected var mState:int=0;
		public var mLive:int = 1;
		
		public function PieceVO()
		{
		}
		
		public function getCrashScore():int{
			return 75;
		}
		public function getBuildScore():int{
			return 0;
		}
		
		public function setActive(inState:int):void{
			mCanSplash=false;
			mState = inState;
			mLive = 1;
		}
		public function getActive():Boolean{
			mLive--;
			return mLive<=0;
		}
		
		public function clone():PieceVO
		{
			var toReturn:PieceVO = new PieceVO();
			return toReturn;
		}
		
		public function getSource():String
		{
			var str:String = "";
			return str;
		}
		
		public function isIngredient():Boolean{
			return false;
		}
		
		public function getName():String{
			if(this is PiecePastryBagVO){
				return "pastry_bag";
			}else if(this is PieceRainbowCupcakeVO){
				return "rainbow_cupcake";
			}else if(this is PieceSpatulaVO){
				return "spatula";
			}else if(this is PieceBlueberryVO){
				return "blueberry";
			}else if(this is PieceRaspberryVO){
				return "raspberry";
			}else if(this is PieceStrawberryVO){
				return "strawberry";
			}else if(this is PiecePhysalisVO){
				return "physalis";
			}else if(this is PieceRandomVO){
				return "random";
			}else if(this is PieceTeapotVO){
				return "teapot";
			}else if(this is PieceColorVO){
				return (this as PieceColorVO).getColorName();
			}
			return "";
		}
		public function getType():String{
			if(this is PiecePastryBagVO){
				return "7";
			}else if(this is PieceRainbowCupcakeVO){
				return "8";
			}else if(this is PieceBlueberryVO){
				return "9";
			}else if(this is PieceRaspberryVO){
				return "10";
			}else if(this is PieceStrawberryVO){
				return "11";
			}else if(this is PiecePhysalisVO){
				return "12";
			}else if(this is PieceSpatulaVO){
				return "13";
			}else if(this is PieceRandomVO){
				return "14";
			}else if(this is PieceTeapotVO){
				return "15";
			}
			return "";
		}

		static public function createPieceFromName(inName:String):PieceVO{
			switch (inName){
				case "pastry_bag":
					return new PiecePastryBagVO();
					break;
				case "rainbow_cupcake":
					return new PieceRainbowCupcakeVO();
					break;
				case "spatula":
					return new PieceSpatulaVO();
					break;
				case "blueberry":
					return new PieceBlueberryVO();
					break;
				case "raspberry":
					return new PieceRaspberryVO();
					break;
				case "strawberry":
					return new PieceStrawberryVO();
					break;
				case "physalis":
					return new PiecePhysalisVO();
					break;
				case "random":
					return new PieceRandomVO();
					break;
				case "teapot":
					return new PieceTeapotVO();
					break;
				default:
					return null;
			}
		}
		
		static public function createPieceFromSourceId(id:String):PieceVO
		{
			if(!id)
				return null;
			
			var results:Array = id.split(/_/);
			for(var i:int = 0; i<results.length; i++)
				results[i] = int(results[i]);
			
            if (results[0] == 15) {
                return new PieceSpecialCombinationVO(id);
            }

			if(results[0] != 3)
				return null;


			if(results[1] <= 0)
				return null;
			
			
			if(results[1]<7)
			{
				if(results[2] <=0)
					return null;
				
				return new PieceColorVO(results[1], results[2]);
			}
			else
			{
				switch (results[1])
				{
					case 7:
						return new PiecePastryBagVO();
						break;
					case 8:
						return new PieceRainbowCupcakeVO();
						break;
					case 9:
						return new PieceBlueberryVO();
						break;
					case 10:
						return new PieceRaspberryVO();
						break;
					case 11:
						return new PieceStrawberryVO();
						break;
					case 12:
						return new PiecePhysalisVO();
						break;
					case 13:
						return new PieceSpatulaVO();
						break;
					case 14:
						return new PieceRandomVO();
						break;
					case 15:
						return new PieceTeapotVO();
						break;
					default:
						return null;
				}
			}
			return null;
		}		
	}
}