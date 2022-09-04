package org.plamee.logic{
	import org.plamee.model.vo.CellVO;

	public class TurnsStorage{
		private var mTurns:Vector.<Vector.<Vector.<CellVO>>> = new Vector.<Vector.<Vector.<CellVO>>>();
		public function TurnsStorage(){
		}
		
		public function add(inCells:Vector.<Vector.<CellVO>>):void{
			var aNewCells:Vector.<Vector.<CellVO>> = new Vector.<Vector.<CellVO>>(inCells.length, true);
			for(var a:int=0;a<inCells.length;a++){
				aNewCells[a]=(new Vector.<CellVO>(inCells[a].length,true));
				for(var b:int=0;b<inCells[a].length;b++)
					aNewCells[a][b] = inCells[a][b].clone();
			}
			mTurns.push(aNewCells);
		}
		
		public function last():Vector.<Vector.<CellVO>>{
			if(mTurns.length==0) return null;
			return mTurns[mTurns.length-1];
		}
		
		public function pop():Vector.<Vector.<CellVO>>{
			if(mTurns.length==0) return null;
			return mTurns.pop();
		}
	}
}