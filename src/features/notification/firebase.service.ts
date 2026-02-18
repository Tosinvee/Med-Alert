import { Injectable, Logger } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class FirebaseService {
  // private static firebaseApp: firebaseAdmin.app.App;
  // private readonly logger = new Logger(FirebaseService.name);
  // constructor(private prisma: PrismaService) {
  //   if (!FirebaseService.firebaseApp) {
  //     FirebaseService.firebaseApp = firebaseAdmin.initializeApp({
  //       credential: firebaseAdmin.credential.cert({
  //         projectId: process.env.FIREBASE_PROJECT_ID,
  //         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  //         privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(
  //           /\\n/g,
  //           '\n',
  //         ),
  //       } as firebaseAdmin.ServiceAccount),
  //     });
  //     this.logger.log('Firebase initialized');
  //   }
  // }
  // async sendToUser(
  //   userId: number,
  //   payload: {
  //     notification?: { title: string; body: string };
  //     data?: Record<string, string>;
  //   },
  // ) {
  //   const tokens = await this.prisma.deviceToken.findMany({
  //     where: { userId },
  //   });
  //   if (!tokens.length) {
  //     this.logger.warn(`⚠️ No FCM tokens for user ${userId}`);
  //     return;
  //   }
  //   const res = await firebaseAdmin.messaging().sendEachForMulticast({
  //     tokens: tokens.map((t) => t.token),
  //     notification: payload.notification,
  //     data: payload.data,
  //   });
  //   this.logger.log(
  //     `📨 Sent FCM to user ${userId}: ${res.successCount} success, ${res.failureCount} failed`,
  //   );
  // }
}
