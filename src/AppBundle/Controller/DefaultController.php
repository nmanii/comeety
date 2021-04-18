<?php

namespace AppBundle\Controller;

use AppBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request)
    {
        $user = $this->getUser();

        if($user instanceof User) {
            return $this->redirectToRoute('dashboard');
        }

        $variant = $this->get('ABTest.service')->getVariantByTestName('homepage_explanation');

        return $this->render('default/index.html.twig', array('abtest_variant' => $variant));
    }

    /**
     * @Route("/about-us", name="about_us")
     */
    public function aboutUsAction(Request $request)
    {
        return $this->render('default/about_us.html.twig');
    }

    /**
     * @Route("/registration", name="registration")
     */
    public function registrationAction(Request $request)
    {
        return $this->render('default/registration.html.twig', ['query' => $request->query->all()]);
    }

    /**
     * @Route("/pricing", name="pricing")
     */
    public function pricingAction(Request $request)
    {
        return $this->render('default/pricing.html.twig');
    }

    /**
     * @Route("/subscription-success", name="subscription_success")
     */
    public function subscriptionSuccessAction(Request $request)
    {
        return $this->render('default/subscription_success.html.twig');
    }
}
