<?php

return [
    'ctrl' => [
        'title' => 'Record actions testing test_record_flex',
        'label' => 'title',
        'type' => 'record_type',
        'tstamp' => 'tstamp',
        'crdate' => 'crdate',
        'delete' => 'deleted',
        'security' => [
            'ignorePageTypeRestriction' => true,
        ],
    ],
    'columns' => [
        'title' => [
            'label' => 'title',
            'config' => [
                'type' => 'input',
            ],
        ],
        'record_type' => [
            'label' => 'record_type',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'items' => [
                    ['label' => 'Default', 'value' => 'default'],
                    ['label' => 'Special', 'value' => 'special'],
                    ['label' => 'Dynamic', 'value' => 'dynamic'],
                ],
                'default' => 'default',
            ],
        ],
        'settings' => [
            'label' => 'settings',
            'config' => [
                'type' => 'flex',
                'ds' => '
                    <T3DataStructure>
                        <sheets>
                            <sDEF>
                                <ROOT>
                                    <sheetTitle>general</sheetTitle>
                                    <type>array</type>
                                    <el>
                                        <settings.title>
                                            <label>title</label>
                                            <config>
                                                <type>input</type>
                                            </config>
                                        </settings.title>
                                        <settings.limit>
                                            <label>limit</label>
                                            <config>
                                                <type>number</type>
                                            </config>
                                        </settings.limit>
                                        <settings.enabled>
                                            <label>enabled</label>
                                            <config>
                                                <type>check</type>
                                            </config>
                                        </settings.enabled>
                                        <settings.mode>
                                            <label>mode</label>
                                            <config>
                                                <type>select</type>
                                                <renderType>selectSingle</renderType>
                                                <items>
                                                    <numIndex index="0">
                                                        <label>List</label>
                                                        <value>list</value>
                                                    </numIndex>
                                                    <numIndex index="1">
                                                        <label>Grid</label>
                                                        <value>grid</value>
                                                    </numIndex>
                                                </items>
                                            </config>
                                        </settings.mode>
                                        <settings.pages>
                                            <label>pages</label>
                                            <config>
                                                <type>group</type>
                                                <allowed>pages</allowed>
                                            </config>
                                        </settings.pages>
                                    </el>
                                </ROOT>
                            </sDEF>
                            <sItems>
                                <ROOT>
                                    <sheetTitle>items</sheetTitle>
                                    <type>array</type>
                                    <el>
                                        <settings.items>
                                            <title>items</title>
                                            <type>array</type>
                                            <section>1</section>
                                            <el>
                                                <link>
                                                    <type>array</type>
                                                    <title>link</title>
                                                    <el>
                                                        <title>
                                                            <label>title</label>
                                                            <config>
                                                                <type>input</type>
                                                            </config>
                                                        </title>
                                                        <url>
                                                            <label>url</label>
                                                            <config>
                                                                <type>link</type>
                                                            </config>
                                                        </url>
                                                    </el>
                                                </link>
                                                <divider>
                                                    <type>array</type>
                                                    <title>divider</title>
                                                    <el>
                                                        <label>
                                                            <label>label</label>
                                                            <config>
                                                                <type>input</type>
                                                            </config>
                                                        </label>
                                                    </el>
                                                </divider>
                                            </el>
                                        </settings.items>
                                    </el>
                                </ROOT>
                            </sItems>
                        </sheets>
                    </T3DataStructure>
                ',
            ],
        ],
    ],
    'types' => [
        'default' => [
            'showitem' => 'record_type, title, settings',
        ],
        'dynamic' => [
            'showitem' => 'record_type, title, settings',
        ],
        'special' => [
            'showitem' => 'record_type, title, settings',
            'columnsOverrides' => [
                'settings' => [
                    'config' => [
                        'ds' => '
                            <T3DataStructure>
                                <sheets>
                                    <sDEF>
                                        <ROOT>
                                            <sheetTitle>special</sheetTitle>
                                            <type>array</type>
                                            <el>
                                                <settings.special>
                                                    <label>special</label>
                                                    <config>
                                                        <type>input</type>
                                                    </config>
                                                </settings.special>
                                            </el>
                                        </ROOT>
                                    </sDEF>
                                </sheets>
                            </T3DataStructure>
                        ',
                    ],
                ],
            ],
        ],
    ],
];
