# 아이템 15. 동적 데이터에 인덱스 시그니처 사용하기

### 인데스 시그니처

타입스크립트에서는 타입에 `인덱스 시그니처`를 명시하여 유연하게 매핑을 표현할 수 있다.

```typescript
type Rocket = { [property: string]: string };

const rocket: Rocket = {
    name: 'Falcon 9',
    variant: 'v1.0',
    thrust: '4,940 kN',
};
```

`[property: string]: string`가 인덱스 시그니처이며, 아래와 같은 특징을 갖는다.

- **키의 이름:** 키의 위치만 표시하는 용도로, 타입 체커에서는 사용하지 않는다.
- **키의 타입:** `string`, `number` 혹은 `symbol`의 조합으로 구성되어야 한다.
- **값의 타입:** 모든 타입이 가능하다.

### 인데스 시그니처 단점

- **모든 키를 허용한다.** `name` 대신 `Name`으로 작성해도 유효한 `Rocket` 타입으로 취급된다.
- **특정 키가 필요하지 않다.** `{}`도 유효하게 취급된다.
- **키마다 다른 타입을 가질 수 없다.** `thrust`만 `number` 타입을 갖고 싶어도 불가능하다.
- **타입스크립트에서 제공하는 언어 서비스를 이용하지 못한다.** 키는 무엇이든지 가능하기 때문에 자동 완성 기능이 동작하지 않는다.

### 인데스 시그니처의 적절한 사용 용도

`인덱스 시그니처`는 타입이 부정확해서 런타임 때까지 객체의 속성을 모르는 임의의 데이터에 대해 사용하는게 좋다.

객체의 속성을 알고 있는 데이터에 대해서는 `인터페이스`와 같은 정확한 타입을 정의할 수 있는 문법을 사용하자.

```typescript
interface Rocket {
    name: string;
    variant: string;
    thrust_kN: number;
}
const falconHeavy: Rocket = {
    name: 'Falcon Heavy',
    variant: 'v1',
    thrust_kN: 15_200,
}
```

이제 타입스크립트에서 제공하는 언어 서비스를 이용할 수 있다. (자동 완성, 정의로 이동, 이름 바꾸기 등등)

모르는 임의의 데이터에 대해 `인덱스 시그니처`를 사용하되, 열 이름을 알고 있는 특정한 상황으로 좁혀진다면 미리 선언된 타입 단언문을 사용할 수 있다.

```typescript
function parseCSV(input: string): {[columnName: string]: string}[]{
    //...
}

interface ProductRow {
    productId: string;
    name: string;
    price: string;
}

declare let csvData: string;
const products = parseCSV(csvData) as unknown as ProductRow[];
```

### 정확한 타입을 정의할 수 있는 방법들

```typescript
interface Row1 { [column: string]: number }
interface Row2 { a: number; b?: number; c?: number; d?: number; } // 그나마 최선
type Row3 = 
    | { a: number; }
    | { a: number; b: number; }
    | { a: number; b: number; c: number; }
    | { a: number; b: number; c: number; d: number; }
```

`Row1`는 너무 광범위하며, `Row3`가 가장 정확하지만 사용하기 번거롭다.

해당 경우에서는 `Record`나 `매핑된 타입`을 활용해볼 수 있다.

#### Record

```typescript
type Vec3D = Record<'x' | 'y' | 'z', number>;
// Type Vec3D = {
//    x: number;
//    y: number;
//    z: number;
//}
```

#### 매핑된 타입

```typescript
type Vec3D = {[k in 'x' | 'y' | 'z']: number};
// Type Vec3D = {
//    x: number;
//    y: number;
//    z: number;
//}

type ABC = {[k in 'a' | 'b' | 'c']: k extends 'b' ? string : number};
// Type Vec3D = {
//    a: number;
//    b: string;
//    c: number;
//}
```

### 결론

- 런타임 때까지 객체의 속성을 알 수 없는 경우에만 `인덱스 시그니처`를 사용한다.
- 안전한 접근을 위해 `인덱스 시그니처`를 사용할 때, 값 타입에 `undefined`를 추가하는 것을 고려해보아야 한다.
- 가능하다면 `인덱스 시그니처`보다는 `인터페이스`, `Record`, `매핑된 타입`등 정확한 타입을 사용하자.