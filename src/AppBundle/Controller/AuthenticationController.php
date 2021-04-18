<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticationController extends Controller
{
    /**
     * @Route("/login", name="login")
     */
    public function loginAction(Request $request)
    {
        return $this->render('default/login.html.twig');
    }

    /**
     * @Route("/discourse/sso", name="discourse_sso")
     */
    public function discourseSsoAction(Request $request)
    {
        $sso = $request->query->get('sso');
        $sig = $request->query->get('sig');

        $ssoKey = $this->container->getParameter('discourse_sso_key');

        if(hash_hmac('sha256', $sso,$ssoKey) !== $sig) {
            echo 'error';
            return $this->redirect($this->container->getParameter('discourse_forum_login_path'));
        }

        return $this->render('default/login.html.twig', [
            'nonce' => $sso,
            'isDiscourseLogin' => true,
            'discoureSsoSuccessPath' => $this->getParameter('discourse_sso_success')
            ]
        );
    }

}
