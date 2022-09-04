package org.plamee.managers{
	import flash.events.TimerEvent;
	import flash.geom.Point;
	import flash.utils.Timer;
	
	import mx.collections.ArrayCollection;
	import mx.containers.Canvas;
	
	import org.plamee.logic.*;
	import org.plamee.model.inums.BlockerType;
	import org.plamee.model.inums.CellType;
	import org.plamee.model.inums.JellyType;
	import org.plamee.model.inums.StatisticType;
	import org.plamee.model.vo.*;
	import org.plamee.model.vo.CellVO;
	import org.plamee.model.vo.PieceVO;
	import org.plamee.model.vo.ShapeSplashVO;
	import org.plamee.view.components.CellViewCanvas;
	import org.plamee.view.components.GameCellCanvas;
	import org.plamee.view.components.GamePieceCanvas;
	
	public final class GameFieldManager{
		private static var mInstance:GameFieldManager = null;
		
		private var delay:uint = 20;
		private var repeat:uint = 0;
		private var mTimer:Timer = new Timer(delay, repeat);
		
		public var mCells:Vector.<Vector.<CellVO>>;
		private var mRespawnVector:Vector.<CellVO>;
		
		private var mChipsCanvas:Canvas;
		private var mDropItems:Array;
		
		private var mNeedTurnBlocker:Boolean=false;
		private var mMyTurn:Boolean = true;
		
		private var mLastPieceInitialize:int = 1;
		
		private var mStable:Boolean=true;
		private var mStatisticManager:StatisticManager = null;
		private var mArrayGoalIngridients:Object;
		
		private var mTime:int=0;
		
		private var mScore:int=0;
		
		private var mScoreCombo:int=1;
		
		private var mTurnStorage:TurnsStorage = null;
				
		public function getCell(inA:int, inB:int):CellVO{
			if(inA>=Match3Editor.BOARD_WIDTH||inB>=Match3Editor.BOARD_HEIGHT||inA<0||inB<0) return null;
			return mCells[inA][inB];
		}
		
		public function GameFieldManager(){
			mInstance = this;
			mTimer.addEventListener(TimerEvent.TIMER, update);
		}
		
		//-----------------------заполняет пустые клетки рандомно из DropStatistics без сплешей
		public function fillEmptyCells():Boolean{
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=Match3Editor.BOARD_HEIGHT-1;b>=0;b--){
				var aCell:CellVO = mCells[a][b];
				if(aCell.pieceReference&&aCell.pieceReference is PieceRandomVO){
					mChipsCanvas.removeChild(aCell.pieceReference.mCanvas);
					aCell.pieceReference=null;
					if(CellVO.isFree(aCell)){
					var aGamePieceCanvas:GamePieceCanvas = setDropStatistics(aCell, false);
					var aTray:int=50;
					while(Splash.getSimpleSplash(mCells).length>0){
						aTray--;
						if(aTray<=0) {
							return false;
						}
						mChipsCanvas.removeChild(aGamePieceCanvas);
						aGamePieceCanvas.mCellVO.blockerRefernce=null;
						aGamePieceCanvas.mCellVO.pieceReference=null;
						aGamePieceCanvas = setDropStatistics(aCell, false);
					}}
				}
			}
			return true;
		}
		
		static public function addScore(inScore:int):void{
			getInstance().mScore+=(inScore*getInstance().mScoreCombo);
			GameFieldManager.getStat().addVars(StatisticType.SCORE,(-inScore*getInstance().mScoreCombo));
		}
		static public function getStable():Boolean{
			return getInstance().mStable;
		}
		
		static public function getStat():StatisticManager{
			return getInstance().mStatisticManager;
		}
		static public function setMove():void{
			getInstance().mNeedTurnBlocker=true;
			getInstance().mMyTurn=true;
		}
		public function setCanvasStatistic(inCanvasStatistic:Canvas):void{
			mStatisticManager = new StatisticManager(inCanvasStatistic);
		}
		public function setSpawnPiece(inArray:ArrayCollection):void{
			mArrayGoalIngridients = new Object();
			for(var a=0;a<inArray.length;a++){
				if(int(inArray[a].frequency)>0){
					var aPieceVO:PieceVO = PieceVO.createPieceFromSourceId(inArray[a].id);
					GameFieldManager.getStat().setVars(StatisticType.INGREDIENT+aPieceVO.getName(),int(inArray[a].number));
					mArrayGoalIngridients[aPieceVO.getName()]={name:aPieceVO.getName(), freq:int(inArray[a].frequency), num:int(inArray[a].number)};
				}
			}
		}
		
		
		public function setGo():Boolean{
			if(!fillEmptyCells()) return false;
			mTimer.start();
			mTime=0;
			return true;
		}
		
		public function setStop():void{
			mTimer.stop();
		}
		
		public static function getInstance():GameFieldManager{
			if(!mInstance) new GameFieldManager();
			return mInstance;
		}
		
		public function setChipsCanvas(inChipsCanvas:Canvas):void{
			mChipsCanvas = inChipsCanvas;
		}
		public function setDropItem(inArray:Array):void{
			mDropItems = inArray;
		}
		
		public function setLevelField(inArray:Array):void{
			mTurnStorage = new TurnsStorage();
			mCells = getVectorLevelField(inArray);
		}
		public function preStart():void{ 
			createRespawn();
			createGraph();
			reDrawCells();
		}
		public function reDrawCells():void{
			mChipsCanvas.removeAllChildren();
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++){
				var aCellVO:CellVO = mCells[a][b];
				aCellVO.mX=a;
				aCellVO.mY=b;
				var aCell:GameCellCanvas = new GameCellCanvas();
				aCell.x = Match3Editor.CELL_WIDTH*a;
				aCell.y = Match3Editor.CELL_HEIGHT*(-b);
				mChipsCanvas.addChild(aCell);
				aCell.setCellVO(aCellVO);
				if(aCellVO.jellyReference) Match3Editor.addChips(a,b,0,mChipsCanvas,aCellVO);
			}
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++){
				var aCellVO:CellVO = mCells[a][b];
						
				if(aCellVO.pieceReference) Match3Editor.addChips(a,b,1,mChipsCanvas,aCellVO);
				if(aCellVO.blockerRefernce) Match3Editor.addChips(a,b,2,mChipsCanvas,aCellVO);
			}
		}
		public function backTurn():void{
			mTurnStorage.pop();
			if(mTurnStorage.last()!=null){
				mCells = mTurnStorage.last();
				preStart();
			}
		}
		
		
		
		public static function getVectorLevelField(inArray:Array):Vector.<Vector.<CellVO>>{
			var aCells:Vector.<Vector.<CellVO>> = new Vector.<Vector.<CellVO>>(Match3Editor.BOARD_WIDTH,true);
			
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++){
				aCells[a]=(new Vector.<CellVO>(Match3Editor.BOARD_HEIGHT,true));
				for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++)
					aCells[a][b] = (inArray[a][b] as CellViewCanvas).cellVO.clone();
			}
			return aCells;
		}
		
		private function getCellNotNull(a:int, b:int, inDown:Boolean=true):CellVO{
			if(a>=Match3Editor.BOARD_WIDTH||b>=Match3Editor.BOARD_HEIGHT||a<0||b<0) return null;
			var aCell:CellVO = mCells[a][b];
			/*if(aCell.blockerRefernce&&aCell.blockerRefernce.canMove()==false){
				return null;
			}*/
			
			if(aCell.type==CellType.EMPTY){
				if(inDown)
					return getCellNotNull(a, b-1);
				else
					return null;
			}
			
			return aCell;
		}
		
		private function getCellPostalOut(inPortalNum:int):CellVO{
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)
				for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++)
					if(mCells[a][b].portalConnectionNum==inPortalNum&&mCells[a][b].type==CellType.PORTAL_OUT)
						return mCells[a][b];
			return null;
		}
		
		public function createGraph():Boolean{
			var aResult:Boolean = true;
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++){
				var aCell:CellVO = mCells[a][b];
				aCell.bootmReference = null;
				aCell.leftBottomReference = null;
				aCell.rightBottomReference = null;
				aCell.mParent = null;
			}
			
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=8;b>=0;b--){
				var aCell:CellVO = mCells[a][b];
				if(aCell.type==CellType.PORTAL_IN){
					aCell.bootmReference = getCellPostalOut(aCell.portalConnectionNum);
					aCell.leftBottomReference = null;
					aCell.rightBottomReference = null;
				}else if(aCell.type>CellType.EMPTY/*&&!(aCell.blockerRefernce&&aCell.blockerRefernce.canMove()==false)*/){
					aCell.bootmReference = getCellNotNull(a, b-1, true);
					aCell.leftBottomReference = getCellNotNull(a-1, b-1, false);
					aCell.rightBottomReference = getCellNotNull(a+1, b-1, false);
					if(aCell.mOutIngredient==false&&!aCell.bootmReference&&!aCell.leftBottomReference&&!aCell.rightBottomReference){
						aResult=false;
					}
				}
				aCell.setParent();
			}
			return aResult;
		}
		
		private function createRespawn():void{
			mRespawnVector = new Vector.<CellVO>();
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++){
				var aCell:CellVO = mCells[a][b];
				if(aCell.respawnRefence!=null)
					mRespawnVector.push(aCell);
			}
		}
		private function setDropStatistics(inCell:CellVO, inIngredient:Boolean = true):GamePieceCanvas{
			var aSID:String = getNextDropItem(inIngredient);
			var aPiece:GamePieceCanvas = new GamePieceCanvas();
			aPiece.setPosition(Match3Editor.CELL_WIDTH*inCell.mX, Match3Editor.CELL_HEIGHT*(inCell.mY));
			mChipsCanvas.addChild(aPiece);
			if(aSID.substr(0,1)=="3"){//piece
				var aPieceVO:PieceVO = PieceVO.createPieceFromSourceId(aSID);
				aPieceVO.mCanvas = aPiece;
				inCell.pieceReference = aPieceVO;
				aPiece.setCellVO(inCell, 1);
			}else if(aSID.substr(0,1)=="4"){//blocker
				var aBlockerVO:BlockerVO = BlockerVO.createBlockerFromSourceId(aSID);
				aBlockerVO.mCanvas = aPiece;
				inCell.blockerRefernce = aBlockerVO;
				aPiece.setCellVO(inCell, 2);
			}else{
				return null;
			}
			return aPiece;
		}
		private function getIngredient():String{
			var aArr:Object = new Object();
			for(var aStr:String in mArrayGoalIngridients){
				aArr[aStr]=0;
			}
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)
				for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++)
				{
					var aCell:CellVO = mCells[a][b];
					if(aCell.pieceReference){
						if(!aArr.hasOwnProperty(aCell.pieceReference.getName()))
							aArr[aCell.pieceReference.getName()]=0;
						aArr[aCell.pieceReference.getName()]+=1;
				}
			}
			for(var aStr:String in mArrayGoalIngridients){
				if(aArr[aStr]<mArrayGoalIngridients[aStr]["freq"]&&mArrayGoalIngridients[aStr]["num"]>0){
					return "3_"+PieceVO.createPieceFromName(aStr).getType()+"_1";
				}
			}
			return "";
		}
		
		private function getNextDropItem(inIng:Boolean):String{
			if(inIng){
				var aIng:String = getIngredient();
				if(aIng!="") return aIng;
			}
			var aCount:int = 0;
			for each(var aObj:Object in mDropItems){
				aCount+=aObj.col;
			}
			var aItem:int = Math.random()*aCount;
			aCount=0;
			for each(var aObj:Object in mDropItems){
				aCount+=aObj.col;
				if(aCount>aItem) return aObj.id;
			}
			return mDropItems[mDropItems.length-1].id;
		}
		
		private function respawn():void{
			for each(var aCell:CellVO in mRespawnVector){
				var aUp:int=0;
				while(CellVO.isFree(aCell)){
					/*var aPieceVO:PieceVO = PieceVO.createPieceFromSourceId(getNextDropItem());
					var aPiece:GamePieceCanvas = new GamePieceCanvas();
					aPiece.setPosition(Match3Editor.CELL_WIDTH*aCell.mX, Match3Editor.CELL_HEIGHT*(aCell.mY-1));
					mChipsCanvas.addChild(aPiece);
					aPieceVO.mCanvas = aPiece;*/
					
					var aNewCell:Vector.<CellVO> = new Vector.<CellVO>();
					for(var a:int=0;a<aUp;a++){
						aNewCell.push(new CellVO());
					}
					aNewCell.push(aCell);
					var aNextCell:Vector.<CellVO> = aCell.getNextFreeCell();
					for each(var aCellVO:CellVO in aNextCell){
						aNewCell.push(aCellVO);
					}
					
					var aPiece:GamePieceCanvas = setDropStatistics(aNewCell[aNewCell.length-1]);
					aPiece.setMove(aNewCell);
					aPiece.setPosition(Match3Editor.CELL_WIDTH*aCell.mX, Match3Editor.CELL_HEIGHT*(aCell.mY+1));
					//aNewCell[aNewCell.length-1].pieceReference = aPieceVO;
					//aPiece.setCellVO(aNewCell[aNewCell.length-1], 1);
					//aPiece.setMove(aNewCell);
					aUp++;
				}
			}
		}
		
		private function nextTurnBlocker():void{
			var aArr:Vector.<CellVO> = new Vector.<CellVO>();
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++){
				var aCell:CellVO = mCells[a][b];
				if(aCell.blockerRefernce&&aCell.blockerRefernce.canIncrease()){
					var aNextCell:CellVO;
					aNextCell = getCell(aCell.mX-1,aCell.mY);
					if(aNextCell&&aNextCell.blockerRefernce==null&&aNextCell.type != CellType.EMPTY) aArr.push(aNextCell);
					aNextCell = getCell(aCell.mX+1,aCell.mY);
					if(aNextCell&&aNextCell.blockerRefernce==null&&aNextCell.type != CellType.EMPTY) aArr.push(aNextCell);
					aNextCell = getCell(aCell.mX,aCell.mY-1);
					if(aNextCell&&aNextCell.blockerRefernce==null&&aNextCell.type != CellType.EMPTY) aArr.push(aNextCell);
					aNextCell = getCell(aCell.mX,aCell.mY+1);
					if(aNextCell&&aNextCell.blockerRefernce==null&&aNextCell.type != CellType.EMPTY) aArr.push(aNextCell);
				}
			}
			if(aArr.length>0){
				var aIndex = Math.floor(Math.random()*aArr.length);
				var inCell:CellVO = aArr[aIndex];
				if(inCell.pieceReference){
					mChipsCanvas.removeChild(inCell.pieceReference.mCanvas);
					inCell.pieceReference=null;
				}
				
				
				var aPiece:GamePieceCanvas = new GamePieceCanvas();
				aPiece.setPosition(Match3Editor.CELL_WIDTH*inCell.mX, Match3Editor.CELL_HEIGHT*(inCell.mY));
				mChipsCanvas.addChild(aPiece);
				var aBlockerVO:BlockerVO = new BlockerVO(BlockerType.HONEY);
				aBlockerVO.mCanvas = aPiece;
				inCell.blockerRefernce = aBlockerVO;
				aPiece.setCellVO(inCell, 2);
			}
		}
		
		private function destroyBlock(inX:int, inY:int):void{//уничтожение блоккера соседним матчем
			if(inX>=Match3Editor.BOARD_WIDTH||inY>=Match3Editor.BOARD_HEIGHT||inX<0||inY<0) return;
			var aCell:CellVO = mCells[inX][inY];
			if(aCell&&aCell.blockerRefernce&&aCell.blockerRefernce.canDestroyMatch()){
				aCell.blockerRefernce.mCanvas.parent.removeChild(aCell.blockerRefernce.mCanvas);
				if(aCell.blockerRefernce.canIncrease()){
					mNeedTurnBlocker=false;
				}
				addScore(aCell.blockerRefernce.getCrashScore());
				aCell.blockerRefernce=null;
			}
		}
		
		private function splashBlock(inCell:CellVO, inMatch:Boolean = false):Boolean{//уничтожение и активация клетки
			var aResult:Boolean = false;
			if(inCell.blockerRefernce){
				if(inCell.blockerRefernce.canDestroyOneinWall()) aResult=true;
				inCell.blockerRefernce.mCanvas.parent.removeChild(inCell.blockerRefernce.mCanvas);
				if(inCell.blockerRefernce.canIncrease()){
					mNeedTurnBlocker=false;
				}
				addScore(inCell.blockerRefernce.getCrashScore());
				inCell.blockerRefernce=null;
				
			}else if(inCell.pieceReference){
				var aPiece:PieceVO = inCell.pieceReference;
				if(aPiece.mCanSplash==false) return aResult;
				clearCell(inCell,false,inMatch);
				if(inMatch){
					var a:int = inCell.mX;
					var b:int = inCell.mY;
					destroyBlock(a-1,b);
					destroyBlock(a+1,b);
					destroyBlock(a,b-1);
					destroyBlock(a,b+1);
				}
				
				if(aPiece is PieceColorVO){
					var aPieceColorVO:PieceColorVO = aPiece as PieceColorVO;
					if(aPieceColorVO.property==1){
						
					}else if(aPieceColorVO.property==2){
						aPiece.setActive(1);
						mChipsCanvas.addChild(aPiece.mCanvas);
						inCell.pieceReference=aPiece;
						setStartActive(inCell);
						if(inCell.bootmReference&&inCell.bootmReference.pieceReference==null&&inCell.bootmReference.blockerRefernce==null){
							inCell.bootmReference.pieceReference = aPiece;
							var aNextCell:Vector.<CellVO> = new Vector.<CellVO>();
							aNextCell.push(inCell.bootmReference);
							aPiece.mCanvas.setMove(aNextCell);
							inCell.pieceReference=null;
						}
						
					}else if(aPieceColorVO.property==3){
						mLastPieceInitialize = aPieceColorVO.type;
						splashLine(inCell.mX, inCell.mY,false);
					}else if(aPieceColorVO.property==4){
						mLastPieceInitialize = aPieceColorVO.type;
						splashLine(inCell.mX, inCell.mY,true);
					}
				}else if(aPiece is PieceRainbowCupcakeVO){
					var aPieceColorBombVO:PieceRainbowCupcakeVO = aPiece as PieceRainbowCupcakeVO;
					for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++){
						var aPiece1:PieceVO = mCells[a][b].pieceReference;
						if(aPiece1&&aPiece1 is PieceColorVO){
							if((aPiece1 as PieceColorVO).type==mLastPieceInitialize){
								splashBlock(mCells[a][b]);
							}
						}
					}
				}
			}
			return aResult;
		}
		public function clearCell(inCell:CellVO, inDown:Boolean = false, inMatch:Boolean = false):Boolean{
			var aResult:Boolean = false;
			if(inCell.blockerRefernce){
				if(inCell.blockerRefernce.canDestroyOneinWall()) aResult=true;
				inCell.blockerRefernce.mCanvas.parent.removeChild(inCell.blockerRefernce.mCanvas);
				if(inCell.blockerRefernce.canIncrease()){
					mNeedTurnBlocker=false;
				}
				addScore(inCell.blockerRefernce.getCrashScore());
				inCell.blockerRefernce=null;
			}else{
				var aPiece:PieceVO = inCell.pieceReference;
				if(aPiece){
					if((!aPiece.isIngredient())||(aPiece.isIngredient()&&inDown)){//проверяем если это ингридиент, то уничтожаем его только когда он проваливается в низ
						if(!inMatch)
							addScore(inCell.pieceReference.getCrashScore());
						if(aPiece is PieceColorVO){
							GameFieldManager.getStat().addVars(StatisticType.PIECE+(aPiece as PieceColorVO).getColorName(),-1);
						}else{
							GameFieldManager.getStat().addVars(StatisticType.INGREDIENT+aPiece.getName(),-1);
						}
						if(aPiece.mCanvas)
							aPiece.mCanvas.parent.removeChild(aPiece.mCanvas);
						inCell.pieceReference=null;
					}
				}
				
				var aJelly:JellyVO = inCell.jellyReference;
				if(aJelly&&aJelly.mCanvas)
				if(aJelly.type==JellyType.SINGLE){
					aJelly.mCanvas.parent.removeChild(aJelly.mCanvas);
					inCell.jellyReference=null;
				}else{
					aJelly.type=JellyType.SINGLE;
					(aJelly.mCanvas as GamePieceCanvas).refreshImage();
				}
				
			}
			return aResult;
		}
		private function splashLine(inX:int, inY:int, inVer:Boolean):void{
			if(inVer){
				for(var a:int=inY+1;a<Match3Editor.BOARD_HEIGHT;a++) {
					if(splashBlock(mCells[inX][a])) break;
				}
				for(var a:int=inY-1;a>=0;a--) {
					if(splashBlock(mCells[inX][a])) break;
				}
			}else{
				for(var a:int=inX+1;a<Match3Editor.BOARD_WIDTH;a++) {
					if(splashBlock(mCells[a][inY])) break;
				}
				for(var a:int=inX-1;a>=0;a--) {
					if(splashBlock(mCells[a][inY])) break;
				}
			}
		}
		public function setSpecMove(inCell1:CellVO, inCell2:CellVO):Boolean{
			var aSwapPiece:SwapPiece = new SwapPiece(inCell1.pieceReference, inCell2.pieceReference);
			if(aSwapPiece.isConf(SwapPiece.GOR,SwapPiece.VER)||aSwapPiece.isConf(SwapPiece.VER,SwapPiece.VER)||aSwapPiece.isConf(SwapPiece.GOR,SwapPiece.GOR)){
				clearCell(inCell1);clearCell(inCell2);
				splashLine(inCell1.mX, inCell1.mY,true);
				splashLine(inCell1.mX, inCell1.mY,false);
				return true;
			}else if(aSwapPiece.isConf(SwapPiece.BOX,SwapPiece.VER)||aSwapPiece.isConf(SwapPiece.BOX,SwapPiece.GOR)){
					clearCell(inCell1);clearCell(inCell2);
					for(var b:int=-1;b<=1;b++){
						if((inCell1.mY+b)>=0&&(inCell1.mY+b)<Match3Editor.BOARD_HEIGHT)
							splashLine(inCell1.mX, inCell1.mY+b,false);
						if((inCell1.mX+b)>=0&&(inCell1.mX+b)<Match3Editor.BOARD_WIDTH)
							splashLine(inCell1.mX+b, inCell1.mY,true);
					}
					return true;
			}else if(aSwapPiece.isConf(SwapPiece.BOMB,SwapPiece.VER)||aSwapPiece.isConf(SwapPiece.BOMB,SwapPiece.GOR)){
				var aLastProperty:int = 3; 
				if(aSwapPiece.isType(inCell1.pieceReference, SwapPiece.BOMB)){
					mLastPieceInitialize = (inCell2.pieceReference as PieceColorVO).type;
					aLastProperty = (inCell2.pieceReference as PieceColorVO).property;
				}else{
					mLastPieceInitialize = (inCell1.pieceReference as PieceColorVO).type;
					aLastProperty = (inCell1.pieceReference as PieceColorVO).property;
				}
				clearCell(inCell1);clearCell(inCell2);
				
				for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++){
					var aPiece1:PieceVO = mCells[a][b].pieceReference;
					if(aPiece1&&aPiece1 is PieceColorVO){
						if((aPiece1 as PieceColorVO).type==mLastPieceInitialize){
							(aPiece1 as PieceColorVO).property = aLastProperty;
							splashBlock(mCells[a][b]);
						}
					}
				}
				return true;
			}else if(aSwapPiece.isConf(SwapPiece.WHEEL,SwapPiece.VER)||aSwapPiece.isConf(SwapPiece.WHEEL,SwapPiece.GOR)){
				/*var aLastProperty:int = 3; 
				if(aSwapPiece.isType(inCell1.pieceReference, SwapPiece.BOMB)){
					mLastPieceInitialize = (inCell2.pieceReference as PieceColorVO).type;
					aLastProperty = (inCell2.pieceReference as PieceColorVO).property;
				}else{
					mLastPieceInitialize = (inCell1.pieceReference as PieceColorVO).type;
					aLastProperty = (inCell1.pieceReference as PieceColorVO).property;
				}*/
				clearCell(inCell1);clearCell(inCell2);
				
				for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++){
					var aPiece1:PieceVO;
					if((inCell1.mX-inCell2.mX)==0){
						aPiece1 = mCells[inCell1.mX][a].pieceReference;
					}else{
						aPiece1 = mCells[a][inCell1.mY].pieceReference;
					}
					if(aPiece1&&aPiece1 is PieceColorVO){
						(aPiece1 as PieceColorVO).property = Math.random()<0.5?3:4;
						aPiece1.mCanvas.refreshImage();
					}
				}
				return true;
			}else if(aSwapPiece.isConf(SwapPiece.BOX,SwapPiece.BOX)){
				clearCell(inCell1);clearCell(inCell2);
				
				var aCell:CellVO;
				for(var b:int=-2;b<=2;b++)
					for(var a:int=-2;a<=2;a++) {
						if((inCell1.mY+b)>=0&&(inCell1.mY+b)<Match3Editor.BOARD_HEIGHT&&(inCell1.mX+a)>=0&&(inCell1.mX+a)<Match3Editor.BOARD_WIDTH)
							splashBlock(mCells[inCell1.mX+a][inCell1.mY+b]);
						if((inCell2.mY+b)>=0&&(inCell2.mY+b)<Match3Editor.BOARD_HEIGHT&&(inCell2.mX+a)>=0&&(inCell2.mX+a)<Match3Editor.BOARD_WIDTH)
							splashBlock(mCells[inCell2.mX+a][inCell2.mY+b]);
					}
				return true;
			}else if(aSwapPiece.isConf(SwapPiece.BOMB,SwapPiece.BOX)){
				if(aSwapPiece.isType(inCell1.pieceReference, SwapPiece.BOMB)){
					mLastPieceInitialize = (inCell2.pieceReference as PieceColorVO).type;
				}else{
					mLastPieceInitialize = (inCell1.pieceReference as PieceColorVO).type;
				}
				var aNextPieceInitialize = mLastPieceInitialize;
				
				clearCell(inCell1);clearCell(inCell2);
				
				for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++){
					var aPiece1:PieceVO = mCells[a][b].pieceReference;
					if(aPiece1&&aPiece1 is PieceColorVO){
						if((aPiece1 as PieceColorVO).type==mLastPieceInitialize){
							splashBlock(mCells[a][b]);
						}else{
							if(aNextPieceInitialize==mLastPieceInitialize){
								aNextPieceInitialize = (aPiece1 as PieceColorVO).type;
							}
							if((aPiece1 as PieceColorVO).type==aNextPieceInitialize)
								splashBlock(mCells[a][b]);
						}
					}
				}
				return true;
			}else if(aSwapPiece.isConf(SwapPiece.WHEEL,SwapPiece.BOX)){
				clearCell(inCell1);clearCell(inCell2);
				
				for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++){
					var aPiece1:PieceVO;
					if((inCell1.mX-inCell2.mX)==0){
						aPiece1 = mCells[inCell1.mX][a].pieceReference;
					}else{
						aPiece1 = mCells[a][inCell1.mY].pieceReference;
					}
					if(aPiece1&&aPiece1 is PieceColorVO){
						(aPiece1 as PieceColorVO).property = 2;
						aPiece1.mCanvas.refreshImage();
					}
				}
				return true;
			}else if(aSwapPiece.isConf(SwapPiece.BOMB,SwapPiece.SIMPLE)){
				if(aSwapPiece.isType(inCell1.pieceReference, SwapPiece.BOMB)){
					mLastPieceInitialize = (inCell2.pieceReference as PieceColorVO).type;
				}else{
					mLastPieceInitialize = (inCell1.pieceReference as PieceColorVO).type;
				}
				clearCell(inCell1);clearCell(inCell2);
				
				for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++){
					var aPiece1:PieceVO = mCells[a][b].pieceReference;
					if(aPiece1&&aPiece1 is PieceColorVO){
						if((aPiece1 as PieceColorVO).type==mLastPieceInitialize){
							splashBlock(mCells[a][b]);
						}
					}
				}
				return true;
			}else if(aSwapPiece.isConf(SwapPiece.BOMB,SwapPiece.BOMB)){
				clearCell(inCell1);clearCell(inCell2);
				
				for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=0;b<Match3Editor.BOARD_HEIGHT;b++){
					clearCell(mCells[a][b]);
				}
			}
			return false;
		}
		
		private function setStartActive(inCell:CellVO):void{
			var aPiece:PieceVO = inCell.pieceReference;
			if(aPiece&&aPiece.mCanSplash==false){
				if(aPiece is PieceColorVO){
					var aPieceColorVO:PieceColorVO = aPiece as PieceColorVO;
					if(aPieceColorVO.property==2){
						if((aPiece.mLive==2)||(mStable&&aPiece.mLive==1)){
							if(aPiece.getActive()){
								if(aPiece.mCanvas)
									aPiece.mCanvas.parent.removeChild(aPiece.mCanvas);
								inCell.pieceReference = null;
							};
							for(var aX:int=inCell.mX-1;aX<=inCell.mX+1;aX++)
								for(var aY:int=inCell.mY-1;aY<=inCell.mY+1;aY++)
									if(aX>=0&&aY>=0&&aX<Match3Editor.BOARD_WIDTH&&aY<Match3Editor.BOARD_HEIGHT){
										splashBlock(mCells[aX][aY]);
									}
							mStable = false;
						}
					}else if(aPieceColorVO.property==3){
						
					}else if(aPieceColorVO.property==4){
						
					}
				}else if(aPiece is PieceRainbowCupcakeVO){
					var aPieceColorBombVO:PieceRainbowCupcakeVO = aPiece as PieceRainbowCupcakeVO;
				}
			}
		}
		
		public function update(inEvent:TimerEvent):void{
			mTime++;
			getStat().setHasVars(StatisticType.TIME,getStat().getVars(StatisticType.TIME)-mTime*delay/1000);
			
			var aStable:Boolean = true;
			//просчет на подение
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)
				for(var b:int=8;b>=0;b--){
					var aCell:CellVO = mCells[a][b];
					if(aCell.blockerRefernce){
						if(aCell.blockerRefernce.canMove()){
							var aBlockVO:BlockerVO = aCell.blockerRefernce;
							var aNextCell:Vector.<CellVO> = aCell.getNextFreeCell();
							if(aBlockVO.mGrounded){
								if(aNextCell.length>0){
									
									aNextCell[aNextCell.length-1].blockerRefernce=aBlockVO;
									aCell.blockerRefernce=null;
									
									aBlockVO.mCanvas.setMove(aNextCell);
									aStable = false;
								}
							}else if(aNextCell.length>0&&aNextCell.length != aBlockVO.mCanvas.mCellVector.length){
								//aPieveVO.mCanvas.mCellVector=aNextCell;
							}
						}
					}else if(aCell.pieceReference){
						var aPieveVO:PieceVO = aCell.pieceReference;
						var aNextCell:Vector.<CellVO> = aCell.getNextFreeCell();
						if(aPieveVO.mGrounded){
							if(aNextCell.length>0){
								
								aNextCell[aNextCell.length-1].pieceReference=aPieveVO;
								aCell.pieceReference=null;
								
								aPieveVO.mCanvas.setMove(aNextCell);
								aStable = false;
							}else if(aPieveVO.isIngredient()&&aCell.mOutIngredient){
								clearCell(aCell, true);
							}
						}else if(aNextCell.length>0&&aNextCell.length != aPieveVO.mCanvas.mCellVector.length){
							//aPieveVO.mCanvas.mCellVector=aNextCell;
						}
					}
				}
			respawn();
			
			var aSecPath:Boolean = true;
			//просчет на диагональ
				for(var b:int=8;b>=0&&aSecPath;b--)
					for(var a:int=0;a<Match3Editor.BOARD_WIDTH&&aSecPath;a++){
					var aCell:CellVO = mCells[a][b];
					if(aCell.blockerRefernce){
						if(aCell.blockerRefernce.canMove()){
							var aBlockVO:BlockerVO = aCell.blockerRefernce;
							var aNextCell:Vector.<CellVO> = aCell.getNextFreeCell(true);
							if(aBlockVO.mGrounded){
								if(aNextCell.length>0){
									
									aNextCell[aNextCell.length-1].blockerRefernce=aBlockVO;
									aCell.blockerRefernce=null;
									
									aBlockVO.mCanvas.setMove(aNextCell);
									aStable = false;
									aSecPath = false;
								}
							}else if(aNextCell.length>0&&aNextCell.length != aBlockVO.mCanvas.mCellVector.length){
								//aPieveVO.mCanvas.mCellVector=aNextCell;
							}
						}
					}else if(aCell.pieceReference){
						var aPieveVO:PieceVO = aCell.pieceReference;
						var aNextCell:Vector.<CellVO> = aCell.getNextFreeCell(true);
						if(aPieveVO.mGrounded){
							if(aNextCell.length>0){
								
								aNextCell[aNextCell.length-1].pieceReference=aPieveVO;
								aCell.pieceReference=null;
								
								aPieveVO.mCanvas.setMove(aNextCell);
								aStable = false;
								aSecPath = false;
							}else if(aNextCell.length>0&&aNextCell.length != aPieveVO.mCanvas.mCellVector.length){
								//aPieveVO.mCanvas.mCellVector=aNextCell;
							}
						}
					}
				}
			
			//сплешим
			var aSplashArray:Vector.<ShapeSplashVO>  = Splash.getSimpleSplash(mCells);
			var aComP:CombinationPiece = new CombinationPiece(aSplashArray);
			for each(var aSSVO:ShapeSplashVO in aSplashArray){
				for each(var aCell:CellVO in aSSVO.mArray){
					splashBlock(aCell, true);
					aStable=false;
				}
			}
			if(aSplashArray.length>0) mScoreCombo++;
			if(aSplashArray.length>0) {
				//Листаем комбинации от матча
				var aCombFig:Vector.<Vector.<Object>> = aComP.getCombinationPoint();
				for(var aIndex:int=0;aIndex<aCombFig.length;aIndex++){
					for each(var aObj:Object in aCombFig[aIndex]){
						var aCell:CellVO = mCells[aObj.x][aObj.y];
						if(aCell.pieceReference!=null) continue;
						if(aIndex==3){
							addScore(75);
							continue;
						}else if(aIndex==2){
								var aRot=1;
								if(aObj.rotate==0||aObj.rotate==1)aRot=0;
								aCell.pieceReference=new PieceColorVO(aObj.type, 3+aRot);
						}else if(aIndex==1){
							aCell.pieceReference=new PieceRainbowCupcakeVO();
						}else if(aIndex==0){
							aCell.pieceReference=new PieceColorVO(aObj.type, 2);
						}
						addScore(aCell.pieceReference.getBuildScore());
						var aGamePieceCanvas:GamePieceCanvas = new GamePieceCanvas();
						aGamePieceCanvas.setPosition(Match3Editor.CELL_WIDTH*aCell.mX, Match3Editor.CELL_HEIGHT*(aCell.mY));
						mChipsCanvas.addChild(aGamePieceCanvas);
						aCell.pieceReference.mCanvas = aGamePieceCanvas;
						aGamePieceCanvas.setCellVO(aCell, 1);
					}
				}
				
				//createGraph();//перестраиваем графу по нашим блокираторам
			}
			
			
			//перемещяем
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=8;b>=0;b--){
				var aCell:CellVO = mCells[a][b];
				if(aCell.blockerRefernce&&aCell.blockerRefernce.canMove()){
					if(!aCell.blockerRefernce.mGrounded){
						aStable = false;
						aCell.blockerRefernce.mCanvas.update();
					}
				}else if(aCell.pieceReference){
					if(!aCell.pieceReference.mGrounded){
						aStable = false;
						aCell.pieceReference.mCanvas.update();
					}else{
						aCell.pieceReference.mCanvas.updateTime();
					}
				}
			}
			
			mStable = aStable;
			
			
			//проверка активированных фишек
			for(var a:int=0;a<Match3Editor.BOARD_WIDTH;a++)for(var b:int=8;b>=0;b--){
				this.setStartActive(mCells[a][b]);
			}
			if(mStable){
				if(mMyTurn){
					mMyTurn=false;
					mTurnStorage.add(mCells);
				}
				if(mNeedTurnBlocker){
					mNeedTurnBlocker=false;
					nextTurnBlocker();
					mScoreCombo=1;
				}
			}
		}
	}
}

