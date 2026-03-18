import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import fetch from 'node-fetch';

type GeocodeResult = {
  lat: number;
  lng: number;
};

@Injectable()
export class GeoService {
  private readonly token = process.env.MAPBOX_TOKEN;

  constructor() {
    if (!this.token) {
      throw new Error('MAPBOX_TOKEN not set');
    }
  }

  /* =====================================================
     PUBLIC: STRUCTURED INPUT (DTO)
  ===================================================== */
  async geocode(dto: {
    address: string;
    postalCode?: string;
    city?: string;
    country?: string;
  }): Promise<GeocodeResult> {
    const query = [
      dto.address,
      dto.postalCode,
      dto.city,
      dto.country,
    ]
      .filter(Boolean)
      .join(', ');

    return this.geocodeQuery(query);
  }

  /* =====================================================
     PUBLIC: RAW ADDRESS (WORKERS)
  ===================================================== */
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    if (!address) {
      throw new BadRequestException('Missing address');
    }

    return this.geocodeQuery(address);
  }

  /* =====================================================
     INTERNAL: MAPBOX GEOCODING
  ===================================================== */
  private async geocodeQuery(query: string): Promise<GeocodeResult> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query,
      )}.json?access_token=${this.token}&limit=1`;

      const res = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Mapbox error: ${res.status}`);
      }

      const data = await res.json();

      if (!data.features?.length) {
        throw new BadRequestException(
          `Geocoding failed for: ${query}`,
        );
      }

      const [lng, lat] = data.features[0].center;

      return {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new InternalServerErrorException(
          'Geocoding timeout',
        );
      }

      console.error('❌ Mapbox geocode error:', err.message);

      throw new InternalServerErrorException(
        'Geocoding service failed',
      );
    }
  }
}