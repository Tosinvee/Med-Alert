import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { updateProfileDto } from './dto/update-profile.dto';
import * as NodeGeocoder from 'node-geocoder';
import nodeFetch from 'node-fetch';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async getGeLocationByAddress(
    address: string,
    userAgent: string,
  ): Promise<{ lat: number; lng: number }> {
    console.log('Original Address:', address);

    // Normalize "plus code" format like "CX94, ..." to extract city and last segment
    if (address && /^[A-Z0-9]{4,}/i.test(address)) {
      const arr = address.split(' ');
      const city = arr.find((p) => p.includes(','));
      if (city) {
        address = `${city} ${arr.pop()}`;
      }
    }

    const options = {
      provider: 'openstreetmap',
      fetch: (url: string, opts: any) => {
        const randomVersion = Math.floor(Math.random() * (24 - 10 + 1)) + 10;
        return nodeFetch(url, {
          ...opts,
          headers: {
            'User-Agent': `MyCustomApp/1.0 (Desktop; Linux) NodeJS/${randomVersion}.x`,
          },
        });
      },
    };

    const geocoder = NodeGeocoder(options);

    try {
      const res = await geocoder.geocode(address);
      if (res && res.length > 0) {
        const { latitude, longitude } = res[0];
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        return { lat: latitude, lng: longitude };
      } else {
        throw new BadRequestException('Unable to geocode the address.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      throw new BadRequestException(
        'Invalid address or failed to fetch coordinates.',
      );
    }
  }

  async updateProfile(
    userId: number,
    body: updateProfileDto,
    userAgent: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const userUpdateData: any = {};
    if (body.address) userUpdateData.address = body.address;
    if (body.state) userUpdateData.state = body.state;
    if (body.city) userUpdateData.city = body.city;
    if (body.phone_number) userUpdateData.phone_number = body.phone_number;

    if (body.address || body.state || body.city) {
      const fullAddress = `${body.address || ''}, ${body.city || ''}, ${body.state || ''}`;

      try {
        const geo = await this.getGeLocationByAddress(fullAddress, userAgent);
        userUpdateData.latitude = geo.lat;
        userUpdateData.longitude = geo.lng;
      } catch (error) {
        console.warn('Geocoding failed:', error.message);
      }
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });
    if (user.userType === 'PATIENT') {
      await this.prisma.patient.upsert({
        where: { userId },
        update: {
          first_name: body.first_name,
          last_name: body.last_name,
          dob: body.dob,
          gender: body.gender,
          conditions: body.conditions,
          allergies: body.allergies,
          bloodType: body.bloodType,
        },
        create: {
          userId,
          first_name: body.first_name,
          last_name: body.last_name,
          dob: body.dob,
          gender: body.gender,
          conditions: body.conditions ?? [],
          allergies: body.allergies ?? [],
          bloodType: body.bloodType,
        },
      });
    } else if (user.userType === 'MEDICS') {
      await this.prisma.medic.upsert({
        where: { id: userId },
        update: {
          name: body.name,
        },
        create: {
          userId,
          name: body.name,
        },
      });
    }
    return { message: 'Profile updated successfully' };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        reference: true,
        email: true,
        address: true,
        city: true,
        state: true,
        phone_number: true,
        latitude: true,
        longitude: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.userType === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId },
      });
      return { ...user, patient };
    }
    if (user.userType === 'MEDICS') {
      const medic = await this.prisma.medic.findUnique({
        where: { userId },
      });
      return { ...user, medic };
    }
    return user;
  }

  async getUsers() {
    const users = await this.prisma.user.findMany({
      include: { patient: true, medic: true },
    });
    return users;
  }
}
