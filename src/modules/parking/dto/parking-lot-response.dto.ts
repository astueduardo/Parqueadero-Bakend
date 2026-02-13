export class ParkingLotResponseDto {
  id: string;
  name: string;
  address: string;
  available: number;
  total: number;
  price: number;
  rating: number;
  isFavorite: boolean;
  tags: string[];
}
