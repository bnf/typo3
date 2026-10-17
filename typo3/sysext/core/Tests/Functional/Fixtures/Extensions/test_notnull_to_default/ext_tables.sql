CREATE TABLE tx_testnotnulltodefault_example_user
(
	uid int(11) unsigned NOT NULL auto_increment,
	image int(11) unsigned DEFAULT '0' NOT NULL,
	files int(11) unsigned DEFAULT NULL,
	birthday date NOT NULL,
	start_time time NOT NULL,

	PRIMARY KEY (uid)
);
