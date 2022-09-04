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
	import org.plamee.controller.GetAllChaptersSettingsCommand;

	import org.plamee.controller.SaveChaptersCommand;
	import org.plamee.model.ApplicationProxy;
	import org.plamee.model.ChapterProxy;
	import org.plamee.model.LevelProxy;
	import org.plamee.view.components.ChapterWindow;

	import org.plamee.view.events.ChapterWindowEvent;
	import org.plamee.view.events.ChaptersWindowEvent;
	import org.puremvc.as3.interfaces.IMediator;
	import org.puremvc.as3.interfaces.INotification;
	import org.puremvc.as3.patterns.mediator.Mediator;
	
	/**
	 * A Mediator for interacting with the top level Application.
	 */
	public class ChaptersMediator extends Mediator implements IMediator
	{
		public static const NAME:String = 'ChaptersMediator';
		public static const SAVE_CHAPTERS:String = 'saveChapters';
		public static const GET_ALL_CHAPTERS_SETTINGS:String = 'getAllChaptersSettings';
		

		//private var chaperWindow:ChapterWindow;
					
		/**
		 * Constructor. 
		 * 
		 * @param object the viewComponent
		 */
		public function ChaptersMediator( viewComponent: ChapterWindow ) 
		{
			super(NAME, viewComponent);
			facade.registerCommand(SAVE_CHAPTERS, SaveChaptersCommand);
			facade.registerCommand(GET_ALL_CHAPTERS_SETTINGS, GetAllChaptersSettingsCommand);

			app.addEventListener(ChaptersWindowEvent.GET_CHAPTER_SETTINGS, onGetChaptersSettingsClicked);
			app.addEventListener(ChapterWindowEvent.SAVE_CHAPTERS, onSaveChapters);
	
		}
		
		private function onGetChaptersSettingsClicked(e:ChaptersWindowEvent):void
		{
			sendNotification(GET_ALL_CHAPTERS_SETTINGS);
			sendNotification(ApplicationMediator.GET_LEVELS);
		}
		
		private function onSaveChapters(e:ChapterWindowEvent):void
		{
			sendNotification(SAVE_CHAPTERS, e.chaptersAr);
		}		
		
		/**
		 * List all notifications this Mediator is interested in.
		 * 
		 * @return Array the list of Nofitication names
		 */
		override public function listNotificationInterests():Array 
		{
			
			return [ 	
						LevelProxy.GOT_LEVEL_LIST,
						LevelProxy.GET_LEVEL_LIST_FAULT,
						ChapterProxy.SAVED_CHAPTERS,
						ChapterProxy.SAVE_CHAPTERS_FAULT,
						ChapterProxy.GOT_ALL_CHAPTERS_SETTIGNS,
						ChapterProxy.GET_ALL_CHAPTERS_SETTINGS_FAULT
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
				case LevelProxy.GOT_LEVEL_LIST:
					if(app.opened)
						app.initList(note.getBody() as Array);					
				break;				
				case LevelProxy.GET_LEVEL_LIST_FAULT:
					if(app.opened)
						app.closeWindow();					
				break;				

				case ChapterProxy.SAVED_CHAPTERS:
					if(app.opened)
					{
						app.savedChapters(note.getBody() as String);
					}
					
					break;				
				case ChapterProxy.SAVE_CHAPTERS_FAULT:
					if(app.opened)
						app.enabled = true;
					Alert.show(note.getBody() as String);					
					break;
				case ChapterProxy.GOT_ALL_CHAPTERS_SETTIGNS:
					if(app.opened)
						app.gotChapters(note.getBody() as Array);
					break;	
				case ChapterProxy.GET_ALL_CHAPTERS_SETTINGS_FAULT:
					if(app.opened)
						app.closeWindow();
					Alert.show(note.getBody() as String);					
					break;				
				
				default:
			}
		}	
		
		/**
		 * Cast the viewComponent to its actual type.
		 * 
		 * @return app the viewComponent cast to Login
		 */
		protected function get app(): ChapterWindow
		{
			return viewComponent as ChapterWindow;
		}
	}
}