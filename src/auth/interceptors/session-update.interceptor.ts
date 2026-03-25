import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionUpdateInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si l'utilisateur est authentifié et possède une sessionId
    if (user && user.sessionId) {
      // Mettre à jour lastActive en arrière-plan sans attendre la réponse
      this.prisma.userSession.update({
        where: { id: user.sessionId },
        data: { lastActive: new Date() },
      }).catch(err => {
        // Optionnel : logger l'erreur mais ne pas bloquer la requête principale
        console.error('Session update error:', err.message);
      });
    }

    return next.handle();
  }
}
