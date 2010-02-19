	/*
	 * Remote.js Javascript Library 0.9
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


function Remote(controller)
{
	this.init();
	window.remote = this;
}

Remote.prototype =
{

	/*
	 * Constructor
	 */
	init: function(controller)
	{
		this._error='';
		this.json=[];
	},

	/*
	 * A generic request handler to make internal functions easier.
	 */
	request: function(action, id, func, value, value2)
	{
		//Flush the json object.
		this.json = [];

		if (id == null) {
			id = '';
		}

		if(value2)
		{
			params = {'action':action,'id':id, 'value':value, 'value2':value2};
		}
		else if(value)
		{
			params = {'action':action,'id':id, 'value':value};
		}
		else
		{
			params = {'action':action,'id':id};
		}

		$.getJSON('remote.php', params,
			function(data)
			{
				//If we returned an error we should do something with it.
				if(data && data.error)
				{
					remote._error = data.error;
					console.log('Error: '+ remote._error)
				}
				//Otherwise we're golden to set the global JSON object
				else if(action!='retrieve')
				{
					remote.json = data;
				}

				//Now we should run the function we were asked to:
				func(data);

			});

	},

	/*
	 * Retrieve Main Torrent List
	 */
	retrieve: function(func)
	{
		this.request('retrieve', null, func);
	},

	/*
	 * Remove torrents
	 */
	remove: function(hash, func)
	{
		this.request('remove', hash, func);
	},

	/*
	 * Resume torrents
	 */
	resume: function(hash, func)
	{
		this.request('resume', hash, func);
	},

	/*
	 * Pause torrents
	 */
	pause: function(hash, func)
	{
		this.request('pause', hash, func);
	},

	/*
	 * Rename torrents
	 */
	rename: function(hash, value, func)
	{
		this.request('setname', hash, func, value);
	},

	/*
	 * Set the upload speed
	 */
	setRate: function(type, Kbytes, func)
	{
		if(Kbytes=='Unlimited') { Kbytes = "0"; }
		this.request('setrate', type, func, Kbytes);
	},

	setTorrentPriority: function(id, priority, func)
	{
		this.request('settorrentpriority', id, func, priority);
	},

	setFilePriority: function(id, file_id, priority, func)
	{
		this.request('setfilepriority', id, func, file_id, priority);
	},

	/*
	 * Get the trackers of a torrent
	 */
	getTrackers: function(id, func)
	{
		this.request('gettrackers', id, func);
	},

	/*
	 * Get the peers of a torrent
	 */
	getPeers: function(id, func)
	{
		this.request('getpeers', id, func);
	},


	/*
	 * Get the files of a torrent
	 */
	getFiles: function(id, func)
	{
		this.request('getfiles', id, func);
	},

	/*
	 * Set the tracker of a torrent to enabled/disabled
	 */
	setTracker: function(id, tracker_id, enabled, func)
	{
		if(!enabled) { enabled = '0'; }
		this.request('settracker', id, func, tracker_id, enabled);
	},

	/*
	 * Set the download speed
	 */
	getRate: function(type, func)
	{
		this.request('getrate', type, func);
	},

	truefalse: function(func, id, istruefunc)
	{
		this[func](id, function(data)
		{
			if(data[func])
			{
				istruefunc();
			}
			else
			{
				console.log('Error: Could not '+ func+ '('+ id+ '): '+ data.error);
			}
		});
	},

	/*
	 * Open a torrent URL
	 */
	openURL: function(url, func, start)
	{
		this.request('loadurl', url, func, start);
	}

}