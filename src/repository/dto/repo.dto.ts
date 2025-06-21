import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";

export class RepoDto {

    @IsNumber()
    @ApiProperty() id: number;

    @IsString()
    @ApiProperty() name: string;

    @IsString()
    @ApiProperty() fullName: string;
    
    @IsString()
    @ApiProperty() htmlUrl: string;
    
    @IsString()
    @ApiProperty() description: string | null;
    
    @IsBoolean()
    @ApiProperty() fork: boolean;
    
    @IsDate()
    @ApiProperty() createdAt: Date;
    
    @IsDate()
    @ApiProperty() updatedAt: Date;
}