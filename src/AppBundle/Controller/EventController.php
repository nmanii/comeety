<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use GuzzleHttp\Command\Exception\CommandException;

class EventController extends Controller
{
    /**
     * @Route("/events", name="show_events")
     */
    public function indexAction(Request $request)
    {
        return $this->render('event/list.html.twig');
    }

    /**
     * @Route("/events/create", name="create_event")
     */
    public function createAction(Request $request)
    {
        $time = '00:00';
        if($request->query->get('time') !== null)  {
            $time = $request->query->get('time');
        }
        $date = '00:00:00';
        if($request->query->get('date') !== null)  {
            $date = $request->query->get('date');
        }
        $startDateTime = $date.' '.$time;
        $event = [
            'title' => $request->query->get('title'),
            'description' => $request->query->get('description'),
            'startDateTime' => \DateTime::createFromFormat('Y-m-d H:i', $startDateTime),
            'maximumCapacity' => $request->query->get('participant'),
            'address' => $request->query->get('address'),
            'placeExternalId' => $request->query->get('placeExternalId'),
            ];
        return $this->render('event/create.html.twig', ['event' => $event]);
    }

    /**
     * @Route("/events/{eventId}/duplicate", name="duplicate_event")
     */
    public function duplicateAction(Request $request, $eventId)
    {
        $clientApi = $this->get('guzzle.client.api');
        $originalEvent = $clientApi->getEvent(['eventId' => $eventId]);
        $event = [
            'title' => $originalEvent['title'],
            'description' => $originalEvent['description'],
            'startDateTime' => null,
            'maximumCapacity' => $originalEvent['maximumCapacity'],
            'address' => $originalEvent['address'],
            'placeExternalId' => $request->query->get('placeExternalId'),
        ];
        return $this->render('event/create.html.twig', ['event' => $event]);
    }

    /**
     * @Route("/events/{eventId}/edit", name="edit_event")
     */
    public function editAction(Request $request, $eventId)
    {
        $clientApi = $this->get('guzzle.client.api');
        try {
            $event = $clientApi->getEvent(['eventId' => $eventId]);
            $data = ['eventId' => $eventId];
            if ($this->getUser() === null || $event['user']['id'] !== $this->getUser()->getId()) {
                $data['errorType'] = 'only_owner_can_edit';
                $data['hideForm'] = true;
            }

            $data['event'] = $event;
        } catch (CommandException $exception)  {
            $data['errorCode'] = $exception->getResponse()->getStatusCode();
            $data['errorMessage'] = $exception->getResponse()->getReasonPhrase();
        }

        return $this->render('event/create.html.twig', $data);
    }

    /**
     * @Route("/events/{eventId}", name="show_event")
     */
    public function showAction(Request $request, $eventId)
    {
        $clientApi = $this->get('guzzle.client.api');

        try {
            $event = $clientApi->getEvent(['eventId' => $eventId]);


            if ($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')) {
                $links = $clientApi->getCurrentUserLinks();
            } else {
                $links = array();
            }

            $isCurrentUserRegistered = false;
            $eventUsers = [];
            $eventUsers = $clientApi->getEventUsers(['eventId' => $eventId]);
            if($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')) {
                foreach ($eventUsers as $eventUser) {
                    if ($this->getUser() != null && $eventUser['user']['id'] === $this->getUser()->getId()) {
                        $isCurrentUserRegistered = true;
                    }
                }
            }
        } catch(CommandException $exception) {
            return $this->render(
                'event/show.html.twig', array(
                    'errorCode' => $exception->getResponse()->getStatusCode(),
                    'isUserAuthenticated' => ($this->getUser()!= null),
                )
            );
        }
        return $this->render(
            'event/show.html.twig',
            [
                'event' => $event,
                'eventUsers' => $eventUsers,
                'isCurrentUserRegistered' => $isCurrentUserRegistered,
                'isUserAuthenticated' => ($this->getUser()!= null),
                'isEventOwner' => ($this->getUser()!= null) && $event['user']['id'] === $this->getUser()->getId(),
                'links' => $links
            ]
        );
    }

    /**
     * @Route("/events/{eventId}/feedback", name="event_feedback")
     */
    public function feedbackAction(Request $request, $eventId)
    {
        $clientApi = $this->get('guzzle.client.api');
        $selectedRating = $request->query->get('rating');

        try {
            $event = $clientApi->getEvent(['eventId' => $eventId]);
            $eventUsers = $clientApi->getEventUsers(['eventId' => $eventId]);
            $links = $clientApi->getCurrentUserLinks();
        } catch(CommandException $exception) {
            return $this->render('event/feedback.html.twig', array('errorCode' => $exception->getResponse()->getStatusCode(), 'message' => $exception->getResponse()->getBody()));
        }

        return $this->render('event/feedback.html.twig', ['event' => $event, 'eventUsers' => $eventUsers, 'links' => $links, 'selectedRating' => $selectedRating]);
    }
}
