import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    
    console.log('RolesGuard - Required Roles:', requiredRoles);
    console.log('RolesGuard - User:', user);
    console.log('RolesGuard - User Role:', user?.role);
    
    if (!user || !user.role) {
      console.log('RolesGuard - FAIL: No user or user.role');
      return false;
    }
    const hasRole = requiredRoles.includes(user.role.toUpperCase());
    console.log('RolesGuard - Has Required Role:', hasRole);
    return hasRole;
  }
}
