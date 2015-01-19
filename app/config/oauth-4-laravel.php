<?php
return array(

    /*
    |--------------------------------------------------------------------------
    | oAuth Config
    |--------------------------------------------------------------------------
    */

    /**
     * Storage
     */
    'storage' => 'Session',

    /**
     * Consumers
     */
    'consumers' => array(

        /**
         * Facebook
         */
        'Facebook' => array(
            'client_id'     => '1521924611416223',
            'client_secret' => 'c5299a1ec736b17782ab1a5b11c45f10',
            'scope'         => array('email', 'user_online_presence'),
        ),

        /**
         * Google
         */
        'Google' => array(
            'client_id'     => '791211372009-pae9foidjct3n1anmjh5vlm59ebktb2n.apps.googleusercontent.com',
            'client_secret' => 'DnTiuKpJ9qEu0QbZdgO1h4iE',
            'scope'         => array('profile','email'),
        ),

    )

);
