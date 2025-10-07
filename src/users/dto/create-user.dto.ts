import { IsString, IsEmail, IsNotEmpty, IsEnum, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        example: 'john@example.com',
        description: 'The email address of the user',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'Password123!',
        description: 'Password (min 8 chars, must contain number, uppercase, and special char)',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message:
                'Password must contain at least one uppercase letter, one number, and one special character',
        },
    )
    password: string;

    @ApiProperty({
        example: 'Servant',
        description: 'User role (Admin or Servant)',
        enum: ['Admin', 'Servant'],
        default: 'Servant',
    })
    @IsEnum(['Admin', 'Servant'])
    role: 'Admin' | 'Servant';
}
