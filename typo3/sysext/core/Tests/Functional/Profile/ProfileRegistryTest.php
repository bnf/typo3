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

namespace TYPO3\CMS\Core\Tests\Functional\Profile;

use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Profile\ProfileDefinition;
use TYPO3\CMS\Core\Profile\ProfileRegistry;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

final class ProfileRegistryTest extends FunctionalTestCase
{
    protected array $testExtensionsToLoad = [
        'typo3/sysext/core/Tests/Functional/Fixtures/Extensions/test_profiles',
    ];

    #[Test]
    public function profilesRegisteredInProfileRegistry(): void
    {
        $profileRegistry = $this->get(ProfileRegistry::class);

        self::assertTrue($profileRegistry->hasProfile('typo3tests/profile-1'));
        self::assertInstanceOf(ProfileDefinition::class, $profileRegistry->getProfile('typo3tests/profile-1'));
    }

    #[Test]
    public function profileDependenciesAreResolvedWithOrdering(): void
    {
        $profileRegistry = $this->get(ProfileRegistry::class);

        $expected = [
            // profile-2 and profile-3 depend on profile-4, therefore profile-4 needs to be ordered before 2 and 3.
            'typo3tests/profile-4',
            // profile-1 depends on profile-2 and profile-3
            'typo3tests/profile-2',
            'typo3tests/profile-3',
            'typo3tests/profile-1',
        ];
        $profileDefinitions = $profileRegistry->getProfiles('typo3tests/profile-1');
        $profileDefinitionsNames = array_map(static fn(ProfileDefinition $d): string => $d->name, $profileDefinitions);

        self::assertEquals($expected, $profileDefinitionsNames);
    }

    #[Test]
    public function invalidProfilesAreSkipped(): void
    {
        $profileRegistry = $this->get(ProfileRegistry::class);
        self::assertFalse($profileRegistry->hasProfile('typo3tests/invalid-version'));
        self::assertFalse($profileRegistry->hasProfile('typo3tests/invalid-dependency'));
    }
}
