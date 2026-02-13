// ==================== PARKING LOT DTOs ====================

export interface ParkingLotResponseDto {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    available: number;
    total: number;
    price: number;
    rating: number;
    distance: number;
    etaMinutes: number;
    tags: string[];
    isFavorite: boolean;
}

export class CreateParkingLotDto {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    total_spaces: number;
    price: number;
}

export class UpdateParkingLotDto {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    total_spaces?: number;
    available_spaces?: number;
    price?: number;
    rating?: number;
    is_active?: boolean;
}

// ==================== PARKING SPACE DTOs ====================

export interface ParkingSpaceResponseDto {
    id: string;
    number: string;
    status: "available" | "reserved" | "occupied";
    floor: number;
    type: string;
}

export class CreateParkingSpaceDto {
    code: string;
    type: string;
    floor: number;
    lot_id: string;
}