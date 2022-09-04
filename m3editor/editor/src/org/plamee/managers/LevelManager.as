package org.plamee.managers 
{
	import flash.display.DisplayObject;
	
	import mx.containers.Canvas;
	import mx.controls.Image;
	import mx.managers.CursorManager;
	import mx.managers.CursorManagerPriority;
	
	import org.plamee.logic.Splash;
	import org.plamee.model.vo.CellVO;
	
	public final class LevelManager {
		
		private static var instance:LevelManager = new LevelManager();
		public var gridArray:Array;
		
		public var bufferdGrid:Array;
		
		
		public function LevelManager() {
			
			if( instance ) throw new Error( "LevelManager singleton and can only be accessed through LevelManager.getInstance()" ); 
			
		}
		
		public static function getInstance():LevelManager {
			
			return instance;
			
		}
		
		public function copyBufferdGrid():void
		{
			bufferdGrid = new Array();
			for(var i:int=0; i<gridArray.length; i++)
			{
				bufferdGrid[i] = new Array();
				for(var j:int=0; j<gridArray[0].length; j++)
				{
					if((gridArray[i][j])&&(gridArray[i][j].cellVO))
						bufferdGrid[i][j] = gridArray[i][j].cellVO.clone();
					else
						bufferdGrid[i][j] = new CellVO();
				}
			}
		}
		
		public function setNewGrid():void
		{
			copyBufferdGrid();
			
			if(gridArray)
				for(var i:int = 0 ; i<gridArray.length; i++)
				{
					if(gridArray[i])
					{
						for(var j:int = 0; j<gridArray[i].length; j++)
						{
							if(gridArray[i][j])
								gridArray[i][j].showCell(new CellVO());
						}
					}
				}
		}		
		
		public function fillEmptyCells():void
		{
			/*copyBufferdGrid();
			
			if(gridArray)
			{
				for(var i:int = 0 ; i<gridArray.length; i++)
				{
					if(gridArray[i])
					{
						for(var j:int = 0; j<gridArray[i].length; j++)
						{
							if(gridArray[i][j])
								gridArray[i][j].fillCell();
						}
					}
				}
			}*/
		}
		
		public function removePortalConnect(portalConnectionNum:int):void
		{
			if(gridArray)
			{
				for(var i:int = 0 ; i<gridArray.length; i++)
				{
					if(gridArray[i])
					{
						for(var j:int = 0; j<gridArray[i].length; j++)
						{
							if(gridArray[i][j])
								gridArray[i][j].removePortalConnection(portalConnectionNum);
						}
					}
				}
			}			
		}
		
		public function testLevel():Boolean{
			return Splash.getSimpleSplash(GameFieldManager.getVectorLevelField(gridArray)).length>0;
		}
		
	}	
	
}

