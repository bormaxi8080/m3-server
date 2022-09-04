package org.plamee.logic{
	import flash.geom.Point;
	
	import org.plamee.model.vo.*;

	public class CombinationPiece{
		private var mCells:Vector.<Vector.<int>>;
		private var mCellsTime:Vector.<Vector.<int>>;
		private var mFigures:Vector.<Vector.<Point>>;
		
		private var mAVecPoint:Vector.<Point>;
		public function CombinationPiece(inSplash: Vector.<ShapeSplashVO>):void{
			createFigure();
			
			mCells = new Vector.<Vector.<int>>(9,true);
			mCellsTime = new Vector.<Vector.<int>>(9,true);
			for(var a:int=0;a<9;a++){
				mCells[a]=(new Vector.<int>(9,true));
				mCellsTime[a]=(new Vector.<int>(9,true));
				for(var b:int=0;b<9;b++){
					mCells[a][b] = 0;
					mCellsTime[a][b] = 0;
				}
			}
			for each(var aSSVO:ShapeSplashVO in inSplash){
				for each(var aCell:CellVO in aSSVO.mArray){
					var aPieceColorVO:PieceColorVO = aCell.pieceReference as PieceColorVO;
					if(aPieceColorVO){
						mCells[aCell.mX][aCell.mY]=aPieceColorVO.type;
						mCellsTime[aCell.mX][aCell.mY]=aPieceColorVO.mCanvas.getTime();
					}
				}
			}
		}
		
		private function addPoint(inX:int, inY:int):void{
			mAVecPoint.push(new Point(inX, inY));
		}
		
		private function createFigure():void{
			mFigures = new Vector.<Vector.<Point>>();
			mAVecPoint = new Vector.<Point>();
			addPoint(0,2);addPoint(0,1);addPoint(0,0);addPoint(1,0);addPoint(2,0);
			mFigures.push(mAVecPoint);
			
			mAVecPoint = new Vector.<Point>();
			addPoint(0,0);addPoint(1,0);addPoint(2,0);addPoint(3,0);addPoint(4,0);
			mFigures.push(mAVecPoint);
			
			mAVecPoint = new Vector.<Point>();
			addPoint(0,0);addPoint(1,0);addPoint(2,0);addPoint(3,0);
			mFigures.push(mAVecPoint);
			
			mAVecPoint = new Vector.<Point>();
			addPoint(0,0);addPoint(1,0);addPoint(2,0);
			mFigures.push(mAVecPoint);
		}
		
		private function getNotNull(inX:int, inY:int):int{
			if(inX<0||inY<0||inX>8||inY>8) return 0;
			return mCells[inX][inY];
		}
		private function canFigure(inFigure:Vector.<Point>, inX:int, inY:int, inRotation:int, inRead:Boolean=true):Boolean{
			for each(var aPoint:Point in inFigure){
				var aX=aPoint.x;
				var aY=aPoint.y;
				if(inRotation==1){
					aX=-aPoint.x;
					aY=aPoint.y;
				}else if(inRotation==2){
					aY=aPoint.x;
					aX=aPoint.y;
				}else if(inRotation==3){
					aY=-aPoint.x;
					aX=aPoint.y;
				}
				if(inRead){
					if(getNotNull(inX+aX, inY+aY)!=mCells[inX][inY]||mCells[inX][inY]==0) 
						return false;
				}else{
					mCells[inX+aX][inY+aY]=0;
				}
			}
			return true;
		}
		private function getPointLast(inFigure:Vector.<Point>, inX:int, inY:int, inRotation:int):Point{
			var aTime:int = 100;
			var aNewPoint:Point = new Point(inFigure[0].x, inFigure[0].y);
			for each(var aPoint:Point in inFigure){
				var aX=aPoint.x;
				var aY=aPoint.y;
				if(inRotation==1){
					aX=-aPoint.x;
					aY=aPoint.y;
				}else if(inRotation==2){
					aY=aPoint.x;
					aX=aPoint.y;
				}else if(inRotation==3){
					aY=-aPoint.x;
					aX=aPoint.y;
				}
				
				var aT:int = mCellsTime[inX+aX][inY+aY];
				if(aT<aTime){
					aTime=aT;
					aNewPoint = new Point(inX+aX, inY+aY);
				}
			}
			return aNewPoint;
		}
		
		public function getCombinationPoint():Vector.<Vector.<Object>>{
			var aComFigures:Vector.<Vector.<Object>> = new Vector.<Vector.<Object>>();
			for each(var aFigure:Vector.<Point> in mFigures){
				var aComFigure:Vector.<Object> = new Vector.<Object>();
				
				for(var a:int=0;a<9;a++)for(var b:int=0;b<9;b++){
					for(var aRot:int=0;aRot<4;aRot++){
						if(canFigure(aFigure, a, b, aRot)){
							var aPoint:Point = getPointLast(aFigure, a, b, aRot);
							aComFigure.push({x:aPoint.x, y:aPoint.y, type:mCells[a][b], rotate:aRot});
							canFigure(aFigure, a, b, aRot, false);
						}
					}
				}
				aComFigures.push(aComFigure);
			}
			return aComFigures;
		}
	}
}