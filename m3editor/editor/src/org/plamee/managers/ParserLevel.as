package org.plamee.managers{
	public class ParserLevel{
		private var mXML:XML = null;
		public function ParserLevel(){
		}
		public function setLevelXML(inText:String):void{
			mXML = new XML(inText);
			/*
			cellsCanvas.width = CELL_WIDTH*9+2;
			cellsCanvas.height = CELL_HEIGHT*9+2;
			
			for(var i:int=0; i<9; i++)
			{
				levelManager.gridArray[i] = new Array();
				for(var j:int = 0; j<9; j++)
				{
					cell = new CellViewCanvas();
					cell.x = CELL_WIDTH*i;
					cell.y = CELL_HEIGHT*j;
					cellsCanvas.addChild(cell);
					cell.onCreateComplete();
					levelManager.gridArray[i][j] = cell;
					cell.setCellDef();
				}
			}
			selectionManager.portalLastNum=1;
			statisticsList.dataProvider = new ArrayCollection();
			
			for each(var aXml1:XML in aXML.elements()){
				switch(aXml1.name().toString()){
					case "cell":
						var aX:int = aXml1.attribute("x").toString();
						var aY:int = aXml1.attribute("y").toString();
						if(aXml1.attribute("dest_x").toString()!=""){
							var aX1:int = aXml1.attribute("dest_x").toString();
							var aY1:int = aXml1.attribute("dest_y").toString();
							(levelManager.gridArray[aX1][8-aY1] as CellViewCanvas).cellVO.type = CellType.PORTAL_OUT;
							(levelManager.gridArray[aX][8-aY] as CellViewCanvas).cellVO.type = CellType.PORTAL_IN;
							
							selectionManager.state = SelectionManager.PORTAL_OUT_STATE;
							(levelManager.gridArray[aX1][8-aY1] as CellViewCanvas).onMouseDown();
							(levelManager.gridArray[aX][8-aY] as CellViewCanvas).onMouseDown();
							selectionManager.portalLastNum++;
						};
						if(aXml1.attribute("piece").toString()!=""){
							var aPieceVO:PieceColorVO = new PieceColorVO();
							aPieceVO.setType(aXml1.attribute("piece").toString());
							aPieceVO.setPower(aXml1.attribute("power").toString());
							(levelManager.gridArray[aX][8-aY] as CellViewCanvas).addPiece(aPieceVO);
						};
						if(aXml1.attribute("spec").toString()!=""){
							var aSPieceVO:PieceVO = null;
							if(aXml1.attribute("spec").toString()=="pastry_bag"){
								aSPieceVO = new PiecePastryBagVO();
							}else if(aXml1.attribute("spec").toString()=="rainbow_cupcake"){
								aSPieceVO = new PieceRainbowCupcakeVO();
							}else if(aXml1.attribute("spec").toString()=="spatula"){
								aSPieceVO = new PieceSpatulaVO();
							}
							if(aSPieceVO)
								(levelManager.gridArray[aX][8-aY] as CellViewCanvas).addPiece(aSPieceVO);
						};
						if(aXml1.attribute("ingredient").toString()!=""){
							var aSPieceVO:PieceVO = null;
							if(aXml1.attribute("ingredient").toString()=="blueberry"){
								aSPieceVO = new PieceBlueberryVO();
							}else if(aXml1.attribute("ingredient").toString()=="raspberry"){
								aSPieceVO = new PieceRaspberryVO();
							}else if(aXml1.attribute("ingredient").toString()=="strawberry"){
								aSPieceVO = new PieceStrawberryVO();
							}else if(aXml1.attribute("ingredient").toString()=="physalis"){
								aSPieceVO = new PiecePhysalisVO();
							}
							if(aSPieceVO)
								(levelManager.gridArray[aX][8-aY] as CellViewCanvas).addPiece(aSPieceVO);
						};
						if(aXml1.attribute("blocker").toString()!=""){
							var aBlockerVO:BlockerVO = new BlockerVO();
							aBlockerVO.setName(aXml1.attribute("blocker").toString());
							(levelManager.gridArray[aX][8-aY] as CellViewCanvas).addBlocker(aBlockerVO);
						};
						if(aXml1.attribute("back").toString()!="")
							(levelManager.gridArray[aX][8-aY] as CellViewCanvas).addJelly(aXml1.attribute("back").toString());
						if(aXml1.attribute("spawn").toString()!="")
							(levelManager.gridArray[aX][8-aY] as CellViewCanvas).addRespawn();
						if(aXml1.attribute("disable").toString()=="1")
							(levelManager.gridArray[aX][8-aY] as CellViewCanvas).deleteAll();
						break;
					case "disable":
						var aX:int = aXml1.attribute("x").toString();
						var aY:int = aXml1.attribute("y").toString();
						(levelManager.gridArray[aX][8-aY] as CellViewCanvas).deleteAll();
						break;
					case "back":
						var aX:int = aXml1.attribute("x").toString();
						var aY:int = aXml1.attribute("y").toString();
						(levelManager.gridArray[aX][8-aY] as CellViewCanvas).addJelly(aXml1.attribute("size").toString());
						break;
					case "set":
						var aX:int = aXml1.attribute("x").toString();
						var aY:int = aXml1.attribute("y").toString();
						if(aXml1.attribute("type").toString()=="color"){
							var aPieceVO:PieceColorVO = new PieceColorVO();
							aPieceVO.setType(aXml1.attribute("value").toString());
							aPieceVO.setPower(aXml1.attribute("power").toString());
							(levelManager.gridArray[aX][8-aY] as CellViewCanvas).addPiece(aPieceVO);
						}else{
							
						}
						break;
					case "portal":
						var aX:int = aXml1.attribute("x").toString();
						var aY:int = aXml1.attribute("y").toString();
						var aX1:int = aXml1.attribute("dest_x").toString();
						var aY1:int = aXml1.attribute("dest_y").toString();
						(levelManager.gridArray[aX1][8-aY1] as CellViewCanvas).cellVO.type = CellType.PORTAL_OUT;
						(levelManager.gridArray[aX][8-aY] as CellViewCanvas).cellVO.type = CellType.PORTAL_IN;
						
						selectionManager.state = SelectionManager.PORTAL_OUT_STATE;
						(levelManager.gridArray[aX1][8-aY1] as CellViewCanvas).onMouseDown();
						(levelManager.gridArray[aX][8-aY] as CellViewCanvas).onMouseDown();
						selectionManager.portalLastNum++;
						break;
					case "color":
						var fromAC:ArrayCollection = statisticsCB.dataProvider as ArrayCollection;
						var ob:Object = null;
						for each(var aOb:Object in fromAC){
						var aPieceVO:PieceColorVO = PieceVO.createPieceFromSourceId(aOb.id) as PieceColorVO;
						if(aPieceVO&&aPieceVO.getColorName()==aXml1.attribute("n").toString()){
							ob = aOb;
							break;
						}
					}
						
						fromAC.removeItemAt(fromAC.getItemIndex(ob));
						ob.col = int(aXml1.attribute("weight").toString());
						
						var toAC:ArrayCollection = statisticsList.dataProvider as ArrayCollection;
						toAC.addItem(ob);
						
						statisticsCB.selectedIndex = 0;
						statisticPersentTI.text = "1";
						
						statisticsCB.invalidateDisplayList();
						statisticsList.invalidateDisplayList();
						
						break;
					case "objective":
						if(aXml1.attribute("type").toString()=="get_color"){
							goalCB.selectedIndex = 3;
							var fromAC:ArrayCollection = mArrayCollectionRegularCB;
							var ob:Object = null;
							for each(var aOb:Object in fromAC){
								var aPieceVO:PieceColorVO = PieceVO.createPieceFromSourceId(aOb.id) as PieceColorVO;
								if(aPieceVO&&aPieceVO.getColorName()==aXml1.attribute("color").toString()){
									ob = aOb;
									break;
								}
							}
							fromAC.removeItemAt(fromAC.getItemIndex(ob));
							ob.col = int(aXml1.attribute("max").toString());
							
							var toAC:ArrayCollection = mArrayCollectionSpesialList;
							toAC.addItem(ob);
							
							if(goalCollectionRegularCB){
								collectionNumTI.text = "1";
								goalCollectionSpesialList.invalidateDisplayList();
								goalCollectionRegularCB.selectedIndex = 0;
								goalCollectionRegularCB.invalidateDisplayList();
							}
						}else if(aXml1.attribute("type").toString()=="clearbacks"){
							goalCB.selectedIndex = 2;
						}else if(aXml1.attribute("type").toString()=="score"){
							goalCB.selectedIndex = 0;
							aXml1.attribute("max").toString();
						}else{
							goalCB.selectedIndex = 1;
							onGoalCBChange(null);
							if(goalViewStack){
								goalViewStack.invalidateDisplayList();
								goalViewStack.invalidateProperties();
							}
							
							var toIL:ArrayCollection = mArrayIngridientsList;
							var aSid:int = int(aXml1.attribute("type").toString().substr(10))+8;
							for each(var aObj in toIL){
								if(aObj.id == "3_"+aSid+"_1"){
									aObj.number=int(aXml1.attribute("max").toString());
									aObj.frequency=int(aXml1.attribute("freq").toString());
									break;
								}
							}
							if(goalIngridientsList){
								goalIngridientsList.invalidateDisplayList();
								goalIngridientsList.invalidateList();
							}
						}
						break;
					case "score":
						tiCountStar1.text = aXml1.attribute("star1").toString();
						tiCountStar2.text = aXml1.attribute("star2").toString();
						tiCountStar3.text = aXml1.attribute("star3").toString();
						break;
					case "limit":
						if(aXml1.attribute("type").toString()=="moves"){
							rbTime.selected=false;
							tiMovesLevel.text = aXml1.attribute("max").toString();
						}else{
							rbTime.selected=true;
							tiTimeLevel.text = aXml1.attribute("max").toString();
						}
						break;
					default:
						trace("NotFound!!! "+aXml1.name());
				}
			}
			onGoalCBChange(null);
			//goalIngridientsList.dataProvider.addAll(PieceCherryVO.getAllSource());*/
		}
	}
}