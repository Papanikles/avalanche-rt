<?php
	/*
	 * TorrentHandler.php PHP Library 0.9
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
//User wants to upload a file
if($_POST['type']=='file')
{
	if(!$_FILES)
	{
		die(json_encode(array('error'=>'FILE not present')));
	}

	$file = $_FILES['torrent_upload_file'];

	if(move_uploaded_file($file['tmp_name'],'torrents/'.$file['name']))
	{
			die(json_encode(array('openfile'=>TRUE)));
	}
	else
	{
		die(json_encode(array('error'=>'Unable to move uploaded file')));
	}
}

die();