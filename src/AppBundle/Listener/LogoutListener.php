<?php
namespace AppBundle\Listener;

use Symfony\Component\HttpKernel\Event\FilterResponseEvent;

class LogoutListener
{
    private $domain;
    private $cookieName;
    private $apiClient;
    private $logger;

    public function __construct($domain, $cookieName, $apiClient, $logger)
    {
        $this->domain = $domain;
        $this->cookieName = $cookieName;
        $this->apiClient = $apiClient;
        $this->logger = $logger;
    }

    public function onKernelResponse(FilterResponseEvent $event)
    {
        if ($event->getRequest()->attributes->get('_route') == 'logout') {
            /*
            try {
                $this->apiClient->discourseLogout();
            } catch(\Exception $ex) {
                $this->logger->error($ex);
            }
            */

            $event->getResponse()->headers->clearCookie($this->cookieName, '/', $this->domain);
        }
    }
}

