import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() email!: string;
  @IsOptional() @IsPhoneNumber('IN') phone?: string;
  @IsString() @MinLength(6) password!: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() locale?: 'en'|'hi';
  @IsOptional() @IsString() role?: 'USER'|'ADMIN';
}
export class LoginDto {
  @IsString() emailOrPhone!: string;
  @IsString() password!: string;
}
