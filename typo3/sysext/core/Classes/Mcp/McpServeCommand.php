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

use Psr\Container\ContainerInterface;
use Psr\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

use Symfony\Component\Console\Attribute\AsCommand;
use TYPO3\CMS\Core\Attribute\AsNonSchedulableCommand;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Action\ActionRegistry;
use TYPO3\CMS\Core\Action\ActionDescriptor;
use TYPO3\CMS\Core\Action\ActionContext;
use TYPO3\CMS\Core\Action\ActionExceptionInterface;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
//use TYPO3\CMS\Core\Action\ActionContextFactory;

#[AsCommand(name: 'mcp:serve', description: 'Serve the Actions API as MCP server over stdio')]
#[AsNonSchedulableCommand]
final class McpServeCommand extends Command
{
    public function __construct(
        private readonly Context $context,
        private readonly ActionRegistry $actionRegistry,
        private readonly LanguageServiceFactory $languageServiceFactory,
        //private readonly ActionContextFactory $contextFactory,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('user', null, InputOption::VALUE_REQUIRED, 'Backend user the server acts as');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        //set_time_limit(0);
        $scopes = [];
        // Loads the be_users row, resolves groups and mounts without a session,
        // computes the scopes via ScopeRegistry; request stays null.
        //$context = $this->contextFactory->forBackendUser((string)$input->getOption('user'));
        $context = new ActionContext(
            $this->context,
            $GLOBALS['BE_USER'],
            $GLOBALS['LANG'],
            null,
            $scopes,
        );

        $action = $this->actionRegistry->getAction('mcp:post');

        $stdin = fopen('php://stdin', 'r');
        $stdout = fopen('php://stdout', 'w');
        while (($line = fgets($stdin)) !== false) {
            if (trim($line) === '') {
                continue;
            }
            $reply = $this->handle($line, $action, $context);
            if ($reply !== null) {
                fwrite($stdout, json_encode($reply, JSON_UNESCAPED_SLASHES) . "\n");
                fflush($stdout);
            }
        }
        return Command::SUCCESS;
    }

    private function handle(string $line, ActionDescriptor $action, ActionContext $context): Response|Error|null
    {
        $id = null;
        ob_start();
        try {
            $arguments = json_decode($line, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            // Nothing but messages may reach stdout: a warning, a deprecation, an echo would corrupt the stream.
            $stray = ob_get_clean();
            if ($stray !== '') {
                fwrite(STDERR, $stray);
            }
            return new Error(0, ['code' => -32700, 'message' => 'Parse error']);
        }
        try {
            $args = [
                ...$arguments,
                ...array_fill_keys(
                    $action->contextParameter,
                    $context
                ),
            ];
            if ($args['jsonrpc'] === '2.0') {
                $args['jsonrpc'] = Enum\JsonRpc::VERSION20;
            }
            $id = $arguments['id'] ?? null;
            // The same action HTTP reaches under POST /api/mcp: scopes, envelope
            // validation, hydration and Mcp\Action::handle() in one place.
            //return $this->invoker->invoke('mcp:post', $arguments, $context);
            return $this->actionRegistry->invoke($action, $args);
        } catch (ActionExceptionInterface $e) {
            return new Error($id ?? 0, ['code' => -32600, 'message' => $e->getMessage()]);
        } catch (\Throwable $e) {
            fwrite(STDERR, $e::class . ': ' . $e->getMessage() . "\n");
            return $id === null ? null : new Error($id, ['code' => -32603, 'message' => 'Internal error: ' . $e->getMessage()]);
        } finally {
            // Nothing but messages may reach stdout: a warning, a deprecation, an echo would corrupt the stream.
            $stray = ob_get_clean();
            if ($stray !== '') {
                fwrite(STDERR, $stray);
            }
        }
    }
}
