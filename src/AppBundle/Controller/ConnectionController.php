<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use GuzzleHttp\Command\Exception\CommandException;

class ConnectionController extends Controller
{
    /**
     * @Route("/connections", name="show_connections")
     */
    public function indexAction(Request $request)
    {
        return $this->render('user/connections_list.html.twig');
    }
}
