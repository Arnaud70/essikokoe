import { Injectable, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor(private reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		// Check if route is public
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		// Check required roles
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		// Call parent authenticate
		return super.canActivate(context);
	}

	handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
		// If error or no user, throw unauthorized
		if (err || !user) {
			throw err || new UnauthorizedException('Invalid or missing JWT token');
		}

		// Check roles if required
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (requiredRoles && requiredRoles.length > 0) {
			if (!user.role || !requiredRoles.includes(user.role.toUpperCase())) {
				throw new ForbiddenException(
					`User role ${user.role} is not authorized. Required: ${requiredRoles.join(', ')}`,
				);
			}
		}

		return user;
	}
}
