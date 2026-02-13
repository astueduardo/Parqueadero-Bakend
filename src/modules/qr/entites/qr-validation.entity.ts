import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ScanType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
}

@Entity('qr_validations')
export class QrValidation {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reservation_id: string;

  @Column('uuid')
  operator_id: string;

  @CreateDateColumn()
  scan_time: Date;

  @Column({
    type: 'enum',
    enum: ScanType,
  })
  scan_type: ScanType;
}
