import { Controller, Get } from '@nestjs/common';
import { ParkingLotsService } from './parking.lots.service';
import { Public } from '@/common/decorators/public.decorator';

@Controller('parking-lots')
export class ParkingLotsController {
    constructor(private readonly service: ParkingLotsService) { }

    // 🌍 PÚBLICO
    @Public()
    @Get()
    async getAll() {
        return this.service.findAll();
    }
}
