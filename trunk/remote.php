<?php
	/*
	 * Remote.php PHP Library 0.9
	 *
	 * Avalanche 0.9 Beta
	 *
	 *	Copyright 2009 © Keithamus
	 *	This code is licensed under the MIT license.
	 *	For more details, see http://www.opensource.org/licenses/mit-license.php
		*
		* For more information, see http://code.google.com/p/avalanche-rt
		*
		* Date: Fri, 19th Feb 2010.
		*
	 */

//We're going to send a header off to say we're JSON
//header('Content-type: application/json');

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
	case 'getsettings':
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
	case 'setpref':
		$file = 'prefs.json';
		$settings=json_decode(file_get_contents($file) );
		$settings[$_GET['id']]=$_GET['value'];
		write_settings_file($file, $settings);
		break;
	case 'addsearchengine':
		$file = 'prefs.json';
		$settings=json_decode(file_get_contents($file) );
		$settings['web_searches'][$_GET['id']]=$_GET['value'];
		write_settings_file($file, $settings);
		break;
	case 'removesearchengine':
		$file = 'prefs.json';
		$settings=json_decode(file_get_contents($file) );
		unset($settings['web_searches'][$_GET['id']]);
		write_settings_file($file, $settings);
		break;
	case 'renametorrent':
		$file = 'prefs.json';
		$settings=json_decode(file_get_contents($file) );
		$settings['rename_list'][$_GET['id']]=$_GET['value'];
		write_settings_file($file, $settings);
		break;
	case 'removerenametorrent':
		$file = 'prefs.json';
		$settings=json_decode(file_get_contents($file) );
		unset($settings['rename_list'][$_GET['id']]);
		write_settings_file($file, $settings);
		break;
	default:
		break;

}

function write_settings_file($file, $settings)
{
	$handler = fopen($file, 'w');
	if($handler)
	{
		$settings = json_encode($settings);
		fwrite($handler, $settings);
		fclose($handler);
		die($settings);
	}
	else
	{
		die(json_encode(array('error'=>'Couldn\'t open file for writing') ) );
	}
}

//Use die to ensure script executes and no extra whitespace is sent (just incase)
die(json_encode($contents) );