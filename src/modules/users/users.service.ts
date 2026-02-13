import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOne(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async create(userData: Partial<User>): Promise<User> {
        // NOTA: El hashing de password es responsabilidad de AuthService
        // Este servicio solo recibe contraseñas ya hasheadas o nulas
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        // NOTA: El hashing de password es responsabilidad de AuthService
        // Este servicio solo recibe contraseñas ya hasheadas
        await this.usersRepository.update(id, data);
        return this.findOne(id) as Promise<User>;
    }

    async remove(id: string): Promise<void> {
        await this.usersRepository.delete(id);
    }
}