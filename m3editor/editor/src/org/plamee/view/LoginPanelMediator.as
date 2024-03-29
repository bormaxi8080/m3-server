/* 
 PureMVC Flex/WebORB Demo – Login 
 Copyright (c) 2007 Jens Krause <jens.krause@puremvc.org> <www.websector.de>
 Your reuse is governed by the Creative Commons Attribution 3.0 License
 */
package org.plamee.view
{	
	import flash.events.Event;
	
	import org.plamee.ApplicationFacade;
	import org.plamee.model.LoginProxy;
	import org.plamee.model.vo.LoginVO;
	import org.plamee.view.components.LoginPanel;
	import org.puremvc.as3.interfaces.IMediator;
	import org.puremvc.as3.interfaces.INotification;
	import org.puremvc.as3.patterns.mediator.Mediator;

	
	/**
	 * A Mediator for interacting with the LoginPanel component.
	 */	
	public class LoginPanelMediator extends Mediator implements IMediator
	{

		private var _loginProxy: LoginProxy;

		public static const NAME:String = 'LoginPanelMediator';

		/**
		 * Constructor. 
		 * @param object the viewComponent
		 */				
		public function LoginPanelMediator(viewComponent: LoginPanel) 
		{
			super(NAME, viewComponent);
			//
			// local reference to the LoginProxy
			_loginProxy = facade.retrieveProxy( LoginProxy.NAME ) as LoginProxy;
			//
			// listen to events dispatched by its view component
			loginPanel.addEventListener( LoginPanel.TRY_LOGIN, login );
			
		}

		/**
		 * List all notifications this Mediator is interested in.
		 * 
		 * @return Array the list of Nofitication names
		 */
		override public function listNotificationInterests():Array 
		{
			return [ 
						LoginProxy.LOGIN_FAILED,
						LoginProxy.LOGIN_SUCCESS
					 ];
		}

		/**
		 * Handle all notifications this Mediator is interested in.
		 * 
		 * @param INotification a notification 
		 */
		override public function handleNotification( note:INotification ):void 
		{
			switch ( note.getName() ) 
			{
				case LoginProxy.LOGIN_FAILED:
					loginPanel.statusMessage.htmlText = "<font color='#FF6600'>" + String(note.getBody()) + "</font>";
				break;
				case LoginProxy.LOGIN_SUCCESS:
					loginPanel.statusMessage.htmlText = "";
					loginPanel.saveNewUser();
				break;
				default:

			}
		}		


		/**
		 * The user has initiated to log in.
		 */
		private function login (event: Event=null ): void
		{			
			var loginVO: LoginVO = new LoginVO();
			loginVO.username = loginPanel.username.text;
			loginVO.password = loginPanel.password.text;

			sendNotification( ApplicationFacade.LOGIN, loginVO );
		}

		/**
		 * Cast the viewComponent to its actual type.
		 * @return app the viewComponent cast to LoginPanel
		 */
		protected function get loginPanel(): LoginPanel
		{
			return viewComponent as LoginPanel;
		}
	}
}