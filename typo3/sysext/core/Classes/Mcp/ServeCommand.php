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

namespace TYPO3\CMS\Core\Mcp;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\StreamableInputInterface;
use Symfony\Component\Console\Output\ConsoleOutputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionExceptionInterface;
use TYPO3\CMS\Core\Action\ActionInvoker;
use TYPO3\CMS\Core\Attribute\AsNonSchedulableCommand;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Scope\ScopeInterface;
use TYPO3\CMS\Core\Scope\ScopeRegistry;
use TYPO3\CMS\Core\Scope\ScopeUser;

#[AsCommand(name: 'mcp:serve', description: 'Serve the Actions API as MCP server over stdio')]
#[AsNonSchedulableCommand]
final class ServeCommand extends Command
{
    public function __construct(
        private readonly Context $context,
        private readonly ActionInvoker $actionInvoker,
        private readonly ScopeRegistry $scopeRegistry,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('user', null, InputOption::VALUE_REQUIRED, 'Backend user the server acts as');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        if (!$output instanceof ConsoleOutputInterface) {
            throw new \LogicException('This command accepts only outputs that implement "ConsoleOutputInterface".', 1790071990);
        }
        set_time_limit(0);

        $user = new ScopeUser($GLOBALS['BE_USER']);
        // Loads the be_users row, resolves groups and mounts without a session,
        //$context = $this->contextFactory->forBackendUser((string)$input->getOption('user'));
        $context = new ActionContext(
            $this->context,
            $GLOBALS['BE_USER'],
            $GLOBALS['LANG'],
            null,
            $this->getScopes($user),
        );

        $stdin = ($input instanceof StreamableInputInterface ? $input->getStream() : null) ?? \STDIN;
        while (($line = fgets($stdin)) !== false) {
            if (trim($line) === '') {
                continue;
            }
            $reply = $this->handle($line, $context);
            if ($reply !== null) {
                $output->writeln(json_encode($reply, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            }
        }
        return Command::SUCCESS;
    }

    private function handle(string $line, ActionContext $context): Response|Error|null
    {
        try {
            $arguments = json_decode($line, false, 512, JSON_THROW_ON_ERROR);
            if (!is_object($arguments)) {
                return new Error(0, ['code' => ErrorCode::INVALID_PARAMS, 'message' => 'JSONRPC payload is expected to be an object']);
            }
            $id = (int)($arguments->id ?? 0);
        } catch (\JsonException $e) {
            return new Error(0, ['code' => ErrorCode::PARSE_ERROR, 'message' => 'Parse error: ' . $e->getMessage()]);
        }

        try {
            return $this->actionInvoker->invoke('mcp:dispatch', $arguments, $context);
        } catch (\InvalidArgumentException $e) {
            return new Error($id, ['code' => ErrorCode::INVALID_PARAMS, 'message' => $e->getMessage()]);
        } catch (\RuntimeException $e) {
            return new Error($id, ['code' => ErrorCode::INVALID_PARAMS, 'message' => $e->getMessage()]);
        } catch (ActionExceptionInterface $e) {
            return new Error($id, ['code' => ErrorCode::INVALID_REQUEST, 'message' => $e->getMessage()]);
        }
    }

    /**
     * @return array<string, ScopeInterface>
     */
    protected function getScopes(ScopeUser $user): array
    {
        $scopes = [];

        foreach ($this->scopeRegistry as $identifier => $scope) {
            if ($scope->allowedForUser($user)) {
                $scopes[$identifier] = $scope;
            }
        }

        return $scopes;
    }
}
