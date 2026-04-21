<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration initiale — Création des tables city, vehicle_brand et quote.
 */
final class Version20240101000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Création initiale du schéma de base de données pour le module devis assurance.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            CREATE TABLE city (
                id          INT AUTO_INCREMENT NOT NULL,
                nom         VARCHAR(100) NOT NULL,
                code_postal VARCHAR(10)  NOT NULL,
                region      VARCHAR(100) NOT NULL,
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TABLE vehicle_brand (
                id             INT AUTO_INCREMENT NOT NULL,
                nom            VARCHAR(100) NOT NULL,
                type_vehicule  VARCHAR(10)  NOT NULL COMMENT '"auto" ou "moto"',
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TABLE quote (
                id                      BIGINT AUTO_INCREMENT NOT NULL,
                city_id                 INT NOT NULL,
                nom                     VARCHAR(100) NOT NULL,
                prenom                  VARCHAR(100) NOT NULL,
                telephone               VARCHAR(20)  NOT NULL,
                date_naissance          DATE         NOT NULL,
                date_permis             DATE         NOT NULL,
                type_assurance          VARCHAR(10)  NOT NULL COMMENT '"auto" ou "moto"',
                marque_vehicule         VARCHAR(100) NOT NULL,
                type_carburant          VARCHAR(50)  NOT NULL,
                date_mise_en_circulation DATE        NOT NULL,
                nombre_places           INT          NOT NULL,
                valeur_neuf             DECIMAL(12,2) NOT NULL,
                valeur_venale           DECIMAL(12,2) NOT NULL,
                immatriculation         VARCHAR(20)  NOT NULL,
                puissance_fiscale       INT          DEFAULT NULL COMMENT 'Auto uniquement',
                cylindree               INT          DEFAULT NULL COMMENT 'Moto uniquement',
                statut                  VARCHAR(20)  NOT NULL DEFAULT 'draft',
                created_at              DATETIME     NOT NULL,
                updated_at              DATETIME     NOT NULL,
                INDEX IDX_CITY (city_id),
                INDEX IDX_STATUT (statut),
                INDEX IDX_TYPE_ASSURANCE (type_assurance),
                PRIMARY KEY(id),
                CONSTRAINT FK_QUOTE_CITY FOREIGN KEY (city_id) REFERENCES city (id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE quote DROP FOREIGN KEY FK_QUOTE_CITY');
        $this->addSql('DROP TABLE quote');
        $this->addSql('DROP TABLE vehicle_brand');
        $this->addSql('DROP TABLE city');
    }
}
