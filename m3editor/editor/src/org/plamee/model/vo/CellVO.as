package org.plamee.model.vo
{
	import mx.collections.ArrayCollection;
	import mx.containers.Canvas;
	
	import org.plamee.model.inums.CellType;
	import org.plamee.view.components.CellViewCanvas;

	public class CellVO
	{
		public var type:int;
		public var portalConnectionNum:int = 0;
		public var boosterAmount:int = 0;
		
		public var leftBottomReference:CellVO;
		public var bootmReference:CellVO;
		public var rightBottomReference:CellVO;
		
		public var jellyReference:JellyVO;
		public var pieceReference:PieceVO;		
		public var blockerRefernce:BlockerVO;
		public var boosterRefernce:BusterVO;
		public var toyRefernce:ToyVO;
		
		public var respawnRefence:RespawnVO;//not used in gameplay
		public var mOutIngredient:Boolean=false;
		
		public var mCanvas:Canvas = null;
		public var mX:int=0, mY:int=0;
		
		public var mParent:CellVO = null;
		public var mPortal:CellVO = null;
		
		public function CellVO()
		{
			type = CellType.EMPTY;
		}
		public function deletePortal():void{
			mPortal = null;
			if(mCanvas&&(mCanvas as CellViewCanvas))
				(mCanvas as CellViewCanvas).deletePortal();
			portalConnectionNum = 0;
		}
		public function setParent():void{
			if(bootmReference) bootmReference.mParent = this;
			if(leftBottomReference) leftBottomReference.mParent = this;
			if(rightBottomReference) rightBottomReference.mParent = this;
		}
		public function isDown():Boolean{
			if(bootmReference||leftBottomReference||rightBottomReference) return false;
			return true;
		}
		public function getNextFreeCell(inAnotherWay:Boolean=false):Vector.<CellVO>{
			var aNewVector:Vector.<CellVO> = new Vector.<CellVO>();
			if(inAnotherWay){
				if(mX%2){
					if(isFree(leftBottomReference))aNewVector.push(leftBottomReference);
					else if(isFree(rightBottomReference)) aNewVector.push(rightBottomReference);
				}else{
					if(isFree(rightBottomReference)) aNewVector.push(rightBottomReference);
					else if(isFree(leftBottomReference)) aNewVector.push(leftBottomReference);
				}
			}else
				if(isFree(bootmReference)) {
					var aNextVector:Vector.<CellVO> = bootmReference.getNextFreeCell(inAnotherWay);
					aNewVector.push(bootmReference);
					for each(var aCell:CellVO in aNextVector){
						aNewVector.push(aCell);
					}
				}
			return aNewVector;
		}
		static public function isFree(inCellVO:CellVO):Boolean{
			return (inCellVO&&inCellVO.type!=CellType.EMPTY&&(inCellVO.pieceReference==null&&inCellVO.blockerRefernce==null&&inCellVO.toyRefernce==null));
		}
		
		public function clone():CellVO
		{
			var toReturn:CellVO = new CellVO();
			toReturn.type = this.type;
			
			if(this.jellyReference)
				toReturn.jellyReference = this.jellyReference.clone();
			
			if(this.pieceReference)
				toReturn.pieceReference = this.pieceReference.clone();			
			
			if(this.toyRefernce)
				toReturn.toyRefernce = this.toyRefernce.clone();	
			
			if(this.blockerRefernce)
				toReturn.blockerRefernce = this.blockerRefernce.clone();	
				
			if(this.boosterRefernce)
				toReturn.boosterRefernce = this.boosterRefernce.clone();	
			
			if(this.respawnRefence)
				toReturn.respawnRefence = this.respawnRefence.clone();
			
			if(this.mOutIngredient)
				toReturn.mOutIngredient = this.mOutIngredient;	
			
			
			return toReturn;
		}			
		
		public static function getAllSource():ArrayCollection
		{
			return new ArrayCollection(
				[
					{id:"1_1", source:"../assets/back1.png"},
					{id:"1_2", source:"../assets/back_portal_in.png"},
					{id:"1_3", source:"../assets/back_portal_out.png"}
				]
			);
		}
		
		public function setTypeByStringId(id:String):void
		{
			if(!id)
			{
				this.type = CellType.EMPTY;
				return;
			}
				
			
			
			var results:Array = id.split(/_/);
			for(var i:int = 0; i<results.length; i++)
				results[i] = int(results[i]);
			
			if(results[0] != 1)
			{
				this.type = CellType.EMPTY;
				return;
			}
			
			switch (results[1])
			{
				case 1:
					this.type = CellType.FULL;
				break;
				case 2:
					this.type = CellType.PORTAL_IN;
				break;
				case 3:
					this.type = CellType.PORTAL_OUT;
				break;
				default:
					this.type = CellType.EMPTY;
					
			}
		}
		
		public function getStringSource():String
		{
			var str:String = "../assets/back";
			
			switch (this.type)
			{
				case CellType.FULL:
					str+="1.png";
					break;
				case CellType.PORTAL_IN:
					str+="_portal_in.png";
					break;
				case CellType.PORTAL_OUT:
					str+="_portal_out.png";
					break;
				default:
					str="";
					
			}
			return str;
		}		
	}
}