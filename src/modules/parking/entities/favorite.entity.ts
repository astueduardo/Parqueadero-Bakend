import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ParkingLot } from './parking-Lot.entity';

@Entity('favorites')
@Unique('uq_fav_user_parking', ['user_id', 'parking_lot_id'])
export class Favorite {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column('uuid')
    user_id: string;

    @ManyToOne(() => ParkingLot, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parking_lot_id' })
    parkingLot: ParkingLot;

    @Column('uuid')
    parking_lot_id: string;

    @CreateDateColumn()
    created_at: Date;
}
