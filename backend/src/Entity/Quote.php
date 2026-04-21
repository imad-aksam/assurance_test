<?php

namespace App\Entity;

use App\Repository\QuoteRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: QuoteRepository::class)]
#[ORM\Table(name: 'quote')]
#[ORM\HasLifecycleCallbacks]
class Quote
{
    public const STATUS_DRAFT     = 'draft';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_CONFIRMED = 'confirmed';

    public const TYPE_AUTO = 'auto';
    public const TYPE_MOTO = 'moto';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'bigint')]
    private ?int $id = null;

    // ─── Informations personnelles ────────────────────────────────────────────

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Assert\Length(max: 100)]
    private string $nom = '';

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le prénom est obligatoire.')]
    #[Assert\Length(max: 100)]
    private string $prenom = '';

    #[ORM\ManyToOne(targetEntity: City::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotNull(message: 'La ville est obligatoire.')]
    private ?City $city = null;

    #[ORM\Column(length: 20)]
    #[Assert\NotBlank(message: 'Le téléphone est obligatoire.')]
    #[Assert\Regex(
        pattern: '/^(\+212|0)([ \-]?[0-9]){9}$/',
        message: 'Le format du numéro de téléphone est invalide.'
    )]
    private string $telephone = '';

    // ─── Informations conducteur ──────────────────────────────────────────────

    #[ORM\Column(type: 'date')]
    #[Assert\NotNull(message: 'La date de naissance est obligatoire.')]
    #[Assert\LessThan('-18 years', message: 'Le conducteur doit avoir au moins 18 ans.')]
    private ?\DateTimeInterface $dateNaissance = null;

    #[ORM\Column(type: 'date')]
    #[Assert\NotNull(message: 'La date d\'obtention du permis est obligatoire.')]
    #[Assert\LessThanOrEqual('today', message: 'La date du permis ne peut pas être dans le futur.')]
    private ?\DateTimeInterface $datePermis = null;

    // ─── Type d'assurance ─────────────────────────────────────────────────────

    #[ORM\Column(length: 10)]
    #[Assert\NotBlank(message: 'Le type d\'assurance est obligatoire.')]
    #[Assert\Choice(
        choices: [self::TYPE_AUTO, self::TYPE_MOTO],
        message: 'Le type d\'assurance doit être "auto" ou "moto".'
    )]
    private string $typeAssurance = '';

    // ─── Informations véhicule ────────────────────────────────────────────────

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'La marque du véhicule est obligatoire.')]
    private string $marqueVehicule = '';

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank(message: 'Le type de carburant est obligatoire.')]
    private string $typeCarburant = '';

    #[ORM\Column(type: 'date')]
    #[Assert\NotNull(message: 'La date de mise en circulation est obligatoire.')]
    #[Assert\LessThanOrEqual('today', message: 'La date de mise en circulation ne peut pas être dans le futur.')]
    private ?\DateTimeInterface $dateMiseEnCirculation = null;

    #[ORM\Column(type: 'integer')]
    #[Assert\NotNull(message: 'Le nombre de places est obligatoire.')]
    #[Assert\Positive(message: 'Le nombre de places doit être positif.')]
    #[Assert\LessThanOrEqual(9, message: 'Le nombre de places ne peut pas dépasser 9.')]
    private ?int $nombrePlaces = null;

    #[ORM\Column(type: 'decimal', precision: 12, scale: 2)]
    #[Assert\NotNull(message: 'La valeur à neuf est obligatoire.')]
    #[Assert\Positive(message: 'La valeur à neuf doit être positive.')]
    private ?string $valeurNeuf = null;

    #[ORM\Column(type: 'decimal', precision: 12, scale: 2)]
    #[Assert\NotNull(message: 'La valeur vénale est obligatoire.')]
    #[Assert\Positive(message: 'La valeur vénale doit être positive.')]
    private ?string $valeurVenale = null;

    #[ORM\Column(length: 20)]
    #[Assert\NotBlank(message: 'L\'immatriculation est obligatoire.')]
    #[Assert\Regex(
        pattern: '/^[A-Z0-9\-]{2,10}$/i',
        message: 'Le format de l\'immatriculation est invalide.'
    )]
    private string $immatriculation = '';

    // ─── Champs conditionnels ─────────────────────────────────────────────────

    /** Uniquement pour Auto */
    #[ORM\Column(type: 'integer', nullable: true)]
    #[Assert\Positive(message: 'La puissance fiscale doit être positive.')]
    private ?int $puissanceFiscale = null;

    /** Uniquement pour Moto */
    #[ORM\Column(type: 'integer', nullable: true)]
    #[Assert\Positive(message: 'La cylindrée doit être positive.')]
    private ?int $cylindree = null;

    // ─── Statut ───────────────────────────────────────────────────────────────

    #[ORM\Column(length: 20)]
    private string $statut = self::STATUS_DRAFT;

    // ─── Timestamps ───────────────────────────────────────────────────────────

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $createdAt;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $updatedAt;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTime();
    }

    // ─── Getters / Setters ────────────────────────────────────────────────────

    public function getId(): ?int { return $this->id; }

    public function getNom(): string { return $this->nom; }
    public function setNom(string $nom): self { $this->nom = $nom; return $this; }

    public function getPrenom(): string { return $this->prenom; }
    public function setPrenom(string $prenom): self { $this->prenom = $prenom; return $this; }

    public function getCity(): ?City { return $this->city; }
    public function setCity(?City $city): self { $this->city = $city; return $this; }

    public function getTelephone(): string { return $this->telephone; }
    public function setTelephone(string $telephone): self { $this->telephone = $telephone; return $this; }

    public function getDateNaissance(): ?\DateTimeInterface { return $this->dateNaissance; }
    public function setDateNaissance(?\DateTimeInterface $d): self { $this->dateNaissance = $d; return $this; }

    public function getDatePermis(): ?\DateTimeInterface { return $this->datePermis; }
    public function setDatePermis(?\DateTimeInterface $d): self { $this->datePermis = $d; return $this; }

    public function getTypeAssurance(): string { return $this->typeAssurance; }
    public function setTypeAssurance(string $type): self { $this->typeAssurance = $type; return $this; }

    public function getMarqueVehicule(): string { return $this->marqueVehicule; }
    public function setMarqueVehicule(string $m): self { $this->marqueVehicule = $m; return $this; }

    public function getTypeCarburant(): string { return $this->typeCarburant; }
    public function setTypeCarburant(string $t): self { $this->typeCarburant = $t; return $this; }

    public function getDateMiseEnCirculation(): ?\DateTimeInterface { return $this->dateMiseEnCirculation; }
    public function setDateMiseEnCirculation(?\DateTimeInterface $d): self { $this->dateMiseEnCirculation = $d; return $this; }

    public function getNombrePlaces(): ?int { return $this->nombrePlaces; }
    public function setNombrePlaces(?int $n): self { $this->nombrePlaces = $n; return $this; }

    public function getValeurNeuf(): ?string { return $this->valeurNeuf; }
    public function setValeurNeuf(?string $v): self { $this->valeurNeuf = $v; return $this; }

    public function getValeurVenale(): ?string { return $this->valeurVenale; }
    public function setValeurVenale(?string $v): self { $this->valeurVenale = $v; return $this; }

    public function getImmatriculation(): string { return $this->immatriculation; }
    public function setImmatriculation(string $i): self { $this->immatriculation = $i; return $this; }

    public function getPuissanceFiscale(): ?int { return $this->puissanceFiscale; }
    public function setPuissanceFiscale(?int $p): self { $this->puissanceFiscale = $p; return $this; }

    public function getCylindree(): ?int { return $this->cylindree; }
    public function setCylindree(?int $c): self { $this->cylindree = $c; return $this; }

    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $statut): self { $this->statut = $statut; return $this; }

    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeInterface { return $this->updatedAt; }

    /** Sérialisation JSON pour l'API */
    public function toArray(): array
    {
        return [
            'id'                    => $this->id,
            'nom'                   => $this->nom,
            'prenom'                => $this->prenom,
            'cityId'                => $this->city?->getId(),
            'cityNom'               => $this->city?->getNom(),
            'telephone'             => $this->telephone,
            'dateNaissance'         => $this->dateNaissance?->format('Y-m-d'),
            'datePermis'            => $this->datePermis?->format('Y-m-d'),
            'typeAssurance'         => $this->typeAssurance,
            'marqueVehicule'        => $this->marqueVehicule,
            'typeCarburant'         => $this->typeCarburant,
            'dateMiseEnCirculation' => $this->dateMiseEnCirculation?->format('Y-m-d'),
            'nombrePlaces'          => $this->nombrePlaces,
            'valeurNeuf'            => $this->valeurNeuf,
            'valeurVenale'          => $this->valeurVenale,
            'immatriculation'       => $this->immatriculation,
            'puissanceFiscale'      => $this->puissanceFiscale,
            'cylindree'             => $this->cylindree,
            'statut'                => $this->statut,
            'createdAt'             => $this->createdAt->format('Y-m-d H:i:s'),
            'updatedAt'             => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
