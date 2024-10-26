import { Role } from '../entities/role.enum';

export interface JwtClaims {
  email: string;
  id: string;
  roles: Role[];
}
