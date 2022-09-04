package org.plamee.controller
{	
	import org.plamee.model.LevelProxy;
	import org.puremvc.as3.interfaces.INotification;
	import org.puremvc.as3.patterns.command.SimpleCommand;

	public class GetLevelsCommand extends SimpleCommand
	{
		override public function execute(note: INotification) :void	
		{
			var levelProxy: LevelProxy = facade.retrieveProxy(LevelProxy.NAME) as LevelProxy;
			levelProxy.getLevelsList();
		}		
	}
}