package org.plamee.managers 
{
	import flash.display.DisplayObject;
	
	import mx.controls.Image;
	import mx.managers.CursorManager;
	import mx.managers.CursorManagerPriority;
	
	import org.plamee.view.components.CellViewCanvas;

	public final class SelectionManager {
		
		private static var instance:SelectionManager = new SelectionManager();
		
		
		public static const REGULAR_STATE:int = 0;
		public static const DROW_STATE:int = 1;
		public static const PORTAL_IN_STATE:int = 2;
		public static const PORTAL_OUT_STATE:int = 3;
		
		public var mCellCanvasPortal:CellViewCanvas = null;
		
		
		private var _selectedItemId:String = ""; 
		private var _selectedItemSource:String = ""; 
		private var _selectedItemAmount:int; 
		
		public var _selectedItemCount		:int=1; //заряд чайника
		public var _selectedItemMax			:int=1; //максимальный заряд чайника
		
		public var wasClicked:Boolean = false;
		
		public var state:int = REGULAR_STATE;
		public var portalLastNum:int = 0;
		
		public var gridArray:Array;
		
		
		public function SelectionManager() {
			
			if( instance ) throw new Error( "SelectionManager singleton and can only be accessed through SelectionManager.getInstance()" ); 
			
		}
		
		public static function getInstance():SelectionManager {
			
			return instance;
			
		}
		
		public function changeSelection(selectedItemId:String, selectedItemSource:String, selectedItemAmount:int = 1):void
		{
			state = DROW_STATE;
			_selectedItemId = selectedItemId;
			_selectedItemSource = selectedItemSource;
			_selectedItemAmount = selectedItemAmount;
		}
		
		public function get selectedItemId():String
		{
			return _selectedItemId;
		}
		
		public function get selectedItemSource():String
		{
			return _selectedItemSource;
		}
		
		public function get selectedItemAmount():int
		{
			return _selectedItemAmount;
		}
		
		public function set selectedItemAmount(selectedItemAmount:int):void
		{
			_selectedItemAmount = selectedItemAmount;
		}
		
	}	
	
}
	
	