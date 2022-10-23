# 아이템 24. 일관성 있는 별칭 사용하기

 

```typescript
const borough = {name: 'Brooklyn', location: [40.688, -73.979]};
const loc = borough.location;
```

`loc`라는 `별칭(alias)`의 값을 변경하면`` borough`의 속성값도 변경됩니다.

```typescript
loc[0] = 0;
borough.location // [0, -73.979]
```



별칭을 남발해서 사용하면 제어 흐름을 분석하기 어렵기에 별칭을 신중히 사용해서 코드 가독성을 높이고 오류를 쉽게 찾을 수 있게끔 해야합니다.

```typescript
interface Coordiante {
  x: number;
  y: number;
}

interface BoundingBox {
  x: [number, number];
  y: [number, number];
}

interface Polygon {
  exterior: Coordinate[];
  holes: Coordiname[][];
  bbox?: BoundingBox; // 어떤 점이 다각형에 포함되는지 
}
```

위 예제에서 `bbox`는 필수가 아닌 최적화 속성이며, 이 속성을 사용하면 어떤 점이 다각형에 포함되는지 체크할 수 있습니다.



```typescript
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const box = polygon.box;
  if (polygon.bbox) {
    if (pt.x < box.x[0] || pt.x > box.x[1] || pt.y < box.y[0] || pt.y > box.y[1] ) {
       // 오류: ~~ 객체가 'undefined'일 수 있습니다.
    }
  }
}
```

위 예제는 동작하나, 에디터에서 오류로 표시됩니다. `polygon.bbox` 를 별도의 `box`라는 별칭을 만든 결과 제어 흐름 분석을 방해하기 되었기 때문입니다. 위 예제를 뜯어보면 아래와 같습니다.

```typescript
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
   (1) polygon.bbox // BoundingBox | undefined
   const box = polygon.bbox;
   (2) box // BoundingBox | undefined
  if (polygon.bbox) {
      (3) polygon.bbox // undefined가 정제되어서 BoundingBox 타입만 가지게 됨
      (4) box // undefined가 정제되지 않아서 BoundingBox | undefined 타입을 그대로 가지게 됨
    }
  }
}
```

` if (polygon.bbox)` 속성 체크가`` polygon.bbox` 타입을 정제했으나` box` 타입은 정제하지 않아 오류가 발생합니다. `box`를 속성 체크 하게끔 하면 문제가 해결됩니다.



```typescript
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
   const box = polygon.bbox;
  if (box) {
    const { x, y } = bbox;
     ...
    }
  }
}
```

하지만 위 예제에서는 실제 `polygon`의 속성인 `bbox`과 다른 이름의 변수명 box을 사용합니다. 가독성을 위해서는 이를 일치시켜 주는 것이 좋습니다. 



## 객체 비구조화 할당 (`destructuring`)을 사용하자

비구조화 할당을 통해 일관된 이름을 사용할 수 있습니다.

```typescript
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
   const { bbox } = polygon;
  if (bbox) {
    const { x, y } = bbox;
     ...
    }
  }
}
```

### 객체 비구조화 할당 시 주의할 점

- 해당 속성이 `선택적(optional) 속성`일 경우 타입의 경계에 `null` 값을 추가하는 것이 좋습니다 (아이템 31).



## 지역변수를 사용하자 

별칭은 타입 체커뿐만 아니라 런타임에도 혼동을 야기할 수 있습니다.

```typescript
const { bbox } = polygon;
if (!bbox) {
  calculatePolygonBbox(polygon); // polygon.bbox가 채워지는 함수 
  // polygon.bbox와 bbox는 다른 값을 참조합니다.
}
```

이렇듯 지역 변수 사용시 타입스크립트의 제어 흐름 분석이 잘 작동합니다. 



아래의 경우에는 함수가 타입 정제를 무효화할 수 있습니다. 

```typescript
function fn (p: Polygon) { /*...*/ }; //polygon.bbox를 제거할 가능성이 있다.

polygon.bbox // BoundingBox | undefined
if( polygon.bbox ) {
 // (1) polygon.bbox 타입은 BoundingBox
  fn(polygon); //polygon.bbox가 제거되었을 수도 있다.
 // (2) polygon.bbox 타입은 그대로 BoundingBox
}
```

`fn(polygon)` 호출이 `polygon.bbox` 를 제거할 가능성이 있으니 `fn(polygon)` 호출 이후에는 `polygon.bbox` 타입을 `BoundingBox | undefined` 로 되돌리는 것이 안전합니다. 하지만 그럴 경우 함수 호출 내에서 속성 체크를 해야하기 때문에 좋지 않습니다. 

이러한 이유로 타입스크립트는 함수가 타입 정제를 무효화 하지 않는다고 가정합니다. 실제로는 위 예제처럼 함수로 인해 타입 정제가 무효화 될 수 있습니다. 그렇기 때문에 타입 정제가 필요한 값을 지역변수로 뽑아내서 사용하면 객체 속성을 바로 사용하는 것보다 타입 정제를 믿을 수 있습니다.



## 결론

- 별칭은 타입스크립트가 타입을 좁히는 것을 방해하기 때문에  별칭을 사용할 때는 일관되게 사용하자.
- 객체 속성을 사용할 때는 비구조화 할당을 사용하자.
- 객체 속성을 직접 사용하기 보다는 지역 변수에 할당하여 사용하자.