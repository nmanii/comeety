<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class UserLanguagesController extends Controller
{
    /**
     * @Route("/user/languages", name="user_languages")
     */
    public function indexAction(Request $request)
    {
        return $this->render('user/languages.html.twig');
    }
}
