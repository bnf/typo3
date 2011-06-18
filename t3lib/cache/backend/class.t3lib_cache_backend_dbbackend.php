<?php
/***************************************************************
 *  Copyright notice
 *
 *  (c) 2008-2011 Ingo Renner <ingo@typo3.org>
 *  All rights reserved
 *
 *  This script is part of the TYPO3 project. The TYPO3 project is
 *  free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  The GNU General Public License can be found at
 *  http://www.gnu.org/copyleft/gpl.html.
 *
 *  This script is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  This copyright notice MUST APPEAR in all copies of the script!
 ***************************************************************/

/**
 * A caching backend which stores cache entries in database tables
 *
 * @package TYPO3
 * @subpackage t3lib_cache
 * @api
 * @scope prototype
 */
class t3lib_cache_backend_DbBackend extends t3lib_cache_backend_AbstractBackend {

	/**
	 * @var string Name of the cache data table
	 */
	protected $cacheTable;

	/**
	 * @var string Name of the cache tags table
	 */
	protected $tagsTable;

	/**
	 * @var boolean Indicates wether data is compressed or not (requires php zlib)
	 */
	protected $compression = FALSE;

	/**
	 * @var integer -1 to 9, indicates zlib compression level: -1 = default level 6, 0 = no compression, 9 maximum compression
	 */
	protected $compressionLevel = -1;

	protected $identifierField;
	protected $creationField;
	protected $lifetimeField;
	protected $notExpiredStatement;
	protected $tableList;
	protected $tableJoin;

	/**
	 * Set cache frontend instance and calculate data and tags table name
	 *
	 * @param t3lib_cache_frontend_Frontend $cache The frontend for this backend
	 * @return void
	 * @author Christian Kuhn <lolli@schwarzbu.ch>
	 * @api
	 */
	public function setCache(t3lib_cache_frontend_Frontend $cache) {
		parent::setCache($cache);

		$this->cacheTable = 'cachingframework_' . $this->cacheIdentifier;
		$this->tagsTable = 'cachingframework_' . $this->cacheIdentifier . '_tags';
		$this->initializeCommonReferences();
	}

	/**
	 * Initializes common references used in this backend.
	 *
	 * @return	void
	 */
	protected function initializeCommonReferences() {
		$this->identifierField = $this->cacheTable . '.identifier';
		$this->creationField = $this->cacheTable . '.crdate';
		$this->lifetimeField = $this->cacheTable . '.lifetime';
		$this->tableList = $this->cacheTable . ', ' . $this->tagsTable;
		$this->tableJoin = $this->identifierField . ' = ' . $this->tagsTable . '.identifier';
		$this->notExpiredStatement = '(' . $this->creationField . ' + ' . $this->lifetimeField .
									 ' >= ' . $GLOBALS['EXEC_TIME'] . ' OR ' . $this->lifetimeField . ' = 0)';
	}

	/**
	 * Saves data in a cache file.
	 *
	 * @param string An identifier for this specific cache entry
	 * @param string The data to be stored
	 * @param array Tags to associate with this cache entry
	 * @param integer Lifetime of this cache entry in seconds. If NULL is specified, the default lifetime is used. "0" means unlimited liftime.
	 * @return void
	 * @throws t3lib_cache_Exception if no cache frontend has been set.
	 * @throws t3lib_cache_exception_InvalidData if the data to be stored is not a string.
	 * @author Ingo Renner <ingo@typo3.org>
	 */
	public function set($entryIdentifier, $data, array $tags = array(), $lifetime = NULL) {
		if (!$this->cache instanceof t3lib_cache_frontend_Frontend) {
			throw new t3lib_cache_Exception(
				'No cache frontend has been set via setCache() yet.',
				1236518288
			);
		}

		if (!is_string($data)) {
			throw new t3lib_cache_exception_InvalidData(
				'The specified data is of type "' . gettype($data) . '" but a string is expected.',
				1236518298
			);
		}

		if (is_null($lifetime)) {
			$lifetime = $this->defaultLifetime;
		}

		$this->remove($entryIdentifier);

		if ($this->compression) {
			$data = gzcompress($data, $this->compressionLevel);
		}

		$GLOBALS['TYPO3_DB']->exec_INSERTquery(
			$this->cacheTable,
			array(
				 'identifier' => $entryIdentifier,
				 'crdate' => $GLOBALS['EXEC_TIME'],
				 'content' => $data,
				 'lifetime' => $lifetime
			)
		);

		if (count($tags)) {
			$fields = array();
			$fields[] = 'identifier';
			$fields[] = 'tag';

			$tagRows = array();
			foreach ($tags as $tag) {
				$tagRow = array();
				$tagRow[] = $entryIdentifier;
				$tagRow[] = $tag;
				$tagRows[] = $tagRow;
			}

			$GLOBALS['TYPO3_DB']->exec_INSERTmultipleRows(
				$this->tagsTable,
				$fields,
				$tagRows
			);
		}
	}

	/**
	 * Loads data from a cache file.
	 *
	 * @param string An identifier which describes the cache entry to load
	 * @return mixed The cache entry's data as a string or FALSE if the cache entry could not be loaded
	 * @author Ingo Renner <ingo@typo3.org>
	 */
	public function get($entryIdentifier) {
		if (!$this->cache instanceof t3lib_cache_frontend_Frontend) {
			throw new t3lib_cache_Exception(
				'No cache frontend has been set via setCache() yet.',
				1308435810
			);
		}

		$cacheEntry = FALSE;

		$cacheEntry = $GLOBALS['TYPO3_DB']->exec_SELECTgetSingleRow(
			'content',
			$this->cacheTable,
			'identifier = ' . $GLOBALS['TYPO3_DB']->fullQuoteStr($entryIdentifier, $this->cacheTable) . ' '
			. 'AND (crdate + lifetime >= ' . $GLOBALS['EXEC_TIME'] . ' OR lifetime = 0)'
		);

		if (is_array($cacheEntry)) {
			$cacheEntry = $cacheEntry['content'];
		}

		if ($this->compression && strlen($cacheEntry)) {
			$cacheEntry = gzuncompress($cacheEntry);
		}

		return $cacheEntry;
	}

	/**
	 * Checks if a cache entry with the specified identifier exists.
	 *
	 * @param string Specifies the identifier to check for existence
	 * @return boolean TRUE if such an entry exists, FALSE if not
	 * @author Ingo Renner <ingo@typo3.org>
	 */
	public function has($entryIdentifier) {
		if (!$this->cache instanceof t3lib_cache_frontend_Frontend) {
			throw new t3lib_cache_Exception(
				'No cache frontend has been set via setCache() yet.',
				1308435811
			);
		}

		$hasEntry = FALSE;

		$cacheEntries = $GLOBALS['TYPO3_DB']->exec_SELECTcountRows(
			'*',
			$this->cacheTable,
			'identifier = ' . $GLOBALS['TYPO3_DB']->fullQuoteStr($entryIdentifier, $this->cacheTable) .
			' AND (crdate + lifetime >= ' . $GLOBALS['EXEC_TIME'] . ' OR lifetime = 0)'
		);
		if ($cacheEntries >= 1) {
			$hasEntry = TRUE;
		}

		return $hasEntry;
	}

	/**
	 * Removes all cache entries matching the specified identifier.
	 * Usually this only affects one entry.
	 *
	 * @param string Specifies the cache entry to remove
	 * @return boolean TRUE if (at least) an entry could be removed or FALSE if no entry was found
	 * @author Ingo Renner <ingo@typo3.org>
	 */
	public function remove($entryIdentifier) {
		if (!$this->cache instanceof t3lib_cache_frontend_Frontend) {
			throw new t3lib_cache_Exception(
				'No cache frontend has been set via setCache() yet.',
				1308435812
			);
		}

		$entryRemoved = FALSE;

		$res = $GLOBALS['TYPO3_DB']->exec_DELETEquery(
			$this->cacheTable,
			'identifier = ' . $GLOBALS['TYPO3_DB']->fullQuoteStr($entryIdentifier, $this->cacheTable)
		);

		$GLOBALS['TYPO3_DB']->exec_DELETEquery(
			$this->tagsTable,
			'identifier = ' . $GLOBALS['TYPO3_DB']->fullQuoteStr($entryIdentifier, $this->tagsTable)
		);

		if ($GLOBALS['TYPO3_DB']->sql_affected_rows($res) == 1) {
			$entryRemoved = TRUE;
		}

		return $entryRemoved;
	}

	/**
	 * Finds and returns all cache entries which are tagged by the specified tag.
	 *
	 * @param string The tag to search for
	 * @return array An array with identifiers of all matching entries. An empty array if no entries matched
	 * @author Ingo Renner <ingo@typo3.org>
	 */
	public function findIdentifiersByTag($tag) {
		if (!$this->cache instanceof t3lib_cache_frontend_Frontend) {
			throw new t3lib_cache_Exception(
				'No cache frontend has been set via setCache() yet.',
				1308435813
			);
		}

		$cacheEntryIdentifiers = array();

		$cacheEntryIdentifierRows = $GLOBALS['TYPO3_DB']->exec_SELECTgetRows(
			$this->identifierField,
			$this->tableList,
			$this->getQueryForTag($tag) .
			' AND ' . $this->tableJoin .
			' AND ' . $this->notExpiredStatement,
			$this->identifierField
		);

		foreach ($cacheEntryIdentifierRows as $cacheEntryIdentifierRow) {
			$cacheEntryIdentifiers[$cacheEntryIdentifierRow['identifier']] = $cacheEntryIdentifierRow['identifier'];
		}

		return $cacheEntryIdentifiers;
	}

	/**
	 * Removes all cache entries of this cache.
	 *
	 * @return void
	 * @author Ingo Renner <ingo@typo3.org>
	 */
	public function flush() {
		if (!$this->cache instanceof t3lib_cache_frontend_Frontend) {
			throw new t3lib_cache_Exception(
				'No cache frontend has been set via setCache() yet.',
				1308435814
			);
		}

		$GLOBALS['TYPO3_DB']->exec_TRUNCATEquery($this->cacheTable);
		$GLOBALS['TYPO3_DB']->exec_TRUNCATEquery($this->tagsTable);
		$GLOBALS['TYPO3_DB']->admin_query('DROP TABLE IF EXISTS ' . $this->cacheTable);
		$GLOBALS['TYPO3_DB']->admin_query('DROP TABLE IF EXISTS ' . $this->tagsTable);
		$this->createCacheTable();
		$this->createTagsTable();
	}

	/**
	 * Removes all cache entries of this cache which are tagged by the specified tag.
	 *
	 * @param string The tag the entries must have
	 * @return void
	 */
	public function flushByTag($tag) {
		if (!$this->cache instanceof t3lib_cache_frontend_Frontend) {
			throw new t3lib_cache_Exception(
				'No cache frontend has been set via setCache() yet.',
				1308435815
			);
		}

		$tagsTableWhereClause = $this->getQueryForTag($tag);

		$this->deleteCacheTableRowsByTagsTableWhereClause($tagsTableWhereClause);

		$GLOBALS['TYPO3_DB']->exec_DELETEquery(
			$this->tagsTable,
			$tagsTableWhereClause
		);
	}

	/**
	 * Does garbage collection
	 *
	 * @return void
	 * @author Ingo Renner <ingo@typo3.org>
	 */
	public function collectGarbage() {
		if (!$this->cache instanceof t3lib_cache_frontend_Frontend) {
			throw new t3lib_cache_Exception(
				'No cache frontend has been set via setCache() yet.',
				1308435816
			);
		}

			// Get identifiers of expired cache entries
		$tagsEntryIdentifierRowsResource = $GLOBALS['TYPO3_DB']->exec_SELECTquery(
			'identifier',
			$this->cacheTable,
			'crdate + lifetime < ' . $GLOBALS['EXEC_TIME'] . ' AND lifetime > 0'
		);

		$tagsEntryIdentifiers = array();
		while ($tagsEntryIdentifierRow = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($tagsEntryIdentifierRowsResource)) {
			$tagsEntryIdentifiers[] = $GLOBALS['TYPO3_DB']->fullQuoteStr(
				$tagsEntryIdentifierRow['identifier'],
				$this->tagsTable
			);
		}
		$GLOBALS['TYPO3_DB']->sql_free_result($tagsEntryIdentifierRowsResource);

			// Delete tag rows connected to expired cache entries
		if (count($tagsEntryIdentifiers)) {
			$GLOBALS['TYPO3_DB']->exec_DELETEquery(
				$this->tagsTable,
				'identifier IN (' . implode(', ', $tagsEntryIdentifiers) . ')'
			);
		}

			// Delete expired cache rows
		$GLOBALS['TYPO3_DB']->exec_DELETEquery(
			$this->cacheTable,
			'crdate + lifetime < ' . $GLOBALS['EXEC_TIME'] . ' AND lifetime > 0'
		);
	}

	/**
	 * Sets the table where the cache entries are stored.
	 *
	 * @deprecated since TYPO3 4.6: The backend calculates the
	 * 		table name internally, this method does nothing anymore
	 * @param string $cacheTable Table name
	 * @return void
	 * @author Ingo Renner <ingo@typo3.org>
	 */
	public function setCacheTable($cacheTable) {
		t3lib_div::logDeprecatedFunction();
	}

	/**
	 * Returns the table where the cache entries are stored.
	 *
	 * @return	string	The cache table.
	 * @author Ingo Renner <ingo@typo3.org>
	 */
	public function getCacheTable() {
		if (!$this->cache instanceof t3lib_cache_frontend_Frontend) {
			throw new t3lib_cache_Exception(
				'No cache frontend has been set via setCache() yet.',
				1308435817
			);
		}

		return $this->cacheTable;
	}

	/**
	 * Sets the table where cache tags are stored.
	 *
	 * @deprecated since TYPO3 4.6: The backend calculates the
	 * 		table name internally, this method does nothing anymore
	 * @param string $tagsTable: Tags table name
	 * @return void
	 */
	public function setTagsTable($tagsTable) {
		t3lib_div::logDeprecatedFunction();
	}

	/**
	 * Gets the table where cache tags are stored.
	 *
	 * @return	string		Name of the table storing tags
	 */
	public function getTagsTable() {
		if (!$this->cache instanceof t3lib_cache_frontend_Frontend) {
			throw new t3lib_cache_Exception(
				'No cache frontend has been set via setCache() yet.',
				1308435818
			);
		}

		return $this->tagsTable;
	}

	/**
	 * Enable data compression
	 *
	 * @param boolean TRUE to enable compression
	 */
	public function setCompression($compression) {
		$this->compression = $compression;
	}

	/**
	 * Set data compression level.
	 * If compression is enabled and this is not set,
	 * gzcompress default level will be used
	 *
	 * @param integer -1 to 9: Compression level
	 */
	public function setCompressionLevel($compressionLevel) {
		if ($compressionLevel >= -1 && $compressionLevel <= 9) {
			$this->compressionLevel = $compressionLevel;
		}
	}

	/**
	 * Create data table of cache
	 *
	 * @return void
	 */
	protected function createCacheTable() {
		$sql = file_get_contents(PATH_t3lib . 'cache/backend/resources/dbbackend-layout-cache.sql');
		$sql = str_replace('###CACHE_TABLE###', $this->cacheTable, $sql);
		$GLOBALS['TYPO3_DB']->admin_query($sql);
	}

	/**
	 * Create tags table of cache
	 *
	 * @return void
	 */
	protected function createTagsTable() {
		$sql = file_get_contents(PATH_t3lib . 'cache/backend/resources/dbbackend-layout-tags.sql');
		$sql = str_replace('###TAGS_TABLE###', $this->tagsTable, $sql);
		$GLOBALS['TYPO3_DB']->admin_query($sql);
	}

	/**
	 * Gets the query to be used for selecting entries by a tag. The asterisk ("*")
	 * is allowed as a wildcard at the beginning and the end of a tag.
	 *
	 * @param string The tag to search for, the "*" wildcard is supported
	 * @return string the query to be used for selecting entries
	 * @author Oliver Hader <oliver@typo3.org>
	 */
	protected function getQueryForTag($tag) {
		if (strpos($tag, '*') === FALSE) {
			$query = $this->tagsTable . '.tag = ' . $GLOBALS['TYPO3_DB']->fullQuoteStr($tag, $this->tagsTable);
		} else {
			$patternForLike = $GLOBALS['TYPO3_DB']->escapeStrForLike(
				$GLOBALS['TYPO3_DB']->quoteStr($tag, $this->tagsTable),
				$this->tagsTable
			);
			$query = $this->tagsTable . '.tag LIKE \'' . $patternForLike . '\'';
		}

		return $query;
	}

	/**
	 * Deletes rows in cache table found by where clause on tags table
	 *
	 * @param string The where clause for the tags table
	 * @return void
	 */
	protected function deleteCacheTableRowsByTagsTableWhereClause($tagsTableWhereClause) {
		$cacheEntryIdentifierRowsRessource = $GLOBALS['TYPO3_DB']->exec_SELECTquery(
			'DISTINCT identifier',
			$this->tagsTable,
			$tagsTableWhereClause
		);

		$cacheEntryIdentifiers = array();
		while ($cacheEntryIdentifierRow = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($cacheEntryIdentifierRowsRessource)) {
			$cacheEntryIdentifiers[] = $GLOBALS['TYPO3_DB']->fullQuoteStr(
				$cacheEntryIdentifierRow['identifier'],
				$this->cacheTable
			);
		}
		$GLOBALS['TYPO3_DB']->sql_free_result($cacheEntryIdentifierRowsRessource);

		if (count($cacheEntryIdentifiers)) {
			$GLOBALS['TYPO3_DB']->exec_DELETEquery(
				$this->cacheTable,
				'identifier IN (' . implode(', ', $cacheEntryIdentifiers) . ')'
			);
		}
	}
}


if (defined('TYPO3_MODE') && isset($GLOBALS['TYPO3_CONF_VARS'][TYPO3_MODE]['XCLASS']['t3lib/cache/backend/class.t3lib_cache_backend_dbbackend.php'])) {
	include_once($GLOBALS['TYPO3_CONF_VARS'][TYPO3_MODE]['XCLASS']['t3lib/cache/backend/class.t3lib_cache_backend_dbbackend.php']);
}

?>