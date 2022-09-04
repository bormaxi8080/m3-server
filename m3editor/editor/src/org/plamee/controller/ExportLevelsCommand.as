package org.plamee.controller
{	
	import org.plamee.model.LevelProxy;
	import org.puremvc.as3.interfaces.INotification;
	import org.puremvc.as3.patterns.command.SimpleCommand;

	public class ExportLevelsCommand extends SimpleCommand
	{
		override public function execute(note: INotification) :void	
		{
			var ids:Array = note.getBody() as Array;
			
			var levelProxy: LevelProxy = facade.retrieveProxy(LevelProxy.NAME) as LevelProxy;
			levelProxy.exportLevels(ids);
		}		
	}
}