import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class GeoService {
  async geocode(dto: {
    address: string;
    postalCode: string;
    city: string;
    country: string;
  }): Promise<{ lat: number; lng: number }> {
    const query = `${dto.address}, ${dto.postalCode}, ${dto.city}, ${dto.country}`;

    const res = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        query,
      )}&key=${process.env.OPENCAGE_API_KEY}`,
    );

    const data = await res.json();

    if (!data.results?.length) {
      throw new Error('Geocoding failed');
    }

    const { lat, lng } = data.results[0].geometry;

    return { lat, lng };
  }
}