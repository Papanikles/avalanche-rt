<?php
	/*
	 * Rtorrent.php PHP Library 0.9
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

require_once('xmlrpc.php');

class Rtorrent
{

	private $server;
	private $params;

	function __construct($params)
	{

		$this->params = $params;

		$this->server = new xmlrpc_client(
			$params['rtorrent_scgi_folder'],
			$params['server_ip'],
			$params['server_port'],
			(isset($params['https']) && $params['https']=false)?'https':'http11'
		);


		if(isset($params['username']) && isset($params['password']) )
		{
			$this->server->setCredentials(
				$params['username'],
				$params['password'],
				$params['set_auth_digest']?CURLAUTH_ANY:CURLAUTH_BASIC
			);
		}

	}

	private function SendAndRecieve($message)
	{

		$this->server->return_type = 'phpvals';
		$this->server->no_multicall = true;

		//Fixes the HTTP/1.1 417 Expect: error.
		$curlopts = array(CURLOPT_HTTPHEADER => array('Expect:'));

		//If the user has "trust_cert" set to true, then set curl to do so
		if(isset($this->params['trust_cert']) && $this->params['trust_cert'] === true)
		{
			$this->client->setSSLVerifyPeer(FALSE);
		}

		$this->server->SetCurlOptions($curlopts);
		$response = $this->server->send($message);

		if(isset($_GET['debugResponse'])) { print_r($response); }

		if($response->faultCode() )
		{

			return $response->faultString();

		}
		else
		{

			return $response->value();

		}

	}

	public function Retrieve($id='')
	{

		$message = new xmlrpcmsg('d.multicall', array(
			new xmlrpcval('name'), //Make an array for all loaded torrents
			new xmlrpcval('d.get_hash='), //The torrent hash
			new xmlrpcval('d.get_name='), //Torrent's name
			new xmlrpcval('d.get_state='), //0 = stopped, 1 = started
			new xmlrpcval('d.get_size_bytes='), //The size in bytes
			new xmlrpcval('d.get_bytes_done='), //How many bytes completed
			new xmlrpcval('d.get_up_total='), //How much in total has been uploaded
			new xmlrpcval('d.get_down_rate='), //Download rate in bytes
			new xmlrpcval('d.get_up_rate='), //Upload rate in bytes
			new xmlrpcval('d.get_peers_connected='), //Amount of connected peers
			new xmlrpcval('d.get_peers_not_connected='), //Amount of unconnected peers
			new xmlrpcval('d.get_peers_accounted='), //Number of leechers
			new xmlrpcval('d.get_complete='), //Is the torrent completely downloaded?
			new xmlrpcval('d.is_hash_checking='), //Is it rehashing?
			new xmlrpcval('d.get_creation_date='), //Date torrent added
			new xmlrpcval('d.get_base_path='), //Where the torrent exists
			new xmlrpcval('d.get_free_diskspace='), //Free disk space where torrent is
			new xmlrpcval('d.is_private='), //Is torrent private?
			new xmlrpcval('d.get_message='), //Comment
			new xmlrpcval('d.get_priority='), //Priority (number)
			new xmlrpcval('d.is_hash_checked='), //Has it been hash checked before?
			new xmlrpcval('d.get_skip_total='), //How many wasted bytes?
			new xmlrpcval('d.get_custom5='), //We use this for the torrents "new name"
			new xmlrpcval('d.get_custom4='), //We use this for the torrents "label"
			//http://libtorrent.rakshasa.no/ticket/1538 < Describes a solution for
			//rtorrent builds that don't use I8, we multiply chunk_size by size_chunks
			new xmlrpcval('d.get_chunk_size='), //Get the size of a single chunk in bytes
			new xmlrpcval('d.get_size_chunks='), //Get how many chunks are in the torrent
			new xmlrpcval('d.get_completed_chunks=') //Get how many chunks have downloaded.
		) );

		$torrents = $this->SendAndRecieve($message);

		if(!is_array($torrents) )
		{

			return json_encode(array('error'=>$torrents));

		}

		foreach($torrents as $torrent)
		{

				$df = @disk_free_space(dirname($torrent[14]));
				$dt = @disk_total_space(dirname($torrent[14]));

				$return_array[$torrent[0]] = array(

					'name' => htmlentities($torrent[1]),
					'is_downloading' => $torrent[2],
					//Old versions of rtorrent use i4 which buffer overflows > 4gb
					'size' => $torrent[3]<0?$torrent[23]* $torrent[24]:$torrent[3],
					'downloaded' => $torrent[4]<0?$torrent[23]* $torrent[25]:$torrent[4],
					'uploaded' => $torrent[5]<0?2147483648:$torrent[5],
					'down_rate' => $torrent[6],
					'up_rate' => $torrent[7],
					'peers_connected' => $torrent[8]-($torrent[8]-$torrent[10]),
					'peers_total' => $torrent[9]+$torrent[8],
					'seeders_connected' => $torrent[8]-$torrent[10],
					'is_completed' => $torrent[11],
					'is_hashing' => $torrent[12],
					'date_added' => $torrent[13],
					'base_path' => $torrent[14],
					//Remember the bug above? We're going to mangle this a bit...
					'free_diskspace' => $df?$df:$torrent[15],
					'total_diskspace' => $dt?$dt:0,
					'private' => $torrent[16],
					'tracker_status' => $torrent[17],
					'priority' => $torrent[18],
					'has_been_hashed' => $torrent[19],
					'wasted_bytes' => $torrent[20],
					'new_name' => $torrent[21],
					'label' => $torrent[22],

				);

		}

		return $return_array;

	}

	public function LoadURL($url, $start)
	{
		$command = $start=='true'?'load_start_verbose':'load_verbose';

		$message = new xmlrpcmsg($command, array(new xmlrpcval($url) ) );

		$response = $this->SendAndRecieve($message);

		$this->server->setDebug(2);

		$return = array();

		$return['openurl']=$response==0?true:false;

		return $return;

	}

	public function Remove($id)
	{

		$message = new xmlrpcmsg('d.erase', array(new xmlrpcval($id) ) );

		$response = $this->SendAndRecieve($message);

		$return = array();

		$return['remove']=$response==0?true:alse;

		return $return;

	}

	public function Pause($id)
	{

		$message = new xmlrpcmsg('d.stop', array(new xmlrpcval($id)));

		$this->SendAndRecieve($message);

		$message = new xmlrpcmsg('d.close', array(new xmlrpcval($id)));

		$response = $this->SendAndRecieve($message);

		$return = array();

		$return['pause']=$response==0?true:false;

		return $return;

	}

	public function PauseAll()
	{

		$message = new xmlrpcmsg('d.multicall', array(
			new xmlrpcval('started'), //Get all ongoing torrents
			new xmlrpcval('d.stop='), //Stop all ongoing torrents
		));

		$this->SendAndRecieve($message);

		$message = new xmlrpcmsg('d.multicall', array(
			new xmlrpcval('stopped'), //Get all ongoing torrents
			new xmlrpcval('d.close='), //Stop all ongoing torrents
		));

		$response = $this->SendAndRecieve($message);

		$return = array();

		$return['pause']=$response==0?true:false;

		return $return;

	}

	public function Resume($id)
	{

		$message = new xmlrpcmsg('d.open', array(new xmlrpcval($id)));

		$this->SendAndRecieve($message);

		$message = new xmlrpcmsg('d.start', array(new xmlrpcval($id)));

		$response = $this->SendAndRecieve($message);

		$return = array();

		$return['resume']=$response==0?true:false;

		return $return;

	}

	public function ResumeAll()
	{

		$message = new xmlrpcmsg('d.multicall', array(
			new xmlrpcval('closed'), //Get all ongoing torrents
			new xmlrpcval('d.open='), //Stop all ongoing torrents
		));

		$this->SendAndRecieve($message);

		$message = new xmlrpcmsg('d.multicall', array(
			new xmlrpcval('stopped'), //Get all ongoing torrents
			new xmlrpcval('d.start='), //Stop all ongoing torrents
		));

		$response = $this->SendAndRecieve($message);

		$return = array();

		$return['pause']=$response==0?true:false;

		return $return;

	}

	public function SetTorrentPriority($id, $priority)
	{
		$message = new xmlrpcmsg('d.set_priority',array(
			new xmlrpcval($id), //Torrent ID
			new xmlrpcval($priority, 'int'), //Priority
		));

		$response = $this->SendAndRecieve($message);

		$return = array();

		$return['setpriority']=$response==0?true:false;

		return $return;

	}

	public function SetFilePriority($id, $file_id, $priority)
	{
		//We have a range of priorities
		if(strpos($file_id,':'))
		{
			$priorities_ar = array();
			$file_id= explode(':', $file_id);
			for($i=$file_id[0]; $i<=$file_id[1]; ++$i)
			{
				$priorities_ar[]= new xmlrpcval(array(
						'methodName'=>new xmlrpcval('f.set_priority'),
						'params'=>new xmlrpcval(array(
								new xmlrpcval($id),
								new xmlrpcval($i, 'int'),
								new xmlrpcval($priority, 'int'),
							), 'array')
					),'struct');

			}
		}
		elseif(strpos($file_id,','))
		{
			$priorities_ar = array();
			$file_id= explode(',', $file_id);
			$count = count($file_id);
			for($i=0; $i<=$count; ++$i)
			{
				$priorities_ar[]= new xmlrpcval(array(
						'methodName'=>new xmlrpcval('f.set_priority'),
						'params'=>new xmlrpcval(array(
								new xmlrpcval($id),
								new xmlrpcval($file_id[$i], 'int'),
								new xmlrpcval($priority, 'int'),
							), 'array')
					),'struct');

			}
		}
		else
		{
			$priorities_ar = array(new xmlrpcval(array(
						'methodName'=>new xmlrpcval('f.set_priority'),
						'params'=>new xmlrpcval(array(
								new xmlrpcval($id),
								new xmlrpcval($file_id, 'int'),
								new xmlrpcval($priority, 'int'),
							), 'array')
					),'struct'));
		}

		$priorities_ar[] = new xmlrpcval(array(
					'methodName'=>new xmlrpcval('d.update_priorities'),
					'params'=>new xmlrpcval(array(
							new xmlrpcval($id)
					), 'array'),
				), 'struct');

		$message = new xmlrpcmsg('system.multicall',array(
			new xmlrpcval($priorities_ar, 'array')));


		$response = $this->SendAndRecieve($message);

		$return = array();

		$return['setpriority']=true;

		foreach($response as $response_array)
		{
			foreach($response_array as $res)
			{
				if($res!=0)
				{
					$return['setpriority']=false;
					return $return;
				}
			}
		}

		return $return;

	}

	public function SetRate($type, $rate)
	{

		if($type!= 'upload' && $type!= 'download')
		{
			return json_encode(array('error'=>'Unrecognised command'));
		}
		else
		{
			$message = new xmlrpcmsg('set_'.$type.'_rate', array(new xmlrpcval($rate.'k')));

			$response = $this->SendAndRecieve($message);

			$return = array();

			$return['setrate']=$response==0?true:false;

			return $return;

		}

	}

	public function GetRate($id)
	{

		if($id!= 'upload' && $id!= 'download')
		{
			return json_encode(array('error'=>'Unrecognised command'));
		}
		else
		{
			$message = new xmlrpcmsg('get_'.$id.'_rate');
		}

			return array('getRate'=>$this->SendAndRecieve($message)/1024);

	}

	public function GetTrackers($id)
	{

		$message = new xmlrpcmsg('t.multicall', array(
			new xmlrpcval($id), //Torrent ID
			new xmlrpcval(''),
			new xmlrpcval('t.get_url='), //Tracker's URL
			new xmlrpcval('t.get_scrape_incomplete='), //The peers scraped from the tracker
			new xmlrpcval('t.get_scrape_complete='), //The seeders scraped from the tracker
			new xmlrpcval('t.is_enabled='), //0 = disabled , 1 = enabled
			new xmlrpcval('t.get_group='), //0 = disabled , 1 = enabled
			new xmlrpcval('t.is_open='), //0 = closed , 1 = open
		) );

		$trackers = $this->SendAndRecieve($message);

		if(!is_array($trackers) )
		{

			return json_encode(array('error'=>$trackers));

		}

		$return_array = array();

		foreach($trackers as $tracker)
		{

				$return_array[$tracker[0]] = array(

					'peers' => $tracker[1],
					'seeders' => $tracker[2],
					'enabled' => $tracker[3]==1?true:false,
					'id' => $tracker[4],
					'open' => $tracker[5]==1?true:false,

				);

		}

		if(array_key_exists('dht://', $return_array))
		{
			$message = new xmlrpcmsg('dht_statistics', array(new xmlrpcval($id)));
			$dht = $this->SendAndRecieve($message);
			$return_array['dht://']['peers']=$dht['peers'];
			$return_array['dht://']['nodes']=$dht['nodes'];
			unset($return_array['dht://']['seeders']);
		}

		return $return_array;

	}

	public function SetTracker($id, $tracker, $state)
	{
		$state=$state==1?1:0;

		$message = new xmlrpcmsg('t.set_enabled', array(
			new xmlrpcval($id), //Torrent ID
			new xmlrpcval($tracker, 'int'), //The tracker ID
			new xmlrpcval($state, 'int') //Disabled or Enabled.
		) );

		$response = $this->SendAndRecieve($message);

		$return = array();

		$return['settracker']=$reponse[0]==0?true:false;

		return $return;
	}

	public function GetPeers($id)
	{

		$message = new xmlrpcmsg('p.multicall', array(
			new xmlrpcval($id), //Torrent ID
			new xmlrpcval(''),
			new xmlrpcval('p.get_address='), //The peer IP
			new xmlrpcval('p.get_client_version='), //Peers rtorrent Program
			new xmlrpcval('p.get_completed_percent='), //Peers % complete
			new xmlrpcval('p.get_down_rate='), //How fast this peer is seeding to us
			new xmlrpcval('p.get_down_total='), //How much they've seeded to us
			new xmlrpcval('p.get_up_rate='), //How fast we're seeding to this peer
			new xmlrpcval('p.get_up_total='), //How much we've seeded to them
			new xmlrpcval('p.is_encrypted='), //0 = not encrypted , 1 = encrypted
			new xmlrpcval('p.is_obfuscated='), //0 = not obf., 1 = obf.
			new xmlrpcval('p.is_snubbed='), //0 = not snubbed, 1 = snubbed
		) );

		$peers = $this->SendAndRecieve($message);

		if(!is_array($peers) )
		{

			return json_encode(array('error'=>$peers));

		}

		$return_array = array();

		foreach($peers as $peer)
		{

				$return_array[$peer[0]] = array(

					'client' => $peer[1],
					'completed_percent' => $peer[2],
					'down_rate' => $peer[3],
					'down_total' => $peer[4],
					'up_rate' => $peer[5],
					'up_total' => $peer[6],
					'is_e' => $peer[7],
					'is_o' => $peer[8],
					'is_s' => $peer[9],

				);

		}

		return $return_array;

	}

	public function GetFiles($id)
	{

		$message = new xmlrpcmsg('f.multicall', array(
			new xmlrpcval($id), //Torrent ID
			new xmlrpcval(''),
			new xmlrpcval('f.get_path='), //The file path
			new xmlrpcval('f.get_priority='), //The file priority
			new xmlrpcval('f.get_size_bytes='), //The file size in bytes
			new xmlrpcval('f.get_completed_chunks='), //Chunks done of the file
			new xmlrpcval('f.get_size_chunks='), //The file size in chunks
			new xmlrpcval('f.get_size_chunks='), //The file size in chunks
		) );

		$files = $this->SendAndRecieve($message);

		if(!is_array($files) )
		{

			return json_encode(array('error'=>$files));

		}

		$return_array = array();

		foreach($files as $file)
		{

				$return_array[] = array(

					'path' => $file[0],
					'priority' => $file[1],
					'size_bytes' => $file[2]<0?2147483648:$file[2],
					'chunks_complete' => $file[3],
					'chunks' => $file[4]

				);

		}

		return $return_array;

	}

	public function SetName($id, $name)
	{
		$message = new xmlrpcmsg('d.set_custom5',
			array(new xmlrpcval($id), new xmlrpcval($name) ) );

		$reponse = $this->SendAndRecieve($message);

		$return = array();

		$return['rename']=$reponse[0]==0?true:false;

		return $return;
	}

	public function SetLabel($id, $label)
	{

		$message = new xmlrpcmsg('d.set_custom4',
			array(new xmlrpcmsg($id), new xmlrpcmsg($label) ) );

		$reponse = $this->SendAndRecieve($message);

		$return = array();

		$return['setLabel']=$reponse[0]==0?true:false;

		return $return;

	}

	public function GetListOfCommands()
	{

		$message = new xmlrpcmsg('system.listMethods');
		return $this->SendAndRecieve($message);

	}

	public function Debug()
	{

		$message = new xmlrpcmsg('system.listMethods');
		$this->server->setDebug(2);
		print_r($this);
		return $this->SendAndRecieve($message);

	}

}