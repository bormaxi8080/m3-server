package org.plamee.logic{
	import org.plamee.model.vo.*;
	import org.plamee.model.vo.ShapeSplashVO;
	public class Splash{
		private var mArray:Vector.<Vector.<CellVO>> = null;
		public function Splash(inArray:Vector.<Vector.<CellVO>>){
			mArray = inArray;
		}
		
		private function getTypeMach(inA:int, inB:int, inType:int):CellVO{
			if(inA>=mArray.length||inB>=mArray[0].length||inA<0||inB<0) return null;
			if(mArray[inA][inB].blockerRefernce&&mArray[inA][inB].blockerRefernce.getInMatch()==false) return null;
			var aPC:PieceColorVO = mArray[inA][inB].pieceReference as PieceColorVO;
			if(aPC&&aPC.type==inType&&aPC.mGrounded) return mArray[inA][inB];
			return null;
		}
		public function get3Mach():Vector.<ShapeSplashVO>{
			var aVSS:Vector.<ShapeSplashVO> = new Vector.<ShapeSplashVO>();
			for(var a:int=0;a<mArray.length;a++)
				for(var b:int=0;b<mArray[0].length;b++){
					var aPC:PieceColorVO = mArray[a][b].pieceReference as PieceColorVO;
					if(aPC&&aPC.mGrounded){
						var aNewSS:ShapeSplashVO = new ShapeSplashVO();
						aNewSS.mArray.push(mArray[a][b]);
						var aDx:int=-1;
						while(getTypeMach(a+aDx,b,aPC.type)!=null){
							aNewSS.mArray.push(mArray[a+aDx][b]);
							aDx--;
						}
						if(aNewSS.mArray.length>=3) aVSS.push(aNewSS);
						
						aNewSS = new ShapeSplashVO();
						aNewSS.mArray.push(mArray[a][b]);
						aDx=-1;
						while(getTypeMach(a,b+aDx,aPC.type)!=null){
							aNewSS.mArray.push(mArray[a][b+aDx]);
							aDx--;
						}
						if(aNewSS.mArray.length>=3) aVSS.push(aNewSS);
						
					}
				}
			return aVSS;
		}
		
		public static function getSimpleSplash(inArray:Vector.<Vector.<CellVO>>):Vector.<ShapeSplashVO>{
			var aSplash:Splash = new Splash(inArray);
			return aSplash.get3Mach();
		}
	}
}