<?php

declare(strict_types=1);

return [
    'ctrl' => [
        'title' => 'DateTime storage variants',
        'label' => 'uid',
        'tstamp' => 'tstamp',
        'crdate' => 'crdate',
        'delete' => 'deleted',
        'enablecolumns' => [
            'disabled' => 'hidden',
        ],
        'security' => [
            'ignorePageTypeRestriction' => true,
        ],
    ],
    'columns' => [
        'int_not_null' => [
            'label' => 'db=int, NOT NULL',
            'config' => [
                'type' => 'datetime',
            ],
        ],
        'int_nullable' => [
            'label' => 'db=int, nullable',
            'config' => [
                'type' => 'datetime',
                'nullable' => true,
            ],
        ],
        'int_datetimesec' => [
            'label' => 'db=int, format=datetimesec',
            'config' => [
                'type' => 'datetime',
                'format' => 'datetimesec',
            ],
        ],
        'datetime_nullable' => [
            'label' => 'dbType=datetime, nullable',
            'config' => [
                'type' => 'datetime',
                'dbType' => 'datetime',
            ],
        ],
        'date_nullable' => [
            'label' => 'dbType=date, nullable',
            'config' => [
                'type' => 'datetime',
                'dbType' => 'date',
                'format' => 'date',
            ],
        ],
        'time_nullable' => [
            'label' => 'dbType=time, nullable',
            'config' => [
                'type' => 'datetime',
                'dbType' => 'time',
                'format' => 'time',
            ],
        ],
        'date_not_null' => [
            'label' => 'dbType=date, nullable=false',
            'config' => [
                'type' => 'datetime',
                'dbType' => 'date',
                'format' => 'date',
                'nullable' => false,
            ],
        ],
        'datetime_not_null' => [
            'label' => 'dbType=datetime, nullable=false',
            'config' => [
                'type' => 'datetime',
                'dbType' => 'datetime',
                'nullable' => false,
            ],
        ],
        'time_not_null' => [
            'label' => 'dbType=time, nullable=false',
            'config' => [
                'type' => 'datetime',
                'dbType' => 'time',
                'format' => 'time',
                'nullable' => false,
            ],
        ],
        'int_legacy_null' => [
            'label' => 'db=int DEFAULT NULL, not nullable in TCA',
            'config' => [
                'type' => 'datetime',
            ],
        ],
        'text_not_null' => [
            'label' => 'db=varchar, NOT NULL',
            'config' => [
                'type' => 'datetime',
            ],
        ],
        'int_inconsistent_sql_null' => [
            'label' => 'db=int DEFAULT NULL, nullable=false',
            'config' => [
                'type' => 'datetime',
                'nullable' => false,
            ],
        ],
        'text_inconsistent_sql_null' => [
            'label' => 'db=varchar DEFAULT NULL, nullable=false',
            'config' => [
                'type' => 'datetime',
                'nullable' => false,
            ],
        ],
        'datetime_inconsistent_sql_null' => [
            'label' => 'dbType=datetime DEFAULT NULL, nullable=false',
            'config' => [
                'type' => 'datetime',
                'dbType' => 'datetime',
                'nullable' => false,
            ],
        ],
        'date_inconsistent_sql_null' => [
            'label' => 'dbType=date DEFAULT NULL, nullable=false',
            'config' => [
                'type' => 'datetime',
                'dbType' => 'date',
                'format' => 'date',
                'nullable' => false,
            ],
        ],
        'time_inconsistent_sql_null' => [
            'label' => 'dbType=time DEFAULT NULL, nullable=false',
            'config' => [
                'type' => 'datetime',
                'dbType' => 'time',
                'format' => 'time',
                'nullable' => false,
            ],
        ],
    ],
    'types' => [
        '1' => ['showitem' => 'int_not_null, int_nullable, int_datetimesec, datetime_nullable, date_nullable, time_nullable, date_not_null, datetime_not_null, time_not_null, int_legacy_null, text_not_null, int_inconsistent_sql_null, text_inconsistent_sql_null, datetime_inconsistent_sql_null, date_inconsistent_sql_null, time_inconsistent_sql_null'],
    ],
];
