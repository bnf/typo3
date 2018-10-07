<?php
namespace TYPO3\CMS\Extbase\SignalSlot;

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

use Psr\Log\LoggerInterface;
use TYPO3\CMS\Core\Log\LogManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Object\ObjectManager;
use TYPO3\CMS\Extbase\Object\ObjectManagerInterface;

/**
 * A dispatcher which dispatches signals by calling its registered slot methods
 * and passing them the method arguments which were originally passed to the
 * signal method.
 */
class Dispatcher implements \TYPO3\CMS\Core\SingletonInterface
{
    /**
     * @var bool
     */
    protected $isInitialized = false;

    /**
     * @var ObjectManagerInterface
     */
    protected $objectManager;

    /**
     * Information about all slots connected a certain signal.
     * Indexed by [$signalClassName][$signalMethodName] and then numeric with an
     * array of information about the slot
     *
     * @var array
     */
    protected $slots = [];

    /**
     * @var LoggerInterface
     */
    protected $logger;

    /**
     * @param ObjectManagerInterface $objectManager
     * @param LoggerInterface $logger
     */
    public function __construct(ObjectManagerInterface $objectManager = null, LoggerInterface $logger = null)
    {
        $this->objectManager = $objectManager;
        $this->logger = $logger;

        $this->isIntitialzed = $objectManager !== null && $logger !== null;
    }

    /**
     * Initializes this object.
     *
     * This methods needs to be used as alternative to inject aspects.
     * Since this dispatches is used very early when the ObjectManager
     * is not fully initialized (especially concerning caching framework),
     * this is the only way.
     */
    public function initializeObject()
    {
        if (!$this->isInitialized) {
            // @todo remove fallbacks which are currently required for unit tests
            $this->objectManager = $this->objectManager ?? GeneralUtility::makeInstance(ObjectManager::class);
            $this->logger = $this->logger ?? GeneralUtility::makeInstance(LogManager::class)->getLogger(self::class);
            $this->isInitialized = true;
        }
    }

    /**
     * Connects a signal with a slot.
     * One slot can be connected with multiple signals by calling this method multiple times.
     *
     * @param string $signalClassName Name of the class containing the signal
     * @param string $signalName Name of the signal
     * @param mixed $slotClassNameOrObject Name of the class containing the slot or the instantiated class or a Closure object
     * @param string $slotMethodName Name of the method to be used as a slot. If $slotClassNameOrObject is a Closure object, this parameter is ignored
     * @param bool $passSignalInformation If set to TRUE, the last argument passed to the slot will be information about the signal (EmitterClassName::signalName)
     * @throws \InvalidArgumentException
     */
    public function connect($signalClassName, $signalName, $slotClassNameOrObject, $slotMethodName = '', $passSignalInformation = true)
    {
        $class = null;
        $object = null;
        if (is_object($slotClassNameOrObject)) {
            $object = $slotClassNameOrObject;
            $method = $slotClassNameOrObject instanceof \Closure ? '__invoke' : $slotMethodName;
        } else {
            if ($slotMethodName === '') {
                throw new \InvalidArgumentException('The slot method name must not be empty (except for closures).', 1229531659);
            }
            $class = $slotClassNameOrObject;
            $method = $slotMethodName;
        }
        $slot = [
            'class' => $class,
            'method' => $method,
            'object' => $object,
            'passSignalInformation' => $passSignalInformation === true,
        ];
        // The in_array() comparision needs to be strict to avoid potential issues
        // with complex objects being registered as slot.
        if (!is_array($this->slots[$signalClassName][$signalName] ?? false) || !in_array($slot, $this->slots[$signalClassName][$signalName], true)) {
            $this->slots[$signalClassName][$signalName][] = $slot;
        }
    }

    /**
     * Dispatches a signal by calling the registered Slot methods
     *
     * @param string $signalClassName Name of the class containing the signal
     * @param string $signalName Name of the signal
     * @param array $signalArguments arguments passed to the signal method
     * @return mixed
     * @throws Exception\InvalidSlotException if the slot is not valid
     * @throws Exception\InvalidSlotReturnException if a slot returns invalid arguments (too few or return value is not an array)
     */
    public function dispatch($signalClassName, $signalName, array $signalArguments = [])
    {
        $this->initializeObject();
        $this->logger->debug(
            'Triggered signal ' . $signalClassName . ' ' . $signalName,
            [
                'signalClassName' => $signalClassName,
                'signalName' => $signalName,
                'signalArguments' => $signalArguments,
            ]
        );
        if (!isset($this->slots[$signalClassName][$signalName])) {
            return $signalArguments;
        }
        foreach ($this->slots[$signalClassName][$signalName] as $slotInformation) {
            if (isset($slotInformation['object'])) {
                $object = $slotInformation['object'];
            } else {
                if (!isset($this->objectManager)) {
                    throw new Exception\InvalidSlotException(sprintf('Cannot dispatch %s::%s to class %s. The object manager is not yet available in the Signal Slot Dispatcher and therefore it cannot dispatch classes.', $signalClassName, $signalName, $slotInformation['class'] ?? ''), 1298113624);
                }
                if (!$this->objectManager->isRegistered($slotInformation['class'])) {
                    throw new Exception\InvalidSlotException('The given class "' . $slotInformation['class'] . '" is not a registered object.', 1245673367);
                }
                $object = $this->objectManager->get($slotInformation['class']);
            }

            if (!method_exists($object, $slotInformation['method'])) {
                throw new Exception\InvalidSlotException('The slot method ' . get_class($object) . '->' . $slotInformation['method'] . '() does not exist.', 1245673368);
            }

            $preparedSlotArguments = $signalArguments;
            if ($slotInformation['passSignalInformation'] === true) {
                $preparedSlotArguments[] = $signalClassName . '::' . $signalName;
            }

            $slotReturn = call_user_func_array([$object, $slotInformation['method']], $preparedSlotArguments);

            if ($slotReturn) {
                if (!is_array($slotReturn)) {
                    throw new Exception\InvalidSlotReturnException('The slot method ' . get_class($object) . '->' . $slotInformation['method'] . '()\'s return value is of an not allowed type ('
                        . gettype($slotReturn) . ').', 1376683067);
                }
                if (count($slotReturn) !== count($signalArguments)) {
                    throw new Exception\InvalidSlotReturnException('The slot method ' . get_class($object) . '->' . $slotInformation['method'] . '() returned a different number ('
                        . count($slotReturn) . ') of arguments, than it received (' . count($signalArguments) . ').', 1376683066);
                }
                $signalArguments = $slotReturn;
            }
        }

        return $signalArguments;
    }

    /**
     * Returns all slots which are connected with the given signal
     *
     * @param string $signalClassName Name of the class containing the signal
     * @param string $signalName Name of the signal
     * @return array An array of arrays with slot information
     */
    public function getSlots($signalClassName, $signalName)
    {
        return $this->slots[$signalClassName][$signalName] ?? [];
    }
}
