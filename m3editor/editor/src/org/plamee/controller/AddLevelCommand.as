package org.plamee.controller
{	
	import org.plamee.model.LevelProxy;
	import org.puremvc.as3.interfaces.INotification;
	import org.puremvc.as3.patterns.command.SimpleCommand;

	public class AddLevelCommand extends SimpleCommand
	{
		override public function execute(note: INotification) :void	
		{
			var ar: Array = note.getBody() as Array;
			var levelProxy: LevelProxy = facade.retrieveProxy(LevelProxy.NAME) as LevelProxy;
			levelProxy.addNewLevel(ar[0],ar[1],ar[2]);
		}		
	}
}