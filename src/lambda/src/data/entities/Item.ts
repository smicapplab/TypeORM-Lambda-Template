import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("bank_information")
export class Item {
  @PrimaryGeneratedColumn({ name: "bd_id" })
  id!: number;

  @Column({ name: "bi_legacy_name" })
  name!: string;

  @Column({ name: "bi_legacy_description", type: "text", nullable: true })
  description?: string;
}