<?php

declare(strict_types=1);

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

namespace TYPO3\CMS\Core\Domain;

use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\Error\InsufficientScopeError;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Schema\Capability\TcaSchemaCapability;
use TYPO3\CMS\Core\Schema\TcaSchema;
use TYPO3\CMS\Core\Scope\AdminScope;

/**
 * Access of a backend user to tables and fields, restricted by the scopes
 * granted to the caller: tables restricted to administrators (`adminOnly`)
 * require the scope `admin`, in addition to the permissions of the user.
 *
 * @internal
 */
final readonly class RecordAccess
{
    /**
     * @param list<string>|null $scopes Identifiers of the granted scopes, null if access is not restricted by scopes
     */
    public function __construct(
        public BackendUserAuthentication $user,
        private ?array $scopes = null,
    ) {}

    public static function fromContext(ActionContext $context): ?self
    {
        return $context->principal instanceof BackendUserAuthentication
            ? new self($context->principal, array_keys($context->scopes))
            : null;
    }

    /**
     * @throws InsufficientScopeError if a scope required for records of the table is not granted
     */
    public function assertScopes(TcaSchema $schema): void
    {
        $scope = $this->getMissingScope($schema);
        if ($scope !== null) {
            throw new InsufficientScopeError(
                sprintf('Records of "%s" require the scope "%s"', $schema->getName(), $scope),
                1793950817,
                $scope,
            );
        }
    }

    public function isTableReadable(TcaSchema $schema): bool
    {
        if ($this->getMissingScope($schema) !== null) {
            return false;
        }
        return $this->user->isAdmin()
            || (!$schema->hasCapability(TcaSchemaCapability::AccessAdminOnly) && $this->user->check('tables_select', $schema->getName()));
    }

    public function isTableModifiable(TcaSchema $schema): bool
    {
        if ($schema->hasCapability(TcaSchemaCapability::AccessReadOnly) || $this->getMissingScope($schema) !== null) {
            return false;
        }
        return $this->user->isAdmin()
            || (!$schema->hasCapability(TcaSchemaCapability::AccessAdminOnly) && $this->user->check('tables_modify', $schema->getName()));
    }

    /**
     * Fields with access control (`exclude`) require explicit permission
     */
    public function isFieldAccessible(TcaSchema $schema, string $fieldName): bool
    {
        return $this->user->isAdmin()
            || !$schema->hasField($fieldName)
            || !$schema->getField($fieldName)->supportsAccessControl()
            || $this->user->check('non_exclude_fields', $schema->getName() . ':' . $fieldName);
    }

    /**
     * Only administrators may be granted the scope `admin`, other users are
     * denied access to tables restricted to administrators in any case
     */
    private function getMissingScope(TcaSchema $schema): ?string
    {
        if ($this->scopes === null
            || !$this->user->isAdmin()
            || !$schema->hasCapability(TcaSchemaCapability::AccessAdminOnly)
            || in_array(AdminScope::IDENTIFIER, $this->scopes, true)
        ) {
            return null;
        }
        return AdminScope::IDENTIFIER;
    }
}
