<?php

namespace AppBundle\Service;

use GuzzleHttp\Client;
use GuzzleHttp\Command\Guzzle\Description;
use GuzzleHttp\Command\Guzzle\GuzzleClient;


use Symfony\Component\OptionsResolver\OptionsResolver;

class ApiClient extends GuzzleClient
{
    public function __construct(array $app = [], array $config = [])
    {
        $resolver = new OptionsResolver();
        $this->configureOptionResolver($resolver);

        // validation des paramètres 
        $options = $resolver->resolve($app);

        $auth = '';

        //TODO : use a token retriever
        if(!empty($app['requestStack'])) {
            $request = $app['requestStack']->getCurrentRequest();
            if(!empty($request)) {
                $cookies = $request->cookies;
                if ($cookies->has($app['authenticationCookieName'])) {
                    $auth = 'Bearer ' . $cookies->get($app['authenticationCookieName']);
                }
            }
        }

        // initialisation du client standard Guzzle
        $client = new Client([
            "headers" => [
                "Content-type" => "application/json; charset=utf-8",
                "Authorization" => $auth,
            ],
            "base_uri" => $options["baseUrl"],
            "verify" => $options['verify']
        ]);

        $description = new Description([
            "name" => 'AppApi',
            "description" => "App api",
            "operations" => [
                "getEvent" => [
                    "httpMethod" => "GET",
                    "uri" => "events/{eventId}",
                    "responseModel" => "jsonResponse",
                    "parameters" => [
                        "eventId" => [
                            "required" => true,
                            "location" => "uri"
                        ]
                    ]
                ],
                "getEventUsers" => [
                    "httpMethod" => "GET",
                    "uri" => "events/{eventId}/users",
                    "responseModel" => "jsonResponse",
                    "parameters" => [
                        "eventId" => [
                            "required" => true,
                            "location" => "uri"
                        ]
                    ]
                ],
                "getCurrentUser" => [
                    "httpMethod" => "GET",
                    "uri" => "/user",
                    "responseModel" => "jsonResponse",
                    "additionalParameters" => [
                        "location" => "query"
                    ]
                ],
                "getCurrentUserLinks" => [
                    "httpMethod" => "GET",
                    "uri" => "/user/links",
                    "responseModel" => "jsonResponse",
                    "additionalParameters" => [
                        "location" => "query"
                    ]
                ],
                "confirmRegistration" => [
                    "httpMethod" => "PUT",
                    "uri"=> "users/{userId}/confirmation",
                    "responseModel" => "jsonResponse",
                    "parameters" => [
                        "confirmationToken" => [
                            "required" => true,
                            "location" => "json",
                        ],
                        "userId" => [
                            "required" => true,
                            "location" => "uri",
                        ]
                    ],
                    "additionalParameters" => [
                        "location" => "json"
                    ]
                ],
                "discourseLogout" => [
                    "httpMethod" => "GET",
                    "uri" => "/discourse-logout",
                    "responseModel" => "jsonResponse",
                    "additionalParameters" => [
                        "location" => "query"
                    ]
                ],
            ],
            "models" => [
                "jsonResponse" => [
                    "type" => "object",
                    "additionalProperties" => [
                        "location" => "json"
                    ]
                ]
            ]
        ]);

        parent::__construct($client, $description, null, null, null, $config);
    }

    protected function configureOptionResolver(OptionsResolver $resolver)
    {
        $resolver
            ->setRequired([
                'baseUrl',
                'authenticationCookieName'
            ])
            ->setDefaults(['requestStack' => null, 'verify' => true]);
    }
}