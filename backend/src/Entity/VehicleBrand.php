<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'vehicle_brand')]
class VehicleBrand
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $nom = '';

    /** 'auto' ou 'moto' */
    #[ORM\Column(length: 10)]
    private string $typeVehicule = '';

    public function getId(): ?int { return $this->id; }
    public function getNom(): string { return $this->nom; }
    public function setNom(string $nom): self { $this->nom = $nom; return $this; }
    public function getTypeVehicule(): string { return $this->typeVehicule; }
    public function setTypeVehicule(string $t): self { $this->typeVehicule = $t; return $this; }

    public function toArray(): array
    {
        return ['id' => $this->id, 'nom' => $this->nom, 'typeVehicule' => $this->typeVehicule];
    }
}
