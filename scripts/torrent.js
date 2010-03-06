	/*
	 * Torrent.js Javascript Library 0.9
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

/*
 * Torrent
 *
 * Initialised the Torrent.prototype object.
 *
 * @returns {object} The Torrent.prototype object.
 */
function Torrent()
{
	window.torrent = this;
	this.init();
}

Torrent.prototype =
{

	/*
	 * Init
	 *
	 * Initialises the Object, and starts all the user interface listeners
	 *
  */
	init: function()
	{
		// We're now going to go through and add functionality to all of our UI elements...

		// SECTION: Main
		$(document).keyup(torrent.keyupBody);
		$(document).keydown(torrent.keydownBody);
		$('body').bind('contextmenu',function(){$('.contextmenu').hide();});
		//Stop the torrent list being scrolled with up+down arrows, as it bugs our code up
		$('#torrent_list').keydown(function(e)
		{
			if(!e.keyCode) return false;
			if($('input:focus').length>0) return true;
			if(e.keyCode == 38) { return false; } //Down Arrow
			if(e.keyCode == 40) { return false; } //Up arrow
			if(e.keyCode == 32) { return false; } //Space bar
			return true;
		});

		// SECTION: Anchor tags with the rel of "func":
		$('a[rel="func"]').click(function(e)
		{
			torrent[e.currentTarget.hash.substr(1).split('/')[0]](e);
		});

		// SECTION: Anchor tags with the rel of "openDialogue":
		$('a[rel="openDialogue"]').click(function(e)
		{
			_args = e.currentTarget.hash.substr(1).split('/');
			torrent.openDialogue(_args[0],torrent[_args[1]]);
		});

		// SECTION: Anchor tags with the rel of "openMenu":
		$('a[rel="openMenu"]').click(torrent.openMenu);

		// SECTION: Input boxes with a name attr:
		$('input[name]').keyup(function(e){ torrent[e.currentTarget.name](e); });

		// SECTION: Input boxes with wrappers need their parent's parents class changed:
		$('.wrapper input').focus(
			function(e) { e.currentTarget.parentNode.parentNode.className ='active'; });
		$('.wrapper input').blur(
			function(e) { e.currentTarget.parentNode.parentNode.className = ''; });

		// SECTION: Web search bar needs to do a few things:
		$('#web_search_delete_text').click(
			function() { $('#web_search').attr('value',''); $(this).hide(); });
		//Set a default search string:
		$('#web_search').attr('search_string',settings.web_searches[0].url);

		//SECDION: Open Button
		$('#open_dialogue .initiate').click(torrent.openTorrent);

		// SECTION: Details Container
		$('#details_header h1').click(
			function(){ torrent.renameTorrent(true); });

		//We'll also use the hash url to filter torrents (thinking page refreshing)
		hash = window.location.hash.substr(1).split('/');
		if(hash[0]=='filterTorrentStatus')
		{
			$('#filter_'+ hash[1]).click();
		}
		else
		{
			$('#filter_torrent a').click();
		}

		//We can also use the hash url to initate the open dialogue box:
		if(hash[0]=='open_dialogue')
		{
			$('#header_open a').click();
			file = window.location.hash.substr(15);
			$('#torrent_upload_url').attr('value',file?file:'');
		}

		//Use updateUserInterface to generate a list of torrents.
		remote.retrieve(this.updateUserInterface);

	},

	/*
	 * updateUserInterface
	 *
	 * Updates all the necessary UI elements.
	 *
		*/
	updateUserInterface: function(torrentlist)
	{

		window.torrentlist = torrentlist;
		if(typeof window.torrentlist != 'object')
		{
			torrent.openDialogue('error_popup');
			$('#error_details').text(
			'Error parsing remote.php'+ "\n\nBad Json\n\n"+ window.torrentlist).focus().select();
		}
		else
		{
			//Let's set up some variables to use later on
			var total_down = 0;
			var total_up = 0;

			//Each JSON object is a torrent, so we can process each one individually.
			$.each(
				torrentlist,
				function(hash,data)
				{
					//Just put the hash into the data object, so we can later get to it.
					data.hash = hash

					//Iterate over some variables for things like "Total Transfers" etc.
					total_down += data.down_rate;
					total_up += data.up_rate;

					torrent.updateTorrentListNode(data);
				});

			//Ok, so we've parsed through each torrent. All torrents have been added to
			//the list, so now we just need to do some general interface cleanup.

			//We'll change the "0" in the status_torrent_count to the number of torrents:
			$('#status_torrent_count').text($('#torrent_list .torrent').length);
			//We're going to change "0 B/s" at the top to "X B/s"
			$('#status_download').text(Math.formatBytes(total_down)+ '/s');
			//We're going to change "0 B/s" at the top to "X B/s"
			$('#status_upload').text(Math.formatBytes(total_up)+ '/s');

			torrent.updateFilterNumbers('');

			//If we're updating, torrent's might have moved state, so we should re-filter:
			$('#filter_bar li.active a').click();
		}

		//Now lets run this again after a set period of time to update the details:
		setTimeout(function(){
			remote.retrieve(torrent.updateUserInterface) }, settings.refresh_delay);

	},

	/*
	 * updateTorrentListNode
	 *
	 * Updates the HTML in a torrent in the #torrent_list ul.
	 *
	 * @argument data {object} The torrent's data object
	 *
		*/
	updateTorrentListNode: function(data)
	{

		//Does the node actually exist? If it doesn't we should create it:
		if(!$('#'+ data.hash).get(0))
		{
			$('#torrent_list #expected').remove();
			// Lots of chaining here, but its all self explanatory:
			$('#torrent_list').append($('<li/>').addClass('torrent').attr('id',data.hash).
				click(torrent.clickTorrent).
				bind('contextmenu', torrent.rightClickTorrent).
				append($('<h2/>')).
				append($('<input/>')).
				append($('<span/>').addClass('progress_details')).
				append($('<div/>').addClass('progress_bar_container').
					append($('<div/>').addClass('progress_bar')).attr('href','#')).
				append($('<a/>').click(torrent.clickTorrentButton)).
				append($('<span/>').addClass('peer_details')));
		}

		//Fill the new name with something if it is empty
		if(data.new_name=='') { data.new_name=data.name; }

		//Also add a share_ratio
		data.share_ratio = (data.uploaded / data.size).toFixed(3)

		//Also put a "percentage done" in the data object, very useful:
		data.percent_done = ((100/ data.size)* data.downloaded).toFixed(2);

		//Remove all status classes so we can put the ones we want back in:
		$('#'+ data.hash).removeClass('hashing seeding downloading completed paused');
		//If the torrent is hashing, we'll give it the "hashing" css class
		if(data.is_hashing)
		{
			$('#'+ data.hash).addClass('hashing');
		}
		//If the torrent is seeding, we'll give it the "seeding" css class
		else if(data.is_completed && data.is_downloading)
		{
			$('#'+ data.hash).addClass('seeding');
		}
		//If the torrent is downloading, we'll give it the "downloading" css class
		else if(data.is_downloading)
		{
			$('#'+ data.hash).addClass('downloading');
		}
		//If the torrent is completed, we'll give it the "completed" css class
		else if(data.is_completed)
		{
			$('#'+ data.hash).addClass('completed');
		}
		//If its none of these, then it's paused. Add a "paused" css class
		else
		{
			$('#'+ data.hash).addClass('paused');
		}

		// Put the torrents name in the H2.
		$('#'+ data.hash+ ' h2').text(data.new_name);

		//If the torrent is hashing, we're going to make the details say
		//"X MB of X GB checked"
		if(data.is_hashing)
		{
			$('#'+ data.hash+ ' .progress_details').text(
				Math.formatBytes(data.downloaded)+ ' of '+ Math.formatBytes(data.size)+
			', checked');
		}
		//If the torrent is completed (seeding or not), its going to say
		//"X GB, uploaded X MB (Ratio X.XXX)"
		else if(data.is_completed)
		{
			$('#'+ data.hash+ ' .progress_details').text(Math.formatBytes(data.size)+
			', uploaded '+ Math.formatBytes(data.uploaded)+ ' (Ratio '+
			(data.uploaded / data.size).toFixed(3)+ ')');
		}
		//If the torrent is active (downloading), then its going to say
		//"X MB of X GB (X%), uploaded X MB (Ratio X.XXX)"
		else
		{
			$('#'+ data.hash+ ' .progress_details').text(Math.formatBytes(data.downloaded)+
			' of '+ Math.formatBytes(data.size)+ ' ('+ data.percent_done+ '%), uploaded '+
			Math.formatBytes(data.uploaded)+ ' (Ratio '+ (data.uploaded / data.size).toFixed(3)+ ')');
		}

		//We're going to assign the progress bar a width of the percentage done
		$('#'+ data.hash+ ' .progress_bar').css('width', data.percent_done+ '%');

		//If the torrent is hashing, then the peer details span will say
		//"Checking consistency, X% done".
		if(data.is_hashing)
		{
			$('#'+ data.hash+ ' .peer_details').text('Checking consistency, '+
			data.percent_done+ '% done');
		}
		//If the torrent is seeding, we'll get it to say
		//"Seeding to X of X peers - UL: X.XX KB/s"
		else if(data.is_completed && data.is_downloading)
		{
			$('#'+ data.hash+ ' .peer_details').text('Seeding to '+
				data.peers_connected+ ' of '+ data.peers_total+ ' peers - '+ 'UL: '+
				Math.formatBytes(data.up_rate)+ '/s');
		}
		//If the torrent is downloading, it'll say
		//"Downloading from X peers and X seeders our of X total - DL: X KB/s UL: X KB/s"
		else if(data.is_downloading)
		{
				$('#'+ data.hash+ ' .peer_details').text('Downloading from '+
				data.peers_connected+ ' peers and '+ data.seeders_connected+
				' seeders out of '+ data.peers_total+ ' total - '+ 'DL: '+
				Math.formatBytes(data.down_rate)+ '/s UL: '+
				Math.formatBytes(data.up_rate)+ '/s');
		}
		//It the torrent is just completed & not downloading (so, completed+paused)
		//Then just say "Completed, paused"
		else if(data.is_completed)
		{
			$('#'+ data.hash+ ' .peer_details').text('Completed, Paused');
		}
		//If the torrent is unfinished and paused, then just say "Paused".
		else
		{
			$('#'+ data.hash+ ' .peer_details').text('Paused');
		}

		//Lastly, if the details pane is open with a torrent, it needs to be updated too
		if($('#details_container').attr('torrent_id') == data.hash)
		{
			$('#details_container .tabs a.selected').click();
		}

	},

	/*
	 * clickTorrent
	 *
	 * Selects or Unselects the clicked torrent, based on different factors.
	 * This is the sole place that harbours the torrents click LOGIC.
	 *
	 * @argument even {object} The click event object.
	 *
	 * @returns {string} Description
		*/
	clickTorrent: function(event)
	{
		$('.contextmenu').hide();
		$('#torrent_list li input').hide();
		$('#torrent_list li h2').show();
		//If the shiftKey was held down, then we should select a range of torrents.
		if(event.shiftKey)
		{
			//So we'll get the torrent which was clicked on before (and is still selected)
			oldI = $('#torrent_list li').index($('#torrent_list li.selected') );
			//And we'll get the clicked torrent.
			newI = $('#torrent_list li').index(this);
			//Now we'll remove the "selected" class on all torrents.
			$('#torrent_list li').removeClass('selected');
			//If the first selected torrent is ABOVE the clicked torrent, we want to
			// move DOWN the list, from oldI to newI.
			if(newI > oldI)
			{
				//So, move down the list from oldI to newI, and add the selected css class.
				//Oh, and btw, newI+1 because indexes start at 0.
				$('#torrent_list li').slice(oldI, newI+1).filter(':not(:hidden)').
					addClass('selected');
			}
			//If the first selected torrent is BELOW the clicked torrent, we want to move
			// UP the list, from newI to oldI
			else
			{
				//So, we'll do just that, move up the list and give all torrents the selected
				//css class. And once again oldI+1 is because indexes start at 0.
				$('#torrent_list li').slice(newI, oldI+1).filter(':not(:hidden)').
					addClass('selected');
			}
			//Using shift we might end up selecting text, so lets use a quick hack:
			$('#torrent_search').focus().blur();
		}
		//Ok, so the shift key WASNT held, which means we're not selecting a range
		else
		{
			//But, if the ctrlKey was held, then the user wants to add this torrent to their
			//list of already selected torrents. Or they might want to DESELECT this from
			//their list, so we'll just toggle the class for them.
			if(event.ctrlKey)
			{
				//Also, just in case the user switched filters, then ctrl clicked in a new
				//filter window, we don't want them pausing torrents they havent seen, so
				//remove the .selected off of all hidden torrents:
				$('#torrent_list :hidden').removeClass('selected');
				$(this).toggleClass('selected');
			}
			//If the ctrlKey isnt selected then we can just remove all selected classes
			//and start anew.
			else
			{
				$('#torrent_list li').removeClass('selected');
				$(this).addClass('selected');
			}
		}

		//Now regardless of what modifier key has been used, we should atleast make
		//the details pane reflect the click event, so we'll trigger a tab click event.
		$('#details_container').attr('torrent_id',this.id);
		$('#details_container .tabs a.selected').click();

		torrent.updatePauseResumeButtons();

		return false;
	},


	/*
	 * Process a client event on the torrent
	 */
	rightClickTorrent: function(e)
	{
		_id = event.currentTarget.id;
		if(!$('#torrent_list li.selected')[0]) { $('#'+ _id).click(); }
		//Is the pause button disabled? Then disable the resume menu button
		if($('#header_pause a').hasClass('disabled'))
		{ $('#torrent_context_menu li.pause').addClass('disabled'); }
		else { $('#torrent_context_menu li.pause').removeClass('disabled'); }
		//Is the resume button disabled? Then disable the resume menu button
		if($('#header_resume a').hasClass('disabled'))
		{ $('#torrent_context_menu li.resume').addClass('disabled'); }
		else { $('#torrent_context_menu li.resume').removeClass('disabled'); }

		$('#torrent_context_menu').
			css('left',e.pageX).
			css('top',e.pageY).
			show();
		return false;
	},

	clickTorrentButton: function(event)
	{

		_id = event.currentTarget.parentNode.id;
		if($('#'+ _id+ '.seeding, #'+ _id+ '.downloading')[0])
		{
			//Pause the torrent
			remote.truefalse('pause', _id, function(event)
			{
				//It paused, so lets remove the downloading/seeding class.
				$('#'+ _id).addClass($('#'+ _id+ '.downloading')[0]?'paused':'completed').
					removeClass('downloading seeding');
				//Lastly we'll trigger the filter function to get rid incorrectly filtered torrents.
					$('#filter_bar li.active').click();
					torrent.updateFilterNumbers('');
					torrent.updatePauseResumeButtons();
			});
		}
		else if($('#'+ _id+ '.completed, #'+ _id+ '.paused')[0])
		{
			//Resume the torrent
			remote.truefalse('resume', _id, function() {
					//It has resumed, so lets add the downloading class, and remove the old ones
					$('#'+ _id).addClass($('#'+ _id+ '.paused')[0]?'downloading':'seeding').
					 removeClass('paused completed');
					//Lastly we'll trigger the filter function to get rid incorrectly filtered torrents.
					$('#filter_bar li.active').click();
					torrent.updateFilterNumbers('');
					torrent.updatePauseResumeButtons();
			});
		}
		return false;
	},

	/*
 * openTorrent
 *
 * Opens a torrent URL
 *
	*
 */
	openTorrent: function()
	{
		//We don't want it if it isnt a URL:
		if($('#torrent_upload_url').val().substr(0,4)!='http') return false;
		remote.openURL(
			$('#torrent_upload_url').val(), //The URL
			function(){
				if(remote.json.openurl)
				{
					//Close the dialogue box
					$('#open_dialogue').hide();
					//Get the torrent file name, and the first "word"
					search = $('#torrent_upload_url').val().split('/');
					torrent_name = search[search.length-1];
					search = torrent_name.split('_')[0].split('.')[0];

					//We're going to now create a "fake" torrent to use as a guide to show the
					//torrent is opening:
					$('#torrent_list').append($('<li/>').addClass('torrent loading').
						attr('id','expected').
						click(torrent.clickTorrent).
						append($('<h2/>').text(torrent_name)).
						append($('<input/>')).
						append($('<span/>').addClass('progress_details').text('Opening torrent file...')).
						append($('<div/>').addClass('progress_bar_container throbber')).
						append($('<a/>').click(torrent.clickTorrentButton)).
						append($('<span/>').addClass('peer_details').html('&nbsp;')).hide());

					$('#filter_torrent').click();
					$('#torrent_search').val(search).keyup().focus().select();
					$('#torrent_upload_url').val('');
					$('#expected').fadeOut(0).fadeIn(500);

					//Set an "opening" timeout so the users knows his torrent hasnt opened.
					setTimeout(function(){
						if($('#torrent_list #expected')[0])
						{
							$('#torrent_list #expected h2').text(
								$('#torrent_list #expected h2').text()+
								' - Timeout error: torrent not created');
							$('#torrent_list #expected .progress_details').text(
								'Torrent file did not open, make sure the link is right and the torrent'+
								' doesn\'t already exist');
							$('#torrent_list #expected').css('background','#f9e2e2');
							setTimeout(function(){
								$('#torrent_list #expected').fadeIn(0).fadeOut(500,
									function() { $('#torrent_list #expected').remove(); });
								},5000);
						}
					}, settings.refresh_delay * 2);

				}
				else
				{
//					console.log('Error, could not load url: '+ $('#torrent_upload_url').val());
				}
			},
			 $('#torrent_upload_start').attr('checked') //To start automatically or not
		);

	},

	/*
 * removeTorrentDialogue
 *
 * Initiates the remove torrent dialogue
	*
 */
	removeTorrentDialogue: function(e)
	{
			if($('#header_remove a').hasClass('disabled')) return false;
			$('#remove_dialogue').attr('rel','');
			$('#torrent_list li.selected').each(
				function(){
					rel = $('#remove_dialogue').attr('rel')+ this.id+ ',';
					$('#remove_dialogue').attr('rel',rel); }
			);
			if($('#torrent_list li.selected').length>1) {
				$('#remove_dialogue p').text('Are you sure you want to delete these '+
					$('#torrent_list li.selected').length+ ' torrents?');
			}
			else
			{
				$('#remove_dialogue p').text('Are you sure you want to delete torrent: "'+
					$('#torrent_list li.selected h2').text()+ '"?');
			}
			torrent.openDialogue('remove_dialogue',torrent.removeTorrents);
	},

	/*
 * removeTorrents
 *
 * Removes the selected list of torrents.
 *
	*
 */
	removeTorrents: function()
	{
		//Split the list of torrents into an array so we can traverse through it...
		torrents = $('#remove_dialogue').attr('rel').split(',').slice(0,-1);
		$.each(torrents, function(i, id)
		{
			remote.truefalse('remove', id, function()
			{
				$('#'+ id).css('background','#f9e2e2').fadeOut(500, function()
				{
					$('#'+ id).remove();
					//Select the first one in the list of new torrents to stop any errors:
					$('#torrent_list li:not(:hidden)').first().click();
				});
			});
		});
		$('#remove_dialogue').hide();
	},

	/*
 * pauseResumeTorrent
 *
 * The click handler to pause/resume a torrent, a list of torrents, or all torrents.
 *
 * @argument event {object} The click event
 *
 */
	pauseResumeTorrent: function(event)
	{
		//Hide all context menus:
		$('.contextmenu').hide();
		//Check the button isnt disabled:
		if(event.currentTarget.className == 'disabled') return false;

		hash = event.currentTarget.hash.split('/');
		action = hash[1] == 'resume'?'resume': 'pause';

		//If the all button was clicked, act upon all torrents.
		selector = (hash[2] && hash[2] == 'all')?
		'#torrent_list li:not(:hidden':
		'#torrent_list li.selected:not(:hidden';

		selector += action == 'pause'? ',.paused,.completed)': ',.downloading,.seeding)';

		//Run through all the torrents (selected or just all depending on the button)
		$.each($(selector), function(i, _torrent) {

			_id = _torrent.id;

			//Resume/Pause the torrent (depending on the action)
			remote.truefalse(action, _id, function() {
					//We're pausing, so remove "downloading" and "seeding",
					//and add "paused" or "completed"
					if(action == 'pause')
					{
						$('#'+ _id).
							addClass($('#'+ _id).hasClass('downloading')?'paused':'completed').
							removeClass('seeding downloading');

					}
					//We're resuming, so remove "paused" and "completed",
					//and add "downloading" or "seeding"
					else
					{
						$('#'+ _id).
							addClass($('#'+ _id).hasClass('paused')?'downloading':'seeding').
							removeClass('paused completed');
					}
					//Lastly we'll trigger the filter function to get rid incorrectly filtered torrents.
					//Nicely animate the torrent "sliding out" of view if in a filter group
					if(!$('#filter_torrent').hasClass('active'))
					{
					$('#'+ _id).animate(
						{marginRight: '9999px', marginLeft: '-9999px'}, 500, null,
						function()
						{
							$('#filter_bar li.active a').click();
							$('#'+ _id).css('margin-left',0).css('margin-right',0);
						});
					}
					torrent.updateFilterNumbers('');
					torrent.updatePauseResumeButtons();
					torrent.updatePauseResumeButtons();
			});

		});

		return false;
	},

	/*
 * updatePauseResumeButtons
 *
 * Sorts out whether or not the Pause and Resume buttons should be disabled
 *
	*
 */
	updatePauseResumeButtons: function()
	{
		//Now if, after this, we have selected torrents, we can enable the toolbar:
		if($('#torrent_list li.selected')[0])
		{
			//We'll enable our remove button:
			$('#header_remove a').removeClass('disabled');

			//Make sure there is atleast one downloading torrent in the selection
			if($('#torrent_list li.selected.downloading,#torrent_list li.selected.seeding')[0])
			{
				//If there is then pause can be enabled
				$('#header_pause a').removeClass('disabled');
			}
			else
			{
				//There isnt, so pause needs to be disabled.
				$('#header_pause a').addClass('disabled');
			}

			//Make sure there is atleast one non-downloading torrent in the selection
			if($('#torrent_list li.selected:not(.downloading,.seeding)')[0])
			{
				//If there is then pause can be enabled
				$('#header_resume a').removeClass('disabled');
			}
			else
			{
				//There isnt so resume needs to be disabled.
				$('#header_resume a').addClass('disabled');
			}

		}
		else
		{
			$('#header_resume a, #header_pause a, #header_remove a').addClass('disabled');
		}

		//We'll also check the current filter list for the appropriate "all" buttons:
		if($('#torrent_list li:not(:hidden)')[0])
		{
			if($('#torrent_list li:not(.downloading,.seeding):not(:hidden)')[0])
			{
				$('#header_resume_all a').removeClass('disabled');
			}
			else
			{
				$('#header_resume_all a').addClass('disabled');
			}
			if($('#torrent_list li:not(:hidden).downloading,#torrent_list li:not(:hidden).seeding')[0])
			{
				$('#header_pause_all a').removeClass('disabled');
			}
			else
			{
				$('#header_pause_all a').addClass('disabled');
			}
		}
		else
		{
			$('#header_resume_all a, #header_pause_all a').addClass('disabled');
		}
	},

	/*
 * filterTorrentStatus
 *
 * The click handler to filter the torrent list to a particular status.
 *
 * @argument event {object} The click event
 *
 */
	filterTorrentStatus: function(event)
	{
		//Get the filer from the hash
		filter = event.currentTarget.hash.substr(1).split('/')[1];
		if(filter=='all') filter='torrent';
		//So hide all the torrents except those with a class of filter
		$('#torrent_list li').hide().filter('li.'+ filter).show();
		//And make sure the filter's button is "depressed" (active class)
		$('#filter_bar li').removeClass('active').filter('#filter_'+ filter).addClass('active');
		//Also because we have a new list of torrents, we should re-colour alternate rows:
		$('#torrent_list li:not(:hidden)').removeClass('even').filter(':even').addClass('even');
		//Also we should trigger the filter search incase theres any text in it:
		$('#torrent_search').keyup();
		//Then we should update the pause and resume buttons so the right ones are disabled.
		torrent.updatePauseResumeButtons();
	},

	/*
 * renameTorrent
 *
 * The click handler to filter the torrent list to a particular status.
 *
 * @argument event {object} The click event
 *
 */
	renameTorrent: function(detailspane)
	{
		$('.contextmenu').hide();
		$('#torrent_list li input').hide();
		$('#torrent_list li h2').show();
		_id = $('#torrent_list li.selected').first().attr('id');
		if($('#'+ _id)[0])
		{
			if(detailspane==true)
			{
				$('#details_header h1').hide();
				$('#details_header .rename').val($('#details_header h1').text()).show().
					focus().select().unbind('keyup').keyup(
				function(event)
				{
					if(event.keyCode == 13)
					{
						remote.rename(_id, $('#details_header .rename').val(), function()
						{
							if(remote.json.rename)
							{
								$('#details_header h1').text($('#details_header .rename').val());
								$('#'+ _id+ ' h2').text($('#details_header .rename').val());
								$('#details_header .rename').blur();
								$('#details_header .rename').hide();
								$('#details_header h1').show();
							}
						});
						return false;
					}
					return false;
				}).blur(function()
				{
					$('#details_header .rename').hide();
					$('#details_header h1').show();
				}).focusout(function()
				{
					$('#details_header .rename').hide();
					$('#details_header h1').show();
				});
			}
			else
			{
				$('#'+ _id+ ' h2').hide();
				$('#'+ _id+ ' input').val($('#'+ _id+ ' h2').text()).show().focus().
					select().unbind('keyup').keyup(
				function(event)
				{
					if(event.keyCode == 13)
					{
						remote.rename(_id, $('#'+ _id+ ' input').val(), function()
						{
							if(remote.json.rename)
							{
								$('#'+ _id+ ' h2').val($('#'+ _id+ ' input').val());
								$('#details_header h1').val($('#'+ _id+ ' input').val());
								$('#'+ _id+ ' input').blur();
								$('#'+ _id+ ' input').hide();
								$('#'+ _id+ ' h2').show();
							}
						});
						return false;
					}
					return false;
				}).blur(function()
				{
					$('#torrent_list li>input:not(:hidden)').hide();
					$('#torrent_list li>h2:hidden').show();
				}).focusout(function()
				{
					$('#torrent_list li>input:not(:hidden)').hide();
					$('#torrent_list li>h2:hidden').show();
				});
			}
		}
	},

	/*
 * switchDetailTabs
 *
 * The click handler to switch the tabs in the details pane.
 *
 * @argument event {object} The click event
 *
 */
	switchDetailTabs: function(event)
	{
		var hash = event.currentTarget.hash.split('/')[1];
		$('#details_container .tabs li a').removeClass('selected').filter(
			$('#'+event.currentTarget.id)).addClass('selected');
		if($('#details_'+ hash+ '_contain').is(':hidden'))
		{
			$('.details_section').slideUp(250).
				filter('#details_'+ hash+ '_contain').slideDown(250);
		}

		if(! $('#details_container').attr('torrent_id')) return false;
		if(! torrentlist[$('#details_container').attr('torrent_id')]) return false;

		//So first we want to get our data variable:
		data = torrentlist[$('#details_container').attr('torrent_id')];

		$('#details_header_name').text(data.new_name);
		$('#details_header_size').text(Math.formatBytes(data.size));

		if(hash == 'general')
		{

			//We'll make some fluffy new variables out of the sutff we have in data...
			//Like a nicely formatted date of creation:
			var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul',
				'Aug','Sep','Oct','Nov','Dec']
			var date = new Date(data.date_added*1000);
			data.formatted_date = date.getDate()+ ' '+ months[date.getMonth()]+ ' '+
				date.getFullYear()+ ' '+	date.getHours()+ ':'+ date.getMinutes();

			//Add a nicely formatted "time left" string
			//l/u = s
			if(data.downloaded < data.size && data.up_rate > 0)
			{
				data.time_remaining = Math.formatSeconds(
					(data.size - data.downloaded) / data.up_rate);
			}
			else
			{
				data.time_remaining = '&#8734;';
			}

			//Add a nicely calculated "health" string
			//TODO: Health String
			//Add the percentage the torrent has used of the hdd it is saved on
			data.size_percent = ((100/data.free_diskspace)*data.size).toFixed(2)+ '%';

			//Now for each of the "detail_var"s, they just want to be filled with the variable
			// in their "id", so we can quickly go through those:
			$('#details_container .detail_var').each(function()
				{
					id = this.id.substring(11);
					this.innerHTML = data[id]?data[id]:'';
				});

			//Now for each of the "detail_bytes"s, they just want to be filled with the variable
			// in their "id" formatted to bytes/kb/mb etc, so we can quickly go through those:
			$('#details_container .detail_bytes').each(function()
				{
					id = this.id.substring(13);
					this.innerHTML = data[id]?Math.formatBytes(data[id]):'';
				});

			//Show the priority button and put the priority in it:
			priorities = ['Skip', 'Low', 'Normal', 'High'];
			$('#details_priority_button').show().text(priorities[data.priority]).
				attr('href','#setPriority/torrent/'+ data.hash);
			//The progress bar also needs to be set:
			$('#details_general_disk_space .progress_bar').css('width',data.size_percent);
			$('#details_general_disk_space').attr('title',data.size_percent);
		}
		else if(hash == 'files')
		{
			remote.getFiles($('#details_container').attr('torrent_id'), function()
			{
				selector = '#details_files_contain .labellist';
				//Get rid of old files, if we're on a different torrent:
				if($('#details_container').attr('torrent_id')!=
					$('#details_files_contain').attr('current_id'))
				{
					$(selector+ ' li').remove();
				}
				$('#details_files_contain').attr('current_id',
					$('#details_container').attr('torrent_id'));
				hash = $('#details_files_contain').attr('current_id');
				//And add the new ones
				$.each(remote.json, function(i, info)
				{
					//Split the path info:
					path = info.path.split('/');
					//Does our file already exist?
					if(path.length==1 && $('#details_files_contain li#'+ hash+ '_f_'+ i)[0])
					{
						//$('#details_files_contain li#'+ hash+ '_f_'+ i);
					}
					//Our file doesn't exist, lets create it:
					else
					{
						file = path[path.length-1];
						_id = hash+ '_f_'+ i;
						//Create the file LI
						priorities = ['Skip', 'Normal', 'High'];
						_element = $('<li/>').attr('id',_id).
							append($('<h4/>').text(file)).
							append($('<span/>').text(
								(((100/ info.chunks)* info.chunks_complete).toFixed(2))+
								'% of '+ Math.formatBytes(info.size_bytes))).
							append($('<a/>').text(priorities[info.priority]).attr(
								'href','#setPriority/file/'+ $('#details_container').attr('torrent_id')+
								'/'+ i).addClass('priority').click(torrent.setPriority));

						//Do we have folders above us?
						if(path.length>1)
						{
							finali = path.length-1;
							file_id = _id;
							previous_id = 'details_files_contain .labellist';
							//Cycle through each of the parent folders:
							$.each(path, function(i, folder)
							{
								_id = hash+ '_'+ folder.replace(/[^A-Za-z0-9]/g,'_');
								//We're at the final folder's file:
								if(i==finali && !$('#details_files_contain #'+ file_id)[0]) {
									$('#details_files_contain ul#'+ previous_id).append(_element);
								}
								//Our parent folder exists, but we don't, so lets append to it!
								else if(i<finali && $('#'+ previous_id)[0] && !$('#'+ _id)[0])
								{
									priorities = ['Skip', 'Normal', 'High'];
									$('#'+ previous_id).append($('<li/>').addClass('folder').
									append($('<a/>').text(folder).addClass('drop').
										attr('href','#'+ _id).
										click(function(event){
											$(event.currentTarget).parent().toggleClass('d');
											$(event.currentTarget.hash).toggle();
										})).
									append($('<span/>').text(
										(((100/ info.chunks)* info.chunks_complete).toFixed(2))+
										'% of '+ Math.formatBytes(info.size_bytes))).
									append($('<a/>').text(priorities[info.priority]).attr(
										'href','#setPriority/folder/'+ $('#details_container').attr('torrent_id')+
										'/'+ _id).addClass('priority').click(torrent.setPriority)).
									append($('<ul/>').attr('id',_id).hide()));
								}
								previous_id = _id;
							});
						}
						else
						{
							$('#details_files_contain .labellist').append(_element);
						}
					}
				});
			});
		}
		else if(hash == 'peers')
		{
			remote.getPeers($('#details_container').attr('torrent_id'), function()
			{
				//Get rid of old peers, only if they're from another torrent
				if($('#details_container').attr('torrent_id')!=
					$('#details_peers_contain').attr('current_id'))
				{
					$('#details_peers_contain .labellist li').remove();
				}
				$('#details_peers_contain').attr('current_id',
					$('#details_container').attr('torrent_id'));

				//And add the new ones
				$.each(remote.json, function(ip, info)
				{
					_id = ip.replace(/\./g,'_');
					//does the peer li already exist?
					if($('#details_peers_contain li#'+ _id)[0])
					{
						//Really the only thing that will change for a peer is their upload/
						//download speed and the percent completed, so lets adjust those.
						//Is the peer seeding/leeching?
						if(info.down_rate || info.up_rate)
						{
							//If the download span doesnt exist we should create it.
							if(!$('#details_peers_contain li#'+ _id+ ' h4 span')[0])
							{
								$('#details_peers_contain li#'+ _id+ ' h4').append('<span/>');
							}
							$('#details_peers_contain li#'+ _id+ ' h4 span').text(
								'DL: '+ Math.formatBytes(info.down_rate)+
								'/s, UL: '+ Math.formatBytes(info.up_rate)+ '/s');
						}
						//The peer isnt seeding/leeching so lets clear the span
						else
						{
							$('#details_peers_contain li#'+ _id+ ' h4 span').text('');
						}
						$('#details_peers_contain li#'+ _id+ ' h4 div').text(
							info.completed_percent+ '% Done, '+
								Math.formatBytes(info.down_total)+ ' Taken, '+
								Math.formatBytes(info.up_total)+ ' Given');
					}
					else
					{
						_element = $('<li/>').attr('id',_id);
						_name_container = $('<h4/>').text(ip+ ' - '+ info.client);

						if(info.down_rate || info.up_rate)
						{
							_name_container.append($('<span/>').text(
								'DL: '+ Math.formatBytes(info.down_rate)+
								'/s, UL: '+ Math.formatBytes(info.up_rate)+ '/s'));
						}

						_element.append(_name_container);

						_details_container = $('<div/>').text(info.completed_percent+ '% Done, '+
							Math.formatBytes(info.down_total)+ ' Taken, '+
							Math.formatBytes(info.up_total)+ ' Given');

						if(info.is_e)
						{
							_details_container.append($('<b/>').attr('title','Peer is encryped (E)'));
						}
						else if(info.is_o)
						{
							_details_container.append($('<b/>').attr('title','Peer is obfuscated (e)')).
								addClass('o');
						}

						if(info.is_s)
						{
							_details_container.append($('<b/>').attr('title','Peer is snubbed (S)')).
								addClass('s');
						}

						$('#details_peers_contain .labellist').
							append(_element.append(_details_container));
					}

				});
			});
		}
		else if(hash == 'trackers')
		{
			remote.getTrackers($('#details_container').attr('torrent_id'), function()
			{
				//Get rid of old trackers
				$('#details_trackers_contain .labellist li').remove();
				//And add the new ones
				$.each(remote.json, function(url, info)
				{

					$('#details_trackers_contain .labellist').append($('<li/>').attr('id',url).
						append($('<h4/>').text(url)).
						append($('<span/>').text(url=='dht://'?
							info.peers+ ' peers accross '+ info.nodes+ ' nodes':
							info.seeders+ ' seeds and '+ info.peers+ ' peers').
					append($('<a/>').
						attr('id',$('#details_container').attr('torrent_id')+ '_t_'+ info.id).
						addClass(info.enabled?'on':'off').attr('title','Toggle Tracker').
						attr('rel',info.id).click(function(event)
							{
								//event.currentTarget.
								//(id, tracker_id, enabled, func)
								enable = event.currentTarget.className=='on'?0:1;
								remote.setTracker(
									$('#details_container').attr('torrent_id'),
									event.currentTarget.rel,
									enable,
									function(data){
										if(data.settracker && event.currentTarget.className=='on')
										{
											$('#'+ event.currentTarget.id).removeClass('on').addClass('off');
										}
										else if(data.settracker)
										{
											$('#'+ event.currentTarget.id).removeClass('off').addClass('on');
										}
									});
							}))));

				});
			});
		}
	},

	/*
 * setPriority
 *
 * The click handler to set the ordering of torrents.
 *
 * @argument event {object} The click event
 *
 */
	setPriority: function(e)
	{
		args = e.currentTarget.hash.split('/');
		type = args[1];
		if(type=='torrent')
		{
			//We just need to show the menu!
			if(args.length==3)
			{
				$('.contextmenu:not(#priority_menu)').hide();
				$('#priority_menu').toggle();
				left = ($('#details_priority_button').offset().left+
					$('#details_priority_button').outerWidth(true))-$('#priority_menu').outerWidth(true);
				$('#priority_menu').css('left',left);
				$.each($('#priority_menu a'), function(i,a)
				{
					hash = a.hash.split('/');
					priority = hash[hash.length-1];
					a.href = '#setPriority/torrent/'+ args[2]+ '/'+ priority;
				});
			}
			//We want to set the priority (and the torrent exists, and the priority is good)
			else if(args.length==4 && torrentlist[args[2]] && args[3]>=0 && args[3]<4)
			{
				remote.setTorrentPriority(args[2],args[3], function(data)
				{
					if(data.setpriority)
					{
						priorities = ['Skip','Low','Normal','High'];
						$('#details_priority_button').text(priorities[args[3]]);
						$('#priority_menu').hide();
						torrentlist[args[2]].priority = Number(args[3]);
					}
				});
			}
		}
		else if(type=='file' || type=='folder')
		{
			//We just need to show the menu!
			if(args.length==4)
			{
				el = $('#details_files_contain .labellist .priority[href='+
					e.currentTarget.hash+ ']');
				$('#file_priority_menu').toggle();
				$('.contextmenu:not(#file_priority_menu)').hide();
				left = (el.offset().left+el.outerWidth(true))-
					$('#file_priority_menu').outerWidth(true);
				_top = el.offset().top+el.outerHeight(true);
				$('#file_priority_menu').css('left',left).css('top',_top);
				$.each($('#file_priority_menu a'),function(i, a)
				{
					hash = a.hash.split('/');
					priority = hash[hash.length-1];
					a.href = '#setPriority/'+ type+ '/'+ args[2]+ '/'+ args[3]+ '/'+ priority;
				});
			}
			else
			{
				if($('#details_files_contain #'+ args[3]).length>0) {
					_id = $('#details_files_contain #'+ args[3]+ ' li').first().attr('id').substr(-1)+
						':'+ $('#details_files_contain #'+ args[3]+ ' li').last().attr('id').substr(-1);
				}
				else
				{
					_id = args[3];
				}
				remote.setFilePriority(args[2],_id,args[4], function(data)
				{
					if(data.setpriority)
					{
						priorities = ['Skip','Normal','High'];
						if($('#'+ args[3]).length>0)
						{
							$('#'+ args[3]+ ' .priority').text(priorities[args[4]]);
							$('#'+ args[3]).parent().children('.priority').text(priorities[args[4]]);
						}
						else
						{
							$('#'+ args[2]+ '_f_'+ args[3]+ ' .priority').text(priorities[args[4]]);
						}
						$('#file_priority_menu').hide();
					}
				});
			}
		}
	},

	/*
 * setTorrentOrder
 *
 * The click handler to set the ordering of torrents.
 *
 * @argument event {object} The click event
 *
 */
	setTorrentOrder: function(event)
	{
		_class = event.currentTarget.className=='desc'?'asc':'desc';
		_hash = event.currentTarget.hash;
		$('#order_menu a').removeClass().filter(
			$('#order_menu a[href="'+ _hash+ '"]')).removeClass().addClass(_class);

	},

	/*
 * toggleDetailPane
 *
 * The click handler to toggle the details pane
 *
 * @argument event {object} The click event
 *
 */
	toggleDetailPane: function(event)
	{
		if($('#details_container').is(':hidden'))
		{
			//Set the torrent container css to the stored attr of margin-right
			$('#torrent_container').css('margin-right',
				$('#torrent_container').attr('margin-right'));
			//Set the filter bar to the same
			$('#filter_bar').css('margin-right',$('#torrent_container').css('margin-right'));
			$('#details_container').show();

		}
		else
		{
			//Set the torrent container attr to the css of margin-right:
			$('#torrent_container').attr('margin-right',
				$('#torrent_container').css('margin-right'));
			//Now set that css to 0
			$('#torrent_container').css('margin-right','0px');
			//Set the filter bar to the same
			$('#filter_bar').css('margin-right',$('#torrent_container').css('margin-right'));
			$('#details_container').hide();
		}
	},

	/*
 * filterTorrentTitles
 *
 * The type handler for the torrent filter search box
 *
 * @argument event {object} The click event
 *
 */
	filterTorrentTitles: function(event)
	{
		//Was the escape key pressed?...
		if(event.keyCode == 27) {
			//Clear the filter bar
			$('#torrent_search').val('');
			//Reset the filter window
			$('#filter_bar li.active').click();
			//Reset the filter numbers
			torrent.updateFilterNumbers('');
			//Blur the search bar
			$('#torrent_search').blur();
		}

		if($('#torrent_search').val()!='')
		{
			$('#filter_search_delete_text').show();

			//If the user pressed backspace, we should show all the torrents to refilter them
			if(event.keyCode == 8) {
				$('#filter_bar li.active a').click();
			}

			//Hide all the torrents we dont want
			$('#torrent_list li:not(:icontains('+ $('#torrent_search').val()+ '))').hide();

			//Update the filter button numbers to reflect our search
			torrent.updateFilterNumbers('#torrent_list li:icontains('+
				$('#torrent_search').val()+')');

		}
		else
		{
			$('#filter_search_delete_text').hide();
		}
	},

	/*
 * clearFilterTorrent
 *
 * The click handler for the clear torrent filter button
 *
 * @argument event {object} The click event
 *
 */
	clearFilterTorrent: function(event)
	{
		$('#torrent_search').val('');
		$('#filter_search_delete_text').hide();
		$('#filter_bar li.active a').click();
		//Reset the filter button numbers
		torrent.updateFilterNumbers('');
	},

	/*
 * updateFilterNumbers
 *
 * A quick function to update the filter numbers
 *
 * @argument selector {string} The selector to bias the numbers
 *
 */
	updateFilterNumbers: function(selector)
	{
		if(selector=='') { selector = '#torrent_list li'; }
		$('#filter_torrent a').
			text('All ('+ $(selector).length+ ')');
		$('#filter_downloading a').
			text('Downloading ('+ $(selector+ '.downloading').length+ ')');
		$('#filter_seeding a').
			text('Seeding ('+ $(selector+ '.seeding').length+ ')');
		$('#filter_paused a').
			text('Paused ('+ $(selector+ '.paused').length+ ')');
		$('#filter_completed a').
		text('Completed ('+ $(selector+ '.completed').length+ ')');
	},

	/*
 * openMenu
 *
 * The click handler for the upload and download rate buttons
 *
 * @argument menu_id {string} The id of the popup menu
 * @argument button_id {string} The id of the button menu
 *
 */
	openMenu: function(event)
	{
		//Get the menu_id from the A hash
		menu_id = event.currentTarget.hash.substr(1);
		//If the menu_id isnt a DOM object then we should exit
		if(!$('#'+ menu_id)[0]) return false;
		//Otherwise, we'll set its position...
		$('#'+ menu_id).css('left',
			$('#'+ event.currentTarget.id).position().left);
		//...and hide all context menus other than ours...
		$('.contextmenu:not(#'+ menu_id+ ')').hide();
		//...and toggle ours...
		$('#'+ menu_id).toggle();
		//If the menu contains any input boxes, we'll want to focus those for the
		//shortcut diehards:
		if($('#'+ menu_id+ ' input')[0]) $('#'+ menu_id+ ' input').focus().select();


			/* //This would hide the menu when anywhere out of the menu was clicked, but
			  //we use the click triggers too much, so whenever the list is updated the
					//menu disappears, which makes for the menu disappearing alot...
			 setTimeout(function(){$('body').click(function()
			{
				$('#'+ menu_id).hide();
				$('body').unbind('click');
			})},100);*/
	},

	openDialogue: function(dialogue_id, openFunction)
	{
		//Hide all context menus:
		$('.contextmenu').hide();
		$('.dialogue').hide().filter('#'+ dialogue_id).show();
		$('#'+ dialogue_id).css('margin-top','-'+
			($('#'+ dialogue_id).height() / 2)+ 'px');
		$('#'+ dialogue_id+ ' .pfocus').focus();
		if(openFunction) { $('#'+ dialogue_id+ ' .initiate').click(openFunction); }
		$('#'+ dialogue_id+ ' .close').click(
			function() { $('#'+ dialogue_id).hide(); });
	},

	/*
 * setRate
 *
 * Set handler for the upload and download rates
 *
 * @argument event {object} The click event
 *
 */
	setRate: function(event)
	{
		args = event.currentTarget.hash.substr(1).split('/');
		//Arg 0 will be the function. Arg 1 will be either download or upload...
		type = args[1]=='upload'?'upload':'download';
		//...and arg 2 will be the KB/s
		rate = args[2];

		remote.setRate(type,rate,function(data)
		{
			if(data.setrate)
			{
				$('#status_'+ type+ '_max').text(rate=='Unlimited'?rate:rate+ ' KB/s');
				$('#'+ type+ '_rate_custom').text(rate=='Unlimited'?0:rate);
			}
		});

		$('#'+ type+ '_rate_menu').hide();

	},

	/*
 * setCustomUploadDownloadRate
 *
 * Set handler for the custom upload and download rates
 *
 * @argument event {object} The click event
 *
 */
	setCustomUploadDownloadRate: function(event)
	{
		//Escape was pressed?
		if(event.keyCode == 27)
		{
			$('#'+ event.currentTarget.id).blur();
			$('#'+ event.currentTarget.id.split('_')[0]+ '_rate_menu').hide();
			return false;
		}
		//Strip out any non-numeric values:
		event.currentTarget.value =
			event.currentTarget.value.replace(/[^\d]/g, '');
		if(event.keyCode == 13)
		{
			args = event.currentTarget.id.split('_');
			type = args[0]=='upload'?'upload':'download';
			rate = $('#'+ event.currentTarget.id).val();

			remote.setRate(type,rate,function(data)
			{
				if(data.setrate)
				{
					$('#status_'+ type+ '_max').text(rate==0?'Unlimited':rate+ ' KB/s');
					$('#'+ event.currentTarget.id).blur();
					$('#'+ type+ '_rate_menu').hide();
				}
			});

		}
	},

	/*
 * setOrder
 *
 * Change the order of torrents based on the users selection
 *
 * @argument event {object} The click event
 *
 */
	setOrder: function(e)
	{
		var ordervar = e.currentTarget.hash.split('/')[1];
		var c = e.currentTarget.className;
		$('#order_menu a').removeClass();
		$.each($('#torrent_list li'), function(i, dom)
		{
			_id = dom.id;
			$('#'+ _id).attr('sort', torrentlist[_id][ordervar]);
		});
		e.currentTarget.className=c=='asc'?'desc':'asc';
		$('#torrent_list>li').tsort({order:c=='asc'?'desc':'asc', attr:'sort'});
	},

	/*
 * keyupWebSearch
 *
 * Key handler for the web search function
 *
 * @argument event {object} The click event
 *
 */
	keyupWebSearch: function(e)
	{
		//Was the escape key pressed?
		if(e.keyCode == 27)
		{
			$('#web_search').val('');
			$('#web_search').blur();
		}

		//If the search input has text, then we should show the clear button
		if($('#web_search').val()!='')
		{
				$('#web_search_delete_text').show();
			//Was the enter key pressed?
			if(e.keyCode == 13)
			{
				window.open(
					$('#web_search').attr('search_string').replace('%s',$('#web_search').val()));
			}
		}
		//Otherwise it could be hidden
		else
		{
			$('#web_search_delete_text').hide();
		}
	},

	/*
 * setWebSearchString
 *
 * Click handler to set the web search engine
 *
 * @argument event {object} The click event
 *
 */
	setWebSearchString: function(e)
	{
		url = e.currentTarget.hash.substr(20);
		$('#web_search_dropdown').attr('title',event.currentTarget.innerHTML);
		$('#web_search_menu').hide();
		$('#web_search').attr('search_string',url).focus().select();
	},

	/*
 * keyupBody
 *
 * The keyup handler for the body element, think keyboard shortcuts:
 * note: these are only certain keys, which we don't want repeated.
 *
 * @argument event {object} The click event
 *
 */
	keyupBody: function(e)
	{
		//Dont do anything if we cant find the keycode, or we are in a text box
		if($('input:focus')[0]) return true;
		if(!e.keyCode) return true;

		key = e.keyCode;

		//Specify some shortcut keys for the dialogue boxes:
		if($('.dialogue:not(:hidden)')[0])
		{
			//Escape was pushed, close the form:
			if(key == 27) { $('.dialogue:not(:hidden) .close').click(); }
			//Enter was pushed, accept the window question:
			if(key == 13) { $('.dialogue:not(:hidden) .initiate').click(); }
			//If left key was pushed, go to the previous button:
			if(key == 37) { $('.dialogue button:focus').prev().focus(); }
			//If right key was pushed, go to the previous button:
			if(key == 39) { $('.dialogue button:focus').next().focus(); }
		}

		//Specify some shortcut keys for the main window:
		else
		{

			//SECTION: Keys 1 - 9 - Moving between filters (for rtorrent consistency)
			if(key >= 49 && key <= 57)
			{
				//1 was pressed
				if(key == 49) { $('#filter_torrent a').click(); }
				//2 was pressed
				if(key == 50) { $('#filter_torrent a').click(); }
				//3 was pressed
				if(key == 51) { $('#filter_downloading a').click(); }
				//4 was pressed
				if(key == 52) { $('#filter_paused a').click(); }
				//5 was pressed
				if(key == 53) { $('#filter_completed a').click(); }
				//6 was pressed
				if(key == 54) { $('#filter_paused a').click(); }
				//7 was pressed
				if(key == 55) { $('#filter_torrent a').click(); }
				//8 was pressed
				if(key == 56) { $('#filter_seeding a').click(); }
				//9 was pressed
				if(key == 57) { $('#filter_seeding a').click(); }
			}

			//SECTION: P, R, Del and O keys, Pausing, Resuming Deleting and Opening torrents
			//P (for pause)
			else if(key == 80) { $('#header_pause a').click(); }
			//R (for resume)
			else if(key == 82) { $('#header_resume a').click(); }
			//Del (for deleting)
			else if(key == 46) { $('#header_remove a').click(); }
			//O (for opening),
			else if(key == 8) { $('#header_open a').click(); }
			//Backspace (for opening) and tick the "resume" button for rtorrent die hards
			else if(key == 79) { $('#header_open a').click();
				$('#torrent_upload_start').attr('checked', true); }
			//Return (for opening) and untick the "resume" button for rtorrent die hards
			else if(key == 13) { $('#header_open a').click();
				$('#torrent_upload_start').attr('checked', false); }
			//Space for toggling of torrents
			else if(key == 32 && $('#torrent_list li input').isHidden()) {
				//Get all selected torrents
				selected_list = $('#torrent_list li.selected');
				$.each(selected_list, function(i, _torrent)
				{
					$('#'+ _torrent.id+ ' a').click();
				});
				selected_list.removeClass('selected').addClass('selected');
			}

			//SECION: +, -. Changing priorities up and down:
			else if(key == 187 || key == 189) {
				//Get all the selected torrents
				selected_list = $('#torrent_list li.selected');
				//Cycle through each
				$.each(selected_list, function(i, _torrent)
				{
					_id = _torrent.id;
					//Increase the priority integer
					_priority = key==187?torrentlist[_id].priority+1:torrentlist[_id].priority-1;
					//If we're not already as high as we can go..
					if(_priority<4)
					{
						//Click the torrent, then click priority menu, then click the priority
						$('#'+ _id).click();
						$('#details_priority_button').click();
						$('#priority_menu a[href$="/'+ _priority+ '"]').click();
					}
				});
				//Reselect all torrents that were selected for continuity.
				selected_list.removeClass('selected').addClass('selected');
			}

			//SECTION: D, U for upload/download rate settings:
			//D for download menu
			else if(key == 68) { $('#status_download_max').click(); }
			//U for upload menu
			else if(key == 85) { $('#status_upload_max').click(); }

			//SECTION: F, W - for the search boxes (to focus them)
			//F (filter search)
			else if(key == 70) { $('#torrent_search').focus().select(); }
			//W (web search)
			else if(key == 87) { $('#web_search').focus().select(); }

			//SECTION: F2, rename torrent
			else if(key == 113 && $('#torrent_list li.selected').length>=0)
			{ torrent.renameTorrent(); }

		}
		return true;
	},

	keydownBody: function(e)
	{
		//Dont do anything if we cant find the keycode, or we are in a text box
		if($('input:focus')[0]) return true;
		if($('.dialogue:not(:hidden)')[0]) return true;
		if(!e.keyCode) return true;

		key = e.keyCode;

		//SECTION: Left and Right arrow keys - Moving between filters
		//Right arrow, go to next filter
		if(key == 39) { $('#filter_bar li.active').next().children('a').click(); }
		//Left arrow, go to previous filter
		else if(key == 37) { $('#filter_bar li.active').prev().children('a').click(); }

		//SECTION: Up and Down arrow keys - Moving between torrents
		//Up arrow
		else if(key == 38)
		{
			//If a torrent is already selected, then move to the next one
			if($('#torrent_list li.selected')[0] &&
				$('#torrent_list li.selected').prevAll(':not(:hidden)')[0])
			{
				element = $('#torrent_list li.selected').prevAll(':not(:hidden)').slice(0,1);
			}
			else
			{
				element = $('#torrent_list li:not(:hidden)').last();
			}
			element.click();
			$('#torrent_container').scrollTop(element.offset().top-element.outerHeight(true));
		}
		//Down arrow
		else if(key == 40)
		{
			if($('#torrent_list li.selected')[0] &&
				$('#torrent_list li.selected').nextAll(':not(:hidden)')[0])
			{
				element = $('#torrent_list li.selected').nextAll(':not(:hidden)').slice(0,1);
			}
			else
			{
				element = $('#torrent_list li:not(:hidden)').first();
			}
			element.click();
			$('#torrent_container').scrollTop(element.offset.top()-element.outerHeight(true));
		}
		return true;
	}

}