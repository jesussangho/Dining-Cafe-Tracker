export {};

declare global {
  namespace kakao {
    namespace maps {
      class Map {
        constructor(container: HTMLElement, options: MapOptions);
        panTo(latlng: LatLng): void;
        setCenter(latlng: LatLng): void;
        getCenter(): LatLng;
        setLevel(level: number, options?: { animate?: boolean; anchor?: LatLng }): void;
        getLevel(): number;
        getBounds(): LatLngBounds;
        relayout(): void;
      }

      class LatLng {
        constructor(lat: number, lng: number);
        getLat(): number;
        getLng(): number;
      }

      class LatLngBounds {
        constructor(sw?: LatLng, ne?: LatLng);
        extend(latlng: LatLng): void;
        getSouthWest(): LatLng;
        getNorthEast(): LatLng;
        isEmpty(): boolean;
      }

      class Marker {
        constructor(options?: MarkerOptions);
        setMap(map: Map | null): void;
        getPosition(): LatLng;
        setTitle(title: string): void;
        setClickable(clickable: boolean): void;
      }

      class Circle {
        constructor(options: CircleOptions);
        setMap(map: Map | null): void;
        setCenter(latlng: LatLng): void;
        setRadius(radius: number): void;
        getMap(): Map | null;
      }

      class InfoWindow {
        constructor(options: InfoWindowOptions);
        open(map: Map, marker: Marker): void;
        close(): void;
        getContent(): string | HTMLElement;
        setContent(content: string | HTMLElement): void;
      }

      class Size {
        constructor(width: number, height: number);
      }

      class Point {
        constructor(x: number, y: number);
      }

      class MarkerImage {
        constructor(src: string, size: Size, options?: MarkerImageOptions);
      }

      interface MapOptions {
        center: LatLng;
        level: number;
        mapTypeId?: number;
        draggable?: boolean;
        scrollwheel?: boolean;
        disableDoubleClick?: boolean;
        disableDoubleClickZoom?: boolean;
        keyboardShortcuts?: boolean;
      }

      interface MarkerOptions {
        position: LatLng;
        map?: Map;
        title?: string;
        image?: MarkerImage;
        clickable?: boolean;
        zIndex?: number;
      }

      interface CircleOptions {
        center: LatLng;
        radius: number;
        strokeWeight?: number;
        strokeColor?: string;
        strokeOpacity?: number;
        strokeStyle?: string;
        fillColor?: string;
        fillOpacity?: number;
        map?: Map;
        zIndex?: number;
      }

      interface InfoWindowOptions {
        content?: string | HTMLElement;
        removable?: boolean;
        zIndex?: number;
        position?: LatLng;
      }

      interface MarkerImageOptions {
        alt?: string;
        coords?: string;
        offset?: Point;
        shape?: string;
        spriteOrigin?: Point;
        spriteSize?: Size;
      }

      namespace services {
        class Places {
          keywordSearch(
            keyword: string,
            callback: (result: PlacesSearchResult, status: StatusType, pagination: Pagination) => void,
            options?: PlacesSearchOptions
          ): void;
          categorySearch(
            code: string,
            callback: (result: PlacesSearchResult, status: StatusType, pagination: Pagination) => void,
            options?: PlacesSearchOptions
          ): void;
        }

        class Geocoder {
          addressSearch(
            address: string,
            callback: (result: AddressSearchResult[], status: StatusType) => void
          ): void;
          coord2Address(
            lng: number,
            lat: number,
            callback: (result: Coord2AddressResult[], status: StatusType) => void
          ): void;
        }

        interface Coord2AddressResult {
          address: {
            address_name: string;
            region_1depth_name: string;
            region_2depth_name: string;
            region_3depth_name: string;
            mountain_yn: string;
            main_address_no: string;
            sub_address_no: string;
            zip_code: string;
          };
          road_address: {
            address_name: string;
            region_1depth_name: string;
            region_2depth_name: string;
            road_name: string;
            underground_yn: string;
            main_building_no: string;
            sub_building_no: string;
            building_name: string;
            zone_no: string;
          } | null;
        }

        const Status: {
          readonly OK: 'OK';
          readonly ZERO_RESULT: 'ZERO_RESULT';
          readonly ERROR: 'ERROR';
        };

        const SortBy: {
          readonly ACCURACY: 'accuracy';
          readonly DISTANCE: 'distance';
        };

        type StatusType = 'OK' | 'ZERO_RESULT' | 'ERROR';

        type PlacesSearchResult = PlacesSearchResultItem[];

        interface PlacesSearchResultItem {
          id: string;
          place_name: string;
          category_name: string;
          category_group_code: string;
          category_group_name: string;
          phone: string;
          address_name: string;
          road_address_name: string;
          x: string; // longitude (경도)
          y: string; // latitude (위도)
          place_url: string;
          distance: string;
        }

        interface PlacesSearchOptions {
          location?: LatLng;
          radius?: number;
          sort?: string;
          page?: number;
          size?: number;
          category_group_code?: string;
          useMapBounds?: boolean;
        }

        interface AddressSearchResult {
          address_name: string;
          address_type: string;
          x: string;
          y: string;
          address: {
            address_name: string;
            region_1depth_name: string;
            region_2depth_name: string;
            region_3depth_name: string;
            main_address_no: string;
            sub_address_no: string;
          };
          road_address: {
            address_name: string;
            region_1depth_name: string;
            region_2depth_name: string;
            road_name: string;
            main_building_no: string;
            sub_building_no: string;
            building_name: string;
            zone_no: string;
          } | null;
        }

        interface Pagination {
          totalCount: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
          current: number;
          gotoPage(page: number): void;
        }
      }

      function load(callback: () => void): void;

      namespace event {
        function addListener(
          target: object,
          type: string,
          handler: (...args: unknown[]) => void
        ): void;
        function removeListener(
          target: object,
          type: string,
          handler: (...args: unknown[]) => void
        ): void;
        function trigger(target: object, type: string, data?: unknown): void;
      }
    }
  }

  interface Window {
    kakao: typeof kakao;
    __kakaoMapOnLoad?: () => void;
  }
}
