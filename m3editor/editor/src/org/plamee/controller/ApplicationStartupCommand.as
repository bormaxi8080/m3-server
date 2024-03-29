/* 
 PureMVC Flex/WebORB Demo – Login 
 Copyright (c) 2007 Jens Krause <jens.krause@puremvc.org> <www.websector.de>
 Your reuse is governed by the Creative Commons Attribution 3.0 License
 */
package org.plamee.controller
{

	import org.puremvc.as3.patterns.command.MacroCommand;

	public class ApplicationStartupCommand extends MacroCommand
	{		
		/**
		 * Adds subcommands to execute in a special order
		 * 
		 */
		override protected function initializeMacroCommand() :void
		{
			addSubCommand( ModelPrepCommand );
			addSubCommand( ViewPrepCommand );
		}		
	}
}