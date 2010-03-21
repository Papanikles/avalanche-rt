<?php
	/*
	 * Remote.php PHP Library 0.9
	 *
	 * Avalanche 0.9 Beta
	 *
	 *	This code is licensed under the GPL3, or "GNU GENERAL PUBLIC LICENSE Version 3"
	 *	For more details, see http://opensource.org/licenses/gpl-3.0.html
		*
		* For more information, see http://code.google.com/p/avalanche-rt
		*
		* Date: Tue, 09th Mar 2010.
		*
		* @author Keith Cirkel ('keithamus') <avalanche@keithcirkel.co.uk>
		* @license http://opensource.org/licenses/gpl-3.0.html
		* @copyright Copyright © 2010, Keith Cirkel
		*
		* This program is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * This program is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.

  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
		*
	 */

//Add our includes
require_once('lib/rtorrent.php');
require_once('settings.php');

//Die if we cant find appropriate settings
if(! $configuration['server_ip'])
{
	json_encode(array('error'=>'Settings file not found'));
	die();
}

//Initiate our object
if(strtolower($configuration['server_type']) == 'rtorrent' )
{
	$server = new Rtorrent($configuration);
}


//This is our switch, depending on the action, depends on the function we run:
switch($_GET['action'])
{

	case 'retrieve':
		$contents=$server->Retrieve();
		break;
	case 'debug':
		$contents=$server->Debug();
		break;
	case 'pause':
		//Does the id have the magic id of all?
		if($_GET['id']=='all')
		{
			$contents=$server->PauseAll();
		}
		else
		{
			$contents=$server->Pause($_GET['id']);
		}
		break;
	case 'resume':
		//Does the id have the magic id of all?
		if($_GET['id']=='all')
		{
			$contents=$server->ResumeAll();
		}
		else
		{
			$contents=$server->Resume($_GET['id']);
		}
		break;
	case 'remove':
		$contents=$server->Remove($_GET['id']);
		break;
	case 'loadurl':
		$contents=$server->LoadURL($_GET['id'],$_GET['value']);
		break;
	case 'setname':
		$contents=$server->SetName($_GET['id'],$_GET['value']);
		break;
	case 'setlabel':
		$contents=$server->SetLabel($_GET['id'],$_GET['value']);
		break;
	case 'getpeers':
		$contents=$server->GetPeers($_GET['id']);
		break;
	case 'getfiles':
		$contents=$server->GetFiles($_GET['id']);
		break;
	case 'getdetails':
		$contents=$server->GetDetails($_GET['id']);
		break;
	case 'settorrentpriority':
		$contents=$server->SetTorrentPriority($_GET['id'],$_GET['value']);
		break;
	case 'setfilepriority':
		$contents=$server->SetFilePriority($_GET['id'],$_GET['value'],$_GET['value2']);
		break;
	case 'setrate':
		$contents=$server->SetRate($_GET['id'],$_GET['value']);
		break;
	case 'getrate':
		$contents=$server->GetRate($_GET['id']);
		break;
	case 'gettrackers':
		$contents=$server->GetTrackers($_GET['id']);
		break;
	case 'settracker':
		$contents=$server->SetTracker($_GET['id'],$_GET['value'],$_GET['value2']);
		break;
	case 'listcommands':
		$contents=$server->GetListOfCommands();
		break;
	case 'updatequery':
		$contents=@file_get_contents('http://avalanche-rt.googlecode.com/files/update.json');
		break;
	default:
		$contents=$server->Retrieve();
		break;

}

//Use die to ensure script executes and no extra whitespace is sent (just incase)
die(json_encode($contents) );