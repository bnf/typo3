.. include:: ../../Includes.txt

===================================================================
Feature: #84112 - Symfony dependency injection for core and extbase
===================================================================

See :issue:`84112`

Description
===========

The PHP library `symfony/dependency-injection` has been integrated and is used
to manage system wide dependency management and injection for classes.
The intergration adds support for Extbase and non Extbase classes and is thus
intended to replace the Extbase dependency injection container and object
manager with the provided PSR-11 container.
Therefore :php:`\TYPO3\CMS\Extbase\Object\ObjectManager` now resorts to this
new dependency injection container and prioritizes its entries over classical
Extbase based dependency injection (which is still available).
:php:`\TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance()` has been adapted
to retrieve instances from the container, if possible.

Configuration
^^^^^^^^^^^^^

Extensions are encouraged to configure their classes to make use of the new
dependency injection. A symfony flavored yaml (or, for advances functionality, php)
service configuration file may be used to do so.

Autowiring
----------

A :file:`Configuration/Services.yaml` which pretty much reflects the
current feature set of Extbase DI file looks like:

.. code-block:: yaml
    # Configuration/Services.yaml
    services:
      _defaults:
        autowire: true
        autoconfigure: true
        public: false

      Your\Namespace\:
        resource: '../Classes/*'

Classes should be adapted to avoid both,
:php:`ObjectManager` and :php:`GeneralUtility::makeInstance()` whenever
possible. Service dependencies should be injected via custructor
injection or setter methods (inject methods as in extbase are supported).

As many extensions will have used Extbase dependency injection in the past,
these extensions will want to enable `autowire` which instructs symfony to
calculate the required dependencies from type declaration of constructor
and inject method. This calculation yields to a service initialization recipe
which is cached using the core php code cache.
Note: An extension doesn't need to use autowiring, it is free to manually
wire dependencies in the service configuration file.

It is suggested to enable `autoconfigure` option as this will automatically
add symfony service tags based on implemented interfaces or base classes. E.g.
it sets classes that implement :php:`\TYPO3\CMS\Core\SingletonInterface` to be publicly available
in the symfony container (required for legacy singleton lookups through
:php:`\TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance()`).

`public: false` is a performance optimization and is therefore suggested to be
enabled in extensions (symfony does not enable this by default for backwards
compatibility reasons).


Manual wiring
-------------

Manual dependency wiring and service configuration can be used instead of (and acutally
even combined with) autowiring. This speeds up container compilation and allows for
custom configuration, but has the drawback of having to write some boilerplate.

.. code-block:: yaml
    # Configuration/Services.yaml
    services:
      _defaults:
        autoconfigure: false
        public: false

      Your\Namespace\Service\ExampleService:
       # mark public – means this service should be retrievable using $container->get()
       # and (often more important), both GeneralUtility::makeInstance() and the extbase
       # ObjectManager will be able to use the symfony DI managed service
       public: true
       # Defining a service to be shared is equal to SingletonInterface behaviour
       shared: true
       # Configure constructor arguments
       arguments:
         $siteConfiguration: '@TYPO3\CMS\Core\Configuration\SiteConfiguration'

      # Example extbase controller
      Your\Namespace\Controller\ExampleController
       # mark public to be dispatchable
       public: true
       # Defining to be a prototype, as extbase controllers are stateful (i. e. could not be defined as singleton)
       shared: false
       # Configure constructor arguments
       arguments:
         $exampleService: '@Your\Namespace\Service\ExampleService'


For more information use the official documentation:
https://symfony.com/doc/4.3/service_container.html


Advanced functionality
----------------------

Given an interface :php:`MyCustomInterface`, you can automatically
add a symfony tag for services that implement this interface and
have autoconfiguration enabled. A compiler pass can use that tag
and configure autoregistration into a registry service.

.. code-block:: php
    # Configuration/Services.php
    <?php
    declare(strict_types = 1);
    namespace Your\Namespace;

    use Symfony\Component\DependencyInjection\ContainerBuilder;
    use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

    return function (ContainerConfigurator $container, ContainerBuilder $containerBuilder) {
        $containerBuilder->registerForAutoconfiguration(MyCustomInterface::class)->addTag('my.custom.interface');

        $containerBuilder->addCompilerPass(new DependencyInjection\SingletonPass('typo3.singleton'));
    };

.. code-block:: php
    # Classes/DependencyInjection/MyCustomPass.php
    <?php
    namespace Your\Namespace\DependencyInjection;

    use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
    use Symfony\Component\DependencyInjection\ContainerBuilder;
    use Your\Namespace\MyRegistry;

    /**
     * @internal
     */
    final class MyCustomPass implements CompilerPassInterface
    {
        /**
         * @var string
         */
        private $tagName;

        /**
         * @param string $tagName
         */
        public function __construct(string $tagName)
        {
            $this->tagName = $tagName;
        }

        /**
         * @param ContainerBuilder $container
         */
        public function process(ContainerBuilder $container)
        {
            $myRegistry = $container->findDefinition(MyRegistry::class);

            foreach ($container->findTaggedServiceIds($this->tagName) as $id => $tags) {
                $definition = $container->findDefinition($id);
                if (!$definition->isAutoconfigured() || $definition->isAbstract()) {
                    continue;
                }

                // They need to be public to be lazy loadable via $container->get()
                $container->findDefinition($id)->setPublic(true);
                // Add a call to the registry class to the auto-generated factory for
                // the registry.
                // Supersedes explicit registrations in ext_localconf.php (which're
                // still possible.
                $myRegistry->addMethodCall('registerMyCustomInterfaceImplementation', [$id]);
            }
        }
    }

Impact
======

 * Symfony automatically resolves interfaces to classes when only one class
   implementing an interface is given. Otherwise an explicit alias is required.
   That means you SHOULD define an alias for interface to class mappings where
   the implementation defaults to the interface minus the trailing Interface
   suffix.

 * Dependency Injection can be added to services without being breaking.
   `GeneralUtility::makeInstance(ServiceName::class)` will keep working,
   as `makeInstance` is adapted to resort to the symfony container.

 * Cyclic dependencies are not supported


.. index:: PHP-API, ext:core
