<?php
	/*
	 * SetSettings.php PHP Library 0.9
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

if($_GET['id'])
{
	if(file_exists('prefs.json'))
	{
		$_JSON = file_get_contents('prefs.json')
			or die(json_encode(array('error'=>'Couldn\'t open file for reading') ) );
		$_JSON = json_decode($_JSON);
	}
	else
	{
		die(json_encode(array('error'=>'Couldn\'t open file for reading') ) );
	}
}

//This is our switch, depending on the action, depends on the function we run:
switch($_GET['id'])
{

	case '':
		break;
	case 'web_searches':
		$n=count($_JSON->web_searches);
		for($i=0; $i<$n; ++$i)
		{
			if($_JSON->web_searches->$i->name == $_GET['value'])
			{
				if($_GET['action']=='remove')
				{
					unset($_JSON->web_searches->$i);
					$write=true;
				}
				elseif($_GET['action']=='set')
				{
					$_JSON->web_searches->$i->url == $_GET['value2'];
					$write=true;
				}
			}
		}
		if(!$write && $_GET['value'] && $_GET['value2'] && $_GET['action']=='set')
		{
			++$i;
			$_JSON->web_searches->$i =
				array('name'=>$_GET['value'], 'url'=>$_GET['value2']);
			$write=true;
		}
		break;
	default:
		if($_GET['action']=='remove')
		{
			unset($_JSON->$_GET['id']);
			$write=true;
		}
		elseif($_GET['action']=='set')
		{
			$_JSON->$_GET['id']=$_GET['value'];
			$write=true;
		}
		break;

}

if($write==true)
{
	$handler = @fopen('prefs.json', 'w')
		or die(json_encode(array(
			'error'=>'Couldn\'t open file for writing. May be a permission error') ) );;
	if($handler)
	{
		$_JSON = json_encode($_JSON);
		fwrite($handler, $_JSON);
		fclose($handler);
		die($_JSON);
	}
	else
	{
		die(json_encode(array('error'=>'Couldn\'t open file for writing') ) );
	}
}