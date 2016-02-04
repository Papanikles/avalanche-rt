# Introduction #

This guide will go through each of the settings in settings.php, giving you answers as to how to do certain tasks in Avalanche

# Adding or Editing Settings #

To edit each setting, you simply need to change the text in the **right hand side string**. For example, if I wanted to change the password, I'd change this:

```
"password"=>"password"
```

to

```
"password"=>"avalanche"
```

Changing settings can be the biggest cause for errors avalanche, so make sure you are careful when making changes. For example, if you remove any comma at the end of a setting, it'll crash. If the last setting in the set has a comma, it'll crash.

# Default Settings #

The default settings.php looks like this:

<?php
$configuration = array(
> "server\_type"=>"rtorrent",
> "server\_ip"=>"127.0.0.1",
> "server\_port"=>"80",
> "rtorrent\_scgi\_folder"=>"/RPC2",
> "username"=>"username",
> "password"=>"password"
);

These are the stock settings that everyone will need to use to allow Avalanche to work. An overview of each of these is as follows:

## server\_type ##

```
"server_type"=>"rtorrent",
```

Server\_type is a setting that _**does not need to change**_ server\_type is a variable that will enable you to use a different server library, to enable support for other bittorrent clients, other than rtorrent. There are currently no other libraries. One day, there may be. You are free to create your own library, but there is no documentation to help you, sorry.

## server\_ip ##

```
"server_ip"=>"127.0.0.1",
```

This one is self explanatory, this is the IP address of the SCGI server you wish to connect to. It will almost always be left to 127.0.0.1.

## server\_port ##

```
"server_ip"=>"80",
```

This one is self explanatory, this is the port of the SCGI server you wish to connect to. It will almost always be left to 80. If you use HTTPS, you will need to change this to 443.

## rtorrent\_scgi\_folder ##

```
"rtorrent_scgi_folder"=>"/RPC2",
```

This is the name of the folder handler you use for rtorrent to work. The Avalanche setup guides uses /RPC1, most other setup guides will use RPC2. It can be literally anything you want, like /SpongeBobSquarePants. Just make sure that it matches what is in your Apache settings!

**Note:** It should be said that changing this does not somehow make your rtorrent install more secure. Security through obscurity is not security! Change it for preference, not as a security panacea.

## username ##

```
"username"=>"username",
```

Well, in the trend of obvious settings, this one lets you use a username for the SCGI server. In the setup guides the username is "rtorrentscgi". Once again, use whatever you want here. Please note that, as opposed to the scgi folder, chosing a good username does indeed make a difference to your security.

## password ##

```
"password"=>"password",
```

This setting lets you use a password for your SCGI server. In the setup guides, you set it up when you ran the htpasswd command. You were told to remember it, so hopefully you did as you need it here!

**Recommendations:** Your password should be atleast 8 characters long. The longer, the better - plain and simple. It should include a wide variety of letters, numbers, and special characters (e.g #~!). Weak passwords include single, correctly spelled words, series of numbers, and ESPECIALLY words or numbers related to your life, for example your dogs name, your wife's birthday (besides, who remembers _that_?)

# Hidden Settings #

Avalanche also features a few hidden settings. The hidden settings are usually either heavily in testing (but are assured not to break Avalanche when not in use) or are hidden because 99% of users will not need them. For the 1% who will, here they are:

## set\_auth\_digest ##

```
"set_auth_digest"=>TRUE,
```

Adding this setting, and setting it to TRUE will use the "DIGEST" authentication for apache, as opposed to "basic". The difference is digest makes an md5 sum of your password before sending it to the server. This is untested, which is why it is hidden. It will work come version 1.0 (hopefully!)

## https ##

```
"https"=>TRUE,
```

Adding https and setting it to TRUE will enable the use of HTTPS, surprise surprise. Use this in conjunction with server\_port 443. This is slightly tested, and hopefully will work (but it will remain hidden in future releases).

## trust\_cert ##

```
"trust_cert"=>TRUE,
```

Trust\_cert, if set to true, will explicitly trust certificates coming from the HTTPS server. If not set, and your cert isn't signed, Avalanche will REJECT connections.