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

namespace TYPO3\CMS\Core\Site\Set;

use TYPO3\CMS\Core\Settings\Category;

class CategoryRegistry
{
    public function __construct(
        protected SetRegistry $setRegistry,
    ) {}

    /**
     * Retrieve list of ordered sets, matched by
     * $setNames, including their dependencies (recursive)
     *
     * @return list<Category>
     */
    public function getCategories(string ...$setNames): array
    {
        $sets = $this->setRegistry->getSets(...$setNames);
        $categories = [];
        foreach ($sets as $set) {
            foreach ($set->categoryDefinitions as $category) {
                $data = $category->toArray();
                $parent = $data['parent'] ?? null;
                unset($data['parent']);
                $categories[$category->key] = [
                    'children' => [],
                    'parent' => $parent,
                    'data' => $data,
                ];
            }
            foreach ($set->categoryDefinitions as $category) {
                if ($category->parent === null) {
                    continue;
                }
                if (!isset($categories[$category->parent])) {
                    throw new \RuntimeException('Missing parent category: ' . $category->parent, 1716291553);
                }
                $categories[$category->parent]['children'][] = $category->key;
            }
        }

        $categorizedSettings = [];
        foreach ($sets as $set) {
            foreach ($set->settingsDefinitions as $definition) {
                foreach ($definition->categories as $category) {
                    $categorizedSettings[$category][] = $definition;
                }
            }
        }

        $instances = [];
        foreach ($categories as $key => $category) {
            if ($category['parent'] === null) {
                $instances[] = $this->createInstance($categories, $key, $categorizedSettings);
            }
        }

        return $instances;
    }

    private function createInstance(array $categories, string $key, array $categorizedSettings): Category
    {
        try {
            return new Category(...[
                ...$categories[$key]['data'],
                'settings' => $categorizedSettings[$key] ?? [],
                'categories' => array_map(fn($key) => $this->createInstance($categories, $key, $categorizedSettings), $categories[$key]['children']),
            ]);
        } catch (\Error $e) {
            throw new \Exception('Invalid category definition: ' . json_encode($categories[$key]['data']), 1720528083, $e);
        }
    }
}
