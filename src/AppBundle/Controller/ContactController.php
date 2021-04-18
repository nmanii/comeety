<?php

namespace AppBundle\Controller;

use AppBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class ContactController extends Controller
{
    /**
     * @Route("/contact", name="contact")
     */
    public function indexAction(Request $request)
    {
        $message = [
            'subject' => $request->query->get('subject'),
            'content' => $request->query->get('content')
        ];
        return $this->render('default/contact.html.twig', ['user' => $this->getUser(), 'message' => $message]);
    }
}
