/* 
 PureMVC Flex/WebORB Demo – Login 
 Copyright (c) 2007 Jens Krause <jens.krause@puremvc.org> <www.websector.de>
 Your reuse is governed by the Creative Commons Attribution 3.0 License
 */
package org.plamee.view
{
	
	import flash.display.DisplayObject;
	import flash.events.MouseEvent;
	
	import mx.controls.Alert;
	import mx.core.Container;
	import mx.managers.PopUpManager;
	
	import org.plamee.ApplicationFacade;
	import org.plamee.controller.AddLevelCommand;
	import org.plamee.controller.DeleteLevelCommand;
	import org.plamee.controller.ExportLevelsCommand;
	import org.plamee.controller.GetLevelByIdCommand;
	import org.plamee.controller.GetLevelsCommand;
	import org.plamee.controller.SaveChaptersCommand;
	import org.plamee.controller.UpdateLevelCommand;
	import org.plamee.model.ApplicationProxy;
	import org.plamee.model.ChapterProxy;
	import org.plamee.model.LevelProxy;
	import org.plamee.model.LoginProxy;
	import org.plamee.model.vo.LevelVO;
	import org.plamee.view.components.ChapterWindow;
	import org.plamee.view.components.LoadWindow;
	import org.plamee.view.components.LoginPanel;
	import org.plamee.view.components.SaveWindow;
	import org.plamee.view.events.ChapterWindowEvent;
	import org.plamee.view.events.LoadWindowEvent;
	import org.plamee.view.events.SaveWindowEvent;
	import org.puremvc.as3.interfaces.IMediator;
	import org.puremvc.as3.interfaces.INotification;
	import org.puremvc.as3.patterns.mediator.Mediator;
	
	/**
	 * A Mediator for interacting with the top level Application.
	 */
	public class ApplicationMediator extends Mediator implements IMediator
	{
		public static const NAME:String = 'ApplicationMediator';
		public static const GET_LEVELS:String = 'getLevels';
		public static const LOAD_LEVEL:String = 'loadLevel';
		public static const DELETE_LEVEL:String = 'deleteLevel';
		public static const SAVE_LEVEL:String = 'saveLevel';
		public static const OVERWRITE_LEVEL:String = 'overwriteLevel';
		public static const EXPORT_LEVELS:String = 'exportLevels';	
		

		private var _appProxy: ApplicationProxy;
		private var _loginProxy: LoginProxy;
		private var _loginPanel:LoginPanel;
		
		private var loadWindow:LoadWindow;
		private var saveWindow:SaveWindow;
		
		
		private var chapterSettingsWindow:ChapterWindow;
					
		/**
		 * Constructor. 
		 * 
		 * @param object the viewComponent
		 */
		public function ApplicationMediator( viewComponent: Match3Editor ) 
		{
			super(NAME, viewComponent);
			
			facade.registerCommand(GET_LEVELS, GetLevelsCommand);
			facade.registerCommand(LOAD_LEVEL, GetLevelByIdCommand);
			facade.registerCommand(DELETE_LEVEL, DeleteLevelCommand);
			facade.registerCommand(SAVE_LEVEL, AddLevelCommand);
			facade.registerCommand(OVERWRITE_LEVEL, UpdateLevelCommand);
			facade.registerCommand(EXPORT_LEVELS, ExportLevelsCommand);
			
			
			//
			// register the needed mediators for its child components
			createPanels();
			//
			// local reference to the proxies
			_appProxy = facade.retrieveProxy(ApplicationProxy.NAME) as ApplicationProxy;
			
			app.logoutBtn.addEventListener(MouseEvent.CLICK, onLogoutClick);
			
			app.openBtn.addEventListener(MouseEvent.CLICK, onOpenClicked);
			app.saveBtn.addEventListener(MouseEvent.CLICK, onSaveClicked);
			app.chapterBtn.addEventListener(MouseEvent.CLICK, onChaptersSettingsClicked);
			
			
		}
		
		private function onLogoutClick(e:MouseEvent):void
		{
			app.onNewClick();
			sendNotification(ApplicationFacade.LOGOUT);
		}
		
		private function onOpenClicked(e:MouseEvent):void
		{
			openLoadWindow();
		}
		
		private function openLoadWindow():void
		{
			if(loadWindow == null)
			{
				loadWindow = new LoadWindow();
				loadWindow.addEventListener(LoadWindowEvent.DELETE_LEVEL, onDeleteLevel);
				loadWindow.addEventListener(LoadWindowEvent.LOAD_LEVEL, onLoadLevel);
				loadWindow.addEventListener(LoadWindowEvent.EXPORT_LEVELS, onExportLevels);
			}
			
			
			loadWindow.openWindow(app as DisplayObject);
			sendNotification(GET_LEVELS);
		}
		
		private function onDeleteLevel(e:LoadWindowEvent):void
		{
			sendNotification(DELETE_LEVEL, e.levelId);
		}
		
		private function onLoadLevel(e:LoadWindowEvent):void
		{
			sendNotification(LOAD_LEVEL, e.levelId);
		}
		
		private function onExportLevels(e:LoadWindowEvent):void
		{
			sendNotification(EXPORT_LEVELS, e.exportLevelsIds);
		}
		
		
		private function onSaveClicked(e:MouseEvent):void
		{
			var lLevel:Object = app.getLevel();
			if(lLevel==null)return;
			openSaveWindow();
		}
		
		private function openSaveWindow():void
		{
			saveWindow:SaveWindow
			
			if(saveWindow == null)
			{
				saveWindow = new SaveWindow();
				saveWindow.addEventListener(SaveWindowEvent.DELETE_LEVEL, onDeleteLevelFromSave);
				saveWindow.addEventListener(SaveWindowEvent.SAVE_LEVEL, onSaveLevel);
				saveWindow.addEventListener(SaveWindowEvent.OVERWRITE_LEVEL, onOverwriteLevel);
				saveWindow.addEventListener(SaveWindowEvent.EXPORT_LEVELS, onExportLevelsFromSave);
			}
			
			
			saveWindow.openWindow(app as DisplayObject);
			sendNotification(GET_LEVELS);
		}
		
		private function onDeleteLevelFromSave(e:SaveWindowEvent):void
		{
			sendNotification(DELETE_LEVEL, e.levelId);
		}
		
		private function onExportLevelsFromSave(e:SaveWindowEvent):void
		{
			sendNotification(EXPORT_LEVELS, e.exportLevelsIds);
		}
		
		private function onSaveLevel(e:SaveWindowEvent):void
		{
			var lLevelVO:LevelVO = app.getLevel();
			lLevelVO.name = e.levelName;
			if (e.showJson)
			{
				app.showJsonMessage(JSON.stringify(lLevelVO.export()));
			}
			sendNotification(SAVE_LEVEL, [e.levelName, e.levelPublic, lLevelVO.export()]);
		}
		
		private function onOverwriteLevel(e:SaveWindowEvent):void
		{
			var lLevelVO:LevelVO = app.getLevel();
			lLevelVO.name = e.levelName;
			if (e.showJson)
			{
				app.showJsonMessage(JSON.stringify(lLevelVO.export()));
			}
			sendNotification(OVERWRITE_LEVEL, [e.levelId, e.levelPublic, lLevelVO.export()]);
		}
		
		private function onChaptersSettingsClicked(e:MouseEvent):void
		{
			openChapterSettingsWindow();
		}
		
		private function openChapterSettingsWindow():void
		{
			if(chapterSettingsWindow == null)
			{
				chapterSettingsWindow = new ChapterWindow();
				facade.registerMediator(new ChaptersMediator(chapterSettingsWindow));
			}
			chapterSettingsWindow.openWindow(app as DisplayObject);
		}		

		
		private function createPanels():void
		{
			if(!_loginPanel)
			{
				_loginPanel = new LoginPanel();
				facade.registerMediator(new LoginPanelMediator(_loginPanel));
			}
		}

		/**
		 * List all notifications this Mediator is interested in.
		 * 
		 * @return Array the list of Nofitication names
		 */
		override public function listNotificationInterests():Array 
		{
			
			return [ 	
						ApplicationProxy.VIEW_STATE_CHANGED,
						LevelProxy.GOT_LEVEL_LIST,
						LevelProxy.GET_LEVEL_LIST_FAULT,
						LevelProxy.GOT_LEVEL_BY_ID,
						LevelProxy.GET_LEVEL_BY_ID_FAULT,
						LevelProxy.LEVEL_DELETED,
						LevelProxy.DELETE_LEVEL_BY_ID_FAULT,
						LevelProxy.LEVEL_UPDATED,
						LevelProxy.UPDATE_LEVEL_BY_ID_FAULT,
						LevelProxy.ADDED_NEW_LEVEL,
						LevelProxy.ADD_NEW_LEVEL_FAULT
					];
		}

		/**
		 * Handle all notifications this Mediator is interested in.
		 * 
		 * @param INotification a notification 
		 */
		override public function handleNotification( note:INotification ):void 
		{
			switch (note.getName()) 
			{
				case ApplicationProxy.VIEW_STATE_CHANGED:
					changeLoginState();
				break;
				case LevelProxy.GOT_LEVEL_LIST:
					if(loadWindow && loadWindow.opened)
						loadWindow.initList(note.getBody() as Array);
					if(saveWindow && saveWindow.opened)
						saveWindow.initList(note.getBody() as Array);				
				break;				
				case LevelProxy.GET_LEVEL_LIST_FAULT:
					if(loadWindow && loadWindow.opened)
						loadWindow.closeWindow();
					if(saveWindow && saveWindow.opened)
						saveWindow.closeWindow();			
					
					Alert.show(note.getBody() as String);
				break;				
				case LevelProxy.GOT_LEVEL_BY_ID:
					if(loadWindow)
					{
						loadWindow.closeWindow();
					}
					app.setLevel(note.getBody(), loadWindow ? loadWindow.showJson.selected  : false);
					// load LEVEL
				break;				
				case LevelProxy.GET_LEVEL_BY_ID_FAULT:
					if(loadWindow)
						loadWindow.enabled = true;
					Alert.show(note.getBody() as String);					
				break;				
				case LevelProxy.LEVEL_DELETED:
					if(loadWindow && loadWindow.opened)
						loadWindow.levelDeletedSuccesfuly();
					if(saveWindow && saveWindow.opened)
						saveWindow.levelDeletedSuccesfuly();					
				break;				
				case LevelProxy.DELETE_LEVEL_BY_ID_FAULT:
					if(loadWindow && loadWindow.opened)
						loadWindow.enabled = true;
					if(saveWindow && saveWindow.opened)
						saveWindow.enabled = true;					
					Alert.show(note.getBody() as String);
				break;			
				
				case LevelProxy.LEVEL_UPDATED:
					if(saveWindow)
					{	
						saveWindow.closeWindow();
						saveWindow.exportLevels();
					}
					// LEVEL updated
					break;				
				case LevelProxy.UPDATE_LEVEL_BY_ID_FAULT:
					if(saveWindow)
						saveWindow.enabled = true;
					Alert.show(note.getBody() as String);					
					break;			
				
				case LevelProxy.ADDED_NEW_LEVEL:
					if(saveWindow)
					{
						saveWindow.closeWindow();
						saveWindow.exportLevels(note.getBody() as int);
					}
					// LEVEL added
					break;				
				case LevelProxy.ADD_NEW_LEVEL_FAULT:
					if(saveWindow)
						saveWindow.enabled = true;
					Alert.show(note.getBody() as String);					
					break;	
				default:
			}
		}	
		
		override public function onRegister():void
		{
			super.onRegister();
			
			// initialize the view state			
			_appProxy.viewState = ApplicationProxy.LOGIN_STATE;	
		}

		/**
		 * Handles the applications view state based on the workflow state defined in Application Proxy
		 */	
		private function changeLoginState():void
		{
			switch (_appProxy.viewState) 
			{
				case ApplicationProxy.LOGIN_STATE:
					showLoginPanel();
				break;
				case ApplicationProxy.LOGIN_ERROR_STATE:
					showLoginPanel();
				break;
				case ApplicationProxy.LOGGED_IN_STATE:
					hideLoginPanel();
				break;
				default:
					showLoginPanel();
			}			
		}
		
		private function showLoginPanel():void
		{
			if(_loginPanel && !_loginPanel.isShowed) 
			{
				PopUpManager.addPopUp(_loginPanel, this.app,true);
				PopUpManager.centerPopUp(_loginPanel);
				_loginPanel.isShowed = true;
			}
		}
		
		private function hideLoginPanel():void
		{
			if(_loginPanel && _loginPanel.isShowed) 
			{
				PopUpManager.removePopUp(_loginPanel);
				_loginPanel.isShowed = false;
			}			
		}
		
		/**
		 * Cast the viewComponent to its actual type.
		 * 
		 * @return app the viewComponent cast to Login
		 */
		protected function get app(): Match3Editor
		{
			return viewComponent as Match3Editor;
		}
	}
}