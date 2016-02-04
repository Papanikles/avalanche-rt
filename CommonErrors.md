# Introduction #

If your Avalanche install throws up an error, and you're not sure how to fix it, then this page is for you. If you have any tips to share, please do in the comments!

# Diagnosing Errors #

If you get an error message, you'll know about it. The error message pops up in the middle of the screen like so:

![http://avalanche-rt.googlecode.com/files/error.png](http://avalanche-rt.googlecode.com/files/error.png)

The errors try to be descriptive, you generally want to look at the bit after "error:". Some are less cryptic than others. Which is why this page is here!

# Errors & Solutions #

## Error 1 ##

```
Error parsing remote.php

Bad Json

{"error":"Didn't receive 200 OK from remote server. (HTTP\/1.1 500 Internal Server Error)"}
```

### The Problem: In Detail ###
Avalanche can't connect to the SCGI server. This is a bit of a doozy: it's either a problem with rTorrent, a problem with Apache, or a problem with Avalanche. Narrows it down right?! Well, here are the solutions, which you can methodically go through, most common problems first

### Possible Solutions ###
  1. **rTorrent isn't open**: Open rtorrent!
  1. **Avalanche has the wrong server infomration in settings.php**: Edit avalanche's settings.php, make sure to match the information with the configuration files for apache. Do not set the server to rtorrent's SCGI port!
  1. **rTorrent doesn't have it's SCGI server enabled**: Add `scgi_port 127.0.0.1:5001` to your .rtorrent.rc
  1. **Apache doesn't have the SCGIMount code**: Add `SCGIMount /RPC1 127.0.0.1:5001` to your apache config

## Error 2 ##

```
Error parsing remote.php

Bad Json

{"error":"Didn't receive 200 OK from remote server. (HTTP\/1.1 404 Not Found)"}
```

### The Problem: In Detail ###
Ok, this is easy, see: "404 Not Found" means the server doesn't have a file (or folder) of the requested name. So, you've got something wrong in avalanches settings.php

### Solution ###
**Avalanche has the wrong server infomration in settings.php**: Edit avalanche's settings.php, make sure to match the information with the configuration files for apache. Do not set the server to rtorrent's SCGI port!

## Error 3 ##

```
Error parsing remote.php

Bad Json

{"error":"Didn't receive 200 OK from remote server. (HTTP\/1.1 401 Authorization Required)"}
```

### The Problem: In Detail ###
Another easy one. "Authorization required" means you've got the wrong password in Avalanche's settings.php

### Possible Solutions ###
  1. **Avalanche has the wrong password infomration in settings.php**: Edit avalanche's settings.php, make sure to match the information with the username and password you entered when setting up Apache & the SCGIMount
  1. **Help! I've forgotten the password I set!**: Ok, just type `sudo htpassword -c /etc/apache/passwords-available/rtorrentscgi "<USERNAME">` to reset the htpassword file.

## Error 4 ##

```
Error parsing remote.php

Bad Json

{"error":"No CURL support compiled in."}
```

### The Problem: In Detail ###
Oh! You just need to install php5-curl!

### Possible Solutions ###
  1. **Ubuntu/Debian/Mint Distros, Install PHP5-curl**: `sudo apt-get install php5-curl && sudo apache2ctl restart` should fix that right up.
  1. **Fedora/RedHat/Centos Distros, Install PHP5-curl**: `sudo yum install php5-curl && sudo apache2ctl restart` should fix that right up.
  1. **Compile PHP5 with CURL**: ...good luck. Ok, seriously, you need to compile PHP5, adding "--with-curl=/usr" to your arguments, for more help with this, consult your distributions forums, or try php.net.

## Error 5 ##

```
Error parsing remote.php

Bad Json

{"error":"CURL error: couldn't connect to host"}
```

### The Problem: In Detail ###
Ok, this usually means that you've set Avalanche's server\_ip or server\_port settings in settings.php incorrectly.

### Possible Solutions ###
  1. **Server\_IP is wrong**: Change the server\_ip variable in settings.php
  1. **Server\_PORT is wrong**: Change the server\_port variable in settings.php, you'll usually want 80, or if you use SSL, 443. Do not pick the same port that rtorrent's scgi is using, Avalanche needs to use the **Apache** SCGI server.

## Error 6 ##

```
Error parsing remote.php

Bad Json

{"error":"Invalid return payload: enable debugging to examine incoming payload missing top level xmlrpc element"}
```

### The Problem: In Detail ###
You've connected to the wrong server, or you've connected to the wrong service

### Possible Solutions ###
  1. **rtorrent\_scgi\_folder is wrong**: Change the rtorrent\_scgi\_folder variable in settings.php
  1. **Server\_IP is wrong**: Change the server\_ip variable in settings.php
  1. **Server\_PORT is wrong**: Change the server\_port variable in settings.php, you'll usually want 80, or if you use SSL, 443. Do not pick the same port that rtorrent's scgi is using, Avalanche needs to use the **Apache** SCGI server.

## Error 7 ##

```
Error parsing remote.php

parsererror

Invalid JSON: <br />
<b>Parse error</b>:  syntax error, unexpected T_CONSTANT_ENCAPSED_STRING, expecting ')' in ....
```

### The Problem: In Detail ###
Your settings.php is broken. More precisely, you're missing a comma or speech mark after one of your settings. Open your settings.php, go to the line above the line that was shown in the error message (for example `<b>/var/www/settings.php</b> on line <b>4</b><br />` says line 4, so go to line 3, and do the following:

### Possible Solutions ###
  1. **Missing Comma (,) at the end of the line**: Add a comma (,).
  1. **Missing Speech Mark (") at the end of the line**: Add a speech mark (").


## Error 8 ##

```
Error parsing remote.php

parsererror

Invalid JSON: <br />
<b>Parse error</b>:  syntax error, unexpected $end in <b>/var/www/settings.php</b> on line <b>10</b><br />
```

### The Problem: In Detail ###
Your settings.php is broken. More precisely, the end of your file is missing the close statement. So you'll need to add it.

### Solution ###
Open your settings.php, go to the end of the document, and, on a new line, add the following:

` ); `

## Error 9 ##

```
Error parsing remote.php

parsererror

Invalid JSON: <br />
<b>Parse error</b>:  syntax error, unexpected T_CONSTANT_ENCAPSED_STRING, expecting '(' in <b>/var/www/settings.php</b> on line <b>3</b><br />
```

### The Problem: In Detail ###
Your settings.php is probably missing the open bracket from the start of the array...

### Solution ###
Open your settings.php, go to line 2, and make sure it says:

` $configuration = array( `

## Error 10 ##

```
Error parsing remote.php

parsererror

Invalid JSON: <br />
<b>Warning</b>:  require_once(settings.php) [<a href='function.require-once'>function.require-once</a>]: failed to open stream: No such file or directory in <b>/var/www/remote.php</b> on line <b>38</b><br />
<br />
<b>Fatal error</b>:  require_once() [<a href='function.require'>function.require</a>]: Failed opening required 'settings.php' (include_path='.:/usr/share/php:/usr/share/pear') in <b>/var/www/remote.php</b> on line <b>38</b><br />
```

### The Problem: In Detail ###
Your settings.php is either missing, or unreadable by Avalanche.

### Possible Solutions ###
  1. **Missing settings.php**: Make sure your settings.php is in the same place as your remote.php.
  1. **Settings.php permission error**: Make sure your settings.php is readable by your remote.php, if in doubt you can run `sudo chmod 755 settings.php`

## Error 11 ##

```
Error parsing remote.php

Couldn't open file for reading
```

### The Problem: In Detail ###
One of the files Avalanche reads from (quite likely to be prefs.json) can't be read.

### Possible Solutions ###
  1. **Missing prefs.json**: Make sure your prefs.json is in the same place as your remote.php.
  1. **Prefs.json permission error**: Make sure your prefs.json is readable by your remote.php, if in doubt you can run `sudo chmod 755 prefs.json`