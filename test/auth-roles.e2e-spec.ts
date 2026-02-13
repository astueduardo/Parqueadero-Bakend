import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { UsersService } from '../src/modules/users/users.service';

describe('Auth & Roles (e2e)', () => {
    let app: INestApplication;
    let usersService: UsersService;

    const uid = Date.now();

    const admin = {
        name: 'Admin Test',
        email: `admin+${uid}@test.local`,
        password: 'password123',
        role: 'admin',
    };

    const gestor = {
        name: 'Gestor Test',
        email: `gestor+${uid}@test.local`,
        password: 'password123',
        role: 'gestor',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        await app.init();

        usersService = moduleFixture.get<UsersService>(UsersService);

        // Cleanup and seed
        const existing = await usersService.findByEmail(admin.email);
        if (!existing) await usersService.create(admin as any);

        const existingGestor = await usersService.findByEmail(gestor.email);
        if (!existingGestor) await usersService.create(gestor as any);
    });

    afterAll(async () => {
        await app.close();
    });

    it('Admin puede crear un usuario', async () => {
        const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
      .send({ email: admin.email, password: admin.password });

    console.log('DEBUG loginRes:', loginRes.status, loginRes.body);
    expect(loginRes.status).toBe(201);
    const token = loginRes.body.access_token;

        const newUser = { name: 'UserX', email: `userx+${uid}@test.local`, password: 'pass123' };

        const res = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)
        .expect(201);

        expect(res.body.email).toBe(newUser.email);
    });

    it('Admin puede asignar rol a un usuario', async () => {
        const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: admin.email, password: admin.password })
        .expect(201);
        const token = loginRes.body.access_token;

        const created = await usersService.create({ name: 'Tmp', email: `tmp+${uid}@test.local`, password: 'tmp123' } as any);

        const res = await request(app.getHttpServer())
        .patch(`/api/users/${created.id}/role`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'gestor' })
        .expect(200);

        expect(res.body.role).toBe('gestor');
    });

    it('Gestor puede actualizar usuario', async () => {
        const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: gestor.email, password: gestor.password })
        .expect(201);
        const token = loginRes.body.access_token;

        const target = await usersService.create({ name: 'ToUpdate', email: `toupdate+${uid}@test.local`, password: 'tt123' } as any);

        const res = await request(app.getHttpServer())
        .patch(`/api/users/${target.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated' })
        .expect(200);

        expect(res.body.name).toBe('Updated');
    });

    it('Gestor no puede eliminar usuarios (403)', async () => {
        const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: gestor.email, password: gestor.password })
        .expect(201);
        const token = loginRes.body.access_token;

        const target = await usersService.create({ name: 'ToDelete', email: `todelete+${uid}@test.local`, password: 'd123' } as any);

        await request(app.getHttpServer())
        .delete(`/api/users/${target.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('Admin puede eliminar usuarios', async () => {
        const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: admin.email, password: admin.password })
        .expect(201);
        const token = loginRes.body.access_token;

        const target = await usersService.create({ name: 'ToDelete2', email: `todelete2+${uid}@test.local`, password: 'd123' } as any);

        const res = await request(app.getHttpServer())
        .delete(`/api/users/${target.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

        expect(res.body.success).toBe(true);
    });
});
