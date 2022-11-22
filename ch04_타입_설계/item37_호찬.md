# 아이템 37. 공식 명칭에는 상표 붙이기

구조적 타이핑의 특성 때문에 이상한 결과를 도출 할 수 있다.

```typescript
interface Vector2D {
  x: number;
  y: number;
}

function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

calculateNorm({x: 3, y: 4}); // 정상, 결과는 5
const vec3D = {x: 3, y: 4, z: 1};
calculateNorm(vec3D); // 정상! 결과는 동일하게 5
```

이 코드는 구조적 타이핑 관점에서는 문제가 없지만, 수학적으로 따지면 2차원 백터를 사용해야 이치에 맞다.

`calculateNorm` 함수가 3차원 백터를 허용하지 않게 하려면 **공식 명칭(nominal typing)을** 사용하면 된다. **공식 명칭을 사용하는 것은, 타입이 아니라 값의 관점에서 `Vector2D`라고 말하는 것이다.**

공식 명칭 개념을 타입스크립트에서는 **상표(brand)를** 붙여서 흉내낼 수 있다.

```typescript
interface Vector2D {
  _brand: '2d';
  x: number;
  y: number;
}

function vec2D(x: number, y: number): Vector2D {
  return {x, y, _brand: '2d'};
}

function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

calculateNorm({x: 3, y: 4}); // 정상, 결과는 5
const vec3D = {x: 3, y: 4, z: 1};
calculateNorm(vec3D); // '_brand' 속성이 ... 형식에 없습니다.
```

`_brand`를 사용해서 `calculateNorm` 함수가 `Vector2D` 타입만 받는 것을 보장할 수 있다.

**상표 기법은 타입 시스템에서 동작하지만 런타임에 상표를 검사하는 것과 동일한 효과를 얻을 수 있다.** 타입 시스템이기 때문에 런타임 오버헤드를 없앨 수 있고 추가 속성을 붙일 수 없는 `string`이나 `number` 같은 내장 타입도 상표화 가능하다.

### 내장 타입도 상표화

```typescript
type AbsolutePath = string & {_brand: 'abs'};

function listAbsolutePath(path: AbsolutePath) {
  //...
}

function isAbsolutePath(path: string): path is AbsolutePath {
  return path.startWith('/');
}
```

`string` 타입이면서 `_brand` 속성을 가지는 객체를 만들 순 없다. 따라서 `AbsolutePath` 는 온전히 타입 시스템의 영역이다.

```typescript
function f(path: string) {
  if (isAbsolutePath(path)) {
    listAbsolutePath(path);
  }
  listAbsolutePath(path); // 'string' 형식의 인수는 'AbsolutePath' 형식의
                          // 매개변수에 할당될 수 없습니다.
}
```

**단언문을 쓰지 않고 `AbsolutePath` 타입을 얻기 위한 유일한 방법은 `AbsolutePath` 타입을 매개변수로 받거나 타입이 맞는지 체크하는 것뿐이다.**

### 타입 시스템 내에서 표현할 수 없는 속성 모델링

이진 검색은 이미 정렬된 상태를 가정하기 떄문에, 목록이 이미 정렬되어 있어야한다. **타입스크립트의 타입 시스템에서는 목록이 정렬되어 있다는 의도를 표현하기가 어려운데 상표 기법을 통해서 해결 할 수 있다.**

```typescript
type SortedList<T> = T[] & {_brand: 'sorted'};

function isSorted<T>(xs: T[]): xs is SortedList<T> {
  //...
    return false;
  //...
  return true;
}

function binarySearch<T>(xs: SortedList<T>, x: T): boolean {
  //...
}
```

이 코드에서 `binarySearch`를 호출하려면, 정렬되었다는 상표가 붙은 `SortedList` 타입의 값을 사용하거나 `isSorted`를 호출하여 정렬되었음을 증명해야 한다.

### 결론

- 타입스크립트는 구조적 타이핑(덕 타이핑)을 사용하기 때문에, 값을 세밀하게 구분하지 못하는 경우가 있다. 값을 구분하기 위해 공식 명칭이 필요하다면 상표를 붙이는 것을 고려해야 한다.
- 상표 기법은 타입 시스템에서 동작하지만 런타임에 상표를 검사하는 것과 동일한 효과를 얻을 수 있다.