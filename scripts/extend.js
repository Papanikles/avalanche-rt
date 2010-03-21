	/*
	 * Extend.js Javascript Library 0.9
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

/*
 * Math.formatbytes
 *
 * Change bytes into an appropriate human SI figure (like GB)
 *
 * @argument bytes {integer} The bytes to retun as SI figure.
 *
 * @returns {string} bytes as an SI figure (e.g "3.00 GB")
 */
Math.formatBytes = function(bytes)
{
	if(bytes==0) return '0 B';
	var size;
	var unit;

	// Size is 1 or more Terabytes (TB).
	if ( bytes >= 1099511627776 )
	{

		size = bytes / 1099511627776;
		unit = ' TB';

	// Size is 1 or more Gigabytes (GB).
 }
	else if ( bytes >= 1073741824 )
	{

		size = bytes / 1073741824;
		unit = ' GB';

	// Size is 1 or more Megabytes (MB).
	}
	else if ( bytes >= 1048576 )
	{

		size = bytes / 1048576;
		unit = ' MB';

	// Size is 1 or more Kilobytes (KB).
 }
	else if ( bytes >= 1024 )
	{

		size = bytes / 1024;
		unit = ' KB';

	// The size is less than one KB
	}
	else
	{

		size = bytes;
		unit = ' B';

	}

	if(size.toString().lastIndexOf(".") != -1) {
		size = size>0?size.toFixed(2):0;
	}

	//Make it say 0 instead of 0.00
	if (size == 0.00) {
		size = 0;
	}

	return size + unit;
}

/*
 *   Converts seconds to more readable units (hours, minutes etc).
 *
 *   @param seconds {integer} The number of seconds to format
 *   @returns {string} Seconds into redable Days, Minutes, Hours.
 */
Math.formatSeconds = function(seconds)
{
	//Start with an empty result var:
	var result = '';

	//See if the result is months long
	var num = Math.floor(seconds / 2629743);
	if (num > 0) result += num+ ' month(s), ';

	//See if the result is weeks long:
	num = Math.floor((seconds % 2629743) / 604800);
	if (num > 0) result += num+ ' week(s), ';

	//See if the result is days long:
	num = Math.floor((seconds % 604800) / 86400);
	if (num > 0) result += num+ ' day(s), ';

	//See if the result is hours long (minus the days)
	num = Math.floor((seconds % 86400) / 3600);
	if (num > 0) result += num+ ' hour(s), ';

	//See if the result is minutes long (minus the hours)
	num = Math.floor((seconds % 3600) / 60);
	if (num > 0) result += num+ ' min(s), ';

 return result+ Math.floor((seconds % 3600) % 60)+ ' seconds';
}

/*
 * :icontains selector
 *
 * Just a quick new selector, same as ":contains" except it is case insensitive!
 *
 */
$.expr[':'].icontains = function(obj, index, meta, stack){
return (obj.textContent || obj.innerText || jQuery(obj).text() || '').toLowerCase().indexOf(meta[3].toLowerCase()) >= 0;
};