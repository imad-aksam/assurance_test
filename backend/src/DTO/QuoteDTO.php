<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Data Transfer Object pour la création / mise à jour d'un devis.
 * Utilisé pour valider les données reçues de l'API avant persistance.
 */
class QuoteDTO
{
    // ─── Étape 1 : Informations personnelles ─────────────────────────────────

    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Assert\Length(max: 100)]
    public string $nom = '';

    #[Assert\NotBlank(message: 'Le prénom est obligatoire.')]
    #[Assert\Length(max: 100)]
    public string $prenom = '';

    #[Assert\NotNull(message: 'La ville est obligatoire.')]
    #[Assert\Positive]
    public ?int $cityId = null;

    #[Assert\NotBlank(message: 'Le téléphone est obligatoire.')]
    #[Assert\Regex(
        pattern: '/^(\+212|0)([ \-]?[0-9]){9}$/',
        message: 'Format de téléphone invalide (ex: 0612345678 ou +212612345678).'
    )]
    public string $telephone = '';

    // ─── Étape 2 : Informations conducteur ───────────────────────────────────

    #[Assert\NotBlank(message: 'La date de naissance est obligatoire.')]
    #[Assert\Date(message: 'Format de date invalide (YYYY-MM-DD).')]
    public string $dateNaissance = '';

    #[Assert\NotBlank(message: 'La date du permis est obligatoire.')]
    #[Assert\Date(message: 'Format de date invalide (YYYY-MM-DD).')]
    public string $datePermis = '';

    // ─── Étape 3 : Type d'assurance ──────────────────────────────────────────

    #[Assert\NotBlank(message: 'Le type d\'assurance est obligatoire.')]
    #[Assert\Choice(choices: ['auto', 'moto'], message: 'Type d\'assurance invalide.')]
    public string $typeAssurance = '';

    // ─── Étape 4 : Véhicule ───────────────────────────────────────────────────

    #[Assert\NotBlank(message: 'La marque du véhicule est obligatoire.')]
    public string $marqueVehicule = '';

    #[Assert\NotBlank(message: 'Le type de carburant est obligatoire.')]
    #[Assert\Choice(
        choices: ['essence', 'diesel', 'hybride', 'electrique', 'gpl'],
        message: 'Type de carburant invalide.'
    )]
    public string $typeCarburant = '';

    #[Assert\NotBlank(message: 'La date de mise en circulation est obligatoire.')]
    #[Assert\Date(message: 'Format de date invalide.')]
    public string $dateMiseEnCirculation = '';

    #[Assert\NotNull(message: 'Le nombre de places est obligatoire.')]
    #[Assert\Positive]
    #[Assert\LessThanOrEqual(9)]
    public ?int $nombrePlaces = null;

    #[Assert\NotNull(message: 'La valeur à neuf est obligatoire.')]
    #[Assert\Positive(message: 'La valeur à neuf doit être un montant positif.')]
    public ?float $valeurNeuf = null;

    #[Assert\NotNull(message: 'La valeur vénale est obligatoire.')]
    #[Assert\Positive(message: 'La valeur vénale doit être un montant positif.')]
    public ?float $valeurVenale = null;

    #[Assert\NotBlank(message: 'L\'immatriculation est obligatoire.')]
    #[Assert\Regex(
        pattern: '/^[A-Z0-9\-]{2,10}$/i',
        message: 'Format d\'immatriculation invalide.'
    )]
    public string $immatriculation = '';

    /** Uniquement si typeAssurance = 'auto' */
    public ?int $puissanceFiscale = null;

    /** Uniquement si typeAssurance = 'moto' */
    public ?int $cylindree = null;

    /** draft | submitted | confirmed */
    public string $statut = 'submitted';

    /** rc | tiers | tous */
    public ?string $offreChoisie = null;

    /** Prix annuel de l'offre choisie en DH */
    public ?float $prixOffre = null;

    /**
     * Construit un DTO depuis un tableau (corps JSON de la requête).
     */
    public static function fromArray(array $data): self
    {
        $dto = new self();
        $dto->nom                   = trim($data['nom'] ?? '');
        $dto->prenom                = trim($data['prenom'] ?? '');
        $dto->cityId                = isset($data['cityId']) ? (int) $data['cityId'] : null;
        $dto->telephone             = trim($data['telephone'] ?? '');
        $dto->dateNaissance         = $data['dateNaissance'] ?? '';
        $dto->datePermis            = $data['datePermis'] ?? '';
        $dto->typeAssurance         = strtolower(trim($data['typeAssurance'] ?? ''));
        $dto->marqueVehicule        = trim($data['marqueVehicule'] ?? '');
        $dto->typeCarburant         = strtolower(trim($data['typeCarburant'] ?? ''));
        $dto->dateMiseEnCirculation = $data['dateMiseEnCirculation'] ?? '';
        $dto->nombrePlaces          = isset($data['nombrePlaces']) ? (int) $data['nombrePlaces'] : null;
        $dto->valeurNeuf            = isset($data['valeurNeuf']) ? (float) $data['valeurNeuf'] : null;
        $dto->valeurVenale          = isset($data['valeurVenale']) ? (float) $data['valeurVenale'] : null;
        $dto->immatriculation       = strtoupper(trim($data['immatriculation'] ?? ''));
        $dto->puissanceFiscale      = isset($data['puissanceFiscale']) ? (int) $data['puissanceFiscale'] : null;
        $dto->cylindree             = isset($data['cylindree']) ? (int) $data['cylindree'] : null;
        $dto->statut                = $data['statut'] ?? 'submitted';
        $dto->offreChoisie          = $data['offreChoisie'] ?? null;
        $dto->prixOffre             = isset($data['prixOffre']) ? (float) $data['prixOffre'] : null;

        return $dto;
    }
}