<?php

namespace App\Service;

use App\DTO\QuoteDTO;
use App\Entity\City;
use App\Entity\Quote;
use App\Repository\QuoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Service métier pour la gestion des devis.
 */
class QuoteService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface     $validator,
        private readonly QuoteRepository        $quoteRepo,
    ) {}

    /**
     * Valide et crée un nouveau devis.
     *
     * @throws \InvalidArgumentException si la validation échoue
     */
    public function create(QuoteDTO $dto): Quote
    {
        $this->validate($dto);

        $quote = new Quote();
        $this->hydrate($quote, $dto);

        $this->em->persist($quote);
        $this->em->flush();

        return $quote;
    }

    /**
     * Valide et met à jour un devis existant.
     *
     * @throws \InvalidArgumentException si la validation échoue
     * @throws \RuntimeException        si le devis est introuvable
     */
    public function update(int $id, QuoteDTO $dto): Quote
    {
        $quote = $this->quoteRepo->find($id)
            ?? throw new \RuntimeException("Devis #{$id} introuvable.");

        $this->validate($dto);
        $this->hydrate($quote, $dto);

        $this->em->flush();

        return $quote;
    }

    /**
     * Hydrate l'entité Quote depuis le DTO.
     */
    private function hydrate(Quote $quote, QuoteDTO $dto): void
    {
        $city = $this->em->find(City::class, $dto->cityId)
            ?? throw new \InvalidArgumentException("Ville #{$dto->cityId} introuvable.");

        $quote
            ->setNom($dto->nom)
            ->setPrenom($dto->prenom)
            ->setCity($city)
            ->setTelephone($dto->telephone)
            ->setDateNaissance(new \DateTime($dto->dateNaissance))
            ->setDatePermis(new \DateTime($dto->datePermis))
            ->setTypeAssurance($dto->typeAssurance)
            ->setMarqueVehicule($dto->marqueVehicule)
            ->setTypeCarburant($dto->typeCarburant)
            ->setDateMiseEnCirculation(new \DateTime($dto->dateMiseEnCirculation))
            ->setNombrePlaces($dto->nombrePlaces)
            ->setValeurNeuf((string) $dto->valeurNeuf)
            ->setValeurVenale((string) $dto->valeurVenale)
            ->setImmatriculation($dto->immatriculation)
            ->setStatut($dto->statut);

        // Champs conditionnels selon le type
        if ($dto->typeAssurance === Quote::TYPE_AUTO) {
            $quote->setPuissanceFiscale($dto->puissanceFiscale);
            $quote->setCylindree(null);
        } else {
            $quote->setCylindree($dto->cylindree);
            $quote->setPuissanceFiscale(null);
        }

        // Offre choisie (optionnel — renseigné depuis EstimationPage)
        $quote->setOffreChoisie($dto->offreChoisie);
        $quote->setPrixOffre($dto->prixOffre);
    }

    /**
     * Valide le DTO et lève une exception si des erreurs sont trouvées.
     *
     * @throws \InvalidArgumentException
     */
    private function validate(QuoteDTO $dto): void
    {
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[$error->getPropertyPath()] = $error->getMessage();
            }
            throw new \InvalidArgumentException(json_encode($messages));
        }

        // Validation métier : datePermis >= dateNaissance + 16 ans
        $naissance = new \DateTime($dto->dateNaissance);
        $permis    = new \DateTime($dto->datePermis);
        $agePermis = $naissance->diff($permis)->y;

        if ($agePermis < 16) {
            throw new \InvalidArgumentException(json_encode([
                'datePermis' => 'Le permis doit être obtenu après 16 ans.',
            ]));
        }

        // Validation métier : valeurVenale <= valeurNeuf
        if ($dto->valeurVenale > $dto->valeurNeuf) {
            throw new \InvalidArgumentException(json_encode([
                'valeurVenale' => 'La valeur vénale ne peut pas dépasser la valeur à neuf.',
            ]));
        }
    }
}