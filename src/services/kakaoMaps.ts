import type { MapCenter, Place } from '@/types';

export function normalizePlace(
  item: kakao.maps.services.PlacesSearchResultItem
): Place {
  return {
    id: item.id,
    name: item.place_name,
    category: item.category_name,
    categoryGroupCode: item.category_group_code,
    address: item.road_address_name || item.address_name,
    addressLegacy: item.address_name,
    phone: item.phone,
    lat: parseFloat(item.y), // Kakao uses y for lat, x for lng
    lng: parseFloat(item.x),
    placeUrl: item.place_url,
    distance: item.distance ? parseInt(item.distance, 10) : undefined,
  };
}

export function searchPlacesByKeyword(
  keyword: string,
  options?: kakao.maps.services.PlacesSearchOptions
): Promise<Place[]> {
  return new Promise((resolve, reject) => {
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(
      keyword,
      (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          resolve(result.map(normalizePlace));
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
          resolve([]);
        } else {
          reject(new Error('검색 중 오류가 발생했습니다.'));
        }
      },
      options
    );
  });
}

export function searchNearbyPlaces(
  center: MapCenter,
  radius: number,
  categoryCode?: string
): Promise<Place[]> {
  return new Promise((resolve, reject) => {
    const ps = new kakao.maps.services.Places();
    const location = new kakao.maps.LatLng(center.lat, center.lng);
    const searchFn = categoryCode ? 'categorySearch' : 'keywordSearch';

    if (categoryCode) {
      ps.categorySearch(
        categoryCode,
        (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            resolve(result.map(normalizePlace));
          } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            resolve([]);
          } else {
            reject(new Error('검색 중 오류가 발생했습니다.'));
          }
        },
        { location, radius, sort: kakao.maps.services.SortBy.DISTANCE }
      );
    } else {
      resolve([]);
    }

    void searchFn;
  });
}

export function geocodeAddress(address: string): Promise<MapCenter> {
  return new Promise((resolve, reject) => {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        resolve({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        });
      } else {
        reject(new Error('주소를 찾을 수 없습니다.'));
      }
    });
  });
}
