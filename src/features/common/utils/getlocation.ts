async getGeLocationByAddress(
  address: string,
  userAgent: string,
): Promise<{ lat: number; lng: number }> {
  console.log('Original Address:', address);

  // Normalize "plus code" format like "CX94, ..." to extract city and last segment
  if (address && /^[A-Z0-9]{4,}/i.test(address)) {
    const arr = address.split(' ');
    const city = arr.find(p => p.includes(','));
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
