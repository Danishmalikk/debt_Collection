import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async signPayload(payload: any) {
    return this.jwtService.sign(payload);
  }

  // simple verify - in real app use UsersService
  async validatePassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}
