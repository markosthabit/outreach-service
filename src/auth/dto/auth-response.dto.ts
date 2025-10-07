import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT access token',
    })
    access_token: string;

    @ApiProperty({
        example: 'John Doe',
        description: 'User role (Admin or Servant)',
    })
    role: 'Admin' | 'Servant';
}

export class RegisterResponseDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'The ID of the created user',
    })
    id: string;

    @ApiProperty({
        example: 'john@example.com',
        description: 'The email of the created user',
    })
    email: string;

    @ApiProperty({
        example: 'Servant',
        description: 'The role of the created user',
    })
    role: string;
}