# 아이템 52. 테스팅 타입의 함정에 주의하기

프로젝트를 공개하려면 테스트 코드를 작성하는 것이 필수이며, 타입 선언도 테스트를 거쳐야 하나 타입 선언을 테스트하는 것은 어렵습니다.

타입 선언에 대한 테스트 코드를 작성할 때 단언문으로 때우는 경우가 많지만 문제를 야기할 수 있기에, dtslint 또는 타입 시스템 외부에서 타입을 검사하는 유사한 도구를 사용하는 것이 더 안전하고 간단합니다.

<br/>

## 반환타입을 체크하지 않는 테스트 예시

### 유틸리티 라이브러리(`lodash`, `underscore`) `map` 예시

```typescript
declare function map<U, V>(array: U[], fn: (u: U) => V): V[];
map(["2017", "2018", "2019"], (v) => Number(v));
```

`map`의 타입 선언이 예상한 타입으로 결과를 내는지 체크하기 위해 `map` 함수를 호출한 코드입니다.

위 예제는 반환값에 대한 체크가 누락되어 있기 때문에 완전한 테스트라고 할 수 없습니다.

### 함수 런타임 동작 테스트 예시

```typescript
const square = (x: number) => x * x;
test("square a number", () => {
  square(1);
  square(2);
});
```

위 예제 역시 함수 실행에서는 오류가 발생하지 않지만 체크할 뿐 반환값은 체크하지 않아 `square`의 구현이 잘못되어도 테스트는 통과하게 됩니다.
함수 실행만 하는 테스트 코드가 의미 없는 것은 아니지만, 실제로 반환 타입을 체크하는 것이 더 좋은 테스트 코드 입니다.

반환 값을 특정 타입의 변수에 할당하여 반환 타입을 체크할 수 있는 방법을 알아봅시다.

```typescript
const lengths: number[] = map(["john", "paul"], (name) => name.length);
```

위 예제는 **불필요한 타입 선언(아이템19)** 에 해당하나, 테스트 코드 관점에서는 중요한 역할을 하고 있습니다. (반환 타입을 `number[]`로 보장)
그러나 테스팅을 위해 할당을 사용하는 방법에는 두가지 근본적인 문제가 있습니다.

<br/>

## 테스팅을 위해 할당을 사용하는 것의 2가지 문제점

### 1. 불필요한 변수 생성

반환값을 할당할 불필요한 변수를 생성하기 보다는 헬퍼 함수를 정의해서 문제를 해결할 수 있습니다.

```typescript
declare function map<U, V>(array: U[], fn: (u: U) => V): V[];
function assertType<T>(x: T) {}

assertType<number[]>(map(["john", "paul"], (name) => name.length));
```

위 예제는 불필요한 변수 문제를 해결하지만, 두 타입이 동일한지 체크하는 것이 아니고 할당 가능성을 체크하고 있다는 문제가 있습니다.

### 2. 할당 가능성 체크

```typescript
function assertType<T>(x: T) {}
const n = 12;
assertType<number>(n); // 정상
```

위 예제에서는 잘 동작합니다. n 심벌의 타입은 실제로 숫자 리터럴 타입 12입니다. 12는 number의 서브타입이기에 할당 가능성 체크를 통과하게 됩니다.
즉, 타입이 동일한지 여부를 판단하는 것이 아니라 할당이 가능한지를 체크하는 것에 그칩니다.

<br/>

## assertType 제대로 사용하기 (`Parameters`, `ReturnType` 제너릭 타입)

`Parameters`와 `ReturnType` 제너릭 타입을 이용해 함수의 매개변수 타입과 반환 타입만 분리하여 테스트할 수 있습니다.

### Parameters<Type>

함수 타입 Type의 매개변수에 사용된 타입에서 튜플 타입을 생성합니다. ([참고](https://www.typescriptlang.org/ko/docs/handbook/utility-types.html#parameterstype))

### ReturnType<Type>

함수 Type의 반환 타입으로 구성된 타입을 생성합니다. ([참고](https://www.typescriptlang.org/ko/docs/handbook/utility-types.html#returntypetype))

```typescript
const double = (x: number) => 2 * x;
let p: Parameters<typeof double> = null!;
assertType<[number, number]>(p);
//                           ~ '[number]' 형식의 인수는 '[number, number]'
//                             형식의 매개변수에 할당될 수 없습니다.
let r: ReturnType<typeof double> = null!;
assertType<number>(r); // 정상
```

<br/>

## 콜백함수가 지닌 문제점 (this 관련)

예제에 사용된 `map`의 콜백함수는 화살표 함수(항상 상위 스코프의 `this`를 가리킴)가 아니기에 `this`의 타입이 테스트 대상이 됩니다.

```typescript
const beatles = ["john", "paul", "george", "ringo"];
assertType<number[]>(
  map(beatles, function (name, i, array) {
    // ~~~~~~~ '(name: any, i: any, array: any) => any' 형식의 인수는
    //         '(u: string) => any' 형식의 매개변수에 할당될 수 없습니다.
    assertType<string>(name);
    assertType<number>(i);
    assertType<string[]>(array);
    assertType<string[]>(this);
    // ~~~~ 'this'에는 암시적으로 'any' 형식이 포함됩니다.
    return name.length;
  })
);
```

위 예제의 문제는 아래 코드의 선언을 사용하면 타입 체크를 통과하게 됩니다.

```typescript
declare function map<U, V>(
  array: U[],
  fn: (this: U[], u: U, i: number, array: U[]) => V
): V[];
```

<br/>

## DefinitelyTyped의 타입 선언 도구 - dtslint

[github 바로가기 microsoft/dtslint](https://github.com/microsoft/dtslint)

dtslint는 특별한 형태의 주석을 통해 동작합니다. dtslint를 사용하면 beatles 관련 예제 테스트를 다음과 같이 작성할 수 있습니다.

```typescript
declare function map<U, V>(
  array: U[],
  fn: (this: U[], u: U, i: number, array: U[]) => V
): V[];
const beatles = ["john", "paul", "george", "ringo"];
map(
  beatles,
  function (
    name, // $ExpectType string
    i, // $ExpectType number
    array // $ExpectType string[]
  ) {
    this; // $ExpectType string[]
    return name.length;
  }
); // $ExpectType number[]
```

dtslint는 할당 가능성을 체크하는 대신 각 심벌의 타입을 추출하여 글자 자체가 같은지 비교합니다.
그러다 보니 `number|string` 과 `string|number`는 같은 타입이지만 글자는 다르기 때문에 다른 타입으로 인식합니다.

<br/>

## 결론

- 타입을 테스트 할 때는 특히 함수 타입의 동일성(equality)과 할당 가능성(assignability)의 차이점을 알고 있어야 한다.
- 콜백이 있는 함수를 테스트 할 때, 콜백 매개변수의 추론된 타입을 체크해야 합니다.
- this가 API 일부분이라면 테스해야 한다.
- 엄격한 테스트를 위해 dtslint 같은 도구를 사용할 수도 있다.
