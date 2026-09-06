import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '@offerly/auth';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import {
  ApplyVacancyImportDto,
  ImportVacancyTextDto,
  ImportVacancyUrlDto,
  UpdateVacancyDto,
  VacancyImportResponseDto,
  VacancyResponseDto
} from './dto/vacancy.dto';
import { VacancyService } from './vacancy.service';

@ApiTags('vacancies')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token is missing, invalid, or expired'
})
@UseGuards(JwtAuthGuard)
@Controller('vacancies')
export class VacancyController {
  constructor(private readonly vacancies: VacancyService) {}
  @Get()
  @ApiOperation({ summary: 'List vacancies owned by the authenticated user' })
  @ApiOkResponse({ type: [VacancyResponseDto] })
  list(@Req() request: AuthenticatedRequest): Promise<VacancyResponseDto[]> {
    return this.vacancies.list(request.user.sub);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get one vacancy' })
  @ApiOkResponse({ type: VacancyResponseDto })
  @ApiNotFoundResponse({ description: 'Vacancy not found' })
  get(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<VacancyResponseDto> {
    return this.vacancies.get(request.user.sub, id);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a vacancy' })
  @ApiOkResponse({ type: VacancyResponseDto })
  @ApiNotFoundResponse({ description: 'Vacancy not found' })
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: UpdateVacancyDto
  ): Promise<VacancyResponseDto> {
    return this.vacancies.update(request.user.sub, id, input);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a vacancy' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Vacancy not found' })
  delete(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    return this.vacancies.delete(request.user.sub, id);
  }
  @Post('imports/url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Load a vacancy page and create an AI-extracted review draft'
  })
  @ApiOkResponse({ type: VacancyImportResponseDto })
  @ApiBadRequestResponse({
    description: 'URL is invalid, private, non-HTML, or too large'
  })
  @ApiUnprocessableEntityResponse({
    description: 'Page could not be loaded or parsed'
  })
  @ApiServiceUnavailableResponse({
    description: 'AI provider is unavailable or not configured'
  })
  importUrl(
    @Req() request: AuthenticatedRequest,
    @Body() input: ImportVacancyUrlDto
  ): Promise<VacancyImportResponseDto> {
    return this.vacancies.importUrl(request.user.sub, input);
  }
  @Post('imports/text')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create an AI-extracted review draft from pasted vacancy text'
  })
  @ApiOkResponse({ type: VacancyImportResponseDto })
  @ApiBadRequestResponse({
    description: 'Text is too short or exceeds the processing limit'
  })
  @ApiUnprocessableEntityResponse({
    description: 'Structured vacancy data could not be extracted'
  })
  @ApiServiceUnavailableResponse({
    description: 'AI provider is unavailable or not configured'
  })
  importText(
    @Req() request: AuthenticatedRequest,
    @Body() input: ImportVacancyTextDto
  ): Promise<VacancyImportResponseDto> {
    return this.vacancies.importText(request.user.sub, input);
  }
  @Get('imports/:id')
  @ApiOperation({ summary: 'Get an imported vacancy draft' })
  @ApiOkResponse({ type: VacancyImportResponseDto })
  @ApiNotFoundResponse({ description: 'Vacancy import not found' })
  getImport(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<VacancyImportResponseDto> {
    return this.vacancies.getImport(request.user.sub, id);
  }
  @Post('imports/:id/apply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Create a vacancy from a reviewed and optionally edited import draft'
  })
  @ApiBody({
    required: false,
    type: ApplyVacancyImportDto,
    description: 'Omit the body to save the original AI draft unchanged'
  })
  @ApiCreatedResponse({ type: VacancyResponseDto })
  @ApiBadRequestResponse({ description: 'Import was already applied' })
  @ApiNotFoundResponse({ description: 'Vacancy import not found' })
  applyImport(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input?: ApplyVacancyImportDto
  ): Promise<VacancyResponseDto> {
    return this.vacancies.applyImport(request.user.sub, id, input);
  }
}
