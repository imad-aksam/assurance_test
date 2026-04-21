<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'city')]
class City
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $nom = '';

    #[ORM\Column(length: 10)]
    private string $codePostal = '';

    #[ORM\Column(length: 100)]
    private string $region = '';

    public function getId(): ?int { return $this->id; }
    public function getNom(): string { return $this->nom; }
    public function setNom(string $nom): self { $this->nom = $nom; return $this; }
    public function getCodePostal(): string { return $this->codePostal; }
    public function setCodePostal(string $cp): self { $this->codePostal = $cp; return $this; }
    public function getRegion(): string { return $this->region; }
    public function setRegion(string $r): self { $this->region = $r; return $this; }

    public function toArray(): array
    {
        return [
            'id'         => $this->id,
            'nom'        => $this->nom,
            'codePostal' => $this->codePostal,
            'region'     => $this->region,
        ];
    }
}
