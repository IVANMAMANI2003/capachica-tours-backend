/*
  Warnings:

  - You are about to drop the column `cantidad_personas` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `codigo_reserva` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `datos_pago` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_cancelacion` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_fin` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_inicio` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `hora` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `metodo_pago` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `moneda` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `motivo_cancelacion` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `notas` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `precio_total` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_reserva` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the `pago` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `turista` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `monto_total` to the `reservas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comprobantes" DROP CONSTRAINT "comprobantes_pago_id_fkey";

-- DropForeignKey
ALTER TABLE "pago" DROP CONSTRAINT "pago_reserva_id_fkey";

-- DropForeignKey
ALTER TABLE "pago_detalle" DROP CONSTRAINT "pago_detalle_pago_id_fkey";

-- DropForeignKey
ALTER TABLE "reservas" DROP CONSTRAINT "reservas_turista_id_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_persona_id_fkey";

-- DropIndex
DROP INDEX "reservas_codigo_reserva_key";

-- AlterTable
ALTER TABLE "reservas" DROP COLUMN "cantidad_personas",
DROP COLUMN "codigo_reserva",
DROP COLUMN "datos_pago",
DROP COLUMN "fecha_cancelacion",
DROP COLUMN "fecha_fin",
DROP COLUMN "fecha_inicio",
DROP COLUMN "hora",
DROP COLUMN "metodo_pago",
DROP COLUMN "moneda",
DROP COLUMN "motivo_cancelacion",
DROP COLUMN "notas",
DROP COLUMN "precio_total",
DROP COLUMN "tipo_reserva",
ADD COLUMN     "monto_total" DECIMAL(12,2) NOT NULL,
ALTER COLUMN "fecha_reserva" DROP DEFAULT;

-- DropTable
DROP TABLE "pago";

-- DropTable
DROP TABLE "turista";

-- CreateTable
CREATE TABLE "turistas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "reserva_id" INTEGER NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tours" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "guide_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TourToTurista" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TourToTurista_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "turistas_usuario_id_key" ON "turistas"("usuario_id");

-- CreateIndex
CREATE INDEX "_TourToTurista_B_index" ON "_TourToTurista"("B");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turistas" ADD CONSTRAINT "turistas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_turista_id_fkey" FOREIGN KEY ("turista_id") REFERENCES "turistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago_detalle" ADD CONSTRAINT "pago_detalle_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pagos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobantes" ADD CONSTRAINT "comprobantes_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pagos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tours" ADD CONSTRAINT "tours_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TourToTurista" ADD CONSTRAINT "_TourToTurista_A_fkey" FOREIGN KEY ("A") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TourToTurista" ADD CONSTRAINT "_TourToTurista_B_fkey" FOREIGN KEY ("B") REFERENCES "turistas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
