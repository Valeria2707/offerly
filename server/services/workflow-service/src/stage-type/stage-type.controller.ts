import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '@offerly/auth';
import { CreateStageTypeDto, UpdateStageTypeDto } from './dto/stage-type.dto';
import { StageTypeService } from './stage-type.service';
import { StageType } from './entities/stage-type.entity';
@ApiTags('stage-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stage-types')
export class StageTypeController {
  constructor(readonly service: StageTypeService) {}
  @Get()
  @ApiOperation({ summary: 'List system and personal stage types' })
  @ApiOkResponse({ type: [StageType] })
  list(@Req() req: AuthenticatedRequest): Promise<StageType[]> {
    return this.service.list(req.user.sub);
  }
  @Post()
  @ApiOperation({ summary: 'Create a personal stage type' })
  @ApiCreatedResponse({ type: StageType })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateStageTypeDto
  ): Promise<StageType> {
    return this.service.create(req.user.sub, body);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a personal stage type' })
  @ApiOkResponse({ type: StageType })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateStageTypeDto
  ): Promise<StageType> {
    return this.service.update(req.user.sub, id, body);
  }
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Deactivate a personal stage type' })
  @ApiNoContentResponse()
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    return this.service.remove(req.user.sub, id);
  }
}
