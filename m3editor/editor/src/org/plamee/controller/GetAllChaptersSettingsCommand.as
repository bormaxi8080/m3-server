package org.plamee.controller
{	
	import org.plamee.model.ChapterProxy;
	import org.plamee.model.LevelProxy;
	import org.puremvc.as3.interfaces.INotification;
	import org.puremvc.as3.patterns.command.SimpleCommand;

	public class GetAllChaptersSettingsCommand extends SimpleCommand
	{
		override public function execute(note: INotification) :void	
		{
		
			var chapterProxy: ChapterProxy = facade.retrieveProxy(ChapterProxy.NAME) as ChapterProxy;
			chapterProxy.getAllChaptersSettings();
		}		
	}
}