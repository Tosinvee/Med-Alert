// import { Processor, WorkerHost } from '@nestjs/bullmq';
// import { FirebaseService } from '../../notification/firebase.service';
// import { PrismaService } from '../../prisma/prisma.service';

// @Processor('retry-dispatch')
// export class RetryDispatchProcessor extends WorkerHost {
//   constructor(
//     private prisma: PrismaService,
//     private notifications: FirebaseService,
//   ) {
//     super();
//   }

//   async process(job) {
//     const { emergencyId } = job.data;

//     const dispatch = await this.prisma.dispatch.findFirst({
//       where: { emergencyId, status: 'PENDING' },
//       include: { medic: { include: { user: true } } },
//     });

//     if (!dispatch) return;

//     await this.prisma.medic.update({
//       where: { id: dispatch.medicId },
//       data: { isAvailable: false },
//     });
//     const nextMedic = await this.prisma.medic.findFirst({
//       where: { isAvailable: true },
//       include: {
//         user: {
//           include: { deviceTokens: true },
//         },
//       },
//     });
//     if (!nextMedic) return;

//     const newDispatch = await this.prisma.dispatch.create({
//       data: {
//         emergencyId,
//         medicId: nextMedic.id,
//         status: 'PENDING',
//       },
//     });
//     //await this.ws.sendToUser(nextMedic.userId, 'newDispatch', newDispatch);
//     // await this.notifications.sendToUser(nextMedic.userId, {
//     //   notification: {
//     //     title: 'New Emergency',
//     //     body: 'Please respond immedately',
//     //   },
//     // });
//   }
// }
