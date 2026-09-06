import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  candidateName: string;
  @IsEmail()
  @IsNotEmpty()
  candidateEmail: string;
  @IsString()
  @IsNotEmpty()
  coverLetter: string;
}
