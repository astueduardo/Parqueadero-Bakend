import { Controller, Get } from '@nestjs/common';
import { ParkingSpacesService } from '../parking-spaces/parking-space.services';
import { ParkingLotsService } from '../parking-lots/parking.lots.service';
@Controller('parking-lots')
export class ParkingLotsController {
    constructor(private readonly service: ParkingLotsService) { }

    @Get()
    async getAll() {
        return this.service.findAll();
    }
}
