import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Demo in-memory users — replace with real DB
const users = [
  { id: '1', username: 'admin', passwordHash: bcrypt.hashSync('adminpass', 10), roles: ['Admin'] },
  { id: '2', username: 'lead', passwordHash: bcrypt.hashSync('leadpass', 10), roles: ['TeamLead'] },
  { id: '3', username: 'agent', passwordHash: bcrypt.hashSync('agentpass', 10), roles: ['Agent'] },
];

@Injectable()
export class UsersService {
  async findByUsername(username: string) {
    return users.find(u => u.username === username);
  }

  async findById(id: string) {
    return users.find(u => u.id === id);
  }
}
