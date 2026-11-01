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
import {
  CreateStageTypeDto,
  StageTypeResponseDto,
  UpdateStageTypeDto
} from './dto/stage-type.dto';
import { StageTypeService } from './stage-type.service';
@ApiTags('stage-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stage-types')
export class StageTypeController {
  constructor(private readonly service: StageTypeService) {}
  @Get()
  @ApiOperation({ summary: 'List system and personal stage types' })
  @ApiOkResponse({ type: [StageTypeResponseDto] })
  list(@Req() req: AuthenticatedRequest): Promise<StageTypeResponseDto[]> {
    return this.service.list(req.user.sub);
  }
  @Post()
  @ApiOperation({ summary: 'Create a personal stage type' })
  @ApiCreatedResponse({ type: StageTypeResponseDto })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateStageTypeDto
  ): Promise<StageTypeResponseDto> {
    return this.service.create(req.user.sub, body);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a personal stage type' })
  @ApiOkResponse({ type: StageTypeResponseDto })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateStageTypeDto
  ): Promise<StageTypeResponseDto> {
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
