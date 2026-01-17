import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class AuthLoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        // Extract user info (Passport attaches decoded JWT payload to req.user)
        const user = request.user;
        const method = request.method;
        const url = request.url;

        console.log(`[Auth Log] User: ${user?.username || 'Anonymus'} | Method: ${method} | URL: ${url}`);

        return next.handle().pipe(
            tap(() => {
                console.log(
                    `[Auth Log] Response sent for ${method} ${url} by ${user?.username || 'Anonymous'}`
                );
            })
        )
    }
}