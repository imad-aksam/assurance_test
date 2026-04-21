<?php

namespace App\DataFixtures;

use App\Entity\City;
use App\Entity\Quote;
use App\Entity\VehicleBrand;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

/**
 * Données de démonstration pour le développement.
 * Commande : php bin/console doctrine:fixtures:load
 */
class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // ── Villes marocaines ──────────────────────────────────────────────────
        $citiesData = [
            ['Casablanca', '20000', 'Grand Casablanca-Settat'],
            ['Rabat',      '10000', 'Rabat-Salé-Kénitra'],
            ['Marrakech',  '40000', 'Marrakech-Safi'],
            ['Fès',        '30000', 'Fès-Meknès'],
            ['Tanger',     '90000', 'Tanger-Tétouan-Al Hoceïma'],
            ['Agadir',     '80000', 'Souss-Massa'],
            ['Meknès',     '50000', 'Fès-Meknès'],
            ['Oujda',      '60000', 'Oriental'],
            ['Salé',       '11000', 'Rabat-Salé-Kénitra'],
            ['Kenitra',    '14000', 'Rabat-Salé-Kénitra'],
            ['Témara',     '12000', 'Rabat-Salé-Kénitra'],
            ['El Jadida',  '24000', 'Casablanca-Settat'],
            ['Tétouan',    '93000', 'Tanger-Tétouan-Al Hoceïma'],
            ['Safi',       '46000', 'Marrakech-Safi'],
            ['Nador',      '62000', 'Oriental'],
        ];

        $cities = [];
        foreach ($citiesData as [$nom, $cp, $region]) {
            $city = (new City())->setNom($nom)->setCodePostal($cp)->setRegion($region);
            $manager->persist($city);
            $cities[] = $city;
        }

        // ── Marques automobiles ────────────────────────────────────────────────
        $autoBrands = ['Renault', 'Peugeot', 'Citroën', 'Volkswagen', 'Toyota',
                       'Hyundai', 'Dacia', 'Ford', 'BMW', 'Mercedes-Benz',
                       'Audi', 'Fiat', 'Honda', 'Nissan', 'Kia'];

        foreach ($autoBrands as $nom) {
            $brand = (new VehicleBrand())->setNom($nom)->setTypeVehicule('auto');
            $manager->persist($brand);
        }

        // ── Marques motos ──────────────────────────────────────────────────────
        $motoBrands = ['Yamaha', 'Honda', 'Kawasaki', 'Suzuki', 'BMW Motorrad',
                       'Ducati', 'Harley-Davidson', 'KTM', 'Triumph', 'Aprilia'];

        foreach ($motoBrands as $nom) {
            $brand = (new VehicleBrand())->setNom($nom)->setTypeVehicule('moto');
            $manager->persist($brand);
        }

        $manager->flush();

        // ── Devis de démonstration ─────────────────────────────────────────────
        $sampleQuote = (new Quote())
            ->setNom('Benali')
            ->setPrenom('Mohammed')
            ->setCity($cities[0]) // Casablanca
            ->setTelephone('0612345678')
            ->setDateNaissance(new \DateTime('1990-05-15'))
            ->setDatePermis(new \DateTime('2010-06-01'))
            ->setTypeAssurance(Quote::TYPE_AUTO)
            ->setMarqueVehicule('Renault')
            ->setTypeCarburant('diesel')
            ->setDateMiseEnCirculation(new \DateTime('2018-03-01'))
            ->setNombrePlaces(5)
            ->setValeurNeuf('180000')
            ->setValeurVenale('120000')
            ->setImmatriculation('12345A')
            ->setPuissanceFiscale(8)
            ->setStatut(Quote::STATUS_CONFIRMED);

        $manager->persist($sampleQuote);

        $sampleMoto = (new Quote())
            ->setNom('El Amrani')
            ->setPrenom('Youssef')
            ->setCity($cities[1]) // Rabat
            ->setTelephone('0661234567')
            ->setDateNaissance(new \DateTime('1995-08-22'))
            ->setDatePermis(new \DateTime('2013-09-15'))
            ->setTypeAssurance(Quote::TYPE_MOTO)
            ->setMarqueVehicule('Yamaha')
            ->setTypeCarburant('essence')
            ->setDateMiseEnCirculation(new \DateTime('2020-01-10'))
            ->setNombrePlaces(2)
            ->setValeurNeuf('45000')
            ->setValeurVenale('38000')
            ->setImmatriculation('7654B')
            ->setCylindree(650)
            ->setStatut(Quote::STATUS_SUBMITTED);

        $manager->persist($sampleMoto);
        $manager->flush();
    }
}
