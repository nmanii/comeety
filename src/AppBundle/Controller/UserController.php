<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class UserController extends Controller
{
    /**
     * @Route("/dashboard", name="dashboard")
     */
    public function indexAction(Request $request)
    {
        return $this->render('user/dashboard.html.twig');
    }

    /**
     * @Route("/user/{userId}/profile", name="user_profile")
     */
    public function profileAction(Request $request, $userId)
    {
        return $this->render('user/profile.html.twig', array('userId' => $userId));
    }

    /**
     * @Route("/password-reset", name="password_reset")
     */
    public function passwordResetAction(Request $request)
    {
        /**
         * If user is already logged, redirect him
         */
        if ($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')) {
            return $this->redirectToRoute('dashboard');
        }
        return $this->render('user/password_reset.html.twig');
    }

    /**
     * @Route("/user/discord", name="discord")
     */
    public function discordAction(Request $request)
    {
        return $this->render('user/discord.html.twig');
    }
}
