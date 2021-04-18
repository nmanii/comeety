<?php

namespace AppBundle\Service;


use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;

class ABTest
{
    private $cookieName;
    private $cookieDomain;
    private $clientConfiguration;
    private $testConfiguration;

    public function __construct(RequestStack $requestStack, $cookieDomain, $cookieName, $testConfiguration)
    {
        $this->request = $requestStack->getCurrentRequest();
        $this->cookieDomain = $cookieDomain;
        $this->cookieName = $cookieName;
        $this->testConfiguration = $testConfiguration;
        $this->loadClientConfigurationFromCookies();
    }

    public function getVariantByTestName($testName) {
        //If the visitor already been assigned a variant for this test
        if(array_key_exists($testName, $this->clientConfiguration)) {
            if(in_array($this->clientConfiguration[$testName], $this->testConfiguration[$testName])) {
                return $this->clientConfiguration[$testName];
            }
        }

        //if don't have a variant, generate variant id for visitor or variant doesn't exist anymore
        $ABTestConfiguration = $this->testConfiguration[$testName];
        //Select randomnly one of the test options
        $ABTestGroup = $ABTestConfiguration[mt_rand(0, count($ABTestConfiguration) - 1)];
        $this->clientConfiguration[$testName] = $ABTestGroup;
        return $ABTestGroup;
    }

    public function loadClientConfigurationFromCookies() {
        $cookies = $this->request->cookies;
        //Get data from cookie
        $this->clientConfiguration = json_decode($cookies->get($this->cookieName), true);
        //If cookie has never been set, we initialize an array
        if($this->clientConfiguration === null) {
            $this->clientConfiguration = array();
        }
    }

    public function onKernelResponse(FilterResponseEvent $event) {
        try {
            $event->getResponse()->headers->setCookie(new Cookie($this->cookieName, json_encode($this->clientConfiguration), "+1 week", '/', $this->cookieDomain, true, true));
        } catch(\Exception $ex) {
            //$this->logger->error($ex);
        }


    }
}