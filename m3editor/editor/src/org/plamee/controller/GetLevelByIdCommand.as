package org.plamee.controller
{	
	import org.plamee.model.LevelProxy;
	import org.puremvc.as3.interfaces.INotification;
	import org.puremvc.as3.patterns.command.SimpleCommand;

	public class GetLevelByIdCommand extends SimpleCommand
	{
		override public function execute(note: INotification) :void	
		{
			var levelId:int = note.getBody() as int;
			
			var levelProxy: LevelProxy = facade.retrieveProxy(LevelProxy.NAME) as LevelProxy;
			levelProxy.getLevelById(levelId);
		}		
	}
}