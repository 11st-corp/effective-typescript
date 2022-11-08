# 아이템 29. 사용할 때는 너그럽게, 생성할 때는 엄격하게

### 견고성 원칙 (포스텔의 법칙)

> 자신이 행하는 일은 엄격하게, 남의 것을 받아들일 때는 너그럽게. - 존 포스텔 (Jon Postel)

함수의 시그니처에도 비슷한 규칙을 적용해야한다. 

**매개변수 타입의 범위는 넓게 설계하고, 반환 타입의 범위는 좁게 설계하자.**

아래 예제에서 `LngLatBounds` 는 총 19가지 (9 + 9 + 1)형태를 지원하고 있다. 19가지 경우의 수를 지원하는 것은 좋은 설계가 아니다.

```ts
declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): CameraOptions;

interface CameraOptions {
    center?: LngLat;
    zoom?: number;
    bearing?: number;
    pitch?: nunmber;
}

type LngLat = 
    { lng: number; lat: number; } |
    { lon: number; lat: number; } |
    [number, number];

type LngLatBounds = 
  { northeast: LngLat; southwest: LngLat; } |
  [ LngLat, LngLat ] |
  [ number, number, number, number ]
```

또 `viewportForBounds`의 반환 타입인 `CameraOptions`가 `setCamera`의 매개변수의 타입으로 사용되고있다. 이럴 경우 매개변수 타입이 엄격해지거나 반환되는 타입이 느슨해질 수 있는 문제가 발생할 수 있다.

```ts
function focusOnFeature(f: Feature) {
    const bounds = calculateBoundingBox(f);
    const camera = viewportForBounds(bounds);
    setCamera(camera);
    const {center: {lat, lng}, zoom} = camera;
                    // ... 형식에 'lat' 속성이 없습니다.
                    // ... 형식에 'lng' 속성이 없습니다.
    zoom; // 타입이 number | undefined
}
```

타입을 정의할 때 `CameraOptions` 타입이 너무 자유로워 위와 같은 문제가 발생한다.

우리는 사용하기 편리한(매개변수의 타입은 넓고, 반환값의 타입은 엄격한) 타입으로 개선시키기 위해 **유니온 타입을 각각 코드 상에서 분기 처리할 수 있다.**

분기 처리를 위한 방법중 하나로 `LngLat`과 `LngLatLike`으로 유사 타입을 만드는 방법이 있다.

```ts
declare function setCamera(camera: CameraOptions): void; // 느슨한 매개변수 타입
declare function viewportForBounds(bounds: LngLatBounds): Camera; // 엄격한 반환값 타입

interface Camera { // 엄격한 반환값 타입
  center: LngLat;
  zoom: number;
  bearing: number;
  pitch: number;
}

interface CameraOptions { // 느슨한 매개변수 타입
  center?: LngLatLike;
  zoom?: number;
  bearing?: number;
  pitch?: number;
}

interface LngLat { lng: number; lat: number; };

type LngLatLike = LngLat | { lon: number; lat: number; } | 
                [number, number]
```

다시 돌아와서 아래 에서 모든 문제가 해결됨을 볼 수 있다.

```ts
function focusOnFeature(f: Feature) {
    const bounds = calculateBoundingBox(f);
    const camera = viewportForBounds(bounds);
    setCamera(camera);
    const {center: {lat, lng}, zoom} = camera;
    zoom; // 타입이 number 
}
```

### 결론

- **매개변수 타입의 범위는 넓게 설계하고, 반환 타입의 범위는 좁게 설계하자.**