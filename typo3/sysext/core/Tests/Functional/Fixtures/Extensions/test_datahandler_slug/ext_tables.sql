#
# Table structure for table 'tx_testdatahandler_slug' for testing slug fields
#
CREATE TABLE tx_testdatahandler_slug (
		title VARCHAR(100) DEFAULT '' NOT NULL,
		slug varchar(2048),

		KEY slug (slug(127))
);
