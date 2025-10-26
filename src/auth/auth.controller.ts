import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.usersService.findByUsername(body.username);
    if (!user) return { error: 'Invalid username/password' };

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) return { error: 'Invalid username/password' };

    const token = await this.authService.signPayload({
      sub: user.id,
      username: user.username,
      roles: user.roles,
    });

    return { access_token: token };
  }
}
