<?php

namespace App\Controller;

use App\Entity\City;
use App\Entity\VehicleBrand;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * API REST pour les données de référence (villes, marques).
 */
#[Route('/api', name: 'api_ref_')]
class ReferentialController extends AbstractController
{
    public function __construct(private readonly EntityManagerInterface $em) {}

    /** GET /api/cities — Liste des villes */
    #[Route('/cities', name: 'cities', methods: ['GET'])]
    public function cities(Request $request): JsonResponse
    {
        $search = $request->query->get('q', '');

        $qb = $this->em->getRepository(City::class)->createQueryBuilder('c')
            ->orderBy('c.nom', 'ASC');

        if ($search) {
            $qb->where('c.nom LIKE :q')->setParameter('q', '%' . $search . '%');
        }

        $cities = $qb->getQuery()->getResult();

        return $this->json(array_map(fn ($c) => $c->toArray(), $cities));
    }

    /** GET /api/brands?type=auto — Marques par type de véhicule */
    #[Route('/brands', name: 'brands', methods: ['GET'])]
    public function brands(Request $request): JsonResponse
    {
        $type = $request->query->get('type', '');

        $qb = $this->em->getRepository(VehicleBrand::class)->createQueryBuilder('b')
            ->orderBy('b.nom', 'ASC');

        if (in_array($type, ['auto', 'moto'], true)) {
            $qb->where('b.typeVehicule = :type')->setParameter('type', $type);
        }

        $brands = $qb->getQuery()->getResult();

        return $this->json(array_map(fn ($b) => $b->toArray(), $brands));
    }
}
