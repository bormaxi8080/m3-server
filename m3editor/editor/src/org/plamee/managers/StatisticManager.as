package org.plamee.managers{
	import mx.containers.Canvas;
	import mx.controls.Label;
	
	public class StatisticManager{
		var mCanvas:Canvas = null;
		
		var mVars:Object = new Object();
		var mVarsCanvas:Object = new Object();
		
		public function StatisticManager(inCanvasStatistic:Canvas){
			mCanvas = inCanvasStatistic;
			mCanvas.removeAllChildren();
		}
		public function setVars(inName:String, inVal:int):void{
			mVars[inName]=inVal;
			refresh();
		}
		public function setHasVars(inName:String, inVal:int):void{
			if(!mVars.hasOwnProperty(inName)) {
				refresh();
				return;
			}
			mVars[inName]=inVal;
			refresh();
		}
		public function getVars(inName:String):int{
			if(!mVars.hasOwnProperty(inName)) return 0;
			return mVars[inName];
		}
		public function addVars(inName:String, inVal:int = 1):void{
			if(!mVars.hasOwnProperty(inName)) return;
			mVars[inName]+=inVal;
			refresh();
		}
		public function refresh():void{
			var aCount:int = 0;
			for(var aStr:String in mVars){
				if(!mVarsCanvas.hasOwnProperty(aStr)){
					mVarsCanvas[aStr] = new Label();
					mCanvas.addChild(mVarsCanvas[aStr]);
				}
				var aLabel:Label = mVarsCanvas[aStr] as Label;
				aLabel.text = aStr+":"+mVars[aStr];
				aLabel.x=aCount;
				aCount+=aLabel.width;
			}
		}
	}
}