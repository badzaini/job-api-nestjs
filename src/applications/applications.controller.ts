import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
// import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post(':jobId')
  create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Param('jobId') jobId: string,
  ) {
    return this.applicationsService.create(jobId, createApplicationDto);
  }

  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }

  @Get(':jobId/all')
  findAllApplicationsByJobId(@Param('jobId') jobId: string) {
    return this.applicationsService.findAllApplicationsByJobId(jobId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateApplicationDto: UpdateApplicationDto,
  // ) {
  //   return this.applicationsService.update(+id, updateApplicationDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(+id);
  }
}
