# 아이템 35. 데이터가 아닌, API 명세를 보고 타입 만들기

## API 명세를 바탕으로 타입을 생성하자

API 명세를 참고해 타입을 생성하면 타입스크립트는 사용자가 실수를 줄일 수 있게 도와줍니다.

반면에 예시 데이터를 참고해 타입을 생성하면 눈앞에 있는 데이터들만 고려하게 되므로 예기치 않은 곳에서 오류가 발생할 수 있습니다.
<br/>

```typescript
// requires node modules: @types/geojson

interface BoundingBox {
  lat: [number, number];
  lng: [number, number];
}
import { Feature } from "geojson";

function calculateBoundingBox(f: Feature): BoundingBox | null {
  let box: BoundingBox | null = null;

  const helper = (coords: any[]) => {
    // ...
  };

  const { geometry } = f;
  if (geometry) {
    helper(geometry.coordinates);
    // ~~~~~~~~~~~
    // 'Geometry' 형식에 'coordinates' 속성이 없습니다.
    // 'GeometryCollection' 형식에 'coordinates' 속성이 없습니다.
  }

  return box;
}
```

위 예제에서는 geometry에 coordinates 속성이 있다고 가정한 것이 문제입니다. 다른 도형과 다르게 GeometryCollection에는 coordinates 속성이 없기 때문입니다. 이 오류는 GeometryCollection을 명시적으로 차단하여 해결할 수 있습니다.

<br/>

```typescript
function helper(coordinates: any[]) {}
const { geometry } = f;
if (geometry) {
  if (geometry.type === "GeometryCollection") {
    throw new Error("GeometryCollections are not supported.");
  }
  helper(geometry.coordinates); // OK
}
```

하지만 위와 같이 GeometryCollection 타입을 차단하기 보다는 모든 타입을 지원하는 것이 더 좋은 방법이기 때문에 조건을 분기해서 헬퍼 함수를 호출하면 모든 타입을 지원할 수 있습니다.

<br/>

```typescript
function helper(coordinates: any[]) {}
const geometryHelper = (g: Geometry) => {
  if (geometry.type === "GeometryCollection") {
    geometry.geometries.forEach(geometryHelper);
  } else {
    helper(geometry.coordinates); // OK
  }
};

const { geometry } = f;
if (geometry) {
  geometryHelper(geometry);
}
```

이렇듯 직접 작성한 타입 선언에는 GeometryCollection 같은 예외 상황이 포함되지 않고, 완벽할 수도 없습니다.

API 명세를 기반으로 타입을 작성한다면 현재까지 경험한 데이터 뿐만 아니라 사용 가능한 모든 값에 대해 작동한다는 확신을 가질 수 있습니다.

<br/>

## GraphQL - 자체적으로 타입 정의 가능

GraphQL의 장점은 특정 쿼리에 대해 타입스크립트 타입을 생성할 수 있다는 것입니다.

타입은 GraphQL의 스키마로 부터 생성되기 때문에 스키마,쿼리가 바뀐다면 결과에 대한 타입도 자동으로 바뀌어 타입과 실제 값이 항상 일치합니다.

하지만 GraphQL와 같은 기술을 사용하지 않는다면 데이터로부터 타입을 생성해야 합니다. quicktype과 같은 도구를 쓸 수 있는데, 이렇게 생성된 데이터가 실제 데이터와 항상 일치하지 않을 수 있습니다.

<br/>

## 결론

- 코드의 안정성을 위해선 API 명세 기반으로 타입을 작성하고, 코드를 생성하는 것이 좋다.
