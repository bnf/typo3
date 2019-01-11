<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\Tests\Unit\DependencyInjection;

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

use TYPO3\CMS\Core\DependencyInjection\FailsafeContainer as Container;
use TYPO3\CMS\Core\DependencyInjection\ServiceProviderRegistry;
use TYPO3\CMS\Core\Tests\Unit\DependencyInjection\Fixtures\TestRegistryServiceProvider;
use TYPO3\CMS\Core\Tests\Unit\DependencyInjection\Fixtures\TestStatefulServiceProvider;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

class ServiceProviderRegistryTest extends UnitTestCase
{
    public function testRegistry()
    {
        $registry = new ServiceProviderRegistry([
            TestRegistryServiceProvider::class,
        ]);

        $this->assertEquals(new TestRegistryServiceProvider(), $registry->get(0));
    }

    public function testRegistryInjectInstance()
    {
        $registry = new ServiceProviderRegistry([
            new TestRegistryServiceProvider(),
        ]);

        $this->assertEquals(new TestRegistryServiceProvider(), $registry->get(0));
        $this->assertSame($registry->get(0), $registry->get(0));
    }

    public function testRegistryArrayWithNoParams()
    {
        $registry = new ServiceProviderRegistry([
            [TestStatefulServiceProvider::class],
        ]);

        $this->assertInstanceOf(TestStatefulServiceProvider::class, $registry->get(0));
        $this->assertEquals(null, $registry->get(0)->foo);
    }

    public function testRegistryArrayWithParams()
    {
        $registry = new ServiceProviderRegistry([
            [TestStatefulServiceProvider::class, [42]],
        ]);

        $this->assertInstanceOf(TestStatefulServiceProvider::class, $registry->get(0));
        $this->assertEquals(42, $registry->get(0)->foo);
    }

    /**
     * @expectedException \InvalidArgumentException
     */
    public function testGetException()
    {
        $registry = new ServiceProviderRegistry([1]);

        $registry->get(0);
    }

    public function testGetServices()
    {
        $registry = new ServiceProviderRegistry([
            new TestRegistryServiceProvider(),
        ]);

        $services = $registry->getFactories(0);
        $this->assertArrayHasKey('serviceA', $services);

        $services2 = $registry->getFactories(0);

        $this->assertSame($services['serviceA'], $services2['serviceA']);
    }

    public function testExtendServices()
    {
        $registry = new ServiceProviderRegistry([
            new TestRegistryServiceProvider(),
        ]);

        $services = $registry->getExtensions(0);
        $this->assertArrayHasKey('serviceB', $services);

        $services2 = $registry->getExtensions(0);

        $this->assertSame($services['serviceB'], $services2['serviceB']);
    }

    public function testGetServiceFactory()
    {
        $registry = new ServiceProviderRegistry([
            new TestRegistryServiceProvider(),
        ]);

        $service = $registry->createService(0, 'param', new Container([]));

        $this->assertEquals(42, $service);
    }

    public function testGetServiceExtension()
    {
        $registry = new ServiceProviderRegistry([
            new TestRegistryServiceProvider(),
        ]);

        $service = $registry->extendService(0, 'serviceB', new Container([]), null);

        $this->assertInstanceOf(\stdClass::class, $service);
    }

    public function testIterator()
    {
        $registry = new ServiceProviderRegistry([
            TestRegistryServiceProvider::class,
            TestRegistryServiceProvider::class,
        ]);

        $i = 0;
        foreach ($registry as $key => $serviceProvider) {
            $this->assertEquals($i, $key);
            $this->assertInstanceOf(TestRegistryServiceProvider::class, $serviceProvider);
            $i++;
        }
    }
}
