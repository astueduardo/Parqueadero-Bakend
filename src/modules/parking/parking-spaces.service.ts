import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { ParkingSpace } from "./entities/parking-space.entity";
import { Reservation, ReservationStatus } from "../reservations/entities/parking-reservatio.entity";

export type SpaceStatus = "available" | "reserved" | "occupied";

export interface ParkingSpaceWithStatus extends ParkingSpace {
    status: SpaceStatus;
}

export interface ParkingAvailability {
    lotId: string;
    totalSpaces: number;
    availableCount: number;
    reservedCount: number;
    occupiedCount: number;
    spaces: ParkingSpaceWithStatus[];
    lastUpdated: string;
}

@Injectable()
export class ParkingSpacesService {

    constructor(
        @InjectRepository(ParkingSpace)
        private readonly spaceRepo: Repository<ParkingSpace>,
        @InjectRepository(Reservation)
        private readonly reservationRepo: Repository<Reservation>,
    ) { }

    private async calculateSpaceStatuses(
        spaces: ParkingSpace[],
    ): Promise<ParkingSpaceWithStatus[]> {
        if (spaces.length === 0) return [];

        const spaceIds = spaces.map(s => s.id);
        const now = new Date();

        const activeReservations = await this.reservationRepo.find({
            where: {
                spaceId: In(spaceIds),
                status: In([
                    ReservationStatus.PENDING,
                    ReservationStatus.CONFIRMED,
                    ReservationStatus.IN_PROGRESS,
                ]),
            },
        });

        const statusMap = new Map<string, SpaceStatus>();

        for (const reservation of activeReservations) {
            const start = new Date(reservation.startTime);
            const end = new Date(reservation.endTime);

            if (now >= start && now <= end) {
                statusMap.set(reservation.spaceId, "occupied");
            } else if (now < start) {
                if (!statusMap.has(reservation.spaceId)) {
                    statusMap.set(reservation.spaceId, "reserved");
                }
            }
        }

        return spaces.map(space => ({
            ...space,
            status: statusMap.get(space.id) ?? "available",
        }));
    }

    async getSpacesByLot(lotId: string): Promise<ParkingSpaceWithStatus[]> {
        const spaces = await this.spaceRepo.find({
            where: { lotId, isActive: true },
            order: { floor: "ASC", code: "ASC" },
        });
        return this.calculateSpaceStatuses(spaces);
    }

    async getAvailability(lotId: string): Promise<ParkingAvailability> {
        const spacesWithStatus = await this.getSpacesByLot(lotId);

        const availableCount = spacesWithStatus.filter(s => s.status === "available").length;
        const reservedCount = spacesWithStatus.filter(s => s.status === "reserved").length;
        const occupiedCount = spacesWithStatus.filter(s => s.status === "occupied").length;

        return {
            lotId,
            totalSpaces: spacesWithStatus.length,
            availableCount,
            reservedCount,
            occupiedCount,
            spaces: spacesWithStatus,
            lastUpdated: new Date().toISOString(),
        };
    }

    async isSpaceAvailable(spaceId: string): Promise<boolean> {
        const space = await this.spaceRepo.findOne({ where: { id: spaceId } });
        if (!space || !space.isActive) return false;
        const [result] = await this.calculateSpaceStatuses([space]);
        return result.status === "available";
    }
    async getAllLotsAvailability(): Promise<{ lotId: string; availableCount: number }[]> {
        const now = new Date();
        const allSpaces = await this.spaceRepo.find({ where: { isActive: true } });
        if (allSpaces.length === 0) return [];

        const spaceIds = allSpaces.map(s => s.id);
        const activeReservations = await this.reservationRepo.find({
            where: {
                spaceId: In(spaceIds),
                status: In([
                    ReservationStatus.PENDING,
                    ReservationStatus.CONFIRMED,
                    ReservationStatus.IN_PROGRESS,
                ]),
            },
        });

        const statusMap = new Map<string, string>();
        for (const reservation of activeReservations) {
            const start = new Date(reservation.startTime);
            const end = new Date(reservation.endTime);
            if (now >= start && now <= end) {
                statusMap.set(reservation.spaceId, "occupied");
            } else if (now < start && !statusMap.has(reservation.spaceId)) {
                statusMap.set(reservation.spaceId, "reserved");
            }
        }

        const lotMap = new Map<string, number>();
        for (const space of allSpaces) {
            const status = statusMap.get(space.id) ?? "available";
            if (status === "available") {
                lotMap.set(space.lotId, (lotMap.get(space.lotId) ?? 0) + 1);
            }
        }

        return Array.from(lotMap.entries()).map(([lotId, availableCount]) => ({
            lotId,
            availableCount,
        }));
    }
}