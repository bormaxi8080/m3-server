package org.plamee.logic{
	import org.plamee.model.vo.PiecePastryBagVO;
	import org.plamee.model.vo.PieceRainbowCupcakeVO;
	import org.plamee.model.vo.PieceColorVO;
	import org.plamee.model.vo.PieceVO;
	
	public class SwapPiece{
		static public var SIMPLE:int = 1;
		static public var BOX:int = 2;
		static public var VER:int = 3;
		static public var GOR:int = 4;
		static public var BOMB:int = 5;
		static public var WHEEL:int = 6;
		
		private var mPiece1:PieceVO;
		private var mPiece2:PieceVO;
		public function SwapPiece(inPiece1:PieceVO, inPiece2:PieceVO){
			mPiece1=inPiece1;
			mPiece2=inPiece2;
		}
		public function isType(inPiece:PieceVO, inType:int):Boolean{
			switch(inType){
				case SIMPLE:
					return (inPiece is PieceColorVO&&(inPiece as PieceColorVO).property==1);
					break;
				case BOX:
					return (inPiece is PieceColorVO&&(inPiece as PieceColorVO).property==2);
					break;
				case VER:
					return (inPiece is PieceColorVO&&(inPiece as PieceColorVO).property==3);
					break;
				case GOR:
					return (inPiece is PieceColorVO&&(inPiece as PieceColorVO).property==4);
					break;
				case BOMB:
					return (inPiece is PieceRainbowCupcakeVO);
					break;
				case WHEEL:
					return (inPiece is PiecePastryBagVO);
					break;
			}
			return false;
		}
		public function isConf(inType1:int, inType2:int):Boolean{
			if(isType(mPiece1, inType1)&&isType(mPiece2, inType2)) return true;
			if(isType(mPiece1, inType2)&&isType(mPiece2, inType1)) return true;
			return false;
		}
	}
}