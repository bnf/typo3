<?php
declare(strict_types = 1);
namespace TYPO3\CMS\Core\Tests\Unit\Core;

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

use Interop\Container\ServiceProviderInterface;
use Prophecy\Prophecy\ObjectProphecy;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\ContainerInterface;
use Psr\Container\NotFoundExceptionInterface;
use stdClass as Service;
use TYPO3\CMS\Core\Core\Container;
use TYPO3\CMS\Core\Tests\Unit\Core\Fixtures\ServiceProvider;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

/**
 * Testcase for the Container class
 */
class ContainertTest extends UnitTestCase
{
    /**
     * @var ServiceProviderInterface|ObjectProphecy
     */
    protected $providerProphecy;

    protected function setUp()
    {
        parent::setUp();

        $this->providerProphecy = $this->createServiceProviderProphecy();
    }

    protected function createServiceProviderProphecy(array $factories = [], array $extensions = []): ObjectProphecy
    {
        $prophecy = $this->prophesize();
        $prophecy->willImplement(ServiceProviderInterface::class);
        $prophecy->getFactories()->willReturn($factories);
        $prophecy->getExtensions()->willReturn($extensions);
        return $prophecy;
    }

    public function testImplementsInterface()
    {
        $this->assertInstanceOf(ContainerInterface::class, new Container);
    }

    public function testWithString()
    {
        $this->providerProphecy->getFactories()->willReturn([
            'param' => function () {
                return 'value';
            }
        ]);
        $container = new Container([$this->providerProphecy->reveal()]);

        $this->assertTrue($container->has('param'));
        $this->assertEquals('value', $container->get('param'));
    }

    /**
     * @dataProvider objectFactories
     */
    public function testGet($factory)
    {
        $this->providerProphecy->getFactories()->willReturn([
            'service' => $factory,
        ]);
        $container = new Container([$this->providerProphecy->reveal()]);

        $this->assertTrue($container->has('service'));
        $this->assertInstanceOf(Service::class, $container->get('service'));
    }

    /**
     * @dataProvider objectFactories
     */
    public function testMultipleGetServicesShouldBeEqual($factory)
    {
        $this->providerProphecy->getFactories()->willReturn([ 'service' => $factory ]);
        // A factory can also be used as extension, as it's based on the same signature
        $this->providerProphecy->getExtensions()->willReturn([ 'extension' => $factory ]);

        $container = new Container([$this->providerProphecy->reveal()]);

        $serviceOne = $container->get('service');
        $serviceTwo = $container->get('service');

        $extensionOne = $container->get('extension');
        $extensionTwo = $container->get('extension');

        $this->assertSame($serviceOne, $serviceTwo);
        $this->assertSame($extensionOne, $extensionTwo);
    }

    public function testPassesContainerAsParameter()
    {
        $this->providerProphecy->getFactories()->willReturn([
            'service' => function () {
                return new Service();
            },
            'container' => function (ContainerInterface $container) {
                return $container;
            }
        ]);
        $container = new Container([$this->providerProphecy->reveal()]);

        $this->assertNotSame($container, $container->get('service'));
        $this->assertSame($container, $container->get('container'));
    }

    public function testNullValueEntry()
    {
        $this->providerProphecy->getFactories()->willReturn([
            'null' => function () {
                return null;
            }
        ]);
        $container = new Container([$this->providerProphecy->reveal()]);

        $this->assertTrue($container->has('null'));
        $this->assertNull($container->get('null'));
    }

    public function testHas()
    {
        $this->providerProphecy->getFactories()->willReturn([
            'service' => function () {
                return new Service();
            },
            'param' => function () {
                return 'value';
            },
            'int' => function () {
                return 2;
            },
            'bool' => function () {
                return false;
            },
            'null' => function () {
                return null;
            }
        ]);
        $container = new Container([$this->providerProphecy->reveal()]);

        $this->assertTrue($container->has('param'));
        $this->assertTrue($container->has('service'));
        $this->assertTrue($container->has('int'));
        $this->assertTrue($container->has('bool'));
        $this->assertTrue($container->has('null'));
        $this->assertFalse($container->has('non_existent'));
    }

    public function testDefaultEntry()
    {
        $default = ['param' => 'value'];
        $container = new Container([], $default);

        $this->assertSame('value', $container->get('param'));
    }

    public function testGetValidatesKeyIsPresent()
    {
        $container = new Container();

        $this->expectException(NotFoundExceptionInterface::class);
        $this->expectExceptionMessage('Container entry "foo" is not available.');
        $container->get('foo');
    }

    /**
     * @dataProvider objectFactories
     */
    public function testExtension($factory)
    {
        $providerA = $this->providerProphecy;
        $providerA->getFactories()->willReturn(['service' => $factory]);

        $providerB = $this->createServiceProviderProphecy();
        $providerB->getExtensions()->willReturn([
            'service' => function (ContainerInterface $c, Service $s) {
                $s->value = 'value';
                return $s;
            },
        ]);
        $container = new Container([$providerA->reveal(), $providerB->reveal()]);

        $this->assertSame('value', $container->get('service')->value);
    }

    /**
     * @dataProvider objectFactories
     */
    public function testExtendingLaterProvider($factory)
    {
        $providerA = $this->providerProphecy;
        $providerA->getFactories()->willReturn(['service' => $factory]);

        $providerB = $this->createServiceProviderProphecy();
        $providerB->getExtensions()->willReturn([
            'service' => function (ContainerInterface $c, Service $s) {
                $s->value = 'value';
                return $s;
            },
        ]);
        $container = new Container([$providerB->reveal(), $providerA->reveal()]);

        $this->assertSame('value', $container->get('service')->value);
    }

    /**
     * @dataProvider objectFactories
     */
    public function testExtendingOwnFactory($factory)
    {
        $this->providerProphecy->getFactories()->willReturn(['service' => $factory]);
        $this->providerProphecy->getExtensions()->willReturn(
            [
                'service' => function (ContainerInterface $c, Service $s) {
                    $s->value = 'value';
                    return $s;
                },
            ]
        );
        $container = new Container([$this->providerProphecy->reveal()]);

        $this->assertSame('value', $container->get('service')->value);
    }

    public function testExtendingNonExistingFactory()
    {
        $this->providerProphecy->getExtensions()->willReturn([
            'service' => function (ContainerInterface $c, Service $s = null) {
                if ($s === null) {
                    $s = new Service();
                }
                $s->value = 'value';
                return $s;
            },
        ]);
        $container = new Container([$this->providerProphecy->reveal()]);

        $this->assertSame('value', $container->get('service')->value);
    }

    /**
     * @dataProvider objectFactories
     */
    public function testMultipleExtensions($factory)
    {
        $providerA = $this->providerProphecy;
        $providerA->getFactories()->willReturn(['service' => $factory]);

        $providerB = $this->createServiceProviderProphecy();
        $providerB->getExtensions()->willReturn([
            'service' => function (ContainerInterface $c, Service $s) {
                $s->value = '1';
                return $s;
            },
        ]);

        $providerC = $this->createServiceProviderProphecy();
        $providerC->getExtensions()->willReturn([
            'service' => function (ContainerInterface $c, Service $s) {
                $s->value .= '2';
                return $s;
            },
        ]);
        $container = new Container([$providerA->reveal(), $providerB->reveal(), $providerC->reveal()]);

        $this->assertSame('12', $container->get('service')->value);
    }

    /**
     * @dataProvider objectFactories
     */
    public function testEntryOverriding($factory)
    {
        $providerA = $this->providerProphecy;
        $providerA->getFactories()->willReturn(['service' => $factory]);

        $providerB = $this->createServiceProviderProphecy();
        $providerB->getFactories()->willReturn(['service' => function () {
            return 'value';
        }]);

        $container = new Container([$providerA->reveal(), $providerB->reveal()]);

        $this->assertNotInstanceOf(Service::class, $container->get('service'));
        $this->assertEquals('value', $container->get('service'));
    }

    public function testCyclicDepndency()
    {
        $this->providerProphecy->getFactories()->willReturn([
            'A' => function (ContainerInterface $container) {
                return $container->get('B');
            },
            'B' => function (ContainerInterface $container) {
                return $container->get('A');
            },
        ]);

        $container = new Container([$this->providerProphecy->reveal()]);

        $this->expectException(ContainerExceptionInterface::class);
        $this->expectExceptionMessage('Container entry "A" is part of a cyclic dependency chain.');
        $container->get('A');
    }

    public static function factory()
    {
        return new Service();
    }

    /**
     * Provider for ServerProvider callables.
     * Either a closure, a static callable or invokable.
     */
    public function objectFactories()
    {
        return [
            [
                // Static callback
                [ self::class, 'factory']
            ],
            [
                // Closure
                function () {
                    return new Service();
                }
            ],
            [
                // Invokable
                new class {
                    public function __invoke()
                    {
                        return new Service();
                    }
                }
            ],
            [
                // Non static factory
                [
                    new class {
                        public function factory()
                        {
                            return new Service();
                        }
                    },
                    'factory'
                ]
            ],
        ];
    }

    // @todo: test leaking factories?
    // @todo: ContainerException when get() fails?
    // @todo: passing non ServiceProvider as parameter

//    public function testDelegateLookupFeature()
//    {
//        $root = new Container();
//        $container = new Container([ 'container'  => function (ContainerInterface $c) { return $c; } ] [], $root);
//
//        $this->assertSame($root, $container->get('container'));
//    }
}
