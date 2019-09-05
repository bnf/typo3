<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\Tests\Unit\Console;

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

use Psr\Container\ContainerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\CommandLoader\CommandLoaderInterface;
use TYPO3\CMS\Core\Console\CommandRegistry;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

/**
 * Testcase for CommandRegistry
 */
class CommandRegistryTest extends UnitTestCase
{
    /**
     * @var \org\bovigo\vfs\vfsStreamDirectory
     */
    protected $rootDirectory;

    /**
     * @var PackageManager|\Prophecy\Prophecy\ObjectProphecy
     */
    protected $packageManagerProphecy;

    /**
     * @var ContainerInterface|\Prophecy\Prophecy\ObjectProphecy
     */
    protected $containerProphecy;

    /**
     * Set up this testcase
     */
    protected function setUp(): void
    {
        parent::setUp();

        /** @var PackageManager */
        $this->packageManagerProphecy = $this->prophesize(PackageManager::class);
        $this->packageManagerProphecy->getActivePackages()->willReturn([]);

        /** @var ContainerInterface */
        $this->containerProphecy = $this->prophesize(ContainerInterface::class);
    }

    /**
     * @test
     */
    public function implementsCommandLoaderInterface()
    {
        $commandRegistry = new CommandRegistry($this->packageManagerProphecy->reveal(), $this->containerProphecy->reveal());
        $this->assertInstanceof(CommandLoaderInterface::class, $commandRegistry);
    }

    /**
     * @test
     */
    public function iteratesLazyCommandsOfActivePackages()
    {
        $command1MockClass = $this->getMockClass(Command::class, ['dummy']);
        $command2MockClass = $this->getMockClass(Command::class, ['dummy']);

        $this->containerProphecy->get('command1')->willReturn(new $command1MockClass);
        $this->containerProphecy->get('command2')->willReturn(new $command2MockClass);

        $commandRegistry = new CommandRegistry($this->packageManagerProphecy->reveal(), $this->containerProphecy->reveal());
        $commandRegistry->addLazyCommand('test:command', 'command1');
        $commandRegistry->addLazyCommand('test:command2', 'command2');

        $commandNames = $commandRegistry->getNames();

        $this->assertCount(2, $commandNames);
        $this->assertInstanceOf($command1MockClass, $commandRegistry->get('test:command'));
        $this->assertInstanceOf($command1MockClass, $commandRegistry->get('test:command2'));
    }

    /**
     * @test
     */
    public function iteratesCommandsOfActiveNonLazyPackages()
    {
        $commandRegistry = new CommandRegistry($this->packageManagerProphecy->reveal(), $this->containerProphecy->reveal());
        $commands = iterator_to_array($commandRegistry->getNonLazyCommands());

        $this->assertCount(0, $commands);
        $this->assertContainsOnlyInstancesOf(Command::class, $commands);
    }
}
