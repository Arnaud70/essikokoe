import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
} from '@nestjs/swagger';
import { MagasinsService } from '../services/magasins.service';
import { CreateMagasinDto, UpdateMagasinDto, MagasinResponseDto } from '../dtos/magasin.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('Magasins')
@Controller('magasins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MagasinsController {
    constructor(private readonly magasinsService: MagasinsService) { }

    @Post()
    @Roles('SUPERADMIN')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Créer un nouveau magasin' })
    @ApiResponse({ status: 201, type: MagasinResponseDto })
    async create(@Body() dto: CreateMagasinDto) {
        return this.magasinsService.createMagasin(dto);
    }

    @Get()
    @Roles('SUPERADMIN', 'GERANT')
    @ApiOperation({ summary: 'Lister tous les magasins' })
    @ApiResponse({ status: 200, type: [MagasinResponseDto] })
    async findAll() {
        return this.magasinsService.getAllMagasins();
    }

    @Get(':id')
    @Roles('SUPERADMIN', 'GERANT')
    @ApiOperation({ summary: 'Récupérer un magasin par son ID' })
    @ApiResponse({ status: 200, type: MagasinResponseDto })
    async findOne(@Param('id') id: string) {
        return this.magasinsService.getMagasinById(id);
    }

    @Patch(':id')
    @Roles('SUPERADMIN')
    @ApiOperation({ summary: 'Modifier un magasin' })
    @ApiResponse({ status: 200, type: MagasinResponseDto })
    async update(@Param('id') id: string, @Body() dto: UpdateMagasinDto) {
        return this.magasinsService.updateMagasin(id, dto);
    }

    @Delete(':id')
    @Roles('SUPERADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Supprimer un magasin' })
    @ApiResponse({ status: 204, description: 'Magasin supprimé' })
    async remove(@Param('id') id: string) {
        return this.magasinsService.deleteMagasin(id);
    }
}
