<?php

namespace AppBundle\Controller;

use GuzzleHttp\Command\Exception\CommandClientException;
use GuzzleHttp\Command\Exception\CommandException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Intl\Intl;

class RegistrationController extends Controller
{

    /**
     * @Route("/registration-success", name="registration_success")
     */
    public function registrationSuccessAction(Request $request)
    {
        return $this->render('registration/success.html.twig');
    }


    /**
     * @Route("/registration-confirmation/{userId}", name="registration_confirmation")
     */
    public function registrationConfirmationAction(Request $request, $userId)
    {
        $token = $request->query->get('t');

        $clientApi = $this->get('guzzle.client.api');
        try{
            $clientApi->confirmRegistration(['confirmationToken' => $token, 'userId' => $userId]);
        } catch(CommandException $exception ) {
            return $this->render('registration/confirmation_error.html.twig', array('errorCode' => $exception->getResponse()->getStatusCode()));
        }

        return $this->render('registration/confirmation_success.html.twig');
    }

    /**
     * @Route("/complete-profile", name="complete_profile")
     */
    public function registrationCompleteProfileAction(Request $request)
    {
        $countryList = $countries = Intl::getRegionBundle()->getCountryNames();
        return $this->render('registration/complete_profile.html.twig', ['countryList' => $countryList]);
    }

    /**
     * @Route("/profile/edit", name="edit_profile")
     */
    public function profileEditAction(Request $request)
    {
        $clientApi = $this->get('guzzle.client.api');
        try {
            $currentUser = $clientApi->getCurrentUser();
            $data['profile'] = $currentUser['profile'];
        } catch (CommandException $exception)  {
            $data['profile_error'] = true;
            $data['errorCode'] = $exception->getResponse()->getStatusCode();
            $data['errorMessage'] = $exception->getResponse()->getReasonPhrase();
        }
        $countryList = $countries = Intl::getRegionBundle()->getCountryNames();
        $data['countryList'] = $countryList;
        return $this->render('registration/complete_profile.html.twig', $data);
    }
}
