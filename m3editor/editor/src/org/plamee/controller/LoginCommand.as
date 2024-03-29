/* 
 PureMVC Flex/WebORB Demo – Login 
 Copyright (c) 2007 Jens Krause <jens.krause@puremvc.org> <www.websector.de>
 Your reuse is governed by the Creative Commons Attribution 3.0 License
 */
package org.plamee.controller
{	
	import org.plamee.model.LoginProxy;
	import org.plamee.model.vo.LoginVO;
	import org.puremvc.as3.interfaces.INotification;
	import org.puremvc.as3.patterns.command.SimpleCommand;

	public class LoginCommand extends SimpleCommand
	{
		/**
		 * Listens to the login notification retrieving the LoginProxy and does login
		 */
		override public function execute(note: INotification) :void	
		{
			var loginVO: LoginVO = note.getBody() as LoginVO;
			var loginProxy: LoginProxy = facade.retrieveProxy(LoginProxy.NAME) as LoginProxy;
			loginProxy.loginUser(loginVO);
		}		
	}
}