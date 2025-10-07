import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/schemas/user.schema';

export class ProfileResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'User ID'
  })
  _id: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address of the user'
  })
  email: string;

  @ApiProperty({
    example: 'Servant',
    enum: UserRole,
    description: 'Role of the user'
  })
  role: UserRole;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Account creation date'
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Account last update date'
  })
  updatedAt: Date;
}