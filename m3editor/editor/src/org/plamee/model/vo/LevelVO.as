package org.plamee.model.vo
{
	public class LevelVO
	{
		private var fLevel:Object; 
		
		public function LevelVO(aLevel:Object = null)
		{
			if (aLevel)
			{
				fLevel = fixImportedLevel(aLevel);
			} else {
				fLevel = {};
			}
		}

        private function fixImportedLevel(aLevel:Object):Object {
            var levelData: Object = JSON.parse(JSON.stringify(aLevel));
            for each (var lCell:Object in levelData.data.cells) {
                if (lCell.reward >= 0) {
                    var reward: Object = levelData.data.rewards[lCell.reward].boosters;
                    if (reward) {
                        var type:String = getObjectKeys(reward)[0];
                        lCell.booster = {};
                        lCell.booster.type = type;
                        lCell.booster.count = reward[type];
                    }
                }
            }
            delete levelData.data.rewards;
            return levelData;
        }

        private static function getObjectKeys(object: Object):Array {
            var keys: Array = [];
            for (var key: String in object) {
                keys.push(key);
            }
            return keys;
        }
		
		public function get content():Object
		{
			return fLevel;
		}

        public function export():Object {
            var contentClone: Object = JSON.parse(JSON.stringify(content));
            contentClone.data.rewards = [];
            var id: int = 0;
            for each (var lCell:Object in contentClone.data.cells) {
                var booster: Object = lCell.booster;
                if (booster) {
                    lCell.reward = id;

                    booster.boosters = {};
                    booster.boosters[booster.type] = booster.count;
                    delete booster.type;
                    delete booster.count;

                    contentClone.data.rewards[id] = booster;
                    delete lCell.booster;

                    id++;
                }
            }
            return contentClone;
        }
		
		public function get name():String
		{
			return fLevel.name;
		}
		
		public function set name(aValue:String):void
		{
			fLevel.name = aValue;
		}
		
		public function setLimit(aType:String, aValue:int):void
		{
			data["limit"] = new Object();
			data["limit"][aType] = aValue;
		}
		
		public function getLimitType():String
		{
			if (data["limit"])
			{
				if (data["limit"]["moves"])
				{
					return "moves";
				}
				if (data["limit"]["time"])
				{
					return "time";
				}
			}
			return "";
		}
		
		public function setExtraTime(inInt:int):void{
			data["extratime"] = inInt;
		}
		public function getExtraTime():int
		{
			if (data.hasOwnProperty("extratime"))
			{
				return data["extratime"];
			}
			return 0;
		}
		public function getLimitValue():int
		{
			if (data["limit"])
			{
				return data["limit"][getLimitType()];
			}
			return -1;
		}
		
		public function set background(aValue:String):void
		{
			data["background"] = aValue;
		}
		
		public function get background():String
		{
			if (data["background"])
			{
				return data["background"];
			}
			return "";	
		}
		
		public function setObjectiveScore():void
		{
			objectives;
		}
		
		public function setObjectiveClearbacks():void
		{
			objectives["clearbacks"] = true;
		}
		
		public function getObjectiveClearbacks():Boolean			
		{
			if (data["objectives"] && objectives["clearbacks"])
			{
				return true;
			}
			return false;
		}
		
		public function setObjectiveToys():void{
			objectives["toys"] = true;
		}
		public function getObjectiveToys():Boolean			{
			return (data["objectives"] && objectives["toys"]);
		}

		public function setObjectiveGlass(aValue:int):void
		{
			objectives["glass"] = aValue;
		}
		
		public function getObjectiveGlass():int
		{
			if (data["objectives"] && objectives["glass"])
			{
				return objectives["glass"];
			}
			return -1;
		}
		
		public function setObjectiveGetColors(aColors:Array):void
		{
			objectives["get_colors"] = aColors;
		}

		public function getObjectiveGetColors():Array
		{
			if (data["objectives"] && objectives["get_colors"])
			{
				return objectives["get_colors"];
			}
			return null;
		}
		
		public function setObjectiveGetIngredients(aMaxInField:int, aSpawnDelay:int, aIngredients:Object):void
		{
			objectives["get_ingredients"] = new Object();
			objectives["get_ingredients"]["max_in_field"] = aMaxInField;
			objectives["get_ingredients"]["spawn_delay"] = aSpawnDelay;
			objectives["get_ingredients"]["ingredients"] = aIngredients;
		}
		
		public function getObjectiveGetIngredients():Object
		{
			if (data["objectives"] && objectives["get_ingredients"])
			{
				return objectives["get_ingredients"];
			}
			return null;
		}
		
		public function setBoss(aSpawnDelay:int, aBlockers:Object):void
		{
			data["boss"] = new Object();
			data["boss"]["spawn_delay"] = aSpawnDelay;
			data["boss"]["blockers"] = aBlockers;
		}
		
		public function getBossSpawnDelay():int
		{
			if (data["boss"])
			{
				return data["boss"]["spawn_delay"];
			}
			return -1;
		}
		
		public function getBossBlockers():Object
		{
			if (data["boss"])
			{
				return data["boss"]["blockers"];
			}
			return null;
		}
		
		public function set scores(aScore:Array):void
		{
			data["scores"] = aScore;
		}
		
		public function get scores():Array
		{
			if (data["scores"])
			{
				return data["scores"] as Array;
			}
			return null;
		}
		
		public function setBoardSize(aWidth:int, aHeight:int):void
		{
			data["board"] = {"width": aWidth, "height": aHeight};
		}
		
		public function getBoardSize():Object
		{
			if (data["board"])				
			{
				return data["board"];
			}
			return null;
		}
		
		public function setStatistics(aNormal:Object, aEasy:Object):void
		{
			data["colors"] = new Object();
			data["colors"]["normal"] = aNormal;
			data["colors"]["easy"] = aEasy;
		}
		
		public function getStatistics():Object
		{	
			if (data["colors"])
			{
				return data["colors"];
			}
			return null;
		}
		
		public function getStatisticEasy():Object
		{
			if (data["colors"] && data["colors"]["easy"])
			{
				return data["colors"]["easy"];
			}
			return null;
		}
		
		public function getStatisticNormal():Object
		{
			if (data["colors"] && data["colors"]["normal"])
			{
				return data["colors"]["normal"];
			}
			return null;
		}

		public function set cells(aCells:Array):void
		{
			data["cells"] = aCells;
		}
		
		public function get cells():Array
		{
			return data["cells"]; 
		}
		
		public function set toys(inToys:Array):void{
			data["toys"] = inToys;
		}
		
		public function get toys():Array{
			return data["toys"]; 
		}
		
		private function get objectives():Object
		{
			if (!data["objectives"])
			{
				data["objectives"] = new Object(); 
			}
			return data["objectives"];
		}
		
		private function get data():Object
		{
			if (!fLevel.data)
			{
				fLevel.data = new Object();
			}
			return fLevel.data;		
		}
		
		public function getSpecialPiecesOnField():Array
		{
			var lSpecials:Array = [];
			for each (var lCell:Object in cells)
			{
				if(lCell["piece"])
				{
					var aSPieceVO:PieceVO = null;
					switch(lCell["piece"])
					{
						case "pastry_bag":
						case "rainbow_cupcake":
						case "spatula":
							if (lSpecials[lCell["piece"]])
							{
								lSpecials[lCell["piece"]] += 1;
							} else {
								lSpecials[lCell["piece"]] = 1;
							}
							break;
					}
				}
			}
			return lSpecials;
		}
		
		public function getBoostersOnField():Array
		{
			var lBoosters:Array = [];
			for each (var lCell:Object in cells)
			{
				if (lCell["booster"])
				{
					if (lBoosters[lCell["booster"]["type"]])
					{
						lBoosters[lCell["booster"]["type"]] += lCell["booster"]["count"];
					} else {
						lBoosters[lCell["booster"]["type"]] = lCell["booster"]["count"];
					}
				}
			}
			return lBoosters;
		}
		
		public function calculateBoosterTypesOnField():int
		{ 
			var lBoosters:Array = getBoostersOnField();
			var length:int = 0;
			for  (var lBooster in lBoosters)
			{
				length++;
			}
			return length;
		}
	}
}