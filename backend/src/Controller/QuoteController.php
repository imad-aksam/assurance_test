<?php

namespace App\Controller;

use App\DTO\QuoteDTO;
use App\Repository\QuoteRepository;
use App\Service\QuoteService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * API REST pour la gestion des devis d'assurance.
 *
 * Base URL : /api/quotes
 */
#[Route('/api/quotes', name: 'api_quotes_')]
class QuoteController extends AbstractController
{
    public function __construct(
        private readonly QuoteService           $quoteService,
        private readonly QuoteRepository        $quoteRepo,
        private readonly EntityManagerInterface $em,
    ) {}

    // ─── GET /api/quotes ──────────────────────────────────────────────────────

    /** Liste paginée des devis (utile pour l'interface admin). */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page  = max(1, (int) $request->query->get('page', 1));
        $limit = min(50, max(1, (int) $request->query->get('limit', 20)));

        $quotes = $this->quoteRepo->findPaginated($page, $limit);
        $total  = $this->quoteRepo->countAll();

        return $this->json([
            'data'  => array_map(fn($q) => $q->toArray(), $quotes),
            'total' => $total,
            'page'  => $page,
            'limit' => $limit,
            'pages' => (int) ceil($total / $limit),
        ]);
    }

    // ─── POST /api/quotes ─────────────────────────────────────────────────────

    /** Crée un nouveau devis. */
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['error' => 'Corps de la requête JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $dto   = QuoteDTO::fromArray($data);
            $quote = $this->quoteService->create($dto);

            return $this->json(
                ['message' => 'Devis créé avec succès.', 'data' => $quote->toArray()],
                Response::HTTP_CREATED
            );
        } catch (\InvalidArgumentException $e) {
            return $this->json(
                ['error' => 'Validation échouée.', 'details' => json_decode($e->getMessage(), true)],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // ─── GET /api/quotes/{id} ─────────────────────────────────────────────────

    /** Récupère un devis par son identifiant. */
    #[Route('/{id}', name: 'get', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function get(int $id): JsonResponse
    {
        $quote = $this->quoteRepo->find($id);

        if (!$quote) {
            return $this->json(['error' => "Devis #{$id} introuvable."], Response::HTTP_NOT_FOUND);
        }

        return $this->json(['data' => $quote->toArray()]);
    }

    // ─── PUT /api/quotes/{id} ─────────────────────────────────────────────────

    /** Met à jour un devis existant. */
    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['error' => 'Corps de la requête JSON invalide.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $dto   = QuoteDTO::fromArray($data);
            $quote = $this->quoteService->update($id, $dto);

            return $this->json(['message' => 'Devis mis à jour.', 'data' => $quote->toArray()]);
        } catch (\RuntimeException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (\InvalidArgumentException $e) {
            return $this->json(
                ['error' => 'Validation échouée.', 'details' => json_decode($e->getMessage(), true)],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // ─── PATCH /api/quotes/{id}/offre ─────────────────────────────────────────

    /** Met à jour uniquement l'offre choisie et le statut. */
    #[Route('/{id}/offre', name: 'patch_offre', methods: ['PATCH'], requirements: ['id' => '\\d+'])]
    public function patchOffre(int $id, Request $request): JsonResponse
    {
        $quote = $this->quoteRepo->find($id);

        if (!$quote) {
            return $this->json(['error' => "Devis #{$id} introuvable."], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        $quote->setOffreChoisie($data['offreChoisie'] ?? null);
        $quote->setPrixOffre(isset($data['prixOffre']) ? (float) $data['prixOffre'] : null);
        if (!empty($data['statut'])) {
            $quote->setStatut($data['statut']);
        }

        $this->em->flush();

        return $this->json(['message' => 'Offre mise à jour.', 'data' => $quote->toArray()]);
    }

    // ─── DELETE /api/quotes/{id} ──────────────────────────────────────────────

    /** Supprime un devis (admin uniquement, à protéger avec un firewall). */
    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $quote = $this->quoteRepo->find($id);

        if (!$quote) {
            return $this->json(['error' => "Devis #{$id} introuvable."], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($quote);
        $this->em->flush();

        return $this->json(['message' => "Devis #{$id} supprimé."], Response::HTTP_OK);
    }
}
